/**
 * NexaCore Sentinel AI: Report Controller
 * Location: backend/src/controllers/report.js
 */

const db = require('../config/db');

exports.getRevenueReport = async (req, res) => {
  try {
    const historicalRevenue = await db.query(`
      SELECT 
        DATE_TRUNC('day', timestamp) as date,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as net_flow
      FROM transactions
      GROUP BY date
      ORDER BY date ASC
    `);
    res.json(historicalRevenue.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

exports.getRiskSummary = async (req, res) => {
    try {
      const riskSummary = await db.query(`
        SELECT 
            segment,
            COUNT(*) as total,
            AVG(churn_probability) as avg_churn,
            AVG(fraud_score) as avg_fraud
        FROM customers
        GROUP BY segment
      `);
      res.json(riskSummary.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch risk summary' });
    }
};
