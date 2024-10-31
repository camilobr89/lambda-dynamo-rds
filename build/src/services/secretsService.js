"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecret = void 0;
const client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
const client = new client_secrets_manager_1.SecretsManagerClient({ region: 'us-east-2' });
const getSecret = async (secretName) => {
    try {
        const command = new client_secrets_manager_1.GetSecretValueCommand({ SecretId: secretName });
        const response = await client.send(command);
        if (response.SecretString) {
            return JSON.parse(response.SecretString);
        }
        else {
            throw new Error('Secret not found');
        }
    }
    catch (error) {
        console.error('Error retrieving secret:', error);
        throw error;
    }
};
exports.getSecret = getSecret;
//# sourceMappingURL=secretsService.js.map