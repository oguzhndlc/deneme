const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul ediliyor.'
    };
  }

  try {
    const data = JSON.parse(event.body);
    const username = data.username || 'bilinmeyen';

    const logFile = path.join('/tmp', 'veriler.txt');  // Netlify'de sadece /tmp dizinine yazabilirsin.

    const logEntry = `${new Date().toISOString()} - ${username}\n`;

    fs.appendFileSync(logFile, logEntry, 'utf8');

    return {
      statusCode: 200,
      body: JSON.stringify({ mesaj: 'Veri dosyaya kaydedildi.', dosya: logFile })
    };

  } catch (err) {
    console.error('Hata:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
