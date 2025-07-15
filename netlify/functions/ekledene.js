const { Client } = require('pg');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul ediliyor.'
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const { username } = JSON.parse(event.body);

    const result = await client.query(
      'INSERT INTO deneme (username) VALUES ($1) RETURNING *',
      [username || 'anonymous']
    );

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        mesaj: 'Kayıt başarıyla eklendi.',
        eklenen: result.rows[0]
      })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
