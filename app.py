from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_file
import mysql.connector
import json
import logging
from mysql.connector import Error
from datetime import datetime
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
import io

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'your_secret_key'


DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASSWORD = ''
DB_NAME = 'meal_plan'


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error: {e}")
    return None

def get_bmr(sex, weight, height, age):
    if sex.lower() == 'male':
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)

# TDEE Calculation
def get_tdee(bmr, a_level):
    activity_multipliers = {
        'sedentary': 1.2,
        'lightly active': 1.375,
        'moderately active': 1.55,
        'very active': 1.725,
        'super active': 1.9
    }
    return bmr * activity_multipliers.get(a_level.lower(), 1.2)

# Meal Plan Generation
def generate_meal_plan(calories, num_meals):
    calories_per_meal = calories / num_meals
    meal_plan = []
    for i in range(num_meals):
        meal = {
            'carbs': calories_per_meal * 0.5 / 4,
            'protein': calories_per_meal * 0.3 / 4,
            'fat': calories_per_meal * 0.2 / 9
        }
        meal_plan.append(meal)
    return meal_plan

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Capture form data
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        age = int(request.form['age'])
        height = float(request.form['height'])
        weight = float(request.form['weight'])
        meals = int(request.form['meals'])
        sex = request.form['sex']
        a_level = request.form.get('a_level')  # Capture activity level

        
        # Calculate BMR and TDEE
        bmr = get_bmr(sex, weight, height, age)
        tdee = get_tdee(bmr, a_level)
        meal_plan = generate_meal_plan(tdee, meals)

        # Macronutrients totals
        total_carbs = sum(meal['carbs'] for meal in meal_plan)
        total_protein = sum(meal['protein'] for meal in meal_plan)
        total_fat = sum(meal['fat'] for meal in meal_plan)

        # Store data in the database
        connection = get_db_connection()
        cursor = connection.cursor()

        try:
            cursor.execute(
                """INSERT INTO users (name, email, password, age, height, weight, meals, sex, a_level, carbs, protein, fat)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (name, email, password, age, height, weight, meals, sex, a_level, total_carbs, total_protein, total_fat)
            )
            connection.commit()
            flash('Account created successfully! Please login.', 'success')
            return redirect(url_for('login'))
        except Error as e:
            print(f"Database Error: {e}")
            flash(f"Error: {e}", 'danger')
        finally:
            cursor.close()
            connection.close()

    return render_template('signup.html')



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
            user = cursor.fetchone()

            if user:
                session['user_id'] = user['id']
                session['user_name'] = user['name']

                # Check if the user is an admin
                if user['is_admin']:
                    session['admin_logged_in'] = True
                    flash('Admin login successful!', 'success')
                    return redirect(url_for('admin_dashboard'))
                else:
                    flash('Login successful!', 'success')
                    return redirect(url_for('user_dashboard'))
            else:
                flash('Invalid email or password.', 'danger')
        except Error as e:
            flash(f"Error: {e}", 'danger')
        finally:
            cursor.close()
            connection.close()

    return render_template('login.html')




@app.route('/download_user_report')
def download_user_report():
    if 'user_id' not in session:
        flash('Please log in to download your report.', 'warning')
        return redirect(url_for('login'))

    user_id = session['user_id']
    connection = get_db_connection()
    if connection is None:
        return "Database connection failed!", 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT user_id, update_id, weight, meals, activity_level, carbs, protein, fat, updated_at
        FROM user_updates
        WHERE user_id = %s
        ORDER BY updated_at DESC
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()

        # Create a PDF file in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []

        # Add title
        elements.append(canvas.Canvas(buffer).drawString(100, 750, "User Updates Report"))
        elements.append(canvas.Canvas(buffer).drawString(100, 730, f"User ID: {user_id}"))

        # Create table data
        data = [["Update ID", "Weight", "Meals", "Activity Level", "Carbs", "Protein", "Fat", "Updated At"]]
        for row in rows:
            data.append([row['update_id'], row['weight'], row['meals'], row['activity_level'], row['carbs'], row['protein'], row['fat'], row['updated_at']])

        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))

        elements.append(table)
        doc.build(elements)

        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='user_updates_report.pdf', mimetype='application/pdf')
    except Error as e:
        logger.error(f"Error fetching data: {e}")
        return "An error occurred while fetching data.", 500
    finally:
        connection.close()

@app.route('/download_weekly_report')
def download_weekly_report():
    if 'user_id' not in session:
        flash('Please log in to download your report.', 'warning')
        return redirect(url_for('login'))

    user_id = session['user_id']
    connection = get_db_connection()
    if connection is None:
        return "Database connection failed!", 500

    try:
        cursor = connection.cursor(dictionary=True)
        query = """
        SELECT id, user_id, workout_type, week_start, monday, tuesday, wednesday, thursday, friday, saturday, sunday
        FROM weekly_workout_data
        WHERE user_id = %s
        ORDER BY week_start DESC
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()

        # Create a PDF file in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []

        # Add title
        elements.append(canvas.Canvas(buffer).drawString(100, 750, "Weekly Workout Report"))
        elements.append(canvas.Canvas(buffer).drawString(100, 730, f"User ID: {user_id}"))

        # Create table data
        data = [["ID", "Workout Type", "Week Start", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]]
        for row in rows:
            data.append([row['id'], row['workout_type'], row['week_start'], row['monday'], row['tuesday'], row['wednesday'], row['thursday'], row['friday'], row['saturday'], row['sunday']])

        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))

        elements.append(table)
        doc.build(elements)

        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='weekly_workout_report.pdf', mimetype='application/pdf')
    except Error as e:
        logger.error(f"Error fetching data: {e}")
        return "An error occurred while fetching data.", 500
    finally:
        connection.close()


