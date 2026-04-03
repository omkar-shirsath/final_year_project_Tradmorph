import sys
import json
import joblib
import pandas as pd
import os

# Absolute path setup
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, '..', 'ml_service', 'behavioral_engine_v2.pkl')

try:
    model = joblib.load(model_path)
except Exception as e:
    # Use flush=True even for errors!
    print(json.dumps({"error": f"Model not found. Error: {str(e)}"}), flush=True)
    sys.exit(1)

def predict():
    try:
        # Read from stdin (Node.js sends data here)
        line = sys.stdin.readline()
        if not line: 
            return
            
        input_data = json.loads(line)
        
        # Prepare DataFrame with features expected by behavioral_engine_v2.pkl
        # The model expects: ['holdingTimeDays', 'pnlPercent', 'priceRunupBeforeEntry', 'maxGainAfterExit', 'rsi']
        df = pd.DataFrame([{
            'holdingTimeDays': 0.0, # Not provided by frontend for new trades, default to 0
            'pnlPercent': 0.0,      # Not provided by frontend, default to 0
            'priceRunupBeforeEntry': float(input_data.get('priceChange', 0)), # Map price change to runup
            'maxGainAfterExit': 0.0, # Not provided by frontend, default to 0
            'rsi': float(input_data.get('rsi', 50)),
        }])
        
        # ML Prediction
        prediction = int(model.predict(df)[0])
        
        # Maps prediction logic (1=FOMO_BUY, 2=PREMATURE_EXIT, 0=NORMAL)
        is_risky = prediction in [1, 2]
        
        labels = {
            0: "Normal",
            1: "FOMO_BUY",
            2: "PREMATURE_EXIT"
        }
        
        result = {
            "is_risky": is_risky,
            "label": labels.get(prediction, "Unknown Risk")
        }
        
        # CRITICAL FIX: Add flush=True
        print(json.dumps(result), flush=True)

    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)

if __name__ == "__main__":
    predict()