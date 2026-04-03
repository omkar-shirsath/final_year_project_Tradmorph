from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI()

# 1. DYNAMIC PATH LOADING
# This ensures it finds the model file even if you move the folder
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "behavioral_engine_v2.pkl")

# Load the new generalized model
try:
    model = joblib.load(MODEL_PATH)
    print("✅ ML Model loaded successfully from ml_service folder")
except Exception as e:
    print(f"❌ Error loading model: {e}")

class TradeData(BaseModel):
    holdingTimeDays: float
    pnlPercent: float
    priceRunupBeforeEntry: float
    maxGainAfterExit: float
    rsi: float  # New feature added in Day 1

@app.post("/predict")
async def predict_behavior(data: TradeData):
    # Convert input to DataFrame for the model
    input_df = pd.DataFrame([data.dict()])
    
    prediction = model.predict(input_df)[0]
    
    # Mapping numbers back to human-readable labels for your Modal
    labels = {
        0: "NORMAL",
        1: "FOMO_BUY",
        2: "PREMATURE_EXIT"
    }
    
    # Behavioral explanations for the "Warning Modal"
    explanations = {
        0: "This trade aligns with rational market patterns.",
        1: "Warning: You are buying after a high price surge (RSI > 70). This is a classic FOMO pattern.",
        2: "Warning: You are selling too early. Historical data suggests this stock often rallies further after this point."
    }

    return {
        "label": labels[prediction],
        "explanation": explanations[prediction],
        "status": "success"
    }

if __name__ == "__main__":
    import uvicorn
    # Running on 8000 to keep it separate from Node.js (5000)
    uvicorn.run(app, host="0.0.0.0", port=8000)