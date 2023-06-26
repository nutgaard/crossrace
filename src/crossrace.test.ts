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
});


function expectOrdering(racelog: string, ordering: string) {
    const result = findOrdering(racelog);
    const riders = result.map(it => it.rider).join(' ');

    expect(riders).toEqual(ordering);
}