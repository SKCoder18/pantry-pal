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

      // Ensure missing columns in users table are safely added if the table pre-existed
      db.all(`PRAGMA table_info(users)`, (err, columns) => {
        if (!err && columns) {
          const colNames = columns.map(c => c.name);
          if (!colNames.includes('google_id')) {
            db.run(`ALTER TABLE users ADD COLUMN google_id TEXT`, (alterErr) => {
              if (alterErr) console.log('Notice: google_id column addition handled:', alterErr.message);
            });
          }
          if (!colNames.includes('picture')) {
            db.run(`ALTER TABLE users ADD COLUMN picture TEXT`, (alterErr) => {
              if (alterErr) console.log('Notice: picture column addition handled:', alterErr.message);
            });
          }
        }
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
        event_id TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      db.all(`PRAGMA table_info(inventory)`, (err, columns) => {
        if (!err && columns) {
          const colNames = columns.map(c => c.name);
          if (!colNames.includes('event_id')) {
            db.run(`ALTER TABLE inventory ADD COLUMN event_id TEXT`, (alterErr) => {
              if (alterErr) console.log('Notice: event_id column addition handled:', alterErr.message);
            });
          }
        }
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
