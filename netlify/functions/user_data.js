const { Client } = require('pg');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul edilir',
    };
  }

  let username;
  try {
    const body = JSON.parse(event.body || '{}');
    username = body.username || 'oguzhndlc'; // Varsayılan değer olarak "kemal"
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Geçersiz JSON verisi' }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Kullanıcı bilgileri
    const userRes = await client.query('SELECT * FROM accounts WHERE user_name = $1', [username]);

    if (userRes.rows.length === 0) {
      await client.end();
      return {
        statusCode: 404,
        body: JSON.stringify({ success: false, message: 'Kullanıcı bulunamadı' }),
      };
    }

    // Diğer tablolar
    const settingsRes = await client.query('SELECT * FROM user_settings WHERE user_name = $1', [username]);
    const userskinsRes = await client.query('SELECT * FROM user_skins WHERE user_name = $1', [username]);
    const userstatsRes = await client.query('SELECT * FROM user_stats WHERE user_name = $1', [username]);
    const costumesRes = await client.query('SELECT * FROM costumes WHERE user_name = $1', [username]);

    await client.end();

    const user = userRes.rows[0];
    delete user.passwrd;

    const result = {
      user,
      userskins: userskinsRes.rows[0] || null,
      settings: settingsRes.rows[0] || null,
      userstats: userstatsRes.rows[0] || null,
      costumes: costumesRes.rows[0] || null,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result }),
    };

  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Sunucu hatası' }),
    };
  }
};
