"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingProcessor = void 0;
const language_tags_1 = __importDefault(require("language-tags"));
const FunctionExecutor_1 = require("./FunctionExecutor");
const CsvParser_1 = require("./input-parser/CsvParser");
const FontoxpathParser_1 = require("./input-parser/FontoxpathParser");
const JsonParser_1 = require("./input-parser/JsonParser");
const XmlParser_1 = require("./input-parser/XmlParser");
const ArrayUtil_1 = require("./util/ArrayUtil");
const ObjectUtil_1 = require("./util/ObjectUtil");
const Vocabulary_1 = require("./util/Vocabulary");
class MappingProcessor {
    constructor(args) {
        this.processed = false;
        this.mapping = args.mapping;
        this.data = args.data;
        this.sourceParser = this.createSourceParser(args);
        this.functionExecutor = new FunctionExecutor_1.FunctionExecutor({
            parser: this.sourceParser,
            functions: args.options.functions,
        });
    }
    createSourceParser(args) {
        const sourceParserArgs = {
            source: args.source,
            sourceCache: args.sourceCache,
            iterator: args.iterator,
            options: args.options,
        };
        switch (args.referenceFormulation) {
            case Vocabulary_1.QL.XPath:
                if (args.options.xpathLib === 'fontoxpath') {
                    return new FontoxpathParser_1.FontoxpathParser(sourceParserArgs);
                }
                return new XmlParser_1.XmlParser(sourceParserArgs);
            case Vocabulary_1.QL.JSONPath:
                return new JsonParser_1.JsonParser(sourceParserArgs);
            case Vocabulary_1.QL.CSV:
                return new CsvParser_1.CsvParser(sourceParserArgs);
            default:
                throw new Error(`Cannot process: ${args.referenceFormulation}`);
        }
    }
    hasProcessed() {
        return this.processed;
    }
    getReturnValue() {
        return this.returnValue;
    }
    async processMapping(topLevelMappingProcessors) {
        const iteratorNumber = this.sourceParser.getCount();
        const parentPaths = this.getParentPaths();
        const subjectMap = this.getSubjectMapFromMapping();
        const classes = this.getNonFunctionClassFromSubjectMap(subjectMap);
        let result = [];
        if (Vocabulary_1.RML.reference in subjectMap) {
            result = await this.processMappingWithSubjectMap(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, classes);
        }
        else if (Vocabulary_1.RR.template in subjectMap) {
            result = await this.processMappingWithTemplate(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, classes);
        }
        else if (Vocabulary_1.FNML.functionValue in subjectMap) {
            result = await this.processMappingWithFunctionValue(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, classes);
        }
        else if (Vocabulary_1.RR.constant in subjectMap ||
            (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(subjectMap[Vocabulary_1.RR.termType]) === Vocabulary_1.RR.BlankNode) {
            result = await this.processMappingWithConstantOrTermType(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, classes);
        }
        else {
            throw new Error('Unsupported subjectmap');
        }
        // TODO: wtf is this...
        // const firstResult = cutArray(result);
        // const nonSingleValueArrayResult = Array.isArray(firstResult) && firstResult.length === 1
        //   ? firstResult[0]
        //   : firstResult;
        this.processed = true;
        this.returnValue = result;
        return result;
    }
    getSubjectMapFromMapping() {
        if (Vocabulary_1.RR.subject in this.mapping) {
            return {
                '@type': Vocabulary_1.RR.SubjectMap,
                [Vocabulary_1.RR.constant]: this.mapping[Vocabulary_1.RR.subject],
            };
        }
        const subjectMap = this.mapping[Vocabulary_1.RR.subjectMap];
        if (subjectMap) {
            if (Array.isArray(subjectMap)) {
                throw new Error('Exactly one subjectMap needed');
            }
            return subjectMap;
        }
        throw new Error(`No subjectMap supplied for mapping ${this.mapping['@id']}`);
    }
    getParentPaths() {
        return this.data.reduce((arr, nodeObject) => {
            const { [Vocabulary_1.RR.joinCondition]: joinCondition, [Vocabulary_1.RR.parentTriplesMap]: parentTriplesMap, } = nodeObject;
            if (parentTriplesMap) {
                const parentTriplesMapId = (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(parentTriplesMap);
                const parentTriplesMapIsThisMapping = parentTriplesMapId === this.mapping['@id'];
                if (parentTriplesMapIsThisMapping && joinCondition) {
                    const parentPaths = (0, ArrayUtil_1.addArray)(joinCondition)
                        .map((joinConditionItem) => (0, ObjectUtil_1.getValue)(joinConditionItem[Vocabulary_1.RR.parent]));
                    return [...arr, ...parentPaths];
                }
            }
            return arr;
        }, []);
    }
    getNonFunctionClassFromSubjectMap(subjectMap) {
        if (subjectMap[Vocabulary_1.RR.class] && !(0, ObjectUtil_1.isFunctionValuedSubjectMap)(subjectMap)) {
            if (Array.isArray(subjectMap[Vocabulary_1.RR.class])) {
                return subjectMap[Vocabulary_1.RR.class].map((sm) => sm['@id']);
            }
            return subjectMap[Vocabulary_1.RR.class]['@id'];
        }
    }
    async processMappingWithSubjectMap(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, type) {
        const subjectFunctionValue = subjectMap[Vocabulary_1.RR.class]?.[Vocabulary_1.FNML.functionValue];
        const results = [];
        for (let i = 0; i < iteratorNumber; i++) {
            if (subjectFunctionValue) {
                type = await this.functionExecutor.executeFunctionFromValue(subjectFunctionValue, i, topLevelMappingProcessors);
            }
            let obj = {};
            let nodes = this.sourceParser.getData(i, (0, ObjectUtil_1.getValue)(subjectMap[Vocabulary_1.RML.reference]));
            nodes = (0, ArrayUtil_1.addArray)(nodes);
            // Needs to be done in sequence, since result.push() is done.
            // for await ()  is bad practice when we use it with something other than an asynchronous iterator - https://stackoverflow.com/questions/59694309/for-await-of-vs-promise-all
            for (const temp of nodes) {
                if (type) {
                    obj['@type'] = type;
                }
                if (!temp.includes(' ')) {
                    obj['@id'] = temp;
                    obj = await this.doObjectMappings(i, obj, topLevelMappingProcessors);
                    if (!obj['@id']) {
                        obj['@id'] = `${this.mapping['@id']}_${i + 1}`;
                    }
                    this.writeParentPath(i, parentPaths, obj);
                    results.push(obj);
                }
            }
        }
        return results;
    }
    async processMappingWithTemplate(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, type) {
        const subjectFunctionValue = subjectMap[Vocabulary_1.RR.class]?.[Vocabulary_1.FNML.functionValue];
        const results = [];
        for (let i = 0; i < iteratorNumber; i++) {
            if (subjectFunctionValue) {
                type = await this.functionExecutor.executeFunctionFromValue(subjectFunctionValue, i, topLevelMappingProcessors);
            }
            let obj = {};
            const template = (0, ObjectUtil_1.getValue)(subjectMap[Vocabulary_1.RR.template]);
            const ids = (0, ObjectUtil_1.calculateTemplate)(template, i, this.sourceParser);
            for (let id of ids) {
                if (subjectMap[Vocabulary_1.RR.termType]) {
                    const termType = (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(subjectMap[Vocabulary_1.RR.termType]);
                    switch (termType) {
                        case Vocabulary_1.RR.BlankNode:
                            id = `_:${id}`;
                            break;
                        case Vocabulary_1.RR.IRI:
                            if ((!subjectMap[Vocabulary_1.RR.template] && !subjectMap[Vocabulary_1.RML.reference]) ||
                                (subjectMap[Vocabulary_1.RR.template] && subjectMap[Vocabulary_1.RML.reference])) {
                                throw new Error('Must use exactly one of - rr:template and rml:reference in SubjectMap!');
                            }
                            // TODO: needed?
                            // if (!helper.isURL(id)) {
                            //   id = helper.addBase(id, this.prefixes);
                            // }
                            break;
                        case Vocabulary_1.RR.Literal:
                            break;
                        default:
                            throw new Error(`Invalid rr:termType: ${(0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(subjectMap[Vocabulary_1.RR.termType])}`);
                    }
                }
                obj['@id'] = id;
                if (type) {
                    obj['@type'] = type;
                }
                obj = await this.doObjectMappings(i, obj, topLevelMappingProcessors);
                if (!obj['@id']) {
                    obj['@id'] = `${this.mapping['@id']}_1`;
                }
                this.writeParentPath(i, parentPaths, obj);
                results.push(obj);
            }
        }
        return results;
    }
    async processMappingWithFunctionValue(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, type) {
        const results = [];
        for (let i = 0; i < iteratorNumber; i++) {
            let obj = {};
            const subjVal = await this.functionExecutor.executeFunctionFromValue(subjectMap[Vocabulary_1.FNML.functionValue], i, topLevelMappingProcessors);
            obj['@id'] = subjVal;
            if (type) {
                obj['@type'] = type;
            }
            obj = await this.doObjectMappings(i, obj, topLevelMappingProcessors);
            this.writeParentPath(i, parentPaths, obj);
            results.push(obj);
        }
        return results;
    }
    async processMappingWithConstantOrTermType(subjectMap, topLevelMappingProcessors, iteratorNumber, parentPaths, type) {
        const subjectFunctionValue = subjectMap[Vocabulary_1.RR.class]?.[Vocabulary_1.FNML.functionValue];
        const results = [];
        // BlankNode with no template or id
        for (let i = 0; i < iteratorNumber; i++) {
            if (subjectFunctionValue) {
                type = await this.functionExecutor.executeFunctionFromValue(subjectFunctionValue, i, topLevelMappingProcessors);
            }
            let obj = {};
            if (Vocabulary_1.RR.constant in subjectMap) {
                obj['@id'] = (0, ObjectUtil_1.getConstant)(subjectMap[Vocabulary_1.RR.constant]);
            }
            if (type) {
                obj['@type'] = type;
            }
            obj = await this.doObjectMappings(i, obj, topLevelMappingProcessors);
            if (!obj['@id']) {
                obj['@id'] = `_:${encodeURIComponent(`${this.mapping['@id']}_${i + 1}`)}`;
            }
            this.writeParentPath(i, parentPaths, obj);
            results.push(obj);
        }
        return results;
    }
    writeParentPath(index, parents, obj) {
        if (!obj.$parentPaths && parents.length > 0) {
            obj.$parentPaths = {};
        }
        for (const parent of parents) {
            if (!obj.$parentPaths[parent]) {
                obj.$parentPaths[parent] = this.sourceParser.getData(index, parent);
            }
        }
    }
    async doObjectMappings(index, obj, topLevelMappingProcessors) {
        if (this.mapping[Vocabulary_1.RR.predicateObjectMap]) {
            const objectMapArray = (0, ArrayUtil_1.addArray)(this.mapping[Vocabulary_1.RR.predicateObjectMap]);
            for (const mapping of objectMapArray) {
                const predicate = await (0, ObjectUtil_1.getPredicateValueFromPredicateObjectMap)(mapping, index, topLevelMappingProcessors, this.sourceParser, this.functionExecutor);
                if (Array.isArray(predicate)) {
                    for (const predicateItem of predicate) {
                        await this.handleSingleMapping(index, obj, mapping, predicateItem, topLevelMappingProcessors);
                    }
                }
                else {
                    await this.handleSingleMapping(index, obj, mapping, predicate, topLevelMappingProcessors);
                }
            }
        }
        return (0, ArrayUtil_1.cutArray)(obj);
    }
    async handleSingleMapping(index, obj, mapping, predicate, topLevelMappingProcessors) {
        if (Vocabulary_1.RR.object in mapping) {
            if (Array.isArray(mapping[Vocabulary_1.RR.object])) {
                mapping[Vocabulary_1.RR.object].forEach((objectItem) => {
                    (0, ObjectUtil_1.setObjPredicate)(obj, predicate, objectItem['@id']);
                });
            }
            else {
                (0, ObjectUtil_1.setObjPredicate)(obj, predicate, mapping[Vocabulary_1.RR.object]['@id']);
            }
        }
        else if (Vocabulary_1.RR.objectMap in mapping) {
            let objectmaps;
            if (Array.isArray(mapping[Vocabulary_1.RR.objectMap])) {
                objectmaps = mapping[Vocabulary_1.RR.objectMap];
            }
            else {
                objectmaps = [mapping[Vocabulary_1.RR.objectMap]];
            }
            await Promise.all(objectmaps.map(async (objectmap) => {
                const { [Vocabulary_1.FNML.functionValue]: functionValue, [Vocabulary_1.RR.parentTriplesMap]: parentTriplesMap, [Vocabulary_1.RR.joinCondition]: joinCondition, [Vocabulary_1.RML.reference]: reference, [Vocabulary_1.RR.template]: template, [Vocabulary_1.RML.languageMap]: languageMap, [Vocabulary_1.RR.datatype]: datatype, [Vocabulary_1.RR.termType]: termType, [Vocabulary_1.RR.language]: language, [Vocabulary_1.RR.constant]: constant, } = objectmap;
                let languageString;
                if (languageMap) {
                    const languageMapResult = await (0, ObjectUtil_1.getValueOfTermMap)(languageMap, index, this.sourceParser, topLevelMappingProcessors, this.functionExecutor);
                    if (Array.isArray(languageMapResult)) {
                        languageString = languageMapResult[0];
                    }
                    else {
                        languageString = languageMapResult;
                    }
                }
                else if (language) {
                    languageString = (0, ObjectUtil_1.getValue)(language);
                }
                if (languageString && !(0, language_tags_1.default)(languageString).valid()) {
                    throw new Error(`Language tag: ${languageString} invalid!`);
                }
                const termTypeValue = (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(termType);
                const datatypeValue = (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(datatype);
                if (template) {
                    const templateValue = (0, ObjectUtil_1.getValue)(template);
                    const templateResults = (0, ObjectUtil_1.calculateTemplate)(templateValue, index, this.sourceParser, termTypeValue);
                    templateResults.forEach((result) => {
                        if (termTypeValue) {
                            (0, ObjectUtil_1.setObjPredicateWithTermType)(obj, predicate, result, termTypeValue, languageString, datatype);
                        }
                        else {
                            const templateReference = { '@id': result };
                            (0, ObjectUtil_1.setObjPredicate)(obj, predicate, templateReference, languageString, datatype);
                        }
                    });
                }
                else if (reference) {
                    const referenceValue = (0, ObjectUtil_1.getValue)(reference);
                    // We have a reference definition
                    let ns = this.sourceParser.getData(index, referenceValue, datatypeValue);
                    let arr = [];
                    ns = (0, ArrayUtil_1.addArray)(ns);
                    ns.forEach((en) => {
                        arr.push(en);
                    });
                    if (termTypeValue === Vocabulary_1.RR.IRI) {
                        arr = arr.map((val) => ({ '@id': val }));
                    }
                    if (arr?.length > 0) {
                        (0, ObjectUtil_1.setObjPredicate)(obj, predicate, (0, ArrayUtil_1.cutArray)(arr), languageString, datatype);
                    }
                }
                else if (constant) {
                    const nonArrayConstantValue = (0, ArrayUtil_1.cutArray)(constant);
                    const singularConstantValue = (0, ObjectUtil_1.getConstant)(nonArrayConstantValue);
                    if (predicate !== Vocabulary_1.RDF.type && termTypeValue === Vocabulary_1.RR.IRI) {
                        (0, ObjectUtil_1.setObjPredicate)(obj, predicate, { '@id': singularConstantValue }, languageString, datatype);
                    }
                    else {
                        (0, ObjectUtil_1.setObjPredicate)(obj, predicate, singularConstantValue, languageString, datatype);
                    }
                }
                else if (parentTriplesMap?.['@id']) {
                    if (!obj.$parentTriplesMap) {
                        obj.$parentTriplesMap = {};
                    }
                    if (joinCondition) {
                        const joinConditions = (0, ArrayUtil_1.addArray)(joinCondition);
                        if (!obj.$parentTriplesMap[predicate]) {
                            obj.$parentTriplesMap[predicate] = [];
                        }
                        obj.$parentTriplesMap[predicate].push({
                            joinCondition: joinConditions.map((cond) => ({
                                parentPath: (0, ObjectUtil_1.getValue)(cond[Vocabulary_1.RR.parent]),
                                child: this.sourceParser.getData(index, (0, ObjectUtil_1.getValue)(cond[Vocabulary_1.RR.child])),
                            })),
                            mapID: objectmap['@id'],
                        });
                    }
                    else if (obj.$parentTriplesMap[predicate]) {
                        obj.$parentTriplesMap[predicate].push({
                            mapID: objectmap['@id'],
                        });
                    }
                    else {
                        obj.$parentTriplesMap[predicate] = [];
                        obj.$parentTriplesMap[predicate].push({
                            mapID: objectmap['@id'],
                        });
                    }
                }
                else if (functionValue) {
                    const result = await this.functionExecutor.executeFunctionFromValue(functionValue, index, topLevelMappingProcessors);
                    if (termTypeValue) {
                        (0, ObjectUtil_1.setObjPredicateWithTermType)(obj, predicate, result, termTypeValue, languageString, datatype);
                    }
                    else {
                        (0, ObjectUtil_1.setObjPredicate)(obj, predicate, result, languageString, datatype);
                    }
                }
            }));
        }
    }
}
exports.MappingProcessor = MappingProcessor;
//# sourceMappingURL=MappingProcessor.js.map