# What is NexaCore Sentinel AI?

## The Problem It Solves

Imagine you work at a retail bank that has thousands of customers. Every day, some of those customers quietly stop using your services, switch to a competitor, or worse — commit fraud. By the time you notice, it's too late. You've already lost them or taken a financial hit.

The traditional approach is reactive: wait for something bad to happen, then respond. NexaCore Sentinel AI flips this — it's **proactive**. It monitors every customer's behavior in real time, predicts who is about to leave and who is at risk of fraud, surfaces those insights to bank staff before the damage is done, and gives them the tools to act directly from the dashboard.

Think of it as an early-warning radar system built specifically for a bank's customer relationship team.

---

## Core Concepts

### Churn
"Churn" is the industry term for a customer leaving — closing their account, moving to a competitor, or going dormant. It's extremely expensive for banks because acquiring a new customer costs far more than retaining an existing one.

The platform assigns every customer a **Churn Probability** (0% to 100%). A score of 78% means the AI predicts there's a 78% chance that customer will leave soon. The bank can then act — offer them a better rate, assign a relationship manager to call them, etc.

### Fraud Score
This measures the probability that unusual or suspicious activity is happening on a customer's account. A high fraud score (above 70%) might mean the customer's login patterns changed suddenly, there were large transactions in quick succession, or the behavior no longer matches their historical profile.

### Customer Segments
Not all customers are equal. The platform groups customers into 5 tiers:

| Segment | What it means |
|---|---|
| **Champions** | High value, loyal, high transaction volume — your best customers |
| **Loyal** | Consistent, long-term customers — reliable but not top spenders |
| **Potential** | Newer customers showing promising patterns — worth nurturing |
| **Dormant** | Were active before, now barely engaging — at passive churn risk |
| **At Risk** | High churn probability, low engagement — need urgent attention |

### Relationship Health Score
A single number (0–100) that combines multiple signals — account balance, credit score, engagement frequency, support ticket history — into one indicator of relationship quality. 100 = ideal, 0 = about to be a former customer.

### Outreach Status
Tracks whether a relationship manager has acted on an at-risk customer: `None → Contacted → In Progress → Resolved`. This can be updated individually or in bulk across multiple customers at once.

---

## What the Platform Actually Does — Page by Page

### 1. Dashboard (the command center)
The homepage gives the entire portfolio at a glance:
- 4 key metrics: total customers, total portfolio balance, average credit score, open fraud alerts
- **Customer Segments donut chart** — visual breakdown of Champions vs. Loyal vs. At Risk etc.
- **Churn Risk Distribution** — how many customers fall into Low, Medium, High risk buckets
- **Risk Heatmap** — scatter plot of all 1,000 customers simultaneously: X axis = fraud score, Y axis = churn probability, each dot coloured by segment. Instantly reveals which customer clusters need attention.

### 2. Customer 360 (deep dive on any customer)
Click any customer in the searchable list and get three tabs:

**Overview tab:**
- Financial snapshot: balance, credit score, health index
- Live churn probability + fraud score with visual progress bars
- **AI Recommendation Engine** — the system reads the customer's scores and segment and generates specific action suggestions:
  - "Freeze account & initiate fraud review" (fraud > 75%)
  - "Assign dedicated relationship manager" (churn > 75%)
  - "Offer loyalty incentive" (churn > 50%)
  - "Launch re-engagement campaign" (Dormant segment)
  - "Offer premium tier upgrade" (Champions segment)
- **Transaction Flow Timeline** — area chart of net money flow for that customer built from their real transaction history
- Last 10 transactions table

**Support Tickets tab:**
- All open and resolved support issues for that customer in one view

**Notes tab:**
- Staff can type and save timestamped notes per customer (e.g., "Called 5 Jul — interested in lower mortgage rate")
- Notes persist to the database and are visible to anyone who opens that customer's profile
- Notes can be deleted when no longer relevant

**Bulk Outreach (in the list panel):**
- Checkbox-select multiple at-risk customers
- Set outreach status for all of them in one click (Contacted / In Progress / Resolved)
- Each customer's status shows next to their name in the list

