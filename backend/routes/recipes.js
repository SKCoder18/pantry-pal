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

router.get('/', (req, res) => {
  db.all('SELECT * FROM custom_recipes WHERE user_id = ? ORDER BY createdAt DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    // Parse JSON strings back to arrays
    const recipes = rows.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
      instructions: JSON.parse(r.instructions || '[]')
    }));
    res.json(recipes);
  });
});

router.post('/', (req, res) => {
  const { id, title, prepTime, ingredients, instructions, createdAt } = req.body;
  
  db.run(
    'INSERT INTO custom_recipes (id, user_id, title, prepTime, ingredients, instructions, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, title, prepTime, JSON.stringify(ingredients), JSON.stringify(instructions), createdAt],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ success: true });
    }
  );
});

module.exports = router;
