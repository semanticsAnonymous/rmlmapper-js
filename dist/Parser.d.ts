import * as jsonld from 'jsonld';
import type { NodeObject } from 'jsonld';
import type { ParseOptions, ProcessOptions } from './util/Types';
export declare class RmlMapper {
    private readonly sourceCache;
    private readonly options;
    constructor(options: ProcessOptions);
    parseJsonLd(mapping: NodeObject): Promise<NodeObject[] | string>;
    parseTurtle(mapping: string): Promise<NodeObject[] | string>;
    private processAndCleanJsonLdMapping;
    private processMapping;
    private processTopLevelMappings;
    private createProcessorForMapping;
    private getReferenceFormulationFromLogicalSource;
    private getSourceFromLogicalSource;
    private getIteratorFromLogicalSource;
    private mergeJoin;
    private clean;
}
export declare function parseTurtle(mapping: string, inputFiles: Record<string, string>, options?: ParseOptions): Promise<string | jsonld.NodeObject[]>;
export declare function parseJsonLd(mapping: NodeObject, inputFiles: Record<string, string>, options?: ParseOptions): Promise<string | jsonld.NodeObject[]>;
/**
 * @deprecated The method should not be used. Please use parseTurtle or parseJsonLd instead.
 */
export declare function parse(mapping: string, inputFiles: Record<string, string>, options?: ParseOptions): Promise<string | jsonld.NodeObject[]>;
