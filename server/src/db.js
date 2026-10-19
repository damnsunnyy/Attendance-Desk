const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 15, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false });
pool.on('error', err => console.error('Unexpected database pool error:', err.message));
module.exports = { pool, query: (sql, params) => pool.query(sql, params) };
