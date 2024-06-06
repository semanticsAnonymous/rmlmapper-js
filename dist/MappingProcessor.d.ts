import type { NodeObject } from 'jsonld';
import type { ProcessOptions, TriplesMap } from './util/Types';
export interface ParsedParentTriplesMap {
    mapID: string;
    joinCondition: {
        parentPath: string;
        child: any[];
    }[];
}
export declare type ParsedMappingResult = (NodeObject & {
    $parentPaths?: Record<string, string[]>;
    $parentTriplesMap?: Record<string, ParsedParentTriplesMap[]>;
});
export interface MappingProcessorArgs {
    referenceFormulation: string;
    options: ProcessOptions;
    sourceCache: Record<string, any>;
    iterator: string;
    source: string;
    mapping: TriplesMap;
    data: NodeObject[];
}
export declare class MappingProcessor {
    private readonly sourceParser;
    private readonly functionExecutor;
    private readonly mapping;
    private readonly data;
    private processed;
    private returnValue;
    constructor(args: MappingProcessorArgs);
    private createSourceParser;
    hasProcessed(): boolean;
    getReturnValue(): any;
    processMapping(topLevelMappingProcessors: Record<string, MappingProcessor>): Promise<ParsedMappingResult[]>;
    private getSubjectMapFromMapping;
    private getParentPaths;
    private getNonFunctionClassFromSubjectMap;
    private processMappingWithSubjectMap;
    private processMappingWithTemplate;
    private processMappingWithFunctionValue;
    private processMappingWithConstantOrTermType;
    private writeParentPath;
    private doObjectMappings;
    private handleSingleMapping;
}
