# Trademorph Project Setup & Execution Guide

This document outlines the commands, packages, and libraries required to run the Trademorph project locally. The project is split into three main components: Client (Frontend), Server (Backend Node API), and ML Service (Python API).

## 1. Prerequisites
- **Node.js**: (Version 18+ recommended)
- **Python**: (Version 3.8+ recommended)
- **MongoDB**: (Local installation or MongoDB Atlas URI in `.env`)

---

## 2. Server (Backend Node API)

The backend handles authentication, database operations, and external API requests.

### Path
`c:\Users\Asus\Desktop\Trademorph\server`

### Setup Commands
```bash
cd server
npm install
```

### Required Packages (from package.json)
- `express`: Web framework
- `mongoose`: MongoDB object modeling
- `jsonwebtoken`: JWT for auth
- `bcryptjs`: Password hashing
- `yahoo-finance2`: Yahoo Finance API wrapper
- `cors`: Cross-Origin Resource Sharing
- `dotenv`: Environment variable management
- `nodemon`: Development server auto-restart

### Execution Command
```bash
npm run dev
```
*(Runs on port 5000 by default, configured in server setup)*

---

## 3. Client (Frontend Web App)

The frontend is a React application built with Vite and Tailwind CSS.

### Path
`c:\Users\Asus\Desktop\Trademorph\client`

### Setup Commands
```bash
cd client
npm install
```

### Required Packages (from package.json)
- `react`, `react-dom`: UI library
- `axios`: HTTP client
- `recharts`: Charting library
- `lucide-react`: Icons
- `tailwindcss`, `postcss`, `autoprefixer`: Styling
- `vite`: Build tool and dev server

### Execution Command
```bash
npm run dev
```
*(Typically runs on port 5173, check Vite's output in the terminal)*

---

## 4. ML Service (Behavioral Prediction Engine)

The machine learning service runs a FastAPI server interacting with your trained `.pkl` model.

### Path
`c:\Users\Asus\Desktop\Trademorph\ml_service`

### Setup Commands
It's recommended to use a virtual environment:
```bash
cd ml_service

# Create and activate virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install required packages
pip install -r requirements.txt
```

### Required Libraries (in requirements.txt)
- `fastapi`: Web framework for APIs
- `uvicorn`: ASGI server for FastAPI
- `pydantic`: Data validation
- `joblib`: Model loading/saving
- `scikit-learn`: Required to load the model and make predictions
- `pandas`: Data manipulation to frame input for the model

### Execution Command
```bash
python predict.py
```
*(Runs on `http://0.0.0.0:8000` as defined in `predict.py`)*

---

## Summary Execution Flow (All Terminals)

To run the whole application, open 3 separate terminals:

**Terminal 1 (Server):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (ML Service):**
```bash
cd ml_service
pip install -r requirements.txt
python predict.py
```

**Terminal 3 (Client):**
```bash
cd client
npm install
npm run dev
```
