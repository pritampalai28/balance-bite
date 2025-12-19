
import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv

load_dotenv()


# Initialize Firebase Admin SDK
# You need to provide the path to your serviceAccountKey.json
# It is recommended to use an environment variable for the path or the credentials dictionary directly

cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'balance-bite-cb8e9-firebase-adminsdk-fbsvc-62d7ff2d2a.json')

if not firebase_admin._apps:
    try:
        # Construct absolute path to ensure file is found relative to this script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        abs_cred_path = os.path.join(base_dir, cred_path)
        
        if os.path.exists(abs_cred_path):
            cred = credentials.Certificate(abs_cred_path)
            firebase_admin.initialize_app(cred)
            print(f"Firebase Admin SDK initialized with certificate: {abs_cred_path}")
        else:
            print(f"Warning: Credential file not found at {abs_cred_path}. Falling back to default.")
            # Fallback or default initialization (e.g., for Google Cloud Run)
            firebase_admin.initialize_app()
            print("Firebase Admin SDK initialized with default credentials.")
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK: {e}")

def verify_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None
