import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-2' });


export const getSecret = async (secretName: string) => {
console.log("getSecret ~ secretName:", secretName)

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    } else {
      throw new Error('Secret not found');
    }
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
};
