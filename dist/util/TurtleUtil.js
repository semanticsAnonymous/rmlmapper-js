"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttlToJson = void 0;
const jsonld_1 = __importDefault(require("jsonld"));
const n3_1 = require("n3");
const UriUtil_1 = require("./UriUtil");
async function quadsToJsonLD(nquads) {
    const doc = await jsonld_1.default.fromRDF(nquads, { format: 'application/n-quads' });
    return await jsonld_1.default.compact(doc, {});
}
async function ttlToJson(ttl) {
    return new Promise((resolve, reject) => {
        const parser = new n3_1.Parser({ baseIRI: 'http://base.com/' });
        const writer = new n3_1.Writer({ format: 'N-Triples' });
        ttl = (0, UriUtil_1.escapeCurlyBrackets)(ttl);
        parser.parse(ttl, (error, quad) => {
            if (error) {
                reject(error);
            }
            else if (quad) {
                writer.addQuad(quad);
            }
            else {
                writer.end(async (writeError, result) => {
                    if (writeError) {
                        reject(writeError);
                        return;
                    }
                    try {
                        const json = await quadsToJsonLD(result);
                        resolve(json);
                    }
                    catch (jsonldError) {
                        reject(jsonldError);
                    }
                });
            }
        });
    });
}
exports.ttlToJson = ttlToJson;
//# sourceMappingURL=TurtleUtil.js.map