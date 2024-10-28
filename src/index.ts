import { DynamoDBStreamEvent } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { insertDisbursement } from './services/dbService';
import { maskCreditNumber } from './utils/maskCreditNumber';
import { IDisbursements } from './models/IDisbursements';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  console.log("DynamoDB Event:", JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      if (record.eventName === 'INSERT') {
       
        const newImage = record.dynamodb?.NewImage as { [key: string] : AttributeValue };
        if (!newImage) continue;

        // Deserializar el objeto DynamoDB usando unmarshall
        const unmarshalledData = unmarshall(newImage);

        const disbursement: IDisbursements = {
          disbursement_id: unmarshalledData.DISBURSEMENT_ID,
          request_id: unmarshalledData.REQUEST_ID,
          identification_number: unmarshalledData.ID_NUMBER,
          date: unmarshalledData.DATE,
          request_json: JSON.stringify(unmarshalledData.REQUEST),
          response_json: JSON.stringify(unmarshalledData.RESPONSE),
          status: unmarshalledData.STATUS,
          credit_number: maskCreditNumber(unmarshalledData.CREDIT_NUMBER),
          amount: unmarshalledData.AMOUNT,
          term: unmarshalledData.TERM,
          rate: unmarshalledData.RATE
          
        };
        console.log("Extracted values:", disbursement); 

        await insertDisbursement(disbursement);
        console.log("Resultado de la inserción:", insertDisbursement);
      }
    }

  } catch (error) {
    console.error('Error processing DynamoDB stream:', error);
  }
};
