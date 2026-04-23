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
    const result = await pool.query('SELECT * FROM custom_recipes WHERE user_id = $1 ORDER BY "createdAt" DESC', [req.user.id]);
    const recipes = result.rows.map(r => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
      instructions: JSON.parse(r.instructions || '[]')
    }));
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', async (req, res) => {
  const { id, title, prepTime, ingredients, instructions, createdAt } = req.body;
  try {
    await pool.query(
      'INSERT INTO custom_recipes (id, user_id, title, "prepTime", ingredients, instructions, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, req.user.id, title, prepTime, JSON.stringify(ingredients), JSON.stringify(instructions), createdAt]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
