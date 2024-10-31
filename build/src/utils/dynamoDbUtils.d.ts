import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { IDisbursements } from '../models/IDisbursements';
export declare class DynamoDbUtils {
    static unmarshallDisbursement(newImage: {
        [key: string]: AttributeValue;
    }): IDisbursements;
}
