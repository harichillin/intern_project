# NexaCore Sentinel AI — Project Overview

A full walkthrough of what this application is, how it's built, and how the pieces connect.

## 1. The Pitch

**NexaCore Sentinel AI** is a B2B customer-intelligence dashboard for a retail bank's relationship managers. It answers three questions for every customer in the portfolio: *Are they about to leave us (churn)? Are they at risk of fraud? What's their overall relationship health?* — using ML predictions layered on top of live transaction/behavioral data, with tools for staff to act directly from the dashboard.

## 2. Architecture (3 services + 1 database)

```
React/Vite frontend (5173)
        │  REST calls (axios)
        ▼
Node/Express backend (5000)  ──── queries ───▶  PostgreSQL (5432, "nexacore_db")
        │  REST calls (axios)
        ▼
Python/FastAPI ML service (8000)  ── loads ──▶  churn_model.joblib / fraud_model.joblib
```

- **Frontend** never talks to the ML service directly — it always goes through the backend.
- **Backend** is the only thing that talks to both Postgres and the ML service. It's a thin orchestrator: fetch data → optionally call ML → return JSON.
- **ML service** is stateless: given a customer's stats, it returns a probability. It doesn't know about the database at all.

## 3. Data model

Five tables in `nexacore_db` (seeded via `db/seed.js` using faker.js):

| Table | What it holds |
|---|---|
| `customers` | demographics + behavior (age, balance, credit score, login frequency, support tickets) + AI outputs (`churn_probability`, `fraud_score`) + `segment` enum + `outreach_status` |
| `transactions` | 10,000 debit/credit records linked to customers |
| `support_tickets` | open/resolved issues per customer |
| `alerts` | fraud flags (`Large Transaction`, `Velocity Spike`, `Location Mismatch`) with a risk score |
| `customer_notes` | timestamped staff notes per customer (added dynamically, not seeded) |

## 4. The ML layer (`ml-service/`)

- `train_models.py`: pulls all customers from Postgres, trains two `RandomForestRegressor` models — one predicting `churn_probability` from 7 behavioral features, one predicting `fraud_score` from 5 risk features. Saves both as `.joblib` files.
- `main.py`: FastAPI app that exposes:
  - `POST /predict/churn` — returns churn probability + risk level
  - `POST /predict/fraud` — returns fraud score + threat level
  - `POST /reload` — hot-reloads model files without restarting the service
- Models can be retrained live from the Control Panel page — zero downtime.

## 5. The backend API (`backend/src/`)

| Route | Purpose |
|---|---|
| `GET /api/dashboard/stats` | portfolio-wide aggregate metrics + segment/churn distributions |
| `GET /api/dashboard/heatmap` | all 1,000 customers with churn + fraud scores for scatter chart |
| `GET /api/customers?search=` | top 50 customers by churn risk, searchable |
| `GET /api/customers/:id` | full 360 view: customer + last 10 transactions + support tickets + alerts |
| `POST /api/customers/:id/refresh` | calls ML service for live re-prediction, updates DB |
| `POST /api/customers/bulk-outreach` | update outreach_status on multiple customers at once |
| `GET /api/customers/:id/notes` | fetch all notes for a customer |
| `POST /api/customers/:id/notes` | add a new note |
| `DELETE /api/notes/:noteId` | delete a note |
| `GET /api/alerts` / `PUT /api/alerts/:id` | fraud alert feed + resolve action |
| `GET /api/transactions/feed` | latest 100 bank-wide transactions for live feed |
| `GET /api/reports/revenue` | daily net cash flow time series |
| `GET /api/reports/city-breakdown` | top 20 cities ranked by avg churn risk |
| `GET /api/reports/risk-summary` | per-segment average churn/fraud |
| `POST /api/ml/retrain` | triggers model retraining then hot-reloads ML service |
| `GET /api/ml/health` | live health status of API + ML engine |

## 6. The frontend — six pages (`frontend/src/pages/`)

1. **Dashboard** (`/`) — portfolio command center: 4 metric cards, customer segment donut chart, churn risk area chart, and a **Risk Heatmap** scatter plot showing all 1,000 customers plotted by fraud score vs. churn probability, colour-coded by segment.

2. **Customer 360** (`/customers`) — three-tab split view:
   - *Overview*: financial snapshot, AI-generated risk scores with progress bars, **AI Recommendation Engine** (rule-based action suggestions per customer), transaction flow timeline chart, recent transactions table
   - *Support Tickets*: all open and resolved support issues for that customer
   - *Notes*: add/delete timestamped staff notes stored in the database
   - List panel also supports **Bulk Outreach** — checkbox-select multiple customers and update their outreach status in one action

3. **Fraud Center** (`/fraud`) — alert feed with summary counts (total/open/resolved), red-bordered open alerts, one-click resolve per alert.

4. **Financial Reports** (`/reports`) — daily net cash flow area chart + **Geographic Breakdown**: horizontal bar chart of top 20 cities by average churn risk, colour-coded red/amber/green, plus a sortable data table.

5. **Live Transaction Feed** (`/transactions`) — auto-refreshing (every 10s) bank-wide transaction table with filter tabs for All / Credits / Debits / Flagged (fraud > 60%), plus 4 summary counters.

6. **Control Panel** (`/control`) — system health monitor (Backend API, ML Engine, Database status with live indicators) + one-click **ML Model Retraining** that runs `train_models.py` against current DB data and hot-reloads the ML service with no restart.

## 7. Design system (Fintech Terminal theme)

- **Background**: `#0a0e14` near-black with subtle scanline texture overlay
- **Primary accent**: `#f0b429` amber (active states, highlights, primary actions)
- **Data accent**: `#22d3ee` cyan (transaction timelines, info states)
- **Risk**: `#f85149` red / **Safe**: `#3fb950` green
- **Typography**: Inter for UI + JetBrains Mono for all numbers, labels, and data
- **Cards**: hairline `1px rgba(255,255,255,0.06)` borders, no rounded corners
- **Header**: sticky breadcrumb bar with live notification bell (auto-polls every 30s)
- **Sidebar**: terminal-style with amber active indicator and live system status footer

## 8. What's genuinely "real" vs. simulated

- **Real**: full REST API, real Postgres queries, real trained ML models, real charts on real aggregated data, real note/outreach state persisted to DB, real model retraining pipeline.
- **Simulated**: the underlying customer/transaction/ticket/alert data is faker-generated — this is a prototype, not connected to a live banking core system.

## 9. Running it locally

Use the portable setup (bundled Node.js + PostgreSQL, no system install needed):

1. Double-click `run_portable.bat` at the project root.
2. It starts PostgreSQL, the ML service (8000), the backend API (5000), and the frontend (5173) — each in its own persistent window.
3. Open [http://localhost:5173](http://localhost:5173).

To reseed the database:
```bash
cd db && node seed.js
```

## 10. Branch structure

| Branch | What it is |
|---|---|
| `main` | Original working app — stable baseline, original blue theme |
| `feature/redesign` | Fintech Terminal redesign + all 6 new features — current active branch |
