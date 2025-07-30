const { Client } = require("pg");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Yalnızca POST metodu destekleniyor." }),
    };
  }

  try {
    const {data,data1,data2,data3} = JSON.parse(event.body);

    const client = new Client({
      connectionString: process.env.NETLIFY_DATABASE_URL, // NeonDB/Supabase bağlantısı
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    const result = await client.query(
      "UPDATE $1 SET $2 = $3 WHERE user_name = $4",
      [data,data1,data2,data3]
    );

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
