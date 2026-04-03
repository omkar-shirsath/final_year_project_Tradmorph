import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import time
import matplotlib.pyplot as plt
import seaborn as sns

# Constants
SYMBOLS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "WIPRO.NS", 
    "SBIN.NS", "ICICIBANK.NS", "ITC.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
    "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "SUNPHARMA.NS",
    "TITAN.NS", "BAJFINANCE.NS", "HINDUNILVR.NS", "ADANIENT.NS", "JSWSTEEL.NS"
]

def add_technical_indicators(df):
    """Calculates purely historical technical features without lookahead bias."""
    # RSI (14 days)
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # MACD 
    ema_12 = df['Close'].ewm(span=12, adjust=False).mean()
    ema_26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = ema_12 - ema_26
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()

    # Bollinger Bands
    df['BB_Mid'] = df['Close'].rolling(window=20).mean()
    df['BB_Std'] = df['Close'].rolling(window=20).std()
    df['BB_Upper'] = df['BB_Mid'] + (df['BB_Std'] * 2)
    df['BB_Lower'] = df['BB_Mid'] - (df['BB_Std'] * 2)
    # Distance from Upper BB in %
    df['Dist_Upper_BB'] = ((df['Close'] - df['BB_Upper']) / df['BB_Upper']) * 100
    # Distance from Lower BB in %
    df['Dist_Lower_BB'] = ((df['Close'] - df['BB_Lower']) / df['BB_Lower']) * 100

    # Volume Spike Profile (Current vol vs 10 day average)
    df['Vol_10d_Avg'] = df['Volume'].rolling(window=10).mean()
    df['Vol_Spike_Ratio'] = df['Volume'] / df['Vol_10d_Avg']

    # Short-term Price Momentum (Past 5 days return)
    df['Momentum_5d'] = df['Close'].pct_change(periods=5) * 100
    
    return df

def fetch_and_prepare_data(symbols=SYMBOLS):
    dfs = []
    print("Ingesting historical data and engineering features...")
    for sym in symbols:
        try:
            # Drop multi-index if yf returns it
            df = yf.download(sym, period="10y", interval="1d", progress=False)
            
            # Handle YFinance multi-index columns for single ticker downloads
            if isinstance(df.columns, pd.MultiIndex):
                # Flattens multiindex: ('Close', 'AAPL') -> 'Close'
                df.columns = df.columns.droplevel(-1) 
                
            if df.empty or len(df) < 100:
                continue
                
            df = add_technical_indicators(df)
            
            # The Target: What happens 5 days from NOW?
            # Shift (-5) brings the close price from 5 days in the future to the current row.
            df['Future_Return_5d'] = (df['Close'].shift(-5) - df['Close']) / df['Close'] * 100
            
            # Create categorical labels
            # 1: Crash Risk (<-3.0% drop)
            # 2: Surge Potential (>4.0% gain)
            # 0: Normal Market Noise
            conditions = [
                (df['Future_Return_5d'] < -3.0),
                (df['Future_Return_5d'] > 4.0)
            ]
            choices = [1, 2]
            df['Label'] = np.select(conditions, choices, default=0)
            
            # Drop NaN rows (will drop the first 26 days due to MACD, and last 5 days due to Target Shift)
            df = df.dropna()
            
            # We add a date column to allow chronological splitting
            df.reset_index(inplace=True)
            df['Symbol'] = sym
            dfs.append(df)
            
            time.sleep(0.1)
        except Exception as e:
            print(f"Error processing {sym}: {e}")
            
    if dfs:
        full_df = pd.concat(dfs, ignore_index=True)
        return full_df
    return None

def train():
    df = fetch_and_prepare_data()
    if df is None or len(df) == 0:
        print("Dataset generation failed.")
        return

    # Chronological Split (Train: Before 2023, Test: 2023 and onwards)
    df['Date'] = pd.to_datetime(df['Date'])
    train_df = df[df['Date'].dt.year < 2023]
    test_df = df[df['Date'].dt.year >= 2023]
    
    print(f"Train Dataset Size (Before 2023): {len(train_df)} days")
    print(f"Test Dataset Size (2023-Present): {len(test_df)} days")

    features = [
        'RSI', 'MACD', 'MACD_Signal', 'Dist_Upper_BB', 'Dist_Lower_BB', 
        'Vol_Spike_Ratio', 'Momentum_5d'
    ]
    
    X_train = train_df[features]
    y_train = train_df['Label']
    
    X_test = test_df[features]
    y_test = test_df['Label']

    # Using Random Forest (Standard, robust algorithm)
    print("Training robust market prediction model...")
    model = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)

    # Evaluation
    predictions = model.predict(X_test)
    print("\n--- Test Set Evaluation (Chronological) ---")
    print(classification_report(y_test, predictions, target_names=["Normal", "Crash Risk (1)", "Surge Risk (2)"]))
    
    # Save Model
    joblib.dump(model, "behavioral_engine_v2.pkl")
    # Save features list so inference knows what to pass
    joblib.dump(features, "model_features.pkl")
    print("Model saved as behavioral_engine_v2.pkl")

    # Feature Importance Plot
    plt.figure(figsize=(10,6))
    feat_importances = pd.Series(model.feature_importances_, index=features)
    feat_importances.nlargest(len(features)).plot(kind='barh', color='indigo')
    plt.title('Technical Indicator Importance in Forecasting Crashes/Surges')
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    print("feature_importance.png saved.")

if __name__ == "__main__":
    train()
