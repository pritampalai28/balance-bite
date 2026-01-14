from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
import logging
from datetime import datetime
import os
import io
from functools import wraps
from firebase_config import verify_token
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from dotenv import load_dotenv

# Import Constants
from constants import ACTIVITY_MULTIPLIERS, GOAL_MODIFIERS, MACRO_RATIOS, MEAL_DISTRIBUTION
from recipes import generate_recipes_with_mistral

load_dotenv()

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# MongoDB Configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DB_NAME = 'meal_plan_db'

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db['users']
    weekly_workout_collection = db['weekly_workout']
    suggestions_collection = db['suggestions']
    user_updates_collection = db['user_updates']
    print(f"Connected to MongoDB at {MONGO_URI}")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# --- Helper Functions ---

def get_bmr(sex, weight, height, age):
    if sex.lower() == 'male':
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

def get_tdee(bmr, a_level):
    return bmr * ACTIVITY_MULTIPLIERS.get(a_level.lower(), 1.2)

def calculate_macros(tdee, goal):
    goal_key = goal.lower()
    # Apply goal modifier to TDEE
    adjusted_calories = tdee * GOAL_MODIFIERS.get(goal_key, 1.0)
    
    # Get ratios
    p_ratio, f_ratio, c_ratio = MACRO_RATIOS.get(goal_key, MACRO_RATIOS['maintenance'])
    
    # Calculate grams (Protein/Carbs = 4 kcal/g, Fat = 9 kcal/g)
    protein_g = (adjusted_calories * p_ratio) / 4
    fat_g = (adjusted_calories * f_ratio) / 9
    carbs_g = (adjusted_calories * c_ratio) / 4
    
    return {
        'calories': adjusted_calories,
        'protein': round(protein_g, 1),
        'fat': round(fat_g, 1),
        'carbs': round(carbs_g, 1)
    }

def generate_meal_plan_logic(daily_macros, num_meals):
    """
    Distributes daily macros into meals based on weighted preference.
    """
    weights = MEAL_DISTRIBUTION.get(num_meals, [1/num_meals] * num_meals) # Fallback to equal split
    
    meal_plan = []
    meal_names = {
        3: ['Breakfast', 'Lunch', 'Dinner'],
        4: ['Breakfast', 'Lunch', 'Snack', 'Dinner'],
        5: ['Breakfast', 'Lunch', 'Snack 1', 'Snack 2', 'Dinner']
    }
    names = meal_names.get(num_meals, [f'Meal {i+1}' for i in range(num_meals)])

    for i, weight in enumerate(weights):
        meal = {
            'name': names[i],
            'calories': round(daily_macros['calories'] * weight, 1),
            'protein': round(daily_macros['protein'] * weight, 1),
            'fat': round(daily_macros['fat'] * weight, 1),
            'carbs': round(daily_macros['carbs'] * weight, 1)
        }
        meal_plan.append(meal)
    
    return meal_plan

# --- Auth Middleware ---

def check_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized: Missing or invalid token'}), 401
        
        token = auth_header.split(' ')[1]
        decoded_token = verify_token(token)
        
        if not decoded_token:
            return jsonify({'error': 'Unauthorized: Invalid token'}), 401
            
        request.user = decoded_token # Attach user info to request
        return f(*args, **kwargs)
    return decorated_function

# --- Routes ---

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to Balance Bite API'})

