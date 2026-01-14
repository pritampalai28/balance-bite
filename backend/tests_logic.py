
from app import calculate_macros, generate_meal_plan_logic, get_tdee, get_bmr
from constants import MEAL_DISTRIBUTION

def test_calculations():
    print("--- Testing Calculations ---")
    
    # 1. Test BMR & TDEE
    # Male, 80kg, 180cm, 25 years, Moderate
    # BMR = 88.362 + (13.397*80) + (4.799*180) - (5.677*25) = 88.362 + 1071.76 + 863.82 - 141.925 = 1882.017
    # TDEE = 1882 * 1.55 = 2917
    bmr = get_bmr('male', 80, 180, 25)
    tdee = get_tdee(bmr, 'moderately active')
    print(f"BMR: {bmr:.2f} (Expected ~1882)")
    print(f"TDEE: {tdee:.2f} (Expected ~2917)")
    
    # 2. Test Goal: Cutting
    # TDEE 2917 * 0.85 = ~2479.5
    # Protein: 2479.5 * 0.40 / 4 = 247.95g
    macros_cut = calculate_macros(tdee, 'cutting')
    print(f"\nCutting Macros (Expected ~2480kcal, High Protein):")
    print(macros_cut)
    
    # 3. Test Goal: Bulking
    # TDEE 2917 * 1.10 = ~3208
    # Carbs: 3208 * 0.50 / 4 = 401g
    macros_bulk = calculate_macros(tdee, 'bulking')
    print(f"\nBulking Macros (Expected ~3208kcal, High Carb):")
    print(macros_bulk)
    
    # 4. Test Meal Distribution (4 Meals)
    # [0.25, 0.35, 0.15, 0.25]
    print(f"\nMeal Plan (4 Meals, Cutting):")
    meal_plan = generate_meal_plan_logic(macros_cut, 4)
    for meal in meal_plan:
        print(f"{meal['name']}: {meal['calories']}kcal (P: {meal['protein']}g)")
        
    total_cal = sum(m['calories'] for m in meal_plan)
    print(f"Total Plan Calories: {total_cal:.1f} (Should match {macros_cut['calories']:.1f})")

if __name__ == "__main__":
    test_calculations()
