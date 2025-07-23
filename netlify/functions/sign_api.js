const { Client } = require('pg');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul edilir.'
    };
  }

  let username, password;
  try {
    const bodyDecoded = Buffer.from(event.body, 'base64').toString('utf8');
    const parsedBody = JSON.parse(bodyDecoded || event.body);

    username = parsedBody.username;
    password = parsedBody.password;
    

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ hata: 'username ve password zorunludur.' })
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
      'INSERT INTO accounts (user_name, passwrd) VALUES ($1, $2) RETURNING user_name',
      [username, password]
    );

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        mesaj: 'Kullanıcı eklendi.',
        kullanici: result.rows[0]
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: 'Veritabanı hatası: ' + err.message })
    };
  }
};
