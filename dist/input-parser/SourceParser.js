"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceParser = void 0;
class SourceParser {
    constructor(args) {
        this.ignoreEmptyStrings = args.options.ignoreEmptyStrings;
        this.ignoreValues = args.options.ignoreValues;
        this.source = args.source;
        this.sourceCache = args.sourceCache;
        this.options = args.options;
    }
    readSourceWithCache() {
        if (this.sourceCache[this.source]) {
            return this.sourceCache[this.source];
        }
        if (this.options.inputFiles?.[this.source]) {
            const contents = this.options.inputFiles[this.source];
            const parsed = this.parseSource(contents);
            this.sourceCache[this.source] = parsed;
            return parsed;
        }
        throw new Error(`File ${this.source} not specified`);
    }
    getData(index, selector, datatype) {
        let values = this.getRawData(index, selector, datatype);
        if (this.ignoreEmptyStrings) {
            values = values.filter((value) => value.trim() !== '');
        }
        if (this.ignoreValues) {
            values = values.filter((value) => !this.ignoreValues.includes(value));
        }
        return values;
    }
}
exports.SourceParser = SourceParser;
//# sourceMappingURL=SourceParser.js.map