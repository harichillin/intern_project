/**
 * NexaCore Sentinel AI: Customer Controller
 * Location: backend/src/controllers/customer.js
 */

const db = require('../config/db');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.getAllCustomers = async (req, res) => {
  try {
    const { segment, search } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    let params = [];

    if (segment) {
      query += ' AND segment = $' + (params.length + 1);
      params.push(segment);
    }

    if (search) {
      query += ' AND name ILIKE $' + (params.length + 1);
      params.push(`%${search}%`);
    }

    query += ' ORDER BY churn_probability DESC LIMIT 50';
    
    const results = await db.query(query, params);
    res.json(results.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await db.query('SELECT * FROM customers WHERE customer_id = $1', [id]);
    
    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const transactions = await db.query('SELECT * FROM transactions WHERE customer_id = $1 ORDER BY timestamp DESC LIMIT 10', [id]);
    const tickets = await db.query('SELECT * FROM support_tickets WHERE customer_id = $1 ORDER BY created_at DESC', [id]);
    const alerts = await db.query('SELECT * FROM alerts WHERE customer_id = $1 ORDER BY created_at DESC', [id]);

    res.json({
      ...customer.rows[0],
      history: {
        transactions: transactions.rows,
        tickets: tickets.rows,
        alerts: alerts.rows
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer 360 data' });
  }
};

exports.refreshPredictions = async (req, res) => {
  try {
    const { id } = req.params;
    const customerRes = await db.query('SELECT * FROM customers WHERE customer_id = $1', [id]);
    const c = customerRes.rows[0];

    // Call ML Service
    const churnRes = await axios.post(`${ML_SERVICE_URL}/predict/churn`, {
      age: c.age,
      account_balance: parseFloat(c.account_balance),
      credit_score: c.credit_score,
      monthly_transactions: c.monthly_transactions,
      login_frequency: c.login_frequency,
      support_ticket_count: c.support_ticket_count,
      last_login_days: c.last_login_days
    });

    const fraudRes = await axios.post(`${ML_SERVICE_URL}/predict/fraud`, {
      age: c.age,
      account_balance: parseFloat(c.account_balance),
      credit_score: c.credit_score,
      login_frequency: c.login_frequency,
      last_login_days: c.last_login_days
    });

    // Update DB
    await db.query(
      'UPDATE customers SET churn_probability = $1, fraud_score = $2 WHERE customer_id = $3',
      [churnRes.data.churn_probability, fraudRes.data.fraud_score, id]
    );

    res.json({
      success: true,
      churn_probability: churnRes.data.churn_probability,
      fraud_score: fraudRes.data.fraud_score
    });
  } catch (error) {
    console.error('ML Sync Error:', error.message);
    res.status(500).json({ error: 'Failed to sync with ML Service' });
  }
};
