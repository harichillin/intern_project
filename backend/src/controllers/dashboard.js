/**
 * NexaCore Sentinel AI: Dashboard Controller
 * Location: backend/src/controllers/dashboard.js
 */

const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const totalCustomers = await db.query('SELECT COUNT(*) FROM customers');
    const totalBalance = await db.query('SELECT SUM(account_balance) FROM customers');
    const avgCreditScore = await db.query('SELECT AVG(credit_score) FROM customers');
    const openAlerts = await db.query("SELECT COUNT(*) FROM alerts WHERE status = 'open'");
    
    // Segment Distribution
    const segments = await db.query('SELECT segment, COUNT(*) as count FROM customers GROUP BY segment');

    // Churn Risk Distribution (Simple bins)
    const churnRisk = await db.query(`
      SELECT 
        CASE 
          WHEN churn_probability > 0.7 THEN 'High Risk'
          WHEN churn_probability > 0.4 THEN 'Medium Risk'
          ELSE 'Low Risk'
        END as risk_level,
        COUNT(*) as count
      FROM customers
      GROUP BY risk_level
    `);

    res.json({
      metrics: {
        totalCustomers: parseInt(totalCustomers.rows[0].count),
        totalBalance: parseFloat(totalBalance.rows[0].sum).toFixed(2),
        avgCreditScore: Math.round(parseFloat(avgCreditScore.rows[0].avg)),
        openAlerts: parseInt(openAlerts.rows[0].count)
      },
      segments: segments.rows,
      churnRisk: churnRisk.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
