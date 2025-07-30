const { Client } = require('pg');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST isteği kabul edilmektedir',
    };
  }

  let username, passwordBase64;
  try {
    const body = JSON.parse(event.body || '{}');
    username = body.username;
    passwordBase64 = body.password;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Geçersiz JSON verisi' }),
    };
  }

  if (!username || !passwordBase64) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Kullanıcı adı ve şifre gereklidir' }),
    };
  }

  // Base64 çözme
  let password;
  try {
    password = Buffer.from(passwordBase64, 'base64').toString('utf-8');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Geçersiz base64 şifre' }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT passwrd FROM accounts WHERE user_name = $1',
      [username]
    );

    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Bu kullanıcı adı mevcut değil' }),
      };
    }

    const storedPassword = result.rows[0].passwrd;

    // Şifre kontrolü (şifre düz metin karşılaştırması)
    const passwordMatches = (password === storedPassword);

    if (passwordMatches) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Kullanıcı adı veya şifreniz yanlış' }),
      };
    }
  } catch (error) {
    console.error('Giriş hatası:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Sunucu hatası oluştu' }),
    };
  }
};
                           
