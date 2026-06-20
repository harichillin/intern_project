/**
 * NexaCore Sentinel AI: Alert Controller
 * Location: backend/src/controllers/alert.js
 */

const db = require('../config/db');

exports.getAlerts = async (req, res) => {
  try {
    const query = `
      SELECT a.*, c.name as customer_name 
      FROM alerts a 
      JOIN customers c ON a.customer_id = c.customer_id 
      ORDER BY a.created_at DESC 
      LIMIT 100
    `;
    const results = await db.query(query);
    res.json(results.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'resolved', 'dismissed'
    await db.query('UPDATE alerts SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
};
