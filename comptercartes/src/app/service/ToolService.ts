import { Injectable } from '@angular/core';

@Injectable()
export class ToolService {

    getValue(anArray: string[][], key: string): string {
        const result: string[][] = anArray.filter((line: string[]) => line[0] === key);
        return result.length === 0 ? null : result[0][1];
    }
    getValues(anArray: string[][], keys: string[]): string[] {
        const result: string[][] = anArray.filter((line: string[]) => keys.filter( (key) => line[0] === key).length > 0);
        return result.length === 0 ? null : result.map((line) => line[1]);
    }
}
