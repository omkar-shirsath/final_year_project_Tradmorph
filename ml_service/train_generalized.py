import yfinance as yf
import pandas as pd
import numpy as np
import joblib
import time
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix

# 1. Configuration - Extended to 20 Diverse Stocks
SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "WIPRO.NS", 
    "SBIN.NS", "ICICIBANK.NS", "ITC.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
    "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "SUNPHARMA.NS",
    "TITAN.NS", "BAJFINANCE.NS", "HINDUNILVR.NS", "ADANIENT.NS", "JSWSTEEL.NS"
]

def generate_and_train():
    all_trades = []
    print(f"🚀 Day 1: Starting Data Generation for {len(SYMBOLS)} stocks...")

    for sym in SYMBOLS:
        print(f"Fetching {sym}...", end=" ", flush=True)
        try:
            # Increased period to 10 years for a massive dataset
            df = yf.download(sym, period="10y", interval="1d", progress=False)
            
            if df.empty or len(df) < 100:
                print("⚠️ Skipped (No data)")
                continue

            # Calculate RSI
            delta = df['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            df['RSI'] = 100 - (100 / (1 + rs))
            df = df.dropna()

            # Generate ~1000 trades per stock for a total of ~20,000 instances
            num_trades = 1000
            for _ in range(num_trades):
                if len(df) <= 40: break
                idx = np.random.randint(20, len(df) - 20)
                
                buy_p = float(df.iloc[idx]['Close'].item())
                # Look back 3 days to see if the user 'chased' a pump
                prev_p = float(df.iloc[idx-3]['Close'].item())
                runup = ((buy_p - prev_p) / prev_p) * 100
                rsi_val = float(df.iloc[idx]['RSI'].item())
                
                hold = np.random.randint(1, 10)
                sell_p = float(df.iloc[idx + hold]['Close'].item())
                pnl = ((sell_p - buy_p) / buy_p) * 100
                
                # Check what happened shortly AFTER they sold (to detect Panic/Premature exit)
                future_max = float(df.iloc[idx + hold : idx + hold + 7]['Close'].max().item())
                after_exit_rally = ((future_max - sell_p) / sell_p) * 100

                # Labeling Logic
                label = 0 
                if runup > 4.5 and rsi_val > 68: 
                    label = 1 # FOMO Buy
                elif hold < 4 and after_exit_rally > 5.0: 
                    label = 2 # Premature/Panic Exit
                
                all_trades.append([hold, pnl, runup, after_exit_rally, rsi_val, label])
            
            print("✅ Done")
            time.sleep(0.5) # Prevent API rate-limiting

        except Exception as e:
            print(f"❌ Error: {e}")
            continue

    # 2. Training with the new huge dataset
    if len(all_trades) < 5000:
        print("🛑 Dataset too small. Check your internet or stock list.")
        return

    cols = ['holdingTimeDays', 'pnlPercent', 'priceRunupBeforeEntry', 'maxGainAfterExit', 'rsi', 'label']
    dataset = pd.DataFrame(all_trades, columns=cols)
    X = dataset.drop('label', axis=1)
    y = dataset['label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Random Forest is perfect for this multi-class behavioral problem
    model = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
    model.fit(X_train, y_train)

    # 3. Save Model and Charts
    joblib.dump(model, "behavioral_engine_v2.pkl")
    
    # Save Feature Importance Chart
    plt.figure(figsize=(10,6))
    feat_importances = pd.Series(model.feature_importances_, index=X.columns)
    feat_importances.nlargest(5).plot(kind='barh', color='teal')
    plt.title('Why did the AI flag a trade? (Feature Importance)')
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    
    # Save Confusion Matrix
    plt.figure(figsize=(8,6))
    sns.heatmap(confusion_matrix(y_test, model.predict(X_test)), annot=True, fmt='d', cmap='YlGnBu')
    plt.title('AI Accuracy: Actual vs Predicted Behaviors')
    plt.tight_layout()
    plt.savefig('confusion_matrix.png')
    
    print(f"\n✨ SUCCESS! Dataset Size: {len(all_trades)} trades.")
    print("📈 Model saved as behavioral_engine_v2.pkl")
    print("🖼️ Charts saved as .png files for your report.")

if __name__ == "__main__":
    generate_and_train()