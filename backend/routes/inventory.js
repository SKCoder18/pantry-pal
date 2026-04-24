const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-pantrypal';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE user_id = $1 ORDER BY "addedAt" DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async (req, res) => {
  const { id, name, quantity, category, expiry, image, addedAt, event_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO inventory (id, user_id, name, quantity, category, expiry, image, "addedAt", event_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, req.user.id, name, quantity, category, expiry, image, addedAt, event_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error inserting inventory", err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
