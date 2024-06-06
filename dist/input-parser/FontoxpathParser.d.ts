import type { SourceParserArgs } from './SourceParser';
import { SourceParser } from './SourceParser';
export declare class FontoxpathParser extends SourceParser<Document> {
    private readonly parser;
    private readonly docArray;
    constructor(args: SourceParserArgs);
    protected parseSource(source: string): Document;
    getCount(): number;
    protected getRawData(index: number, selector: string): any[];
}