@app.route('/add_workout_data', methods=['POST'])
def add_workout_data():
    if 'user_id' not in session:
        flash('Please log in to add workout data.', 'warning')
        return redirect(url_for('login'))

    user_id = session['user_id']
    data = request.get_json()  

    if not data:
        return jsonify({'error': 'No data received.'}), 400  

    
    required_fields = ['workoutType', 'weekStart', 'weekData']

    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    
    if not isinstance(data.get('weekData', {}), dict):
        return jsonify({'error': 'Invalid weekData: must be an object with daily values.'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        
        workout_type = data['workoutType']
        week_start = data['weekStart']
        week_data = data['weekData']

        for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']:
            week_data[day] = float(week_data.get(day, 0))

        cursor.execute(
            "INSERT INTO weekly_workout_data (user_id, workout_type, week_start, monday, tuesday, wednesday, thursday, friday, saturday, sunday) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (user_id, workout_type, week_start, week_data['monday'], week_data['tuesday'], week_data['wednesday'],
             week_data['thursday'], week_data['friday'], week_data['saturday'], week_data['sunday']),
        )
        print(f"Inserted weekly workout data: {user_id}, {workout_type}, {week_start}, {week_data}")

        connection.commit()
        return jsonify({'message': 'Workout data added successfully!'}), 200

    except Exception as e:
        logger.error(f"Database Error: {e}")
        return jsonify({'error': 'An error occurred while adding workout data.'}), 500

    finally:
        cursor.close()
        connection.close()
 


@app.route('/user_dashboard', methods=['GET', 'POST'])
def user_dashboard():
    if 'user_id' not in session:
        flash("Please log in to access your dashboard.", "warning")
        return redirect(url_for('login'))

    user_id = session['user_id']
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
       
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            flash('User not found.', 'danger')
            return redirect(url_for('login'))

       
        if request.method == 'POST':
            
            if 'generate_meal_plan' in request.form:  
                weight = float(request.form['weight'])
                meals = int(request.form['meals'])
                a_level = request.form['a_level']

                # Debugging: Check received form data
                print(f"Updated values received: weight={weight}, meals={meals}, activity_level={a_level}")

                # Recalculate BMR, TDEE, and Meal Plan
                bmr = get_bmr(user['sex'], weight, user['height'], user['age'])
                tdee = get_tdee(bmr, a_level)
                meal_plan = generate_meal_plan(tdee, meals)

                # Calculate new macros
                total_carbs = sum(meal['carbs'] for meal in meal_plan)
                total_protein = sum(meal['protein'] for meal in meal_plan)
                total_fat = sum(meal['fat'] for meal in meal_plan)

                try:
                    # Log the updates in the `user_updates` table only when meal plan is generated
                    cursor.execute(
                        """INSERT INTO user_updates 
                           (user_id, weight, meals, activity_level, carbs, protein, fat, updated_at)
                           VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())""",
                        (user_id, weight, meals, a_level, total_carbs, total_protein, total_fat)
                    )
                    connection.commit()  # Save the changes
                    

                    flash('Your updates have been saved and your meal plan has been recalculated!', 'success')

                except Error as e:
                    print(f"Database Error: {e}")
                    flash(f"Error saving your updates: {e}", 'danger')

        # Fetch the latest update from user_updates table
        cursor.execute(
            """SELECT * FROM user_updates WHERE user_id = %s ORDER BY updated_at DESC LIMIT 1""",
            (user_id,)
        )
        latest_update = cursor.fetchone()

       

        if latest_update:
            # Use the latest user update details to calculate the meal plan
            weight = latest_update['weight']
            meals = latest_update['meals']
            a_level = latest_update['activity_level']

            # Debugging: Show what data will be used for calculation
            

            bmr = get_bmr(user['sex'], weight, user['height'], user['age'])
            tdee = get_tdee(bmr, a_level)
            meal_plan = generate_meal_plan(tdee, meals)
        else:
            # Default to original user data if no updates are found
            bmr = get_bmr(user['sex'], user['weight'], user['height'], user['age'])
            tdee = get_tdee(bmr, user['a_level'])
            meal_plan = generate_meal_plan(tdee, user['meals'])

        # Return the rendered template with user and meal plan data
        return render_template('user_dashboard.html', user=user, meal_plan=meal_plan, latest_update=latest_update)

    except Error as e:
        print(f"Error: {e}")
        flash(f"Error: {e}", 'danger')
        return redirect(url_for('login'))

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/submit_suggestion', methods=['POST'])
def submit_suggestion():
    suggestion = request.form['suggestion']
    
    # Save suggestion to the database or perform your desired actions here
    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        cursor.execute("INSERT INTO suggestions (suggestion) VALUES (%s)", (suggestion,))
        connection.commit()
        flash('Suggestion submitted successfully!', 'success')
    except Error as e:
        flash(f"Error: {e}", 'danger')
    finally:
        cursor.close()
        connection.close()

    return redirect(url_for('user_dashboard'))

@app.route('/admin_dashboard')
def admin_dashboard():
    if not session.get('admin_logged_in'):
        flash('You need to log in as an admin to access this page.', 'danger')
        return redirect(url_for('login'))

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Fetch all users except admins
        cursor.execute(
            "SELECT id, name, age, height, weight, meals, sex, a_level, carbs, protein, fat FROM users WHERE is_admin = 0"
        )
        users = cursor.fetchall()
         # Debugging output

        # Fetch suggestions
        cursor.execute("SELECT * FROM suggestions")
        suggestions = cursor.fetchall()

    except Error as e:
        flash(f"Error: {e}", 'danger')
        return redirect(url_for('login'))
    finally:
        cursor.close()
        connection.close()

    return render_template('admin_dashboard.html', users=users, suggestions=suggestions)

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)




