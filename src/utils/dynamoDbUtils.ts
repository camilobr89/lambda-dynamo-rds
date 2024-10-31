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
   * Ofusca los campos especificados en el objeto `data` sin importar la profundidad.
   */
  static obfuscateDataForLogs(data: any): any {
    const fieldsToObfuscate = (config.logs.fieldsToObfuscate || '').split(',').map(field => field.trim());

    // Función recursiva para aplicar enmascaramiento profundo
    const obfuscateRecursively = (data: any): any => {
      if (typeof data !== 'object' || data === null) {
        return data;
      }

      const obfuscatedData = Array.isArray(data) ? [] : {};

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Si el campo debe ofuscarse y es una cadena, aplicar enmascaramiento
          if (fieldsToObfuscate.includes(key) && typeof data[key] === 'string') {
            obfuscatedData[key] = DynamoDbUtils.maskField(data[key]);
          }
          // Si el valor es un objeto o array, llamar recursivamente
          else if (typeof data[key] === 'object') {
            obfuscatedData[key] = obfuscateRecursively(data[key]);
          } else {
            obfuscatedData[key] = data[key];
          }
        }
      }
      return obfuscatedData;
    };

    return obfuscateRecursively(data);
  }
}
