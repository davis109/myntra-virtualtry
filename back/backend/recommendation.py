import pandas as pd
import os

EXTRACTED_CLOTH_IMAGES_FOLDER = os.getenv("EXTRACTED_CLOTH_IMAGES_FOLDER")

# Load and preprocess the data
df = pd.read_csv(r"C:/Users/karan singh/Desktop/AR_Try/Myntra-CoDivas/back/backend/products_final_data.csv")
df.dropna(inplace=True)

# Update the 'extract_images' column
# df['extract_images'] = df['extract_images'].apply(lambda x: os.path.join(EXTRACTED_CLOTH_IMAGES_FOLDER, x))

df['date'] = pd.to_datetime(df['date'], format='%Y-%m-%d')

# Ensure all required columns are present
required_columns = ['product_id', 'price', 'rating', 'subcategory', 'img', 'name', 'main_category', 'target_audience', 'date', 'quantity', 'extract_images', 'seller', 'discount']
missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    raise ValueError(f"Missing columns in the DataFrame: {', '.join(missing_columns)}")

categories = ['Top Wear', 'Bottom Wear', 'Dress (Full Length)']
audiences = ['Male', 'Female', 'Unisex']

def get_top_products(main_category, target_audience):

    target_year = 2024

    if main_category not in categories:
        return {"error": "Invalid main_category"}
    
    if target_audience not in audiences:
        return {"error": "Invalid target_audience"}
    
    # Seasonal Top Products
    df_july_past_years = df[(df['date'].dt.month == 7) & (df['date'].dt.year < target_year)]
    df_july_past_years_filtered = df_july_past_years[~df_july_past_years['name'].str.contains('Infant', case=False, na=False)]
    seasonal_top_products = df_july_past_years_filtered.groupby(['main_category', 'target_audience']).apply(
        lambda x: x.nlargest(10, 'quantity')
    ).reset_index(drop=True)

    seasonal_top_10 = seasonal_top_products[
        (seasonal_top_products['main_category'] == main_category) & 
        (seasonal_top_products['target_audience'] == target_audience)
    ][['name', 'product_id', 'price', 'main_category', 'subcategory', 'img','extract_images']].to_dict(orient='records')
    
    # Fashion Trend Products
    df_recent_months = df[(df['date'] >= '2024-05-01') & (df['date'] <= '2024-06-30')]
    df_recent_months_filtered = df_recent_months[~df_recent_months['name'].str.contains('Infant', case=False, na=False)]
    df_recent_months_filtered = df_recent_months_filtered[~df_recent_months_filtered['name'].str.contains('Bra', case=False, na=False)]
    
    recent_spike_products = df_recent_months_filtered.groupby(['main_category', 'target_audience', 'name']).agg(
        quantity_sum=('quantity', 'sum'),
        last_month_quantity=('quantity', lambda x: x.iloc[-1]),
        last_month_date=('date', lambda x: x.iloc[-1])
    ).reset_index()

    df_july_2023 = df[(df['date'].dt.month == 7) & (df['date'].dt.year == 2023)]
    df_july_2023_filtered = df_july_2023[~df_july_2023['name'].str.contains('Infant', case=False, na=False)]
    df_july_2023_filtered = df_july_2023_filtered[~df_july_2023_filtered['name'].str.contains('Bra', case=False, na=False)]
    
    previous_year_products = df_july_2023_filtered.groupby(['main_category', 'target_audience', 'name']).agg(
        quantity_sum_last_year=('quantity', 'sum')
    ).reset_index()

    recent_spike_products = recent_spike_products.merge(previous_year_products, on=['main_category', 'target_audience', 'name'], how='left', suffixes=('', '_last_year'))
    recent_spike_products['quantity_sum_last_year'] = recent_spike_products['quantity_sum_last_year'].fillna(0)

    recent_spike_products['has_spike'] = recent_spike_products['quantity_sum'] > recent_spike_products['quantity_sum_last_year'] * 1.5
    recent_spike_products['weight'] = recent_spike_products['quantity_sum_last_year'].apply(lambda x: 2 if x == 0 else 1)
    recent_spike_products['weighted_spike'] = recent_spike_products['has_spike'] * recent_spike_products['quantity_sum'] * recent_spike_products['weight']

    fashion_trend_products = recent_spike_products[recent_spike_products['has_spike']].sort_values(by=['weighted_spike', 'quantity_sum'], ascending=[False, False])
    fashion_top_products = fashion_trend_products.groupby(['main_category', 'target_audience']).head(10).reset_index(drop=True)

    # Merge to include product details
    fashion_top_products_details = fashion_top_products.merge(df[['name', 'product_id', 'price', 'rating', 'main_category', 'subcategory', 'img', 'extract_images', 'seller', 'discount']], on=['name', 'main_category'], how='left')
    
    fashion_top_10 = fashion_top_products_details[
        (fashion_top_products_details['main_category'] == main_category) & 
        (fashion_top_products_details['target_audience'] == target_audience)
    ][['name', 'product_id', 'price', 'main_category', 'subcategory', 'img', 'extract_images', 'seller', 'discount']].to_dict(orient='records')

    result = {
        "seasonal_top_products": seasonal_top_10,
        "fashion_trend_products": fashion_top_10
    }

    return result
