import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { IDisbursements } from '../models/IDisbursements';

export class DynamoDbUtils {
  static unmarshallDisbursement(newImage: { [key: string]: AttributeValue }): IDisbursements {
    const unmarshalledData = unmarshall(newImage);
    return {
      disbursement_id: unmarshalledData.DISBURSEMENT_ID,
      request_id: unmarshalledData.REQUEST_ID,
      identification_number: unmarshalledData.ID_NUMBER,
      date: unmarshalledData.DATE,
      request_json: JSON.stringify(unmarshalledData.REQUEST),
      response_json: JSON.stringify(unmarshalledData.RESPONSE),
      status: unmarshalledData.STATUS,
      credit_number: unmarshalledData.CREDIT_NUMBER,
      product: unmarshalledData.PRODUCT,
      amount: unmarshalledData.AMOUNT,
      term: unmarshalledData.TERM,
      rate: unmarshalledData.RATE
    };
  }
}

