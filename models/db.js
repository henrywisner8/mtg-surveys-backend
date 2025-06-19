const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Neon / Railway
});

console.log("⚡ Postgres pool initialized");

// 🟢 Test DB connection on startup
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`🟢 DB connected. Current time: ${res.rows[0].now}`);
  } catch (err) {
    console.error('🔴 DB connection error:', err.message);
    process.exit(1); // optional: stop server if DB is down
  }
})();

module.exports = pool;
