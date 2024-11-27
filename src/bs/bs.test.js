
import { everyOtherDegree } from './bs';

describe('everyOtherDegree', () => {
    test('should return correct degree for even index', () => {
        expect(everyOtherDegree(0, 6)).toBe(0);
        expect(everyOtherDegree(2, 6)).toBe(60);
        expect(everyOtherDegree(4, 6)).toBe(120);
    });

    test('should return correct degree for odd index', () => {
        expect(everyOtherDegree(1, 6)).toBe(300);
        expect(everyOtherDegree(3, 6)).toBe(240);
        expect(everyOtherDegree(5, 6)).toBe(180);
    });

    test('should handle different lengths', () => {
        expect(everyOtherDegree(0, 4)).toBe(0);
        expect(everyOtherDegree(1, 4)).toBe(270);
        expect(everyOtherDegree(2, 4)).toBe(90);
        expect(everyOtherDegree(3, 4)).toBe(180);
    });
});