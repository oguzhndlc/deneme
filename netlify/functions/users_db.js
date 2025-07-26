const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event, context) {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY id ASC');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: result.rows })   // Tüm kullanıcılar JSON dizisi olarak
    };

  } catch (err) {
    console.error('Veri tabanı hatası:', err.message);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Veri tabanına bağlanırken hata oluştu.' })
    };
  }
};
