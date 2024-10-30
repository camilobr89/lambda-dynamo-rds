export default {
  secretName: process.env.DATABASE_MATERIALIZATION_AURORA_SECRET1_QA,
  environment: process.env.ENVIRONMENT || 'dev',
  ssl: { rejectUnauthorized: false },
  logs: {
    fieldsToObfuscate:
      process.env.LOGS_FIELDS_TO_OBFUSCATE ||
      'apiKeyEvent,apiKeyRedis,identificationNumber,x-api-key',
      jsonDepth: process.env.LOGS_JSON_DEPTH || '2',
  },
};
