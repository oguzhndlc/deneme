const { Client } = require('pg');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul ediliyor.'
    };
  }

  let username;
  try {
    const body = JSON.parse(event.body);
    username = body.username;
    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ hata: 'username eksik' })
      };
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ hata: 'Geçersiz JSON: ' + err.message })
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const result = await client.query(
      'INSERT INTO deneme (username) VALUES ($1) RETURNING *',
      [username]
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
    console.error('Veritabanı hatası:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: 'Sunucu hatası: ' + err.message })
    };
  }
};