@app.route('/api/signup', methods=['POST'])
@check_auth
def signup():
    # User is already created in Firebase on frontend. 
    # Here we creates/updates the user document in MongoDB.
    data = request.get_json()
    uid = request.user['uid']
    email = request.user['email']
    
    # Extract profile data
    name = data.get('name')
    age = int(data.get('age', 0))
    height = float(data.get('height', 0))
    weight = float(data.get('weight', 0))
    meals = int(data.get('meals', 3))
    sex = data.get('sex', 'male')
    a_level = data.get('a_level', 'sedentary')
    is_admin = data.get('is_admin', False)
    
    # New Fields
    goal = data.get('goal', 'maintenance')
    diet_type = data.get('diet_type', 'standard')
    disliked_ingredients = data.get('disliked_ingredients', []) # List of strings

    # Core Logic
    bmr = get_bmr(sex, weight, height, age)
    tdee = get_tdee(bmr, a_level)
    
    # Calculate Macros based on Goal
    daily_macros = calculate_macros(tdee, goal)
    meal_plan = generate_meal_plan_logic(daily_macros, meals)
    
    user_doc = {
        '_id': uid, # Use Firebase UID as MongoDB _id
        'email': email,
        'name': name,
        'age': age,
        'height': height,
        'weight': weight,
        'meals': meals,
        'sex': sex,
        'a_level': a_level,
        'goal': goal,
        'diet_type': diet_type,
        'disliked_ingredients': disliked_ingredients,
        'bmr': bmr,
        'tdee': tdee, # Base TDEE
        'target_calories': daily_macros['calories'], # Adjusted calories
        'total_carbs': daily_macros['carbs'],
        'total_protein': daily_macros['protein'],
        'total_fat': daily_macros['fat'],
        'is_admin': is_admin,
        'created_at': datetime.utcnow()
    }

    try:
        users_collection.replace_one({'_id': uid}, user_doc, upsert=True)
        return jsonify({'message': 'User profile created/updated successfully', 'user': user_doc})
    except Exception as e:
        logger.error(f"Error saving user: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
@check_auth
def get_profile():
    uid = request.user['uid']
    user = users_collection.find_one({'_id': uid})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(user)

@app.route('/api/user/update', methods=['POST'])
@check_auth
def update_profile():
    uid = request.user['uid']
    data = request.get_json()
    
    user = users_collection.find_one({'_id': uid})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Update allowed fields
    weight = float(data.get('weight', user['weight']))
    meals = int(data.get('meals', user['meals']))
    a_level = data.get('a_level', user['a_level'])
    goal = data.get('goal', user.get('goal', 'maintenance'))
    diet_type = data.get('diet_type', user.get('diet_type', 'Standard'))
    
    # Recalculate
    bmr = get_bmr(user['sex'], weight, user['height'], user['age'])
    tdee = get_tdee(bmr, a_level)
    
    # Recalculate Macros
    daily_macros = calculate_macros(tdee, goal)
    meal_plan = generate_meal_plan_logic(daily_macros, meals)
    

    update_doc = {
        'weight': weight,
        'meals': meals,
        'a_level': a_level,
        'goal': goal,
        'diet_type': diet_type,
        'bmr': bmr,
        'tdee': tdee,
        'target_calories': daily_macros['calories'],
        'total_carbs': daily_macros['carbs'],
        'total_protein': daily_macros['protein'],
        'total_fat': daily_macros['fat']
    }
    
    # Log update
    log_entry = {
        'user_id': uid,
        'weight': weight,
        'meals': meals,
        'activity_level': a_level,
        'goal': goal,
        'diet_type': diet_type,
        'tdee': tdee,
        'target_calories': daily_macros['calories'],
        'carbs': daily_macros['carbs'],
        'protein': daily_macros['protein'],
        'fat': daily_macros['fat'],
        'updated_at': datetime.utcnow()
    }

    try:
        users_collection.update_one({'_id': uid}, {'$set': update_doc})
        user_updates_collection.insert_one(log_entry)
        
        # Return updated full profile + meal plan
        new_profile = users_collection.find_one({'_id': uid})
        return jsonify({
            'message': 'Profile updated',
            'user': new_profile,
            'meal_plan': meal_plan
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/meal-plan', methods=['GET'])
@check_auth
def get_meal_plan():
    uid = request.user['uid']
    user = users_collection.find_one({'_id': uid})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Re-generate meal plan on the fly to ensure it matches current stats
    # (Or we could store the meal plan in DB, but calculating it is cheap)
    daily_macros = {
        'calories': user.get('target_calories', user['tdee']), # Fallback for old users
        'protein': user['total_protein'],
        'fat': user['total_fat'],
        'carbs': user['total_carbs']
    }
    
    meal_plan = generate_meal_plan_logic(daily_macros, user['meals'])
    return jsonify({'meal_plan': meal_plan})


@app.route('/api/workout', methods=['POST'])
@check_auth
def add_workout():
    uid = request.user['uid']
    data = request.get_json()
    
    if not data or 'workoutType' not in data or 'weekStart' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    workout_entry = {
        'user_id': uid,
        'workout_type': data['workoutType'],
        'week_start': data['weekStart'],
        'week_data': data.get('weekData', {}),
        'created_at': datetime.utcnow()
    }

    try:
        weekly_workout_collection.insert_one(workout_entry)
        return jsonify({'message': 'Workout data added'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestion', methods=['POST'])
@check_auth
def add_suggestion():
    data = request.get_json()
    suggestion = data.get('suggestion')
    if not suggestion:
        return jsonify({'error': 'Empty suggestion'}), 400
        
    try:
        suggestions_collection.insert_one({
            'user_id': request.user['uid'],
            'suggestion': suggestion,
            'created_at': datetime.utcnow()
        })
        return jsonify({'message': 'Suggestion submitted'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/generate-recipes', methods=['POST'])
@check_auth
def get_ai_recipes():
    """
    Generates recipes for a specific user using Mistral AI.
    """
    uid = request.user['uid']
    data = request.get_json()
    meal_name = data.get('meal_name', 'Meal')
    
    user = users_collection.find_one({'_id': uid})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Calculate current daily macros
    daily_macros = {
        'protein': user.get('total_protein'),
        'fat': user.get('total_fat'),
        'carbs': user.get('total_carbs')
    }
    
    # Use diet type from user profile, or updated one if frontend sends it (optional)
    diet_type = user.get('diet_type', 'Standard')
    excluded = user.get('disliked_ingredients', [])

    # Call AI Helper
    result = generate_recipes_with_mistral(
        user_profile=user,
        daily_macros=daily_macros,
        meal_name=meal_name,
        diet_type=diet_type,
        excluded_ingredients=excluded
    )
    
    if "error" in result:
        return jsonify(result), 500 if "not configured" in result["error"] else 400
    
    return jsonify({'recipe': result})

# --- Reports ---

@app.route('/api/report/user-updates', methods=['GET'])
@check_auth
def download_user_report():
    uid = request.user['uid']
    updates = list(user_updates_collection.find({'user_id': uid}).sort('updated_at', -1))
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    elements.append(canvas.Canvas(buffer).drawString(100, 750, "User Updates Report"))
    elements.append(canvas.Canvas(buffer).drawString(100, 730, f"User ID: {uid}"))
    
    # headers = ["Date", "Weight", "Meals", "Activity", "Carbs", "Protein", "Fat"]
    # Updated headers to include Goal
    data = [["Date", "Weight", "Goal", "Activity", "Cal", "P", "F", "C"]]
    
    for u in updates:
        # Format date safely
        date_str = u['updated_at'].strftime('%Y-%m-%d') if isinstance(u['updated_at'], datetime) else str(u['updated_at'])
        
        # Handle missing keys for backward compatibility
        goal_val = u.get('goal', 'N/A')
        cal_val = u.get('target_calories', u.get('tdee', 0))
        
        data.append([
            date_str,
            str(u['weight']),
            goal_val,
            u['activity_level'],
            f"{int(cal_val)}",
            f"{int(u['protein'])}",
            f"{int(u['fat'])}",
            f"{int(u['carbs'])}"
        ])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 0), (-1, -1), 8), # Smaller font to fit more columns
    ]))
    
    elements.append(table)
    try:
        doc.build(elements)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='user_updates_report.pdf', mimetype='application/pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Admin Helper ---

def check_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        uid = request.user['uid']
        user = users_collection.find_one({'_id': uid})
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Forbidden: Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Admin Routes ---

@app.route('/api/admin/users', methods=['GET'])
@check_auth
@check_admin
def list_users():
    try:
        users = list(users_collection.find({}, {'_id': 1, 'name': 1, 'email': 1, 'goal': 1, 'created_at': 1}))
        # Convert ObjectId and datetime for JSON serialization
        for user in users:
            user['_id'] = str(user['_id'])
            if 'created_at' in user and isinstance(user['created_at'], datetime):
                user['created_at'] = user['created_at'].isoformat()
        return jsonify({'users': users})
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/suggestions', methods=['GET'])
@check_auth
@check_admin
def list_suggestions():
    try:
        suggestions = list(suggestions_collection.find({}).sort('created_at', -1))
        for s in suggestions:
            s['_id'] = str(s['_id'])
            if 'created_at' in s and isinstance(s['created_at'], datetime):
                s['created_at'] = s['created_at'].isoformat()
        return jsonify({'suggestions': suggestions})
    except Exception as e:
        logger.error(f"Error listing suggestions: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)

