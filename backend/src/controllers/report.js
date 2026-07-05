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

exports.getCityBreakdown = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT city,
             COUNT(*) as total_customers,
             ROUND(AVG(churn_probability)::numeric, 4) as avg_churn,
             ROUND(AVG(fraud_score)::numeric, 4) as avg_fraud,
             COUNT(CASE WHEN segment = 'At Risk' THEN 1 END) as at_risk_count
      FROM customers
      GROUP BY city
      ORDER BY avg_churn DESC
      LIMIT 20
    `);
    res.json(result.rows.map(r => ({
      ...r,
      total_customers: parseInt(r.total_customers),
      at_risk_count: parseInt(r.at_risk_count),
      avg_churn: parseFloat(r.avg_churn),
      avg_fraud: parseFloat(r.avg_fraud),
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch city breakdown' });
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
