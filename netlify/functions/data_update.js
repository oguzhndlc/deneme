const { Client } = require("pg");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Yalnızca POST metodu destekleniyor." }),
    };
  }

  try {
    const body = event.isBase64Encoded
      ? JSON.parse(Buffer.from(event.body, "base64").toString("utf8"))
      : JSON.parse(event.body);

    const { data, data1, data2, data3 } = body;

    const client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    // data → tablo adı
    // data1 → güncellenecek sütun
    // data2 → yeni değer
    // data3 → user_name (şart)
    const query = `UPDATE ${data} SET ${data1} = $1 WHERE user_name = $2`;
    const result = await client.query(query, [data2, data3]);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "veri güncellendi",
        updatedRows: result.rowCount,
      }),
    };
  } catch (error) {
    console.error("UPDATE hatası:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sunucu hatası: " + error.message }),
    };
  }
};
