const { Client } = require('pg');

exports.handler = async function(event) {
  console.log('📩 Yeni istek alındı.');
  console.log('👉 HTTP Method:', event.httpMethod);
  console.log('👉 Ham Body:', event.body);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul ediliyor.'
    };
  }

  let user_name, passwrd;
  try {
    let parsedBody;

    try {
      const decoded = Buffer.from(event.body, 'base64').toString('utf8');
      parsedBody = JSON.parse(decoded);
      console.log('🔓 Base64 decode edilmiş body:', decoded);
    } catch {
      parsedBody = JSON.parse(event.body);
      console.log('⚡ Düz JSON body:', event.body);
    }

    user_name = parsedBody.user_name;
    passwrd = parsedBody.passwrd;

    if (!user_name || !passwrd) {
      return {
        statusCode: 400,
        body: JSON.stringify({ hata: 'user_name ve passwrd alanları zorunludur.' })
      };
    }

  } catch (err) {
    console.error('❌ JSON parse hatası:', err);
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
      'INSERT INTO users (user_name, passwrd) VALUES ($1, $2) RETURNING *',
      [user_name, passwrd]
    );

    await client.end();

    console.log('✅ Kayıt başarıyla eklendi:', result.rows[0]);

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
