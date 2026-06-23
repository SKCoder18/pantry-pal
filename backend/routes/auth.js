const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-pantrypal';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error', message: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, email, name } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message, stack: error.stack });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error', message: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ error: 'Please sign in with Google' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } });
  });
});

// Google Auth Sync
router.post('/google', (req, res) => {
  const { name, email, picture, google_id } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error', message: err.message });
    
    if (user) {
      // Update picture if missing
      if (!user.picture && picture) {
        db.run('UPDATE users SET picture = ?, google_id = ? WHERE id = ?', [picture, google_id, user.id]);
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: picture || user.picture } });
    } else {
      db.run(
        'INSERT INTO users (name, email, google_id, picture) VALUES (?, ?, ?, ?)',
        [name, email, google_id, picture],
        function(err) {
          if (err) return res.status(500).json({ error: 'Database error', message: err.message });
          const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET);
          res.json({ token, user: { id: this.lastID, email, name, picture } });
        }
      );
    }
  });
});

module.exports = router;
