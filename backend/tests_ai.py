
from recipes import generate_recipes_with_mistral
import os

def test_ai_generation():
    print("--- Testing AI Recipe Generation ---")
    
    # Mock data
    user_profile = {'name': 'Test User'}
    daily_macros = {'protein': 150, 'fat': 70, 'carbs': 200}
    
    # Test without key (assuming key is missing or invalid)
    print("Testing with current environment...")
    result = generate_recipes_with_mistral(user_profile, daily_macros)
    print(f"Result: {result}")
    
    if "error" in result and "AI service not configured" in result["error"]:
        print("SUCCESS: Handled missing key correctly.")
    elif "name" in result:
        print("SUCCESS: Generated recipe!")
    else:
        print("WARNING: Unexpected response.")

if __name__ == "__main__":
    test_ai_generation()
