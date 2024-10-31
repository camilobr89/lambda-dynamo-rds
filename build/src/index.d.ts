import { DynamoDBStreamEvent } from 'aws-lambda';
export declare class DynamoDBStreamHandler {
    handler(event: DynamoDBStreamEvent): Promise<void>;
    private processRecords;
    private isValidEventType;
    private processSingleRecord;
    private insertDisbursementWithRetry;
    private handleDatabaseError;
}
export declare const handler: (event: DynamoDBStreamEvent) => Promise<void>;
