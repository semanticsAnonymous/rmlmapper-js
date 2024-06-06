"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvParser = void 0;
const csvjson_1 = __importDefault(require("csvjson"));
const ArrayUtil_1 = require("../util/ArrayUtil");
const SourceParser_1 = require("./SourceParser");
class CsvParser extends SourceParser_1.SourceParser {
    constructor(args) {
        super(args);
        const source = this.readSourceWithCache();
        const csvOptions = {
            delimiter: args.options.csv?.delimiter ?? ',',
        };
        const result = csvjson_1.default.toObject(source, csvOptions);
        this.data = result;
    }
    parseSource(source) {
        return source;
    }
    getCount() {
        return this.data.length;
    }
    getRawData(index, selector) {
        if (selector.startsWith('PATH~')) {
            return [index.toString()];
        }
        if (this.data[index]?.[selector]) {
            return (0, ArrayUtil_1.addArray)(this.data[index][selector]);
        }
        return [];
    }
}
exports.CsvParser = CsvParser;
//# sourceMappingURL=CsvParser.js.map