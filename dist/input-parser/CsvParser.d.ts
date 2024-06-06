import type { SourceParserArgs } from './SourceParser';
import { SourceParser } from './SourceParser';
export declare class CsvParser extends SourceParser<string> {
    private readonly data;
    constructor(args: SourceParserArgs);
    protected parseSource(source: string): string;
    getCount(): number;
    protected getRawData(index: number, selector: string): any[];
}
