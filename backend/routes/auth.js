const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-pantrypal';

// Helper to query user by email safely
const findUserByEmail = (email, callback) => {
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err && err.message.includes('no such column')) {
      // Fallback query if optional columns are somehow missing
      db.get('SELECT id, name, email, password FROM users WHERE email = ?', [email], callback);
    } else {
      callback(err, user);
    }
  });
};

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
          console.error('Registration database error:', err.message);
          return res.status(500).json({ error: 'Database error', message: err.message });
        }
        
        const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, email, name } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  findUserByEmail(email, async (err, user) => {
    if (err) {
      console.error('Login database error:', err.message);
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ error: 'Please sign in with Google' });

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture || null } });
    } catch (error) {
      res.status(500).json({ error: 'Authentication error', message: error.message });
    }
  });
});

// Google Auth Sync
router.post('/google', (req, res) => {
  const { name, email, picture, google_id } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google Sign-In' });
  }

  findUserByEmail(email, (err, user) => {
    if (err) {
      console.error('Google sync database error:', err.message);
      return res.status(500).json({ error: 'Database error', message: err.message });
    }
    
    if (user) {
      // Safely update picture if missing and table supports it
      try {
        db.run('UPDATE users SET picture = ?, google_id = ? WHERE id = ?', [picture || null, google_id || null, user.id], () => {});
      } catch (e) {
        // Ignore update error if columns don't exist yet
      }
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: picture || user.picture || null } });
    } else {
      db.run(
        'INSERT INTO users (name, email, google_id, picture) VALUES (?, ?, ?, ?)',
        [name, email, google_id || null, picture || null],
        function(err) {
          if (err) {
            // Fallback insert if extra columns fail
            db.run(
              'INSERT INTO users (name, email) VALUES (?, ?)',
              [name, email],
              function(fallbackErr) {
                if (fallbackErr) {
                  return res.status(500).json({ error: 'Database error', message: fallbackErr.message });
                }
                const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET);
                return res.json({ token, user: { id: this.lastID, email, name, picture: picture || null } });
              }
            );
            return;
          }
          const token = jwt.sign({ id: this.lastID, email, name }, JWT_SECRET);
          res.json({ token, user: { id: this.lastID, email, name, picture: picture || null } });
        }
      );
    }
  });
});

module.exports = router;
