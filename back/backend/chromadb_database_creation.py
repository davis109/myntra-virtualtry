import pandas as pd
import chromadb
import chromadb.utils.embedding_functions as embedding_functions
import os
from dotenv import load_dotenv
load_dotenv()

CHROMADB_PATH = os.getenv("CHROMADB_PATH")

chromadb_client = chromadb.PersistentClient(path=CHROMADB_PATH)
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="thenlper/gte-base")

collection = chromadb_client.get_or_create_collection(name="myntra_data", embedding_function=embedding_function) # If not specified, by default uses the embedding function "all-MiniLM-L6-v2"

def add_data_to_db():
    
    def get_data_from_csv():
        df = pd.read_csv("C:/Users/karan singh/Desktop/AR_Try/Myntra-CoDivas/back/backend/products_final_data.csv")
        print(df)
        
        # Drop rows where the column "extract_images" is equal to "NA"
        df.dropna(inplace=True)
        
        new_df = df[["name", "main_category", "subcategory", "img", "extract_images", "seller", "price", "discount"]]
        
        return new_df

    data = get_data_from_csv()
    for index, row in data.iterrows():
        name = row["name"]
        main_category = row["main_category"]
        subcategory = row["subcategory"]
        img = row["img"]
        extract_images = row["extract_images"]
        seller = row["seller"]
        price = row["price"]
        discount = row["discount"]
        
        collection.add(
            documents=name,
            metadatas={"main_category": main_category, "subcategory": subcategory, "extract_images": extract_images, "img": img, "seller": seller, "price": price, "discount": discount},
            ids=[str(index)]
        )
        
add_data_to_db()