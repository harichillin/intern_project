"""
NexaCore Sentinel AI: ML API Service
Location: ml-service/main.py

FastAPI service providing real-time churn and fraud risk intelligence.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="NexaCore Sentinel ML Service")

# Path to models
CHURN_MODEL_PATH = "models/churn_model.joblib"
FRAUD_MODEL_PATH = "models/fraud_model.joblib"

# Global model variables
churn_model = None
fraud_model = None

# Initialize models on startup
@app.on_event("startup")
def load_models():
    global churn_model, fraud_model
    if os.path.exists(CHURN_MODEL_PATH) and os.path.exists(FRAUD_MODEL_PATH):
        churn_model = joblib.load(CHURN_MODEL_PATH)
        fraud_model = joblib.load(FRAUD_MODEL_PATH)
        print("Models loaded successfully.")
    else:
        print("Models not found. Prediction endpoints will return errors until models are trained.")

# Input Schemas
class ChurnInput(BaseModel):
    age: int
    account_balance: float
    credit_score: int
    monthly_transactions: int
    login_frequency: int
    support_ticket_count: int
    last_login_days: int

class FraudInput(BaseModel):
    age: int
    account_balance: float
    credit_score: int
    login_frequency: int
    last_login_days: int

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "NexaCore ML Service",
        "models_loaded": churn_model is not None and fraud_model is not None
    }

@app.post("/predict/churn")
def predict_churn(data: ChurnInput):
    if churn_model is None:
        raise HTTPException(status_code=503, detail="Churn model not loaded")
    
    input_df = pd.DataFrame([data.dict()])
    prediction = churn_model.predict(input_df)[0]
    
    return {
        "churn_probability": round(float(prediction), 4),
        "risk_level": "High" if prediction > 0.7 else "Medium" if prediction > 0.4 else "Low"
    }

@app.post("/predict/fraud")
def predict_fraud(data: FraudInput):
    if fraud_model is None:
        raise HTTPException(status_code=503, detail="Fraud model not loaded")
    
    input_df = pd.DataFrame([data.dict()])
    prediction = fraud_model.predict(input_df)[0]
    
    return {
        "fraud_score": round(float(prediction), 4),
        "threat_level": "Critical" if prediction > 0.8 else "Elevated" if prediction > 0.5 else "Stable"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
