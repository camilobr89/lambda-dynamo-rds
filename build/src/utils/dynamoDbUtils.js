"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDbUtils = void 0;
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
class DynamoDbUtils {
    static unmarshallDisbursement(newImage) {
        const unmarshalledData = (0, util_dynamodb_1.unmarshall)(newImage);
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
exports.DynamoDbUtils = DynamoDbUtils;
//# sourceMappingURL=dynamoDbUtils.js.map