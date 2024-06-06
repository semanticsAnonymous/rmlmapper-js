"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unescapeCurlyBrackets = exports.escapeCurlyBrackets = exports.toURIComponent = void 0;
function toURIComponent(str) {
    return encodeURIComponent(str)
        .replace(/\(/ug, '%28')
        .replace(/\)/ug, '%29');
}
exports.toURIComponent = toURIComponent;
function replaceAll(str, search, replacement) {
    // eslint-disable-next-line require-unicode-regexp
    return str.replace(new RegExp(search, 'g'), replacement);
}
const OPEN_BRACKET_REPLACEMENT = '#replaceOpenBr#';
const CLOSE_BRACKET_REPLACEMENT = '#replaceClosingBr#';
function escapeCurlyBrackets(str) {
    str = replaceAll(str, '\\\\{', OPEN_BRACKET_REPLACEMENT);
    str = replaceAll(str, '\\\\}', CLOSE_BRACKET_REPLACEMENT);
    return str;
}
exports.escapeCurlyBrackets = escapeCurlyBrackets;
function unescapeCurlyBrackets(str) {
    str = replaceAll(str, OPEN_BRACKET_REPLACEMENT, '{');
    str = replaceAll(str, CLOSE_BRACKET_REPLACEMENT, '}');
    return str;
}
exports.unescapeCurlyBrackets = unescapeCurlyBrackets;
//# sourceMappingURL=UriUtil.js.map