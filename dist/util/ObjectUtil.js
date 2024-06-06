"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTriplesMap = exports.getPredicateValueFromPredicateObjectMap = exports.getValueOfTermMap = exports.calculateTemplate = exports.allCombinationsOfArray = exports.setObjPredicateWithTermType = exports.setObjPredicate = exports.replaceReferences = exports.jsonLDGraphToObj = exports.predicateContainsFnoExecutes = exports.isFunctionValuedSubjectMap = exports.isFnoExecutesPredicate = exports.getFunctionNameFromPredicateObjectMap = exports.getConstant = exports.convertRdfTypeToJsonldType = exports.removeMetaFromAllNodes = exports.removeEmptyFromAllNodes = exports.findObjectWithIdInArray = exports.getIdFromNodeObjectIfDefined = exports.getValue = exports.addToObjAsReference = exports.addToObj = void 0;
const ArrayUtil_1 = require("./ArrayUtil");
const StringUtil_1 = require("./StringUtil");
const UriUtil_1 = require("./UriUtil");
const Vocabulary_1 = require("./Vocabulary");
function addToObj(obj, pred, data) {
    if (obj[pred]) {
        const dataAsArray = Array.isArray(data) ? data : [data];
        if (Array.isArray(obj[pred])) {
            obj[pred].push(...dataAsArray);
        }
        else {
            obj[pred] = [obj[pred], ...dataAsArray];
        }
    }
    else {
        obj[pred] = data;
    }
}
exports.addToObj = addToObj;
function addToObjAsReference(obj, pred, data) {
    const dataAsNode = { '@id': data };
    addToObj(obj, pred, dataAsNode);
}
exports.addToObjAsReference = addToObjAsReference;
function getValue(fieldValue) {
    if (fieldValue && typeof fieldValue === 'object' && '@value' in fieldValue) {
        return fieldValue['@value'];
    }
    return fieldValue;
}
exports.getValue = getValue;
function getIdFromNodeObjectIfDefined(nodeObject) {
    if (nodeObject && typeof nodeObject === 'object') {
        return nodeObject['@id'];
    }
    if (nodeObject) {
        return nodeObject;
    }
}
exports.getIdFromNodeObjectIfDefined = getIdFromNodeObjectIfDefined;
function findObjectWithIdInArray(objArr, id) {
    return objArr.find((obj) => obj['@id'] === id);
}
exports.findObjectWithIdInArray = findObjectWithIdInArray;
function removeEmptyFromAllKeysOfNodeObject(nodeObject) {
    return Object.keys(nodeObject)
        .reduce((obj, subNodeKey) => {
        if (obj[subNodeKey] && typeof obj[subNodeKey] === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            obj[subNodeKey] = removeEmptyFromAllNodes(obj[subNodeKey]);
        }
        else if (obj[subNodeKey] === null || obj[subNodeKey] === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete obj[subNodeKey];
        }
        return obj;
    }, nodeObject);
}
function removeEmptyFromAllNodes(jsonLd) {
    if (Array.isArray(jsonLd)) {
        return jsonLd.reduce((arr, subDoc) => {
            if (subDoc) {
                arr.push(removeEmptyFromAllKeysOfNodeObject(subDoc));
            }
            return arr;
        }, []);
    }
    return removeEmptyFromAllKeysOfNodeObject(jsonLd);
}
exports.removeEmptyFromAllNodes = removeEmptyFromAllNodes;
function removeMetaFromNode(nodeObject) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $parentTriplesMap, $parentPaths, ...nodeObjectWithoutMeta } = nodeObject;
    return nodeObjectWithoutMeta;
}
function removeMetaFromAllNodes(jsonLd) {
    return jsonLd.map((subDoc) => removeMetaFromNode(subDoc));
}
exports.removeMetaFromAllNodes = removeMetaFromAllNodes;
function convertRdfTypeToJsonldType(obj) {
    Object.keys(obj).forEach((key) => {
        if (key === 'rdf:type' || key === Vocabulary_1.RDF.type) {
            const temp = (0, ArrayUtil_1.addArray)(obj[key]);
            if (temp?.[0] && typeof temp[0] === 'object') {
                const types = temp.map((tempItem) => tempItem['@id']);
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete obj[key];
                addToObj(obj, '@type', types);
            }
            else {
                const type = obj[key];
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete obj[key];
                addToObj(obj, '@type', type);
            }
        }
        else if (obj[key] && typeof obj[key] === 'object') {
            convertRdfTypeToJsonldType(obj[key]);
        }
    });
}
exports.convertRdfTypeToJsonldType = convertRdfTypeToJsonldType;
function getConstant(constant) {
    if (typeof constant === 'object') {
        if ('@id' in constant) {
            return constant['@id'];
        }
        if ('@value' in constant) {
            if (constant['@type'] === Vocabulary_1.XSD.integer) {
                return Number.parseInt(constant['@value'], 10);
            }
            if (constant['@type'] === Vocabulary_1.XSD.double) {
                return Number.parseFloat(constant['@value']);
            }
            if (constant['@type'] === Vocabulary_1.XSD.boolean) {
                return (constant['@value'] === true || constant['@value'] === 'true');
            }
            return constant['@value'];
        }
    }
    return constant;
}
exports.getConstant = getConstant;
function getPredicateValue(predicate) {
    if (Array.isArray(predicate)) {
        return predicate.map((predicateItem) => predicateItem['@id']);
    }
    if (typeof predicate === 'object') {
        return predicate['@id'];
    }
    return predicate;
}
function getFunctionNameFromObject(object) {
    if (Array.isArray(object)) {
        if (object.length === 1) {
            return getIdFromNodeObjectIfDefined(object[0]);
        }
        throw new Error('Only one function may be specified per PredicateObjectMap');
    }
    return getIdFromNodeObjectIfDefined(object);
}
function getFunctionNameFromObjectMap(objectMap) {
    const isArray = Array.isArray(objectMap);
    if (isArray && objectMap.length > 1) {
        throw new Error('Only one function may be specified per PredicateObjectMap');
    }
    if (isArray && objectMap[0][Vocabulary_1.RR.constant]) {
        return getConstant(objectMap[0][Vocabulary_1.RR.constant]);
    }
    if (!isArray && objectMap[Vocabulary_1.RR.constant]) {
        return getConstant(objectMap[Vocabulary_1.RR.constant]);
    }
    throw new Error('Object must be specified through constant');
}
function getFunctionNameFromPredicateObjectMap(predicateObjectMap) {
    const { [Vocabulary_1.RR.objectMap]: objectMap, [Vocabulary_1.RR.object]: object } = predicateObjectMap;
    if (object) {
        return getFunctionNameFromObject(object);
    }
    if (objectMap) {
        return getFunctionNameFromObjectMap(objectMap);
    }
    throw new Error('No object specified in PredicateObjectMap');
}
exports.getFunctionNameFromPredicateObjectMap = getFunctionNameFromPredicateObjectMap;
function isFnoExecutesPredicate(predicate) {
    return predicate === Vocabulary_1.FNO.executes || predicate === Vocabulary_1.FNO_HTTPS.executes;
}
exports.isFnoExecutesPredicate = isFnoExecutesPredicate;
function hasLogicalSource(node) {
    return Vocabulary_1.RML.logicalSource in node;
}
function isFunctionValuedSubjectMap(subjectMap) {
    return typeof subjectMap === 'object' && Vocabulary_1.FNML.functionValue in subjectMap;
}
exports.isFunctionValuedSubjectMap = isFunctionValuedSubjectMap;
function predicateContainsFnoExecutes(predicate) {
    if (Array.isArray(predicate)) {
        return predicate.some((predicateItem) => isFnoExecutesPredicate(predicateItem));
    }
    return isFnoExecutesPredicate(predicate);
}
exports.predicateContainsFnoExecutes = predicateContainsFnoExecutes;
function isJsonLDReference(obj) {
    return typeof obj === 'object' && '@id' in obj && Object.keys(obj).length === 1;
}
// May create circular data-structure (probably not common in RML though)
function jsonLDGraphToObj(graph, deleteReplaced = false) {
    const graphHasNodeWithoutId = graph.some((node) => !node['@id']);
    if (graphHasNodeWithoutId) {
        throw new Error('node without id');
    }
    const graphById = graph.reduce((object, node) => {
        object[node['@id']] = node;
        return object;
    }, {});
    const replacedIds = [];
    for (const id of Object.keys(graphById)) {
        const node = graphById[id];
        for (const key of Object.keys(node)) {
            const fieldValue = node[key];
            if (Array.isArray(fieldValue)) {
                fieldValue.forEach((value, index) => {
                    if (isJsonLDReference(value) && value['@id'] in graphById) {
                        replacedIds.push(value['@id']);
                        graphById[id][key][index] = graphById[value['@id']];
                    }
                });
            }
            else if (isJsonLDReference(fieldValue) && fieldValue['@id'] in graphById) {
                replacedIds.push(fieldValue['@id']);
                graphById[id][key] = graphById[fieldValue['@id']];
            }
        }
    }
    if (deleteReplaced) {
        for (const deleteId of replacedIds) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete graphById[deleteId];
        }
    }
    return Object.values(graphById);
}
exports.jsonLDGraphToObj = jsonLDGraphToObj;
function replaceReferences(graph) {
    const connectedGraph = jsonLDGraphToObj(graph, true);
    // Test for circular deps & remove links
    try {
        return JSON.parse(JSON.stringify(connectedGraph));
    }
    catch {
        // eslint-disable-next-line no-console
        console.error('Could not replace, circular dependencies when replacing nodes');
        return graph;
    }
}
exports.replaceReferences = replaceReferences;
function setValueAtPredicate(obj, predicate, data, language, datatype) {
    if (language !== undefined || datatype !== undefined) {
        if (obj[predicate]) {
            const newValue = {
                '@type': datatype,
                '@value': data,
                '@language': language,
            };
            if (typeof obj[predicate] === 'object' && obj[predicate]['@value']) {
                obj[predicate] = [obj[predicate], newValue];
            }
            else if (Array.isArray(obj[predicate])) {
                obj[predicate].push(newValue);
            }
            else {
                const previousValue = {
                    '@value': obj[predicate],
                };
                obj[predicate] = [previousValue, newValue];
            }
        }
        else {
            obj[predicate] = {
                '@value': data,
                '@type': datatype,
                '@language': language,
            };
        }
    }
    else if (obj[predicate]) {
        obj[predicate] = (0, ArrayUtil_1.addArray)(obj[predicate]);
        obj[predicate].push(data);
    }
    else {
        obj[predicate] = data;
    }
}
function setObjPredicate(obj, predicate, dataSet, language, datatype) {
    if (datatype) {
        datatype = typeof datatype === 'object' ? datatype['@id'] : datatype;
    }
    if (datatype === Vocabulary_1.RDF.JSON) {
        datatype = '@json';
    }
    if (datatype === '@json') {
        setValueAtPredicate(obj, predicate, dataSet, language, datatype);
    }
    else {
        dataSet = (0, ArrayUtil_1.addArray)(dataSet).filter((data) => data !== undefined);
        for (const data of dataSet) {
            setValueAtPredicate(obj, predicate, data, language, datatype);
        }
    }
}
exports.setObjPredicate = setObjPredicate;
function setObjPredicateWithTermType(obj, predicate, dataSet, termType, language, datatype) {
    let result;
    switch (termType) {
        case Vocabulary_1.RR.BlankNode:
            if (Array.isArray(dataSet)) {
                result = dataSet.map((item) => ({ '@id': `_:${item}` }));
            }
            else {
                result = { '@id': `_:${dataSet}` };
            }
            break;
        case Vocabulary_1.RR.IRI:
            if (Array.isArray(dataSet)) {
                result = dataSet.map((item) => ({ '@id': item }));
            }
            else {
                result = { '@id': dataSet };
            }
            break;
        case Vocabulary_1.RR.Literal:
            result = dataSet;
            break;
        default:
            throw new Error(`Invalid rr:termType: ${termType}`);
    }
    setObjPredicate(obj, predicate, result, language, datatype);
}
exports.setObjPredicateWithTermType = setObjPredicateWithTermType;
function allCombinationsOfArray(arr) {
    if (arr.length === 0) {
        return [];
    }
    if (arr.length === 1) {
        return arr[0].map((item) => [item]);
    }
    const result = [];
    const firstElement = arr[0];
    const allCombinationsOfRest = allCombinationsOfArray(arr.slice(1));
    for (const combinination of allCombinationsOfRest) {
        for (const element of firstElement) {
            result.push([element, ...combinination]);
        }
    }
    return result;
}
exports.allCombinationsOfArray = allCombinationsOfArray;
function calculateTemplate(template, index, sourceParser, termType) {
    const openBracketIndicies = (0, StringUtil_1.getAllOcurrences)('{', template);
    const closedBracketIndicies = (0, StringUtil_1.getAllOcurrences)('}', template);
    if (openBracketIndicies.length === 0 || openBracketIndicies.length !== closedBracketIndicies.length) {
        return [template];
    }
    const selectorsInTemplate = openBracketIndicies.map((beginningValue, idx) => template.slice(beginningValue + 1, closedBracketIndicies[idx]));
    const dataToInsert = selectorsInTemplate.map((selector) => (0, ArrayUtil_1.addArray)(sourceParser.getData(index, selector)));
    const allDataCombinations = allCombinationsOfArray(dataToInsert);
    return allDataCombinations.reduce((templates, combinination) => {
        const finalTemplate = combinination.reduce((resolvedTemplate, word, idxB) => {
            if (!termType || termType !== Vocabulary_1.RR.Literal) {
                word = (0, UriUtil_1.toURIComponent)(word);
            }
            return resolvedTemplate.replace(`{${selectorsInTemplate[idxB]}}`, word);
        }, template);
        if (finalTemplate.length > 0) {
            templates.push((0, UriUtil_1.unescapeCurlyBrackets)(finalTemplate));
        }
        return templates;
    }, []);
}
exports.calculateTemplate = calculateTemplate;
async function getValueOfTermMap(termMap, index, sourceParser, topLevelMappingProcessors, functionExecutor) {
    if (Vocabulary_1.RR.constant in termMap) {
        return getConstant(termMap[Vocabulary_1.RR.constant]);
    }
    if (Vocabulary_1.RML.reference in termMap) {
        return sourceParser.getData(index, getValue(termMap[Vocabulary_1.RML.reference]));
    }
    if (Vocabulary_1.RR.template in termMap) {
        const template = getValue(termMap[Vocabulary_1.RR.template]);
        return calculateTemplate(template, index, sourceParser);
    }
    if (Vocabulary_1.FNML.functionValue in termMap) {
        return await functionExecutor.executeFunctionFromValue(termMap[Vocabulary_1.FNML.functionValue], index, topLevelMappingProcessors);
    }
    throw new Error('TermMap has neither constant, reference or template');
}
exports.getValueOfTermMap = getValueOfTermMap;
async function getPredicateValueFromPredicateMap(predicateMap, index, topLevelMappingProcessors, sourceParser, functionExecutor) {
    if (Array.isArray(predicateMap)) {
        const predicateArrays = await Promise.all(predicateMap.map((predicateMapItem) => getValueOfTermMap(predicateMapItem, index, sourceParser, topLevelMappingProcessors, functionExecutor)));
        return predicateArrays.flat();
    }
    return await getValueOfTermMap(predicateMap, index, sourceParser, topLevelMappingProcessors, functionExecutor);
}
async function getPredicateValueFromPredicateObjectMap(mapping, index, topLevelMappingProcessors, sourceParser, functionExecutor) {
    const { [Vocabulary_1.RR.predicate]: predicate, [Vocabulary_1.RR.predicateMap]: predicateMap } = mapping;
    if (predicate) {
        return getPredicateValue(predicate);
    }
    if (predicateMap) {
        return await getPredicateValueFromPredicateMap(predicateMap, index, topLevelMappingProcessors, sourceParser, functionExecutor);
    }
    throw new Error('No predicate specified in PredicateObjectMap');
}
exports.getPredicateValueFromPredicateObjectMap = getPredicateValueFromPredicateObjectMap;
function hasSubjectMap(node) {
    return Vocabulary_1.RR.subject in node || Vocabulary_1.RR.subjectMap in node;
}
function isTriplesMap(node) {
    return hasLogicalSource(node) && hasSubjectMap(node);
}
exports.isTriplesMap = isTriplesMap;
//# sourceMappingURL=ObjectUtil.js.map