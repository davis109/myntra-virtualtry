from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import sqlite3
import os
from rag import get_images_using_llm, viton_model
from recommendation import get_top_products
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import base64
from typing import Optional


app = FastAPI()

image_directory = Path(__file__).parent / "fitted_images"
app.mount("/fitted_images", StaticFiles(directory=image_directory), name="fitted_images")

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

UPLOAD_DIR = os.getenv("UPLOADED_USER_IMAGES_FOLDER")
UPLOADED_PERSON_IMAGE_NAME = None
SQLITE_DB_PATH = os.path.join(os.getenv("SQLITE_DB_PATH"), "myntra.db")
EXTRACTED_CLOTH_IMAGES_FOLDER = os.getenv("EXTRACTED_CLOTH_IMAGES_FOLDER")

Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

user_preferences = {"positive": {}, "negative": {}}
visited_items = set()

@app.post("/get_images")
async def get_images(search: dict):
    query = search["query"]
    print("Search Query:", query)
    extracted_images, images, categories, names, sellers, prices, discounts  = get_images_using_llm(query)
    extracted_image_1 = extracted_images[0]
    extracted_image_final = extracted_image_1
    print("Cloth Match:", names[0])
    category_1= categories[0]
    print(category_1)
    
    images_details = []
    images_details.append(
        {
            "original_image": images,
            "name": names[0],
            "seller": sellers[0],
            "price": prices[0],
            "discount": discounts[0]
        }
    )
    
    final_image = await viton_model(cloth_image_path=os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, extracted_image_1), cloth_category=category_1, person_image_path=os.path.join(UPLOAD_DIR, UPLOADED_PERSON_IMAGE_NAME)) # along with these parameters, we can also pass the user image
    
    try:
        extracted_image_2 = extracted_images[1]
        extracted_image_final = extracted_image_2
        print("Cloth Match:", names[1])
        category_2 = categories[1]
        print(category_2)
        final_image_path = await viton_model(cloth_image_path=os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, extracted_image_2), cloth_category=category_2, person_image_path=final_image)
        
        images_details.append(
            {
                "original_image": images[1],
                "name": names[1],
                "seller": sellers[1],
                "price": prices[1],
                "discount": discounts[1]
            }
        )
    except Exception as e:
        print(e)
        pass # this means there was only one image which is possible
    
    return {
        "fitted_image": extracted_image_final,
        "details": images_details
    }

async def get_fitted_images(images, person_image_path):
    tasks = []
    for image in images:
        if image["main_category"] == "Top Wear":
            tasks.append(viton_model(cloth_image_path=os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, image["extract_images"]), cloth_category="Upper-body", person_image_path=person_image_path))
        elif image["main_category"] == "Bottom Wear":
            tasks.append(viton_model(cloth_image_path=os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, image["extract_images"]), cloth_category="Lower-body", person_image_path=person_image_path))
        elif image["main_category"] == "Dress (Full Length)":
            tasks.append(viton_model(cloth_image_path=os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, image["extract_images"]), cloth_category="Dress", person_image_path=person_image_path))
                
    results = await asyncio.gather(*tasks)
    
    # encoded_images = [base64.b64encode(image).decode('utf-8') for image in results]
    return {"images": results}

