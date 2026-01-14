
import os
import json
import logging
from mistralai import Mistral
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")


def generate_recipes_with_mistral(user_profile, daily_macros, meal_name="Meal", diet_type="Standard", excluded_ingredients=None):
    """
    Generates recipes using Mistral AI based on user macros and preferences.
    Returns a list of structured recipe objects.
    """
    if not MISTRAL_API_KEY:
        logger.error("MISTRAL_API_KEY not found.")
        return {"error": "AI service not configured"}

    if excluded_ingredients is None:
        excluded_ingredients = []

    client = Mistral(api_key=MISTRAL_API_KEY)
    
    # Construct the prompt
    prompt = f"""
    You are an expert fitness chef. Create a delicious **{diet_type}** recipe for **{meal_name}** that fits these specific requirements:
    
    **Target Macros for this Meal:**
    - Protein: {daily_macros.get('protein', 0) / 3:.1f}g (Approx)
    - Fat: {daily_macros.get('fat', 0) / 3:.1f}g (Approx)
    - Carbs: {daily_macros.get('carbs', 0) / 3:.1f}g (Approx)
    
    **Dietary Preferences:**
    - Diet Type: {diet_type}
    - Excluded Ingredients: {', '.join(excluded_ingredients) if excluded_ingredients else 'None'}
    
    **Instructions:**
    1. Generate 1 creative, delicious {diet_type} recipe for {meal_name} that closely matches these macros.
    2. Provide the response in strict JSON format.
    3. Do not include markdown formatting (like ```json), just the raw JSON string.
    
    **JSON Schema:**
    {{
        "name": "Recipe Name",
        "description": "Brief description",
        "ingredients": ["100g Chicken Breast", "1 cup Rice", ...],
        "instructions": ["Step 1...", "Step 2..."],
        "macros": {{
            "protein": 30,
            "fat": 10,
            "carbs": 40,
            "calories": 400
        }},
        "prep_time": "15 mins"
    }}
    """
    
    try:
        response = client.chat.complete(
            model="mistral-small-latest",
            messages=[
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        recipe_data = json.loads(content)
        return recipe_data

    except Exception as e:
        logger.error(f"Mistral AI Error: {e}")
        return {"error": f"Failed to generate recipe: {str(e)}"}

