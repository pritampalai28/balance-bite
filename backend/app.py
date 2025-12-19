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
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'super active': 1.9
    }
    return bmr * activity_multipliers.get(a_level.lower(), 1.2)

def generate_meal_plan_logic(calories, num_meals):
    calories_per_meal = calories / num_meals
    meal_plan = []
    for i in range(num_meals):
        meal = {
            'carbs': round(calories_per_meal * 0.5 / 4, 1),
            'protein': round(calories_per_meal * 0.3 / 4, 1),
            'fat': round(calories_per_meal * 0.2 / 9, 1),
            'calories': round(calories_per_meal, 1)
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

    # Core Logic
    bmr = get_bmr(sex, weight, height, age)
    tdee = get_tdee(bmr, a_level)
    meal_plan = generate_meal_plan_logic(tdee, meals)
    
    total_carbs = sum(m['carbs'] for m in meal_plan)
    total_protein = sum(m['protein'] for m in meal_plan)
    total_fat = sum(m['fat'] for m in meal_plan)

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
        'bmr': bmr,
        'tdee': tdee,
        'total_carbs': total_carbs,
        'total_protein': total_protein,
        'total_fat': total_fat,
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
    
    # Recalculate
    bmr = get_bmr(user['sex'], weight, user['height'], user['age'])
    tdee = get_tdee(bmr, a_level)
    meal_plan = generate_meal_plan_logic(tdee, meals)
    
    total_carbs = sum(m['carbs'] for m in meal_plan)
    total_protein = sum(m['protein'] for m in meal_plan)
    total_fat = sum(m['fat'] for m in meal_plan)

    update_doc = {
        'weight': weight,
        'meals': meals,
        'a_level': a_level,
        'bmr': bmr,
        'tdee': tdee,
        'total_carbs': total_carbs,
        'total_protein': total_protein,
        'total_fat': total_fat
    }
    
    # Log update
    log_entry = {
        'user_id': uid,
        'weight': weight,
        'meals': meals,
        'activity_level': a_level,
        'carbs': total_carbs,
        'protein': total_protein,
        'fat': total_fat,
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
    
    meal_plan = generate_meal_plan_logic(user['tdee'], user['meals'])
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
    
    data = [["Date", "Weight", "Meals", "Activity", "Carbs", "Protein", "Fat"]]
    for u in updates:
        # Format date safely
        date_str = u['updated_at'].strftime('%Y-%m-%d %H:%M') if isinstance(u['updated_at'], datetime) else str(u['updated_at'])
        data.append([
            date_str,
            u['weight'],
            u['meals'],
            u['activity_level'],
            u['carbs'],
            u['protein'],
            u['fat']
        ])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    try:
        doc.build(elements)
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='user_updates_report.pdf', mimetype='application/pdf')
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