@app.post("/get_recommendations")
async def get_recommendations(data: dict):
    main_category = data["main_category"]
    target_audience = data["target_audience"]
    extracted_image = data['extract_images']
    
    if main_category == "Top Wear":
        category = "Upper-body"
    elif main_category == "Bottom Wear":
        category = "Lower-body"
    elif main_category == "Dress (Full Length)":
        category = "Dress"
        
    extracted_image_path = await viton_model(cloth_image_path=os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, extracted_image), cloth_category=category, person_image_path=os.path.join(UPLOAD_DIR, UPLOADED_PERSON_IMAGE_NAME))

    if main_category == "Top Wear":
        recommended_category = "Bottom Wear"
        
    elif main_category == "Bottom Wear":
        recommended_category = "Top Wear"
        
    elif main_category == "Dress (Full Length)":
        recommended_category = "Dress (Full Length)"
        
    trendy_products = get_top_products(recommended_category, target_audience)
    
    # seasonal_top_products = trendy_products["seasonal_top_products"]
    fashion_trend_products = trendy_products["fashion_trend_products"]
    
    # Filter out products that have been visited
    filtered_products = [product for product in fashion_trend_products if "img" in product and product['img'] not in visited_items]
    
    
    
    def adjust_weights():
        weights = {}
        for subcat, count in user_preferences["positive"].items():
            weights[subcat] = weights.get(subcat, 1) + count  # Increase weight for positive feedback
        
        for subcat, count in user_preferences["negative"].items():
            weights[subcat] = weights.get(subcat, 1) - count  # Decrease weight for negative feedback
        
        # Ensure no negative weights
        for subcat in weights:
            if weights[subcat] < 0:
                weights[subcat] = 0

        return weights
    # Adjust weights based on feedback
    weights = adjust_weights()
    print(weights)
    
    # Apply weights to filter and sort the products
    def weighted_sort(product):
        subcat = product.get("subcategory", "")
        return weights.get(subcat, 1)
    
    # print(fashion_trend_products)
    # print("#############################")
    # Sort and slice the lists
    # seasonal_top_products = sorted(seasonal_top_products, key=weighted_sort, reverse=True)[0]
    fashion_trend_products = sorted(filtered_products, key=weighted_sort, reverse=True)[:3]
    print("fashion: ",len(fashion_trend_products))
    
    # Update visited items
    visited_items.update([product["img"] for product in fashion_trend_products])
    print("Visited_Items:", visited_items)
    # print(fashion_trend_products)
    # Verify the data passed to get_fitted_images
    if any(not isinstance(product, dict) for product in fashion_trend_products):
        return {"error": "Invalid data format: Each item in 'fashion_trend_products' should be a dictionary"}
    
    # Get fitted images
    fitted_images = await get_fitted_images(fashion_trend_products, extracted_image_path)
    
    recommended_images_details = [
        {
            "name": fashion_trend_products[i]["name"],
            "subcategory": fashion_trend_products[i]["subcategory"],
            "fitted_image": fashion_trend_products[i]["extract_images"],
            "original_image": fashion_trend_products[i]["img"],
            "seller": fashion_trend_products[i]["seller"],
            "price": fashion_trend_products[i]["price"],
            "discount": fashion_trend_products[i]["discount"],
        }
        for i in range(len(fashion_trend_products))
    ]

    return {
        "selected_image": extracted_image,
        "recommended_images": recommended_images_details
        
    }


@app.post("/submit-feedback")
async def feedback(positive_feedback: List[str], negative_feedback: List[str]):
    print(positive_feedback)
    print(negative_feedback)
    for subcat in positive_feedback:
        user_preferences["positive"][subcat] = user_preferences["positive"].get(subcat, 0) + 1
    
    for subcat in negative_feedback:
        user_preferences["negative"][subcat] = user_preferences["negative"].get(subcat, 0) + 1
    
    return {"message": "Feedback received", "user_preferences": user_preferences}


@app.post("/take_user_image")
async def get_user_image(file: UploadFile = File(...)):
    """Endpoint to upload an image and save it to the local folder"""
    try:
        # Ensure the uploaded file is an image
        if file.content_type not in ["image/jpeg", "image/png", "image/gif"]:
            raise HTTPException(status_code=400, detail="Unsupported file type.")

        global UPLOADED_PERSON_IMAGE_NAME
        UPLOADED_PERSON_IMAGE_NAME = file.filename
        print(UPLOADED_PERSON_IMAGE_NAME)
        
        # Define the path where the image will be saved
        image_path = os.path.join(UPLOAD_DIR, file.filename)

        # Write the uploaded file to the specified path
        with open(image_path, "wb") as buffer:
            buffer.write(await file.read())

        return {"filename": file.filename, "path": image_path}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")


@app.get("/get_myntra_data")
def get_myntra_data():
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE extract_images IS NOT NULL")
        rows = cursor.fetchall()
        conn.close()

        # Convert rows to list of dicts
        data = [dict(row) for row in rows[:30]]
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)