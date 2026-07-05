# What is NexaCore Sentinel AI?

## The Problem It Solves

Imagine you work at a retail bank that has thousands of customers. Every day, some of those customers quietly stop using your services, switch to a competitor, or worse — commit fraud. By the time you notice, it's too late. You've already lost them or taken a financial hit.

The traditional approach is reactive: wait for something bad to happen, then respond. NexaCore Sentinel AI flips this — it's **proactive**. It monitors every customer's behavior in real time, predicts who is about to leave and who is at risk of fraud, and surfaces those insights to bank staff before the damage is done.

Think of it as an early-warning radar system built specifically for a bank's customer relationship team.

---

## Core Concepts

### Churn
"Churn" is the industry term for a customer leaving — closing their account, moving to a competitor, or going dormant. It's extremely expensive for banks because acquiring a new customer costs far more than retaining an existing one.

The platform assigns every customer a **Churn Probability** (0% to 100%). A score of 78% means the AI predicts there's a 78% chance that customer will leave soon. The bank can then act — offer them a better rate, assign a relationship manager to call them, etc.

### Fraud Score
This measures the probability that unusual or suspicious activity is happening on a customer's account. A high fraud score (above 70%) might mean: the customer's login patterns changed suddenly, there were large transactions in quick succession, or the behavior no longer matches their historical profile.

Unlike churn which is about the customer leaving voluntarily, fraud is about unauthorized or suspicious activity that harms either the customer or the bank.

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
A single number (0–100) that combines multiple signals — account balance, credit score, engagement frequency, support ticket history — into one "how healthy is this relationship?" indicator. 100 = ideal customer relationship, 0 = about to be a former customer.

---

## What the Platform Actually Does

### Dashboard (the command center)
When you open the app, you see the entire portfolio at a glance:
- How many total customers exist
- What the total portfolio balance is
- Average credit score across all customers
- How many fraud alerts are currently open
- A breakdown of customers by segment (who are my Champions vs. who is At Risk?)
- A distribution of churn risk across the portfolio (how many are High Risk right now?)

This gives a bank manager a 60-second health check on the entire customer base every morning.

### Customer 360 (deep dive on one person)
When a relationship manager wants to focus on a specific customer, they use the Customer 360 page. Search for a name, click on them, and you get:
- Their full financial snapshot (balance, credit score, health score)
- Their churn probability and fraud score
- Their last 10 transactions
- A "Sync Real-time ML" button — this triggers the AI to re-analyze that customer right now using their latest data and update their risk scores instantly

The "360" in the name means you see the customer from every angle — financial data, behavioral data, risk data, and transaction history — in one place.

### Fraud & Security Center (the alert feed)
This is where fraud alerts surface. Every alert has:
- The type of suspicious event (Large Transaction, Velocity Spike, Location Mismatch)
- Which customer triggered it
- A risk confidence score (how confident the system is this is genuinely suspicious)
- A "Mark as Resolved" button so staff can close it once investigated

Alerts with red borders are open and need attention. Greyed-out ones are resolved.

### Financial Reports (the trend view)
Shows the bank's net cash flow day by day — total credits minus total debits plotted over time. This helps managers spot trends: is money flowing in overall, or is there a net outflow? Are there unusual spikes in any direction?

---

## How the AI Actually Works

The AI is not magic — it's a **Random Forest** model, which is a well-established machine learning algorithm. Here's the plain-English version of how it was trained:

1. The database was seeded with 1,000 realistic fake customers, each with a pre-assigned churn probability and fraud score (based on their behavioral profile).
2. The training script (`train_models.py`) read all those customers and their scores from the database.
3. It looked for patterns: "customers with low login frequency + high support ticket count + low account balance tend to have high churn probability."
4. It encoded those patterns into two saved model files (`churn_model.joblib` and `fraud_model.joblib`).
5. Now, given any new set of customer stats, the model can predict a score in milliseconds — without needing to re-analyze the entire database.

This is a simplified but structurally real ML pipeline: the same train → serialize → serve pattern used in production systems at scale.

---

## The Technology Stack (in plain English)

| Layer | Technology | Why |
|---|---|---|
| What you see in the browser | React + Tailwind CSS + Recharts | React builds the interactive UI; Tailwind handles styling; Recharts draws the charts |
| The server that handles requests | Node.js + Express | Sits between the frontend and database, handles all the business logic |
| The database | PostgreSQL | Stores all customer, transaction, ticket, and alert data reliably |
| The AI engine | Python + FastAPI + Scikit-Learn | Python is the standard for ML; FastAPI serves predictions via a fast API; Scikit-Learn provides the Random Forest algorithm |

---

## The Data (What's in the Database)

Everything is simulated but realistic — generated using a library called Faker that creates believable fake names, cities, amounts, and dates.

| Data | Volume |
|---|---|
| Customers | 1,000 |
| Transactions | 10,000 (10 per customer on average) |
| Support Tickets | 500 |
| Fraud Alerts | 200 |

---

## Summary in One Paragraph

NexaCore Sentinel AI is a prototype banking intelligence platform that uses machine learning to predict which customers are about to leave and which are at risk of fraud, then surfaces those insights through a real-time dashboard so bank staff can act before problems escalate. It's built as a full-stack application — a React frontend, a Node.js API, a PostgreSQL database, and a Python ML service — and demonstrates the end-to-end architecture of a real AI-powered product: from data storage, to model training, to live prediction, to visual reporting.
