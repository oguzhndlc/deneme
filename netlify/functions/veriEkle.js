const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL‎,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Sadece POST istekleri.' };
  }

  try {
    const { username } = JSON.parse(event.body);
    const result = await pool.query(
      'INSERT INTO deneme (username) VALUES ($1) RETURNING *',
      [username]
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ mesaj: 'Kayıt başarıyla eklendi.', data: result.rows[0] })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
