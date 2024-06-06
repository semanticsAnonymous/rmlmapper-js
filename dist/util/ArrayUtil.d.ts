import type { OrArray } from './Types';
export declare function returnFirstItemInArrayOrValue(value: any): any;
export declare function addArray<T>(arr: OrArray<T>): T[];
export declare function cutArray<T>(arr: OrArray<T>): T;
export declare function intersection<T>(arrOfArr: T[][]): T[];