### 3. Fraud & Security Center (the alert feed)
- Summary counts: total alerts, currently open, resolved
- Every alert shows: type of fraud event, customer name, risk confidence %, timestamp
- Red left border = open and needs action; greyed out = resolved
- One-click "Mark Resolved" closes an alert

### 4. Financial Reports (trend analysis)
- **Daily Net Cash Flow** area chart — credits minus debits over time, with a zero-line reference
- **Geographic Breakdown** — horizontal bar chart of the top 20 cities ranked by average customer churn risk, colour-coded red/amber/green
- City data table showing: total customers, average churn %, average fraud %, at-risk count per city

### 5. Live Transaction Feed (bank-wide activity)
- Shows the 100 most recent transactions across all customers
- Auto-refreshes every 10 seconds
- Filter tabs: All / Credits only / Debits only / Flagged (customers with fraud score > 60%)
- Rows with high-fraud customers get a red left border for quick scanning
- Shows: transaction type, merchant, customer name, segment, fraud risk, amount, timestamp

### 6. Control Panel (system operations)
- **System Health** — live status cards for Backend API, ML Engine, and Database with pulsing green indicators
- **Model Retraining** — one button triggers the full ML pipeline:
  1. Connects to the live PostgreSQL database
  2. Trains fresh churn and fraud models on current customer data
  3. Saves new .joblib model files
  4. Hot-reloads the ML service — no restart, zero downtime
- Shows the 5-step training pipeline visually so you can explain exactly what's happening

---

## How the AI Actually Works

The AI is not magic — it's a **Random Forest** model, a well-established machine learning algorithm that learns patterns from data.

**Training** (done once, or re-triggered from Control Panel):
1. Read all 1,000 customers from PostgreSQL
2. Find patterns: "customers with low login frequency + high support tickets + low balance tend to have high churn probability"
3. Encode those patterns into `churn_model.joblib` and `fraud_model.joblib`

**Prediction** (real-time on any customer):
1. Pass a customer's current stats (age, balance, credit score etc.) to the ML service API
2. The model returns a probability score in milliseconds
3. The backend saves the updated score to the database
4. The frontend re-renders with the new risk values

This is the same **train → serialize → serve** pattern used in production ML systems at scale — just simplified for a prototype.

---

## The Technology Stack

| Layer | Technology | What it does |
|---|---|---|
| Browser UI | React + Tailwind CSS + Recharts | Builds the interactive pages; Tailwind handles styling; Recharts draws all charts |
| API server | Node.js + Express | Handles all requests between frontend, database, and ML service |
| Database | PostgreSQL | Stores customers, transactions, tickets, alerts, and staff notes |
| ML engine | Python + FastAPI + Scikit-Learn | Serves real-time churn and fraud predictions via a REST API |
| Design theme | Fintech Terminal | Near-black background, amber + cyan accents, JetBrains Mono font for data |

---

## The Data

Everything is simulated but realistic, generated by a library called Faker:

| Data | Volume |
|---|---|
| Customers | 1,000 |
| Transactions | 10,000 (10 per customer on average) |
| Support Tickets | 500 |
| Fraud Alerts | 200 |
| Staff Notes | 0 (created live by users during the demo) |

---

## Branch Structure

| Branch | What it contains |
|---|---|
| `main` | Original app — stable working baseline, original blue design |
| `feature/redesign` | Fintech Terminal redesign + all new features (this version) |

---

## Summary in One Paragraph

NexaCore Sentinel AI is a prototype banking intelligence platform that uses machine learning to predict which customers are about to leave and which are at risk of fraud, then gives bank staff a full suite of tools to act on those insights: AI-generated action recommendations per customer, bulk outreach status tracking, staff notes, live transaction monitoring, geographic risk analysis, and the ability to retrain the ML models on demand. It's built as a full-stack application — React frontend, Node.js API, PostgreSQL database, and Python ML service — demonstrating the end-to-end architecture of a real AI-powered product: from data storage, to model training, to live prediction, to visual reporting, to staff workflow tools.
