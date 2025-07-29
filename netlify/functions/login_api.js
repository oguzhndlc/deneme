const { Client } = require('pg');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Only POST requests allowed',
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
      body: JSON.stringify({ success: false, message: 'Invalid JSON body' }),
    };
  }

  if (!username || !passwordBase64) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Username and password required' }),
    };
  }

  // Base64 decode
  let password;
  try {
    password = Buffer.from(passwordBase64, 'base64').toString('utf-8');
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid base64 password' }),
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
        body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
      };
    }

    const storedPassword = result.rows[0].passwrd;

    // bcrypt kontrolü iptal, basit eşitlik kontrolü
    const passwordMatches = (password === storedPassword);

    if (passwordMatches) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Internal server error' }),
    };
  }
};
