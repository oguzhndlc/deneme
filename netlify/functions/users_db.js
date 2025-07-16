const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event, context) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id ASC LIMIT 2');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
