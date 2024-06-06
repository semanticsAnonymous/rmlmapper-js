import type { SourceParser } from './input-parser/SourceParser';
import type { MappingProcessor } from './MappingProcessor';
import type { FunctionValue } from './util/Types';
declare type FnoFunction = (parameters: any) => Promise<any> | any;
interface FunctionExecutorArgs {
    parser: SourceParser<any>;
    functions?: Record<string, FnoFunction>;
}
export declare class FunctionExecutor {
    private readonly parser;
    private readonly functions?;
    constructor(args: FunctionExecutorArgs);
    executeFunctionFromValue(functionValue: FunctionValue, index: number, topLevelMappingProcessors: Record<string, MappingProcessor>): Promise<any>;
    private getFunctionName;
    private getFunctionParameters;
    private getParametersFromPredicateObjectMaps;
    private getParametersFromPredicateObjectMap;
    private getParametersFromObject;
    private getParametersFromObjectMap;
    private calculateFunctionParams;
    private getParameterValue;
    private getValueOfReference;
    private resolveTemplate;
    private resolveFunctionValue;
    private resolveTriplesMap;
    private executeFunction;
}
export {};
