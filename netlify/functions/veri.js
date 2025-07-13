// netlify/functions/veri.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL, // Netlify ayarlarından okunacak
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event, context) {
  try {
    const result = await pool.query('SELECT * FROM deneme');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
