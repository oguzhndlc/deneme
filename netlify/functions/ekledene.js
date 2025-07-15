const { Client } = require('pg');

exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Sadece GET istekleri kabul ediliyor.'
    };
  }

  // URL parametresinden username alınır: ?username=Oguzhan
  const username = event.queryStringParameters?.username || 'anonymous';

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
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
