"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDisbursement = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = __importDefault(require("../config"));
const secretsService_1 = require("./secretsService");
let pool;
const initializeDbConnection = async () => {
    if (!pool) {
        const dbConfig = await (0, secretsService_1.getSecret)(config_1.default.secretName);
        console.log("🚀 ~ initializeDbConnection ~ dbConfig:", dbConfig);
        pool = promise_1.default.createPool({
            user: dbConfig.username,
            host: dbConfig.host,
            database: dbConfig.dbname,
            password: dbConfig.password,
            port: dbConfig.port,
        });
    }
    return pool;
};
const insertDisbursement = async (disbursement) => {
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
exports.insertDisbursement = insertDisbursement;
//# sourceMappingURL=dbService.js.map