"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersection = exports.cutArray = exports.addArray = exports.returnFirstItemInArrayOrValue = void 0;
function returnFirstItemInArrayOrValue(value) {
    if (value && Array.isArray(value) && value.length === 1) {
        return value[0];
    }
    return value;
}
exports.returnFirstItemInArrayOrValue = returnFirstItemInArrayOrValue;
function addArray(arr) {
    if (!Array.isArray(arr)) {
        return [arr];
    }
    return arr;
}
exports.addArray = addArray;
function cutArray(arr) {
    if (!Array.isArray(arr)) {
        return arr;
    }
    if (arr.length === 1) {
        arr = arr[0];
    }
    return arr;
}
exports.cutArray = cutArray;
function intersection(arrOfArr) {
    return arrOfArr.reduce((aArray, bArray) => aArray.filter((item) => bArray.includes(item)));
}
exports.intersection = intersection;
//# sourceMappingURL=ArrayUtil.js.map