:: STEP 1: Install Server (Backend)
cd server
call npm install
cd ..

:: STEP 2: Install Client (Frontend)
cd client
call npm install
cd ..

:: STEP 3: Install Machine Learning (AI)
cd ml_service
pip install fastapi uvicorn pydantic joblib scikit-learn pandas
cd ..

echo "Installation complete! You can close this window now."
pause
