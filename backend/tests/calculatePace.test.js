import { calculatePace } from '../utils/calculatePace.js';

describe('calculatePace', () => {
  test('returns correct pace for valid input', () => {
    expect(calculatePace(5, 25)).toBe(5);
  });

  test('returns null for 0 distance', () => {
    expect(calculatePace(0, 25)).toBeNull();
  });

  test('returns null for 0 time', () => {
    expect(calculatePace(5, 0)).toBeNull();
  });
});
