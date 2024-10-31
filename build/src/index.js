"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.DynamoDBStreamHandler = void 0;
const dynamoDbUtils_1 = require("./utils/dynamoDbUtils");
const dbService_1 = require("./services/dbService");
const console_1 = require("console");
class DynamoDBStreamHandler {
    async handler(event) {
        (0, console_1.debug)("[START] DynamoDB Event: %s", JSON.stringify(event, null, 2));
        try {
            await this.processRecords(event.Records);
        }
        catch (generalError) {
            (0, console_1.debug)('Error processing DynamoDB event:', generalError);
            throw new Error('Error processing DynamoDB event: ' + generalError);
        }
    }
    async processRecords(records) {
        for (const record of records) {
            if (this.isValidEventType(record.eventName)) {
                await this.processSingleRecord(record);
            }
        }
    }
    isValidEventType(eventName) {
        return eventName === 'INSERT' || eventName === 'MODIFY';
    }
    async processSingleRecord(record) {
        var _a;
        const newImage = (_a = record.dynamodb) === null || _a === void 0 ? void 0 : _a.NewImage;
        if (!newImage)
            return;
        const disbursement = dynamoDbUtils_1.DynamoDbUtils.unmarshallDisbursement(newImage);
        await this.insertDisbursementWithRetry(disbursement);
    }
    async insertDisbursementWithRetry(disbursement) {
        try {
            (0, console_1.debug)("[INFO] Inserting disbursement: %s", JSON.stringify(disbursement));
            await (0, dbService_1.insertDisbursement)(disbursement);
            (0, console_1.debug)("[INFO] Disbursement inserted: %s", JSON.stringify(disbursement));
        }
        catch (dbError) {
            await this.handleDatabaseError(dbError, disbursement);
        }
    }
    async handleDatabaseError(error, disbursement) {
        if (error.code === 'ER_DUP_ENTRY') {
            (0, console_1.debug)(`Duplicate entry for disbursement_id: ${disbursement.disbursement_id}. Skipping.`);
            return;
        }
        (0, console_1.debug)(`Database error inserting disbursement_id: ${disbursement.disbursement_id}`, error);
        throw new Error(`Critical database error: ${error.message}`);
    }
}
exports.DynamoDBStreamHandler = DynamoDBStreamHandler;
const handler = async (event) => {
    const streamHandler = new DynamoDBStreamHandler();
    return await streamHandler.handler(event);
};
exports.handler = handler;
//# sourceMappingURL=index.js.map