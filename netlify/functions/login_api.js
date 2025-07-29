const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Only POST requests allowed',
    };
  }

  const { user_name, passwrd } = JSON.parse(event.body || '{}');

  if (!user_name || !passwrd) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Username and password required' }),
    };
  }

  const client = new Client({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const result = await client.query('SELECT passwrd FROM accounts WHERE user_name = $1', [user_name]);
    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
      };
    }

    const hashedPassword = result.rows[0]. passwrd;

    const passwordMatches = await bcrypt.compare(passwrd, hashedPassword);

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
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

