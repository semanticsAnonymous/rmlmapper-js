"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parseJsonLd = exports.parseTurtle = exports.RmlMapper = void 0;
/* eslint-disable
  unicorn/prefer-object-has-own,
  @typescript-eslint/naming-convention,
  no-console
*/
const jsonld = __importStar(require("jsonld"));
const MappingProcessor_1 = require("./MappingProcessor");
const ArrayUtil_1 = require("./util/ArrayUtil");
const ObjectUtil_1 = require("./util/ObjectUtil");
const TurtleUtil_1 = require("./util/TurtleUtil");
const Vocabulary_1 = require("./util/Vocabulary");
class RmlMapper {
    constructor(options) {
        this.sourceCache = {};
        this.options = options;
    }
    async parseJsonLd(mapping) {
        const flattenedMapping = await jsonld.flatten(mapping, {});
        return await this.processAndCleanJsonLdMapping(flattenedMapping);
    }
    async parseTurtle(mapping) {
        const response = await (0, TurtleUtil_1.ttlToJson)(mapping);
        return await this.processAndCleanJsonLdMapping(response);
    }
    async processAndCleanJsonLdMapping(mapping) {
        const output = await this.processMapping(mapping);
        const out = await this.clean(output);
        if (this.options.toRDF) {
            return await jsonld.toRDF(out, { format: 'application/n-quads' });
        }
        return out;
    }
    async processMapping(mapping) {
        const graph = mapping['@graph'];
        const connectedGraph = (0, ObjectUtil_1.jsonLDGraphToObj)(graph);
        const output = await this.processTopLevelMappings(connectedGraph);
        return this.mergeJoin(output, connectedGraph);
    }
    async processTopLevelMappings(graph) {
        const topLevelMappingProcessors = graph
            .reduce((obj, node) => {
            if ((0, ObjectUtil_1.isTriplesMap)(node)) {
                obj[node['@id']] = this.createProcessorForMapping(graph, node);
            }
            return obj;
        }, {});
        if (Object.keys(topLevelMappingProcessors).length === 0) {
            throw new Error('No top level mapping found');
        }
        const output = {};
        for (const [mappingId, proccessor] of Object.entries(topLevelMappingProcessors)) {
            if (proccessor.hasProcessed()) {
                output[mappingId] = proccessor.getReturnValue();
            }
            else {
                output[mappingId] = await proccessor.processMapping(topLevelMappingProcessors);
            }
        }
        return output;
    }
    createProcessorForMapping(data, mapping) {
        const logicalSource = (0, ObjectUtil_1.findObjectWithIdInArray)(data, mapping[Vocabulary_1.RML.logicalSource]['@id']);
        const referenceFormulation = this.getReferenceFormulationFromLogicalSource(logicalSource);
        const iterator = this.getIteratorFromLogicalSource(logicalSource, referenceFormulation);
        const source = this.getSourceFromLogicalSource(logicalSource);
        return new MappingProcessor_1.MappingProcessor({
            source,
            referenceFormulation,
            options: this.options,
            sourceCache: this.sourceCache,
            iterator,
            mapping,
            data,
        });
    }
    getReferenceFormulationFromLogicalSource(logicalSource) {
        const referenceFormulation = logicalSource[Vocabulary_1.RML.referenceFormulation];
        if (Array.isArray(referenceFormulation)) {
            if (referenceFormulation.length === 1) {
                return (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(referenceFormulation[0]);
            }
            throw new Error('Only one rml:referenceFormulations may be supplied. Found multiple.');
        }
        return (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(referenceFormulation);
    }
    getSourceFromLogicalSource(logicalSource) {
        const source = logicalSource[Vocabulary_1.RML.source];
        if (Array.isArray(source)) {
            if (source.length === 1) {
                return (0, ObjectUtil_1.getValue)(source[0]);
            }
            throw new Error('Exactly one rml:source must be supplied. Found multiple.');
        }
        return (0, ObjectUtil_1.getValue)(source);
    }
    getIteratorFromLogicalSource(logicalSource, referenceFormulation) {
        if (referenceFormulation === 'CSV') {
            return '$';
        }
        return (0, ObjectUtil_1.getValue)(logicalSource[Vocabulary_1.RML.iterator]);
    }
    mergeJoin(output, data) {
        for (const key in output) {
            if (Object.prototype.hasOwnProperty.call(output, key)) {
                output[key] = (0, ArrayUtil_1.addArray)(output[key]);
                const firstentry = output[key][0];
                // Every entry in a mapping will have the same join properties, thus take join paths from first entry
                if (firstentry?.$parentTriplesMap) {
                    const parentTriplesMap = firstentry.$parentTriplesMap;
                    for (const predicate in parentTriplesMap) {
                        if (Object.prototype.hasOwnProperty.call(parentTriplesMap, predicate)) {
                            const predicateData = parentTriplesMap[predicate];
                            // eslint-disable-next-line @typescript-eslint/no-for-in-array
                            for (const i in predicateData) {
                                if (Object.prototype.hasOwnProperty.call(predicateData, i)) {
                                    const singleJoin = predicateData[i];
                                    const record = (0, ObjectUtil_1.findObjectWithIdInArray)(data, singleJoin.mapID);
                                    const parentId = record[Vocabulary_1.RR.parentTriplesMap]['@id'];
                                    const toMapData = (0, ArrayUtil_1.addArray)(output[parentId]);
                                    if (singleJoin.joinCondition) {
                                        const cache = {};
                                        singleJoin.joinCondition.forEach(({ parentPath }) => {
                                            cache[parentPath] = {};
                                            for (const tmd of toMapData) {
                                                if (tmd.$parentPaths) {
                                                    const parentData = tmd.$parentPaths[parentPath];
                                                    const parentDataArr = (0, ArrayUtil_1.addArray)(parentData);
                                                    if (parentDataArr.length !== 1) {
                                                        console.warn(`joinConditions parent must return only one value! Parent: ${parentDataArr}`);
                                                        break;
                                                    }
                                                    const firstParentData = parentDataArr[0];
                                                    if (!cache[parentPath][firstParentData]) {
                                                        cache[parentPath][firstParentData] = [];
                                                    }
                                                    cache[parentPath][firstParentData].push(tmd['@id']);
                                                }
                                            }
                                        });
                                        for (const entry of output[key]) {
                                            const joinConditions = entry.$parentTriplesMap?.[predicate]?.[i]?.joinCondition ?? [];
                                            const childrenMatchingCondition = joinConditions.map((joinCondition) => {
                                                let firstChild;
                                                if (Array.isArray(joinCondition.child)) {
                                                    if (joinCondition.child.length !== 1) {
                                                        console.warn(`joinCoinConditionitions child must return only one value! Child: ${joinCondition.child}`);
                                                    }
                                                    firstChild = joinCondition.child[0];
                                                }
                                                else {
                                                    firstChild = joinCondition.child;
                                                }
                                                const matchingChildren = cache[joinCondition.parentPath][firstChild];
                                                return matchingChildren || [];
                                            });
                                            const childrenMatchingAllCondition = (0, ArrayUtil_1.intersection)(childrenMatchingCondition);
                                            for (const child of childrenMatchingAllCondition) {
                                                (0, ObjectUtil_1.addToObjAsReference)(entry, predicate, child);
                                            }
                                        }
                                    }
                                    else {
                                        for (const tmd of toMapData) {
                                            for (const entry of output[key]) {
                                                (0, ObjectUtil_1.addToObjAsReference)(entry, predicate, tmd['@id']);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return output;
    }
    async clean(outputByMapping) {
        let output = Object.values(outputByMapping).flat();
        output = (0, ObjectUtil_1.removeMetaFromAllNodes)(output);
        output = (0, ObjectUtil_1.removeEmptyFromAllNodes)(output);
        (0, ObjectUtil_1.convertRdfTypeToJsonldType)(output);
        if (this.options?.replace) {
            output = (0, ObjectUtil_1.replaceReferences)(output);
        }
        if (this.options?.compact) {
            const compacted = await jsonld.compact(output, this.options.compact);
            const context = compacted['@context'];
            const graph = compacted['@graph'];
            if (graph && Array.isArray(graph)) {
                context['@language'] = this.options.language;
                graph.forEach((nodeObject) => {
                    nodeObject['@context'] = context;
                });
                return graph;
            }
            compacted['@context']['@language'] = this.options.language;
            return [compacted];
        }
        if (this.options?.language) {
            output.forEach((subOutput) => {
                subOutput['@context'] = { '@language': this.options.language };
            });
        }
        return Array.isArray(output) ? output : [output];
    }
}
exports.RmlMapper = RmlMapper;
async function parseTurtle(mapping, inputFiles, options = {}) {
    const rmlMapper = new RmlMapper({ ...options, inputFiles });
    return await rmlMapper.parseTurtle(mapping);
}
exports.parseTurtle = parseTurtle;
async function parseJsonLd(mapping, inputFiles, options = {}) {
    const rmlMapper = new RmlMapper({ ...options, inputFiles });
    return await rmlMapper.parseJsonLd(mapping);
}
exports.parseJsonLd = parseJsonLd;
/**
 * @deprecated The method should not be used. Please use parseTurtle or parseJsonLd instead.
 */
async function parse(mapping, inputFiles, options = {}) {
    return parseTurtle(mapping, inputFiles, options);
}
exports.parse = parse;
//# sourceMappingURL=Parser.js.map