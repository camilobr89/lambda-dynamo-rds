import mysql, { Pool } from 'mysql2/promise';
import config from '../config';
import { IDisbursements } from '../models/IDisbursements';
import { getSecret } from './secretsService';

let dbPool: Pool;

const initializeDbConnection = async (): Promise<Pool> => {
  if (!dbPool) {
    const dbConfig = await getSecret(config.secretName);
    dbPool = mysql.createPool({
      user: dbConfig.username,
      host: dbConfig.host,
      database: dbConfig.dbname,
      password: dbConfig.password,
      port: dbConfig.port,
    });
  }
  return dbPool;
};

export const insertOrUpdateDisbursement = async (disbursement: IDisbursements): Promise<void> => {
  const pool = await initializeDbConnection();
  const query = `
    INSERT INTO disbursements (
      disbursement_id, request_id, identification_number, date, request_json, response_json,
      status, credit_number, product, amount, term, rate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (disbursement_id) 
    DO UPDATE SET 
      request_id = EXCLUDED.request_id,
      identification_number = EXCLUDED.identification_number,
      date = EXCLUDED.date,
      request_json = EXCLUDED.request_json,
      response_json = EXCLUDED.response_json,
      status = EXCLUDED.status,
      credit_number = EXCLUDED.credit_number,
      product = EXCLUDED.product,
      amount = EXCLUDED.amount,
      term = EXCLUDED.term,
      rate = EXCLUDED.rate;
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
    disbursement.product,
    disbursement.amount,
    disbursement.term,
    disbursement.rate,
  ];

  await pool.query(query, values);
};
