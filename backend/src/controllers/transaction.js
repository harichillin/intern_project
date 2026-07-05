const db = require('../config/db');

exports.getLiveFeed = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.id, t.amount, t.type, t.merchant, t.timestamp,
             c.name AS customer_name, c.segment, c.fraud_score
      FROM transactions t
      JOIN customers c ON t.customer_id = c.customer_id
      ORDER BY t.timestamp DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction feed' });
  }
};
