const AWS = require('aws-sdk');

// Configuración del cliente de AWS para la Data API de RDS
const rdsdataservice = new AWS.RDSDataService({
  region: 'us-east-2' // Cambia esto a la región de tu Aurora
});

// ARN del clúster Aurora y ARN del secreto en Secrets Manager
const dbConfig = {
  resourceArn: process.env.AURORA_RESOURCE_ARN, // ARN del clúster Aurora
  secretArn: process.env.SECRETS_MANAGER_ARN,   // ARN de Secrets Manager
  database: process.env.DB_NAME                 // Nombre de la base de datos
};

// Función para enmascarar el número de crédito
const maskCreditNumber = (creditNumber) => {
  if (!creditNumber || creditNumber.length < 4) return null;
  return '****' + creditNumber.slice(-4);
};

// Lambda Handler
exports.handler = async (event) => {
  console.log("DynamoDB Event:", JSON.stringify(event, null, 2));

  try {
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

        const sqlStatement = `
          INSERT INTO disbursements (
            disbursement_id, request_id, identification_number, date, request_json, response_json, 
            status, credit_number, amount, term, rate
          )
          VALUES (:disbursement_id, :request_id, :identification_number, :date, :request_json, :response_json, :status, :credit_number, :amount, :term, :rate)
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

        // Ejecuta la consulta usando la Data API
        const result = await rdsdataservice.executeStatement({
          resourceArn: dbConfig.resourceArn,
          secretArn: dbConfig.secretArn,
          database: dbConfig.database,
          sql: sqlStatement,
          parameters: [
            { name: 'disbursement_id', value: { stringValue: disbursement_id }},
            { name: 'request_id', value: { stringValue: request_id }},
            { name: 'identification_number', value: { stringValue: identification_number }},
            { name: 'date', value: { stringValue: date }},
            { name: 'request_json', value: { stringValue: request_json }},
            { name: 'response_json', value: { stringValue: response_json }},
            { name: 'status', value: { stringValue: status }},
            { name: 'credit_number', value: { stringValue: credit_number }},
            { name: 'amount', value: { doubleValue: amount }},
            { name: 'term', value: { longValue: term }},
            { name: 'rate', value: { doubleValue: rate }}
          ]
        }).promise();

        console.log("Resultado de la inserción:", result);
      }
    }

    return { statusCode: 200, body: "Records processed successfully" };
  } catch (error) {
    console.error('Error processing DynamoDB stream:', error);
    return { statusCode: 500, body: "Error processing records" };
  }
};
