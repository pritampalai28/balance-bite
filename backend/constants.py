
# Activity Multipliers
ACTIVITY_MULTIPLIERS = {
    'sedentary': 1.2,
    'lightly active': 1.375,
    'moderately active': 1.55,
    'very active': 1.725,
    'super active': 1.9
}

# Goal Multipliers (Adjust TDEE)
# Cutting: -500 kcal (or percentage-based, but fixed deficit is common)
# Bulking: +300-500 kcal
# For this implementation, we will likely apply these as modifiers to the TDEE in the logic function.
GOAL_MODIFIERS = {
    'cutting': 0.85, # 15% deficit
    'bulking': 1.10, # 10% surplus
    'maintenance': 1.0
}

# Macro Ratios (Protein, Fat, Carbs)
# Each tuple is (Protein %, Fat %, Carbs %)
MACRO_RATIOS = {
    'cutting': (0.40, 0.20, 0.40),      # High Protein to spare muscle
    'bulking': (0.25, 0.25, 0.50),      # High Carb for energy
    'maintenance': (0.30, 0.30, 0.40)   # Balanced
}

# Meal Distribution Weights
# Percentages of total daily calories per meal
MEAL_DISTRIBUTION = {
    3: [0.30, 0.40, 0.30],             # Breakfast, Lunch, Dinner
    4: [0.25, 0.35, 0.15, 0.25],       # Breakfast, Lunch, Snack, Dinner
    5: [0.20, 0.30, 0.10, 0.10, 0.30]  # Breakfast, Lunch, Snack 1, Snack 2, Dinner
}
