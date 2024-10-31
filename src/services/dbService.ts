import mysql, { Pool } from 'mysql2/promise';
import config from '../config';
import { IDisbursements } from '../models/IDisbursements';
import { getSecret } from './secretsService';

let pool: Pool;

const initializeDbConnection = async () => {
  if (!pool) {
    pool = mysql.createPool({
      user: config.user,
      host: config.host,
      database: config.database,
      password: config.password,
      port: config.port,
    });
  }
  console.log('Pool:', pool);
  return pool;
};

export const insertDisbursement = async (disbursement: IDisbursements): Promise<void> => {
  console.log("insertOrUpdateDisbursement ~ disbursement:", disbursement)
  const pool = await initializeDbConnection();
  const query = `
    INSERT INTO disbursements (
      disbursement_id, request_id, identification_number, date, request_json, response_json,
      status, credit_number, amount, term, rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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

  await pool.query(query, values);
};

