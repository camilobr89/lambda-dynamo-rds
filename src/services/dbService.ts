import mysql, { Pool } from 'mysql2/promise';
import config from 'src/config';
import { IDisbursements } from '../models/IDisbursements';
import { getSecret } from './secretsService';

let pool: Pool;

const initializeDbConnection = async () => {
  if (!pool) {
    // Obtén el secreto directamente, asegurándote de que contiene los datos de configuración exactos
    const dbConfig = await getSecret(config.secretManager); // Usa el nombre de tu secreto

    // Crea el pool de conexiones utilizando directamente el secreto como dbConfig
    pool = mysql.createPool({
      ...dbConfig,
    });
  }
  return pool;
};

export const insertOrUpdateDisbursement = async (disbursement: IDisbursements): Promise<void> => {
    console.log("Conexión exitosa con MySQL");
  const query = `
    INSERT INTO disbursements (
      disbursement_id, request_id, identification_number, date, request_json, response_json,
      status, credit_number, amount, term, rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    disbursement.disbursement_id,
    disbursement.request_id,
    disbursement.identification_number,
    disbursement.date,
    disbursement.request_json,
    disbursement.response_json,
    disbursement.status,
    disbursement.credit_number,
    disbursement.amount,
    disbursement.term,
    disbursement.rate,
  ];

  const pool = await initializeDbConnection();
  await pool.query(query, values);
};
