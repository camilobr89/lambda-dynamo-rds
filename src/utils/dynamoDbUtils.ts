import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { IDisbursements } from '../models/IDisbursements';
import config from '../config';

export class DynamoDbUtils {
  static unmarshallDisbursement(newImage: { [key: string]: AttributeValue }): IDisbursements {
    const unmarshalledData = unmarshall(newImage);
    const dataInLowerCase = Object.keys(unmarshalledData).reduce((acc, key) => {
      acc[key.toLowerCase()] = unmarshalledData[key];
      return acc;
    }, {} as { [key: string]: any });

    return {
      disbursement_id: dataInLowerCase['disbursement_id'],
      request_id: dataInLowerCase['request_id'],
      identification_number: dataInLowerCase['id_number'],
      date: dataInLowerCase['date'],
      request_json: JSON.stringify(dataInLowerCase['request']),
      response_json: JSON.stringify(dataInLowerCase['response']),
      status: dataInLowerCase['status'],
      credit_number: dataInLowerCase['credit_number'],
      product: dataInLowerCase['product'],
      amount: dataInLowerCase['amount'],
      term: dataInLowerCase['term'],
      rate: dataInLowerCase['rate']
    };
  }

   /**
   * Enmascara un valor completo con asteriscos.
   */
   static maskField(value: string): string {
    return '*'.repeat(value.length);
  }

  /**
   * Ofusca los campos especificados en el objeto `data`, manejando estructuras tanto simples como anidadas.
   */
  static obfuscateDataForLogs(data: any): any {
    const fieldsToObfuscate = (config.logs.fieldsToObfuscate || '').split(',').map(field => field.trim());

    const obfuscateRecursively = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      const obfuscatedData = Array.isArray(obj) ? [] : {};

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Enmascarar si es un campo simple que debe ofuscarse y es una cadena
          if (fieldsToObfuscate.includes(key) && typeof obj[key] === 'string') {
            obfuscatedData[key] = DynamoDbUtils.maskField(obj[key]);
          }
          // Enmascarar si es un campo de DynamoDB { "S": "valor" } y debe ofuscarse
          else if (fieldsToObfuscate.includes(key) && typeof obj[key] === 'object' && obj[key].S) {
            obfuscatedData[key] = { S: DynamoDbUtils.maskField(obj[key].S) };
          }
          // Si es un objeto o array, procesarlo recursivamente
          else if (typeof obj[key] === 'object') {
            obfuscatedData[key] = obfuscateRecursively(obj[key]);
          } else {
            obfuscatedData[key] = obj[key];
          }
        }
      }

      return obfuscatedData;
    };

    return obfuscateRecursively(data);
  }
}
