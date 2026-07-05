const db = require('../config/db');

exports.getNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM customer_notes WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, created_by } = req.body;
    if (!note?.trim()) return res.status(400).json({ error: 'Note cannot be empty' });
    const result = await db.query(
      'INSERT INTO customer_notes (customer_id, note, created_by) VALUES ($1, $2, $3) RETURNING *',
      [id, note.trim(), created_by || 'Relationship Manager']
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    await db.query('DELETE FROM customer_notes WHERE id = $1', [noteId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
