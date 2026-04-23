const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-pantrypal';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name',
      [name, email, hashedPassword]
    );
    
    const user = result.rows[0];
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    if (error.code === '23505') { // Postgres unique violation code
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ error: 'Please sign in with Google' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Google Auth Sync
router.post('/google', async (req, res) => {
  const { name, email, picture, google_id } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = result.rows[0];
    
    if (user) {
      if (!user.picture && picture) {
        await pool.query('UPDATE users SET picture = $1, google_id = $2 WHERE id = $3', [picture, google_id, user.id]);
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: picture || user.picture } });
    } else {
      const insertResult = await pool.query(
        'INSERT INTO users (name, email, google_id, picture) VALUES ($1, $2, $3, $4) RETURNING id, email, name, picture',
        [name, email, google_id, picture]
      );
      user = insertResult.rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.json({ token, user });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
