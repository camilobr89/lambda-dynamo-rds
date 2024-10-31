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

  static maskField(value: string): string {
    return '*'.repeat(value.length);
  }

  /**
   * Ofusca los campos especificados en el objeto data basado en la configuración.
   */
  static obfuscateDataForLogs(data: { [key: string]: any }): { [key: string]: any } {
    const fieldsToObfuscate = (config.logs.fieldsToObfuscate || '').split(',').map(field => field.trim());
    
    return Object.keys(data).reduce((acc, key) => {
      if (fieldsToObfuscate.includes(key) && typeof data[key] === 'string') {
        acc[key] = DynamoDbUtils.maskField(data[key]);
      } else {
        acc[key] = data[key];
      }
      return acc;
    }, {} as { [key: string]: any });
  }
}
