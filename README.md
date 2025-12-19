# BLANCE-BITE

> **Note:** This project is under continuous development.

## Overview
BLANCE-BITE is a full-stack web application featuring a Next.js frontend and a Flask backend. It integrates with Firebase and MongoDB to provide real-time data and analytics features.





## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.8+)
- MongoDB running locally or remotely

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd BLANCE-BITE
    ```

2.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    # Set up environment variables (see env_template.txt if available)
    npm run dev
    ```
    The frontend will run at `http://localhost:3000`.

3.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    # Ensure MongoDB is running locally on port 27017
    python app.py
    ```
    The backend runs on `http://127.0.0.1:5000` (default Flask port).



