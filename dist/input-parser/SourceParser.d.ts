import type { ProcessOptions } from '../util/Types';
export interface SourceParserArgs {
    source: string;
    sourceCache: Record<string, any>;
    options: ProcessOptions;
    iterator: string;
}
export declare abstract class SourceParser<T> {
    private readonly ignoreEmptyStrings?;
    private readonly ignoreValues?;
    private readonly source;
    private readonly sourceCache;
    protected readonly options: ProcessOptions;
    constructor(args: SourceParserArgs);
    protected readSourceWithCache(): T;
    protected abstract parseSource(contents: string): T;
    /**
    * Get the total count of items in the dataset
    */
    abstract getCount(): number;
    /**
    * Get the data at a specific index matching a selector
    * @param index - the index of the data to get
    * @param selector - the selector of the field to get from the data at the index
    */
    protected abstract getRawData(index: number, selector: string, datatype?: string): any[];
    getData(index: number, selector: string, datatype?: string): any[];
}
