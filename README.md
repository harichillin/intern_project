# NexaCore Sentinel AI 🛡️

AI-Powered B2B Customer Relationship Intelligence Platform for Retail Banks.

## 🚀 Quick Start (Windows)

To run this application whenever you want, follow these simple steps:

### 1. One-Time Setup
Double-click `setup_project.bat`. This will:
- Install Node.js dependencies for the Backend and Frontend.
- Install Python requirements for the ML Service.

### 2. Database Preparation
Ensure PostgreSQL is installed and running:
1. Create a database named `nexacore_db`.
2. Run the SQL schema found in `db/schema.sql`.
3. Seed the data:
   ```bash
   cd db
   npm install
   npm run seed
   ```

### 3. Launch the Platform
Double-click **`launch_sentinel.bat`**. This will automatically:
- Start the FastAPI ML Engine.
- Start the Node.js Backend API.
- Start the React/Vite Frontend.

## 🔗 Access Links
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **API Health:** [http://localhost:5000/health](http://localhost:5000/health)
- **ML API Status:** [http://localhost:8000/](http://localhost:8000/)

## 🛠️ Stack
- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js, PostgreSQL
- **ML Service:** Python 3.11, FastAPI, Scikit-Learn
