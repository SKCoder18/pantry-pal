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
    const existingUser = db.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.users.insert({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET);
    res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = db.users.findByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!user.password) return res.status(400).json({ error: 'Please sign in with Google' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Google Auth Sync
router.post('/google', (req, res) => {
  const { name, email, picture, google_id } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required for Google Sign-In' });
  }

  try {
    let user = db.users.findByEmail(email);
    if (user) {
      // Update picture and google_id if missing or changed
      const updates = {};
      if (!user.picture && picture) updates.picture = picture;
      if (!user.google_id && google_id) updates.google_id = google_id;
      
      if (Object.keys(updates).length > 0) {
        user = db.users.update(user.id, updates);
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } });
    } else {
      const newUser = db.users.insert({
        name,
        email,
        google_id,
        picture
      });

      const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET);
      res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name, picture: newUser.picture } });
    }
  } catch (error) {
    console.error('Google sync error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
