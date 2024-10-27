"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskCreditNumber = void 0;
const maskCreditNumber = (creditNumber) => {
    if (!creditNumber || creditNumber.length < 4)
        return null;
    return '****' + creditNumber.slice(-4);
};
exports.maskCreditNumber = maskCreditNumber;
//# sourceMappingURL=maskCreditNumber.js.map