const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        google_id TEXT,
        picture TEXT
      )`);

      // Migrations to add missing columns to users if they don't exist
      db.run(`ALTER TABLE users ADD COLUMN google_id TEXT`, (err) => {
        // Column might already exist, ignore error
      });
      db.run(`ALTER TABLE users ADD COLUMN picture TEXT`, (err) => {
        // Column might already exist, ignore error
      });

      // Inventory table
      db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        name TEXT,
        quantity TEXT,
        category TEXT,
        expiry TEXT,
        image TEXT,
        addedAt TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Migration to add event_id column to inventory if it doesn't exist
      db.run(`ALTER TABLE inventory ADD COLUMN event_id TEXT`, (err) => {
        // Column might already exist, ignore error
      });

      // Custom recipes table
      db.run(`CREATE TABLE IF NOT EXISTS custom_recipes (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        title TEXT,
        prepTime TEXT,
        ingredients TEXT,
        instructions TEXT,
        createdAt TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);
    });
  }
});

module.exports = db;
