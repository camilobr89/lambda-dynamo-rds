export default {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 3306,
  secretName: process.env.DATABASE_MATERIALIZATION_AURORA_SECRET1_QA,
  ssl: { rejectUnauthorized: false }
};
