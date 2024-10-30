import { DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDbUtils } from './utils/dynamoDbUtils';
import { insertOrUpdateDisbursement } from './services/dbService';

import { debug } from 'console';


export class DisbursementHandler {
  async processEvent(event: DynamoDBStreamEvent): Promise<void> {
    try {
      await this.processRecords(event.Records);
    } catch (error) {
      throw new Error(`Error processing event: ${error}`);
    }
  }

  private async processRecords(records: DynamoDBStreamEvent['Records']): Promise<void> {
    const processPromises = records
      .filter(record => DynamoDbUtils.isValidOperation(record.eventName))
      .map(record => this.processSingleRecord(record));
    await Promise.all(processPromises);
  }

  private async processSingleRecord(record: any): Promise<void> {
    const newImage = record.dynamodb?.NewImage;
    if (!newImage) {
      return;
    }
    const disbursement = DynamoDbUtils.unmarshallDisbursement(newImage);
    try {
      await insertOrUpdateDisbursement(disbursement);
      debug("[INFO] Disbursement inserted:", disbursement);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        debug(`Duplicate entry for disbursement_id: ${disbursement.disbursement_id}. Skipping.`);
        return;
      }
      debug(`Database error inserting disbursement_id: ${disbursement.disbursement_id}`);
      throw new Error(`Critical database error: ${error.message}`);
    }
  }
}

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const disbursementHandler = new DisbursementHandler();
  await disbursementHandler.processEvent(event);
}
