"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionExecutor = void 0;
const PredefinedFunctions_1 = require("./PredefinedFunctions");
const ArrayUtil_1 = require("./util/ArrayUtil");
const ObjectUtil_1 = require("./util/ObjectUtil");
const Vocabulary_1 = require("./util/Vocabulary");
const templateRegex = /(?:\{(.*?)\})/ug;
class FunctionExecutor {
    constructor(args) {
        this.functions = args.functions;
        this.parser = args.parser;
    }
    async executeFunctionFromValue(functionValue, index, topLevelMappingProcessors) {
        const functionName = await this.getFunctionName(functionValue[Vocabulary_1.RR.predicateObjectMap], index, topLevelMappingProcessors);
        const parameters = await this.getFunctionParameters(functionValue[Vocabulary_1.RR.predicateObjectMap], index, topLevelMappingProcessors);
        const params = await this.calculateFunctionParams(parameters, index, topLevelMappingProcessors);
        return await this.executeFunction(functionName, params);
    }
    async getFunctionName(predicateObjectMapField, index, topLevelMappingProcessors) {
        const predicateObjectMaps = (0, ArrayUtil_1.addArray)(predicateObjectMapField);
        for (const predicateObjectMap of predicateObjectMaps) {
            const predicate = await (0, ObjectUtil_1.getPredicateValueFromPredicateObjectMap)(predicateObjectMap, index, topLevelMappingProcessors, this.parser, this);
            if ((0, ObjectUtil_1.predicateContainsFnoExecutes)(predicate)) {
                const functionName = (0, ObjectUtil_1.getFunctionNameFromPredicateObjectMap)(predicateObjectMap);
                if (functionName) {
                    return functionName;
                }
            }
        }
        throw new Error('Failed to find function name in predicatePbjectMap');
    }
    async getFunctionParameters(predicateObjectMapField, index, topLevelMappingProcessors) {
        if (Array.isArray(predicateObjectMapField)) {
            return await this.getParametersFromPredicateObjectMaps(predicateObjectMapField, index, topLevelMappingProcessors);
        }
        return await this.getParametersFromPredicateObjectMap(predicateObjectMapField, index, topLevelMappingProcessors);
    }
    async getParametersFromPredicateObjectMaps(predicateObjectMaps, index, topLevelMappingProcessors) {
        let parameters = [];
        for (const predicateObjectMap of predicateObjectMaps) {
            const thisMapParameters = await this.getParametersFromPredicateObjectMap(predicateObjectMap, index, topLevelMappingProcessors);
            parameters = [...parameters, ...thisMapParameters];
        }
        return parameters;
    }
    async getParametersFromPredicateObjectMap(predicateObjectMap, index, topLevelMappingProcessors) {
        const predicate = await (0, ObjectUtil_1.getPredicateValueFromPredicateObjectMap)(predicateObjectMap, index, topLevelMappingProcessors, this.parser, this);
        if (!(0, ObjectUtil_1.isFnoExecutesPredicate)(predicate)) {
            const { [Vocabulary_1.RR.object]: object, [Vocabulary_1.RR.objectMap]: objectMap } = predicateObjectMap;
            if (object) {
                return this.getParametersFromObject(object, predicate);
            }
            if (objectMap) {
                return this.getParametersFromObjectMap(objectMap, predicate);
            }
        }
        return [];
    }
    getParametersFromObject(object, predicate) {
        if (Array.isArray(object)) {
            const objectMapsFromObject = object.map((objectItem) => ({ '@type': Vocabulary_1.RR.ObjectMap, [Vocabulary_1.RR.constant]: objectItem }));
            return this.getParametersFromObjectMap(objectMapsFromObject, predicate);
        }
        const objectMapFromObject = { '@type': Vocabulary_1.RR.ObjectMap, [Vocabulary_1.RR.constant]: object };
        return this.getParametersFromObjectMap(objectMapFromObject, predicate);
    }
    getParametersFromObjectMap(objectMap, predicate) {
        if (Array.isArray(objectMap)) {
            return objectMap.map((objectMapItem) => ({ [Vocabulary_1.RR.predicate]: { '@id': predicate }, ...objectMapItem }));
        }
        return [{
                [Vocabulary_1.RR.predicate]: { '@id': predicate },
                ...objectMap,
            }];
    }
    async calculateFunctionParams(parameters, index, topLevelMappingProcessors) {
        const result = [];
        await Promise.all(parameters.map(async (parameter) => {
            // Adds parameters both by their predicates and as array values
            const value = await this.getParameterValue(parameter, index, topLevelMappingProcessors);
            (0, ObjectUtil_1.addToObj)(result, parameter[Vocabulary_1.RR.predicate]['@id'], value);
            result.push(value);
        }));
        return result;
    }
    async getParameterValue(parameter, index, topLevelMappingProcessors) {
        if (Vocabulary_1.RR.constant in parameter) {
            return (0, ObjectUtil_1.getConstant)(parameter[Vocabulary_1.RR.constant]);
        }
        if (Vocabulary_1.RML.reference in parameter) {
            return this.getValueOfReference(parameter[Vocabulary_1.RML.reference], index, parameter[Vocabulary_1.RR.datatype]);
        }
        if (Vocabulary_1.RR.template in parameter) {
            return this.resolveTemplate(parameter[Vocabulary_1.RR.template], index);
        }
        if (Vocabulary_1.FNML.functionValue in parameter) {
            return await this.resolveFunctionValue(parameter[Vocabulary_1.FNML.functionValue], index, topLevelMappingProcessors);
        }
        if (Vocabulary_1.RR.parentTriplesMap in parameter) {
            return await this.resolveTriplesMap(parameter[Vocabulary_1.RR.parentTriplesMap], topLevelMappingProcessors);
        }
    }
    getValueOfReference(reference, index, datatype) {
        const data = this.parser.getData(index, (0, ObjectUtil_1.getValue)(reference), (0, ObjectUtil_1.getIdFromNodeObjectIfDefined)(datatype));
        return (0, ArrayUtil_1.returnFirstItemInArrayOrValue)(data);
    }
    resolveTemplate(template, index) {
        let resolvedTemplate = (0, ObjectUtil_1.getValue)(template);
        let match = templateRegex.exec(resolvedTemplate);
        while (match) {
            const variableValue = this.parser.getData(index, match[1]);
            resolvedTemplate = resolvedTemplate.replace(`{${match[1]}}`, variableValue.toString());
            match = templateRegex.exec(resolvedTemplate);
        }
        return resolvedTemplate;
    }
    async resolveFunctionValue(functionValue, index, topLevelMappingProcessors) {
        const returnValue = await this.executeFunctionFromValue(functionValue, index, topLevelMappingProcessors);
        return (0, ArrayUtil_1.returnFirstItemInArrayOrValue)(returnValue);
    }
    async resolveTriplesMap(triplesMap, topLevelMappingProcessors) {
        const processor = topLevelMappingProcessors[triplesMap['@id']];
        if (processor) {
            if (processor.hasProcessed()) {
                return processor.getReturnValue();
            }
            return await processor.processMapping(topLevelMappingProcessors);
        }
        throw new Error('Could not resolve value of parentTriplesMap in function parameter');
    }
    async executeFunction(functionName, parameters) {
        if (this.functions && functionName in this.functions) {
            return await this.functions[functionName](parameters);
        }
        if (functionName in PredefinedFunctions_1.predefinedFunctions) {
            return PredefinedFunctions_1.predefinedFunctions[functionName](parameters);
        }
        throw new Error(`Could not find function ${functionName}`);
    }
}
exports.FunctionExecutor = FunctionExecutor;
//# sourceMappingURL=FunctionExecutor.js.map