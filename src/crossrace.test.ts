import { describe, it, expect } from "vitest";
import {findOrdering} from "./crossrace";

describe('findOrdering', () => {
    it('should correctly identify ordering', () => {
        expectOrdering(`
            1 2 3
            1 3
            1 2
        `, '1 3 2');
    });

    it('should correctly identify ordering', () => {
        expectOrdering(`
            1 2 3
            1 3
            1 2 3
        `, '1 3 2');
    });

    it('should correctly identify ordering', () => {
        expectOrdering(`
            1 2 3
            2 3 1
            3 1 2
            1 2 3
        `, '1 2 3');
    });

    it('should handle tabs in input', () => {
        expectOrdering(`
        130\t812\t666\t318\t195\t613\t193\t567\t387\t308
130\t812\t666\t318\t195\t613\t193\t567\t308\t387
130\t812\t666\t318\t195\t613\t193\t567\t308\t387
130\t812\t666\t318\t195\t613\t193\t567\t308\t
812\t130\t666\t318\t195\t613\t193\t567\t\t
812\t308\t130\t666\t318\t195\t\t\t\t
812\t613\t193\t567\t130\t308\t318\t666\t195\t
812\t613\t193\t130\t567\t318\t308\t666\t\t
812\t195\t130\t613\t193\t567\t318\t308\t666\t
812\t195\t130\t613\t193\t567\t318\t666\t\t
812\t308\t130\t195\t613\t193\t567\t318\t666\t
        `, '812 130 318 666 195 613 193 567 308 387')
    })
});


function expectOrdering(racelog: string, ordering: string) {
    const result = findOrdering(racelog);
    const riders = result.map(it => it.rider).join(' ');

    expect(riders).toEqual(ordering);
}