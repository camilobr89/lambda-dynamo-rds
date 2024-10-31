import { DynamoDBStreamEvent } from 'aws-lambda';
import { DynamoDbUtils } from './utils/dynamoDbUtils';
import { insertDisbursement } from './services/dbService';
import { IDisbursements } from './models/IDisbursements';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { debug } from 'console';


export class DynamoDBStreamHandler {
 
  /**
   * Main handler method for processing DynamoDB Stream events
   */
  public async handler(event: DynamoDBStreamEvent): Promise<void> {
    const obfuscatedEvent = DynamoDbUtils.obfuscateDataForLogs(JSON.parse(JSON.stringify(event)));
    debug("[START] DynamoDB Event (obfuscated): %s", JSON.stringify(obfuscatedEvent, null, 2));


    try {
      await this.processRecords(event.Records);
    } catch (generalError) {
      debug('Error processing DynamoDB event:', generalError);
      throw new Error('Error processing DynamoDB event: ' + generalError);
    }
  }

  /**
   * Process all records in the event
   */
  private async processRecords(records: DynamoDBStreamEvent['Records']): Promise<void> {
    for (const record of records) {
      if (this.isValidEventType(record.eventName)) {
        await this.processSingleRecord(record);
      }
    }
  }

  /**
   * Check if the event type is valid for processing
   */
  private isValidEventType(eventName: string | undefined): boolean {
    return eventName === 'INSERT' || eventName === 'MODIFY';
  }

  /**
   * Process a single DynamoDB record
   */
  private async processSingleRecord(record: DynamoDBStreamEvent['Records'][0]): Promise<void> {
    const newImage = record.dynamodb?.NewImage as { [key: string]: AttributeValue };
    if (!newImage) return;

    const disbursement: IDisbursements = DynamoDbUtils.unmarshallDisbursement(newImage);
    const obfuscatedDisbursement = DynamoDbUtils.obfuscateDataForLogs(disbursement);
    debug("[INFO] Inserting disbursement (obfuscated): %s", JSON.stringify(obfuscatedDisbursement));

    await this.insertDisbursementWithRetry(disbursement);
  }

  /**
   * Insert disbursement with error handling
   */
  private async insertDisbursementWithRetry(disbursement: IDisbursements): Promise<void> {
    try {
      debug("[INFO] Inserting disbursement: %s", JSON.stringify(disbursement));
      await insertDisbursement(disbursement);
      debug("[INFO] Disbursement inserted: %s", JSON.stringify(disbursement));
    } catch (dbError: any) {
      await this.handleDatabaseError(dbError, disbursement);
    }
  }

  /**
   * Handle database errors during insertion
   */
  private async handleDatabaseError(error: any, disbursement: IDisbursements): Promise<void> {
    if (error.code === 'ER_DUP_ENTRY') {
      debug(`Duplicate entry for disbursement_id: ${disbursement.disbursement_id}. Skipping.`);
      return;
    }
    
    debug(`Database error inserting disbursement_id: ${disbursement.disbursement_id}`, error);
    throw new Error(`Critical database error: ${error.message}`);
  }
}

// Lambda handler function
export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  const streamHandler = new DynamoDBStreamHandler();
  return await streamHandler.handler(event);
};