# NexaCore Sentinel AI — Project Overview

A full walkthrough of what this application is, how it's built, and how the pieces connect.

## 1. The Pitch

**NexaCore Sentinel AI** is a B2B customer-intelligence dashboard for a retail bank's relationship managers. It answers three questions for every customer in the portfolio: *Are they about to leave us (churn)? Are they at risk of fraud? What's their overall relationship health?* — using ML predictions layered on top of live transaction/behavioral data.

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

## 3. Data model (`db/schema.sql`)

Four tables, seeded with 1,000 fake customers via `db/seed.js` (faker.js):

| Table | What it holds |
|---|---|
| `customers` | demographics + behavior (age, balance, credit score, login frequency, support tickets) + the two AI outputs (`churn_probability`, `fraud_score`) + a `segment` enum (Champions/Loyal/Potential/Dormant/At Risk) |
| `transactions` | 10,000 debit/credit records per customer |
| `support_tickets` | open/resolved issues per customer |
| `alerts` | fraud flags (`Large Transaction`, `Velocity Spike`, `Location Mismatch`) with a risk score |

`churn_probability` and `fraud_score` are pre-seeded with plausible values, then can be **refreshed live** by calling the ML service (see below).

## 4. The ML layer (`ml-service/`)

- `train_models.py`: pulls all customers from Postgres, trains two `RandomForestRegressor` models — one predicting `churn_probability` from 7 features (age, balance, credit score, monthly transactions, login frequency, support tickets, days since last login), one predicting `fraud_score` from 5 features (age, balance, credit score, login frequency, days since last login). Saves both as `.joblib` files.
- `main.py`: FastAPI app that loads those two files at startup and exposes `POST /predict/churn` and `POST /predict/fraud`. Pure input → number, no DB access.

This is a real (if simple) train → serialize → serve ML pipeline, not a hardcoded stub.

## 5. The backend API (`backend/src/`)

| Route | Purpose |
|---|---|
| `GET /api/dashboard/stats` | aggregate metrics for the homepage: total customers, portfolio balance, avg credit score, open alert count, segment distribution, churn-risk distribution |
| `GET /api/customers?segment=&search=` | top 50 customers by churn risk, filterable |
| `GET /api/customers/:id` | one customer + their last 10 transactions, all support tickets, all alerts — the "360 view" |
| `POST /api/customers/:id/refresh` | pulls the customer's current stats, calls the ML service for fresh churn/fraud scores, writes them back to Postgres |
| `GET /api/alerts` / `PUT /api/alerts/:id` | fraud alert feed + resolve action |
| `GET /api/reports/revenue` | daily net cash flow (credits − debits) across the whole bank |
| `GET /api/reports/risk-summary` | per-segment average churn/fraud |

## 6. The frontend — four pages (`frontend/src/pages/`)

1. **Dashboard** (`/`) — the homepage: 4 metric cards (customers, balance, credit score, alerts) + a donut chart of customer segments + an area chart of churn-risk buckets. Pulls from `/dashboard/stats`.
2. **Customer 360** (`/customers`) — split view: searchable customer list on the left (sorted by churn risk), full detail panel on the right (balance, credit score, health index, churn/fraud risk cards, recent transactions table). Has a **"Sync Real-time ML"** button that triggers a live re-prediction via the backend → ML service round-trip — this is the one place you can watch the whole stack work end-to-end in real time.
3. **Fraud Center** (`/fraud`) — live feed of fraud alerts (red-bordered if open), each resolvable with one click.
4. **Financial Reports** (`/reports`) — bank-wide net cash flow over time as an area chart.

## 7. What's genuinely "real" vs. simulated

- Real: full CRUD-ish REST API, real Postgres queries, a real trained ML model making real predictions, real charts rendering real aggregated data.
- Simulated: the underlying *transactions/customers* are synthetic (faker-generated), not live banking data — this is a demo/prototype, not connected to an actual core banking system.

## 8. Running it locally

Use the portable setup (bundled Node.js + PostgreSQL, no system install needed):

1. Double-click `run_portable.bat` at the project root.
2. It starts: the portable PostgreSQL server, the ML service (port 8000), the backend API (port 5000), and the frontend dev server (port 5173) — each in its own window.
3. Open [http://localhost:5173](http://localhost:5173).

If the database is ever empty, reseed it from `db/`:
```bash
cd db
npm install
node seed.js
```
