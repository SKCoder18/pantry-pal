const { Pool } = require('pg');

// Forcing the Render Internal URL because the Render dashboard has a bad URL saved in it.
const connectionString = 'postgresql://pantrypal_db_ppgs_user:W1zvIQiM2vGxgg2DTFasYmBRc5ws1kSb@dpg-d7l76blckfvc73a2v1qg-a/pantrypal_db_ppgs';

const pool = new Pool({
  connectionString,
  ssl: false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        google_id TEXT,
        picture TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        quantity TEXT,
        category TEXT,
        expiry TEXT,
        image TEXT,
        "addedAt" TEXT
      );
    `);

    // Safely add event_id if it doesn't exist
    await pool.query(`
      ALTER TABLE inventory ADD COLUMN IF NOT EXISTS event_id TEXT;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_recipes (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT,
        "prepTime" TEXT,
        ingredients TEXT,
        instructions TEXT,
        "createdAt" TEXT
      );
    `);

    console.log('Connected to PostgreSQL and verified tables.');
  } catch (err) {
    console.error('Error initializing PostgreSQL tables:', err);
  }
};

initDb();

module.exports = pool;
