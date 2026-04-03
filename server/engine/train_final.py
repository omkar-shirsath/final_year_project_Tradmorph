import yfinance as yf
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)

symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "TATAMOTORS.NS"]
simulated_trades = []

print("🚀 Fetching market data for behavioral training...")
for sym in symbols:
    df = yf.download(sym, period="5y", interval="1d", progress=False)
    
    # Ensure we have enough data to look back 2 days and forward 15 days
    if len(df) < 50:
        continue
    
    for _ in range(300):
        # Safety buffer: start at index 2, end 15 days before the last row
        idx = np.random.randint(2, len(df) - 15)
        
        # Using .item() to avoid the float() FutureWarning
        buy_p = df.iloc[idx]['Close'].item()
        prev_p = df.iloc[idx-2]['Close'].item()
        
        runup = ((buy_p - prev_p) / prev_p) * 100
        
        hold = np.random.randint(1, 8)
        sell_p = df.iloc[idx + hold]['Close'].item()
        pnl = ((sell_p - buy_p) / buy_p) * 100
        
        # Look at the 5 days AFTER the sell date
        future_slice = df.iloc[idx + hold + 1 : idx + hold + 6]['Close']
        if not future_slice.empty:
            future_max = future_slice.max().item()
            after_exit = ((future_max - sell_p) / sell_p) * 100
        else:
            after_exit = 0

        simulated_trades.append([hold, pnl, runup, after_exit])

# 2. Labelling & Training
X = pd.DataFrame(simulated_trades, columns=['hold', 'pnl', 'runup', 'after_exit'])
def label_logic(row):
    if row['runup'] > 5.0 and row['pnl'] < 0: return 1  # FOMO_BUY
    if row['hold'] < 3 and row['after_exit'] > 4.0: return 2  # SELLING_TOO_FAST
    return 0  # NORMAL

y = X.apply(label_logic, axis=1)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 3. Save
save_path = os.path.join(MODEL_DIR, "behavioral_engine.pkl")
joblib.dump(model, save_path)
print(f"✅ Training complete! Model saved to: {save_path}")