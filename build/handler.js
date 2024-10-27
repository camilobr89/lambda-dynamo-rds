"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const dbService_1 = require("./services/dbService");
const maskCreditNumber_1 = require("./utils/maskCreditNumber");
const handler = async (event) => {
    var _a;
    console.log("DynamoDB Event:", JSON.stringify(event, null, 2));
    try {
        for (const record of event.Records) {
            if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
                const newImage = (_a = record.dynamodb) === null || _a === void 0 ? void 0 : _a.NewImage;
                if (!newImage)
                    continue;
                const unmarshalledData = (0, util_dynamodb_1.unmarshall)(newImage);
                const disbursement = {
                    disbursement_id: unmarshalledData.DISBURSEMENT_ID,
                    request_id: unmarshalledData.REQUEST_ID,
                    identification_number: unmarshalledData.ID_NUMBER,
                    date: unmarshalledData.DATE,
                    request_json: JSON.stringify(unmarshalledData.REQUEST),
                    response_json: JSON.stringify(unmarshalledData.RESPONSE),
                    status: unmarshalledData.STATUS,
                    credit_number: (0, maskCreditNumber_1.maskCreditNumber)(unmarshalledData.CREDIT_NUMBER),
                    amount: unmarshalledData.AMOUNT,
                    term: unmarshalledData.TERM,
                    rate: unmarshalledData.RATE
                };
                console.log("Extracted values:", disbursement);
                await (0, dbService_1.insertOrUpdateDisbursement)(disbursement);
                console.log("Resultado de la inserción:", dbService_1.insertOrUpdateDisbursement);
            }
        }
    }
    catch (error) {
        console.error('Error processing DynamoDB stream:', error);
    }
};
exports.handler = handler;
//# sourceMappingURL=handler.js.map