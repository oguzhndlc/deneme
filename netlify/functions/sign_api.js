const { Client } = require('pg');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul edilir.'
    };
  }

  let user_name, password, name, surname, mail, phone_number;

  try {
    const bodyDecoded = Buffer.from(event.body, 'base64').toString('utf8');
    const parsedBody = JSON.parse(bodyDecoded || event.body);

    user_name = parsedBody.user_name;
    password = parsedBody.password;
    name = parsedBody.name;
    surname = parsedBody.surname;
    mail = parsedBody.mail;
    phone_number = parsedBody.phone_number;

    if (!user_name || !password) {
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

    // Kullanıcı adı kontrolü:
    const kontrolResult = await client.query(
      'SELECT user_name FROM accounts WHERE user_name = $1',
      [user_name]
    );

    if (kontrolResult.rows.length > 0) {
      await client.end();
      return {
        statusCode: 409, // 409 Conflict
        body: JSON.stringify({ hata: 'Bu kullanıcı adı zaten kayıtlı.' })
      };
    }

    // Ekleme işlemi:
    const result = await client.query(
      'INSERT INTO accounts (user_name, passwrd, name, surname, mail, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_name',
      [user_name, password, name, surname, mail, phone_number]
    );

    await client.query(
  'INSERT INTO user_settings (user_name, music, sound) VALUES ($1, $2, $3)',
  [user_name, true, true]
    );

    await client.query(
  'INSERT INTO user_skins (user_name,skin_main,skin_one,skin_two,skin_three,skin_four,skin_five) VALUES ($1, $2, $3,$4,$5,$6,$7)',
  [user_name,1,0,0,0,0,0]
);

    await client.query(
  'INSERT INTO user_stats (user_name,level,money,classic_high_score,race_high_score,classic_gameplay,race_gameplay,eat_enemy) VALUES ($1, $2, $3,$4,$5,$6,$7,$8)',
  [user_name,0,0,0,0,0,0,0]
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
