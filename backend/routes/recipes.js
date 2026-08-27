const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');

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

// Get user's custom recipes
router.get('/', (req, res) => {
  try {
    const recipes = db.recipes.findByUserId(req.user.id);
    res.json(recipes);
  } catch (err) {
    console.error('Fetch custom recipes error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save custom recipe
router.post('/', (req, res) => {
  const { id, title, prepTime, ingredients, instructions, createdAt } = req.body;
  
  try {
    db.recipes.insert(req.user.id, {
      id,
      title,
      prepTime,
      ingredients,
      instructions,
      createdAt
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Save custom recipe error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
