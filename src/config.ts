export default {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false },
  logs: {
    fieldsToObfuscate:
      process.env.LOGS_FIELDS_TO_OBFUSCATE
  },
};
