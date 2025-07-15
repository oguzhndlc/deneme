const fs = require('fs');
const path = require('path');

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

  try {
    // Base64 çöz
    const decodedBody = Buffer.from(event.body, 'base64').toString('utf8');
    console.log('🔓 Decode edilmiş body:', decodedBody);

    const data = JSON.parse(decodedBody);
    const username = data.username || 'bilinmeyen';

    const logFile = path.join('/tmp', 'veriler.txt');  // Netlify'de yazabileceğin dizin

    const logEntry = `${new Date().toISOString()} - ${username}\n`;

    fs.appendFileSync(logFile, logEntry, 'utf8');

    return {
      statusCode: 200,
      body: JSON.stringify({ mesaj: 'Veri dosyaya kaydedildi.', dosya: logFile })
    };

  } catch (err) {
    console.error('❌ JSON parse hatası:', err);
    console.error('🔥 Sunucu hatası:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: 'Geçersiz JSON formatı.' })
    };
  }
};
