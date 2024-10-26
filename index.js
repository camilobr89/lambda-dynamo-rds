
const mysql = require('mysql2/promise');

// El resto del código sigue igual


// Configuración de PostgreSQL desde variables de entorno
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
};

// Función para enmascarar el número de crédito
const maskCreditNumber = (creditNumber) => {
  if (!creditNumber || creditNumber.length < 4) return null;
  return '****' + creditNumber.slice(-4);
};

// Lambda Handler
exports.handler = async (event) => {
console.log("DynamoDB Event:", JSON.stringify(event, null, 2));
  let client

  try {
    // Conectar a la base de datos
    await client.connect();
    // Conectar a la base de datos
    client = await mysql.createConnection(dbConfig);
    console.log("Conexión exitosa con MySQL");

    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const newImage = record.dynamodb.NewImage;

        console.log("NewImage:", newImage);
        const disbursement_id = newImage.DISBURSEMENT_ID.S;
        const request_id = newImage.REQUEST_ID.S;
        const date = newImage.DATE.S;
        const identification_number = newImage.ID_NUMBER.S;
        const request_json = JSON.stringify(newImage.REQUEST.S);
        const response_json = JSON.stringify(newImage.RESPONSE.S);
        const status = newImage.STATUS.S;
        const credit_number = maskCreditNumber(newImage.CREDIT_NUMBER.S);
        const amount = parseFloat(newImage.AMOUNT.S);
        const term = parseInt(newImage.TERM.S, 10);
        const rate = parseFloat(newImage.RATE.S);
        console.log("Extracted values:", disbursement_id, request_id, date, identification_number, status); 

        const query = `
          INSERT INTO disbursements (
            disbursement_id, request_id, identification_number, date, request_json, response_json, 
            status, credit_number, amount, term, rate
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            request_id = VALUES(request_id),
            identification_number = VALUES(identification_number),
            date = VALUES(date),
            request_json = VALUES(request_json),
            response_json = VALUES(response_json),
            status = VALUES(status),
            credit_number = VALUES(credit_number),
            amount = VALUES(amount),
            term = VALUES(term),
            rate = VALUES(rate);
        `;

        const values = [
          disbursement_id, request_id, identification_number, date, request_json, response_json,
          status, credit_number, amount, term, rate
        ];

        // Ejecutar la consulta en PostgreSQL
        const result = await client.query(query, values);
        console.log("Resultado de la inserción:", result);
      }
    }

    return { statusCode: 200, body: "Records processed successfully" };
  } catch (error) {
    console.error('Error processing DynamoDB stream:', error);
    return { statusCode: 500, body: "Error processing records" };
  } finally {
    await client.end(); // Cerrar la conexión con la base de datos
    console.log("Conexión cerrada");
  }
};
