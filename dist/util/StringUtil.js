"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOcurrences = void 0;
function getAllOcurrences(substring, string) {
    const ocurrences = [];
    let index = -1;
    index = string.indexOf(substring, index + 1);
    while (index >= 0) {
        ocurrences.push(index);
        index = string.indexOf(substring, index + 1);
    }
    return ocurrences;
}
exports.getAllOcurrences = getAllOcurrences;
//# sourceMappingURL=StringUtil.js.map