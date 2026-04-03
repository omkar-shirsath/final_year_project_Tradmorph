import os
import json
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# Configuration - Matches your existing path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: Ensure your trained model is named 'behavioral_engine.pkl' or update this line
MODEL_PATH = os.path.join(BASE_DIR, 'trained_models', 'behavioral_engine.pkl')

class TradeIn(BaseModel):
    holdingTimeDays: int
    pnlPercent: float
    priceRunupBeforeEntry: float
    maxGainAfterExit: float

class BehavioralClassifier:
    def __init__(self):
        self.model = None
        self.feature_names = ['holdingTimeDays', 'pnlPercent', 
                             'priceRunupBeforeEntry', 'maxGainAfterExit']
        self.load_model()
    
    def load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
    
    def predict(self, features_dict):
        X = pd.DataFrame([features_dict])[self.feature_names]
        prediction = self.model.predict(X)[0]
        
        # Determine Label Name
        # If your model was trained with 0,1,2, map them here:
        mapping = {0: 'NORMAL', 1: 'FOMO_BUY', 2: 'SELLING_TOO_FAST'}
        label = mapping.get(prediction, prediction) if isinstance(prediction, (int, np.integer)) else prediction
        
        return {
            'behaviorLabel': label,
            'explanation': self._generate_explanation(label, features_dict),
            'suggestions': self._generate_suggestions(label)
        }

    def _generate_explanation(self, label, features):
        explanations = {
            'FOMO_BUY': f"⚠️ FOMO Detected! Stock surged {features['priceRunupBeforeEntry']:.1f}% before buy, resulting in {features['pnlPercent']:.1f}% loss.",
            'SELLING_TOO_FAST': f"🏃 Premature Exit! Held {features['holdingTimeDays']} day(s), but stock rose {features['maxGainAfterExit']:.1f}% after sell.",
            'NORMAL': f"✅ Rational Trading! Held for {features['holdingTimeDays']} day(s) with {features['pnlPercent']:.1f}% return."
        }
        return explanations.get(label, "Trade analyzed.")

    def _generate_suggestions(self, label):
        suggestions = {
            'FOMO_BUY': ["Wait for pullbacks", "Use limit orders", "Stick to entry criteria"],
            'SELLING_TOO_FAST': ["Set profit targets", "Use trailing stop-loss", "Let winners run"],
            'NORMAL': ["Maintain discipline", "Follow your plan"]
        }
        return suggestions.get(label, [])

# Initialize Classifier
classifier = BehavioralClassifier()

@app.post("/predict-trade")
async def get_prediction(trade: TradeIn):
    try:
        # Convert Pydantic model to dictionary
        data = trade.dict()
        result = classifier.predict(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))