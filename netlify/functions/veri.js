const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event, context) {
  try {
    const result = await pool.query('SELECT * FROM accounts ORDER BY id ASC');
    const result1 = await pool.query('SELECT * FROM costumes ORDER BY id ASC');
    const result2 = await pool.query('SELECT * FROM user_settings ORDER BY id ASC');
    const result3 = await pool.query('SELECT * FROM user_stats ORDER BY id ASC');
    const result4 = await pool.query('SELECT * FROM user_skins ORDER BY id ASC');


    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accounts: result.rows,costumes: result1.rows,user_settings: result2.rows,user_stats: result3.rows,user_skins: result4.rows})
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
