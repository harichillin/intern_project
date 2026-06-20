"""
NexaCore Sentinel AI: ML Model Trainer
Location: ml-service/train_models.py

This script pulls data from PostgreSQL, trains predictive models for 
Churn Probability and Fraud Likelihood, and saves them for the FastAPI service.
"""

import pandas as pd
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

# Configuration
DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nexacore_db")
MODEL_DIR = "models"

def train_models():
    print("🚀 Starting ML Model Training...")
    
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    try:
        engine = create_engine(DB_URL)
        
        # 1. Load Customer Data for Churn Prediction
        print("📊 Loading customer data for Churn Model...")
        df_customers = pd.read_sql("SELECT age, account_balance, credit_score, monthly_transactions, login_frequency, support_ticket_count, last_login_days, churn_probability FROM customers", engine)
        
        if df_customers.empty:
            print("❌ No data found in customers table. Please run the seeder first.")
            return

        # Features & Target
        X_churn = df_customers.drop('churn_probability', axis=1)
        y_churn = df_customers['churn_probability']

        # Train Churn Model
        print("🧠 Training Churn Prediction Model (Random Forest)...")
        churn_model = RandomForestRegressor(n_estimators=100, random_state=42)
        churn_model.fit(X_churn, y_churn)
        
        churn_model_path = os.path.join(MODEL_DIR, "churn_model.joblib")
        joblib.dump(churn_model, churn_model_path)
        print(f"✅ Churn Model saved to {churn_model_path}")

        # 2. Load Transaction/Customer Data for Fraud Score Prediction
        # For simplicity in this project, we'll use customer behavior metrics to predict their baseline fraud risk
        print("📊 Loading data for Fraud Risk Model...")
        df_fraud = pd.read_sql("SELECT age, account_balance, credit_score, login_frequency, last_login_days, fraud_score FROM customers", engine)
        
        X_fraud = df_fraud.drop('fraud_score', axis=1)
        y_fraud = df_fraud['fraud_score']

        # Train Fraud Model
        print("🧠 Training Fraud Risk Model (Random Forest)...")
        fraud_model = RandomForestRegressor(n_estimators=100, random_state=42)
        fraud_model.fit(X_fraud, y_fraud)
        
        fraud_model_path = os.path.join(MODEL_DIR, "fraud_model.joblib")
        joblib.dump(fraud_model, fraud_model_path)
        print(f"✅ Fraud Model saved to {fraud_model_path}")

        print("\n✨ All models trained and serialized successfully!")

    except Exception as e:
        print(f"❌ Error during training: {e}")

if __name__ == "__main__":
    train_models()
