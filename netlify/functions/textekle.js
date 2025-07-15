const fs = require('fs');
const path = require('path');

exports.handler = async function(event) {
  console.log('📩 Yeni istek alındı.');
  console.log('👉 HTTP Method:', event.httpMethod);
  console.log('👉 Ham Body:', event.body);

  if (event.httpMethod !== 'POST') {
    console.warn('❌ Geçersiz istek metodu:', event.httpMethod);
    return {
      statusCode: 405,
      body: 'Sadece POST istekleri kabul ediliyor.'
    };
  }

  try {
    let data;

    try {
      data = JSON.parse(event.body);
      console.log('✅ Body JSON olarak parse edildi:', data);
    } catch (parseError) {
      console.error('❌ JSON parse hatası:', parseError.message);
      console.error('❓ Gelen veri:', event.body);
      throw new Error('Geçersiz JSON formatı.');
    }

    const username = data.username || 'bilinmeyen';
    console.log('👤 Alınan username:', username);

    const logFile = path.join('/tmp', 'veriler.txt');  // Netlify'de sadece /tmp dizinine yazılabilir.
    const logEntry = `${new Date().toISOString()} - ${username}\n`;

    fs.appendFileSync(logFile, logEntry, 'utf8');
    console.log('📝 Veri dosyaya yazıldı:', logFile);

    return {
      statusCode: 200,
      body: JSON.stringify({ mesaj: 'Veri dosyaya kaydedildi.', dosya: logFile })
    };

  } catch (err) {
    console.error('🔥 Sunucu hatası:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ hata: err.message })
    };
  }
};
