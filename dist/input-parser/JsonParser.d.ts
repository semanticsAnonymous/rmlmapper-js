import { SourceParser } from './SourceParser';
import type { SourceParserArgs } from './SourceParser';
export declare class JsonParser extends SourceParser<JSON> {
    private readonly json;
    private readonly paths;
    constructor(args: SourceParserArgs);
    protected parseSource(source: string): JSON;
    getCount(): number;
    protected getRawData(index: number, selector: string, datatype: string): any[];
}
