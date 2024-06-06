"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontoxpathParser = void 0;
const xmldom_1 = require("@xmldom/xmldom");
const fontoxpath_1 = require("fontoxpath");
const slimdom_1 = require("slimdom");
const SourceParser_1 = require("./SourceParser");
function parseXml(xml) {
    return new slimdom_1.DOMParser().parseFromString(xml, 'text/xml');
}
(0, fontoxpath_1.registerCustomXPathFunction)('fn:parse-xml', ['xs:string'], 'item()', (context, xml) => parseXml(xml));
class FontoxpathParser extends SourceParser_1.SourceParser {
    constructor(args) {
        super(args);
        this.parser = new xmldom_1.DOMParser();
        const source = this.readSourceWithCache();
        this.docArray = (0, fontoxpath_1.evaluateXPathToNodes)(args.iterator, source, null, null, { language: fontoxpath_1.evaluateXPath.XPATH_3_1_LANGUAGE });
    }
    parseSource(source) {
        return this.parser.parseFromString(source, 'text/xml');
    }
    getCount() {
        return this.docArray.length;
    }
    getRawData(index, selector) {
        if (selector.startsWith('PATH~')) {
            selector = `${selector.slice(5)}/path()`;
        }
        const object = this.docArray[index];
        return (0, fontoxpath_1.evaluateXPathToStrings)(selector, object, null, null, { language: fontoxpath_1.evaluateXPath.XPATH_3_1_LANGUAGE });
    }
}
exports.FontoxpathParser = FontoxpathParser;
//# sourceMappingURL=FontoxpathParser.js.map