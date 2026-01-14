# 🍽️ BalanceBite

> AI-Powered Nutrition & Meal Planning Application

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Flask](https://img.shields.io/badge/Flask-3.x-green?logo=flask)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?logo=mongodb)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?logo=firebase)

BalanceBite is a full-stack nutrition tracking application that helps users manage their macros, generate AI-powered recipes, and achieve their fitness goals - whether cutting, bulking, or maintaining.

## ✨ Features

- **🔐 Firebase Authentication** - Secure login/signup with email & password
- **📊 Macro Calculation** - Automatic BMR, TDEE, and macro targets based on your stats
- **🍳 AI Recipe Generation** - Get personalized recipes using Mistral AI
- **📈 Analytics Dashboard** - Track progress with charts and heatmaps
- **🎯 Goal-Based Planning** - Cutting, bulking, or maintenance modes
- **📱 Responsive Design** - Beautiful dark theme UI on all devices
- **📄 PDF Reports** - Download your progress reports

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** with React 19
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Chart.js** for data visualization
- **Lucide React** for icons

### Backend
- **Flask** REST API
- **MongoDB** for data storage
- **Firebase Admin SDK** for auth verification
- **Mistral AI** for recipe generation
- **ReportLab** for PDF generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- Firebase project

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "MISTRAL_API_KEY=your_mistral_api_key" > .env

# Run server
python3 app.py
```

Server runs on `http://127.0.0.1:5001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

App runs on `http://localhost:3000`

## 📁 Project Structure

```
BALANCE-BITE/
├── backend/
│   ├── app.py              # Flask API routes
│   ├── constants.py        # Macro ratios & multipliers
│   ├── recipes.py          # Mistral AI integration
│   ├── firebase_config.py  # Firebase Admin setup
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── login/          # Login page
│   │   │   ├── signup/         # Signup page
│   │   │   └── admin/          # Admin panel
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MacroRing.tsx
│   │   │   ├── RecipeCard.tsx
│   │   │   └── Toast.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── lib/
│   │       └── firebase.ts
│   └── package.json
│
└── README.md
```

## 🔑 Environment Variables

### Backend (.env)
```
MISTRAL_API_KEY=your_mistral_api_key
MONGO_URI=mongodb://localhost:27017/
FIREBASE_CREDENTIALS_PATH=your-firebase-adminsdk.json
```

### Frontend
Firebase config is in `src/lib/firebase.ts`

## 📸 Screenshots

| Landing Page | Dashboard |
|-------------|-----------|
| Modern hero with animations | Macro rings & meal plans |

| Nutrition | Analytics |
|-----------|-----------|
| Daily targets & recipes | Charts & heatmaps |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes.

---

Made with ❤️ by Pritam
