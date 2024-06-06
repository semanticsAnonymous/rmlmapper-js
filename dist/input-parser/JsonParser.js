"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonParser = void 0;
const jsonpath_plus_1 = require("jsonpath-plus");
const Vocabulary_1 = require("../util/Vocabulary");
const SourceParser_1 = require("./SourceParser");
class JsonParser extends SourceParser_1.SourceParser {
    constructor(args) {
        super(args);
        const source = this.readSourceWithCache();
        this.json = source;
        this.paths = (0, jsonpath_plus_1.JSONPath)({ path: args.iterator, json: this.json, resultType: 'path' });
    }
    parseSource(source) {
        return JSON.parse(source);
    }
    getCount() {
        return this.paths.length;
    }
    getRawData(index, selector, datatype) {
        const sel = selector.replace(/^PATH~/u, '');
        const splitter = sel.startsWith('[') ? '' : '.';
        const values = (0, jsonpath_plus_1.JSONPath)({
            path: `${this.paths[index]}${splitter}${sel}`,
            json: this.json,
            resultType: selector.startsWith('PATH~') ? 'pointer' : 'value',
        })
            // Null values are ignored (undefined shouldn't happens since input is json)
            .filter((selectedValue) => selectedValue !== null && selectedValue !== undefined);
        if (values.length === 1 && Array.isArray(values[0]) && datatype !== Vocabulary_1.RDF.JSON) {
            return values[0];
        }
        return values;
    }
}
exports.JsonParser = JsonParser;
//# sourceMappingURL=JsonParser.js.map