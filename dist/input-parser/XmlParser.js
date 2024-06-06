"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlParser = void 0;
const xmldom_1 = require("@xmldom/xmldom");
const xpath_1 = __importDefault(require("xpath"));
const SourceParser_1 = require("./SourceParser");
// Adapted from https://stackoverflow.com/a/30227178
function getPathToElem(element) {
    if (typeof element !== 'string' && typeof element !== 'number' && typeof element !== 'boolean') {
        if (!element.parentNode) {
            return '';
        }
        let ix = 0;
        // eslint-disable-next-line unicorn/prefer-spread
        for (const child of Array.from(element.parentNode.childNodes)) {
            if (child === element) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
                // @ts-ignore
                return `${getPathToElem(element.parentNode)}/${element.tagName}[${ix + 1}]`;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
            // @ts-ignore
            if (child.nodeType === 1 && child.tagName === element.tagName) {
                ix += 1;
            }
        }
    }
    return '';
}
class XmlParser extends SourceParser_1.SourceParser {
    constructor(args) {
        super(args);
        this.parser = new xmldom_1.DOMParser();
        const source = this.readSourceWithCache();
        this.docArray = xpath_1.default.select(args.iterator, source);
    }
    parseSource(source) {
        if (this.options.removeNameSpace) {
            for (const key in this.options.removeNameSpace) {
                // eslint-disable-next-line unicorn/prefer-object-has-own
                if (Object.prototype.hasOwnProperty.call(this.options.removeNameSpace, key)) {
                    const toDelete = `${key}="${this.options.removeNameSpace[key]}"`;
                    source = source.replace(toDelete, '');
                }
            }
        }
        return this.parser.parseFromString(source);
    }
    getCount() {
        return this.docArray.length;
    }
    getRawData(index, path) {
        const object = this.docArray[index];
        const temp = xpath_1.default.select(path.replace(/^PATH~/u, ''), object);
        const arr = [];
        if (path.startsWith('PATH~') && Array.isArray(temp)) {
            return temp.map(getPathToElem);
        }
        if (typeof temp === 'string') {
            return [temp];
        }
        temp.forEach((node) => {
            if (typeof node !== 'string' && typeof node !== 'number' && typeof node !== 'boolean') {
                if (node.nodeValue) {
                    arr.push(node.nodeValue);
                }
                else {
                    const children = node.childNodes;
                    if (children) {
                        // eslint-disable-next-line unicorn/prefer-spread
                        Array.from(children).forEach((child) => {
                            if ('data' in child) {
                                arr.push(child.data);
                            }
                        });
                    }
                }
            }
        });
        return arr;
    }
}
exports.XmlParser = XmlParser;
//# sourceMappingURL=XmlParser.js.map