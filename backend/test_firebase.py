
from firebase_config import verify_token
import firebase_admin
print("Firebase App Name:", firebase_admin.get_app().name)
print("Backend verification successful.")
