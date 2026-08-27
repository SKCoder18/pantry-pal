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
  try {
    const items = db.inventory.findByUserId(req.user.id);
    res.json(items);
  } catch (err) {
    console.error('Fetch inventory error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add item to inventory
router.post('/', (req, res) => {
  const { id, name, quantity, category, expiry, image, addedAt, event_id } = req.body;
  
  try {
    db.inventory.insert(req.user.id, {
      id,
      name,
      quantity,
      category,
      expiry,
      image,
      addedAt,
      event_id
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Add inventory item error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete item
router.delete('/:id', (req, res) => {
  try {
    const success = db.inventory.delete(req.params.id, req.user.id);
    res.json({ success });
  } catch (err) {
    console.error('Delete inventory item error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
