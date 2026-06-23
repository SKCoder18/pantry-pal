const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-pantrypal';

// Middleware to protect routes
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

// Get user's inventory
router.get('/', (req, res) => {
  db.all('SELECT * FROM inventory WHERE user_id = ? ORDER BY addedAt DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Add item to inventory
router.post('/', (req, res) => {
  const { id, name, quantity, category, expiry, image, addedAt } = req.body;
  
  db.run(
    'INSERT INTO inventory (id, user_id, name, quantity, category, expiry, image, addedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, name, quantity, category, expiry, image, addedAt],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    }
  );
});

// Delete item
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM inventory WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

module.exports = router;
