import { describe, expect, it } from 'vitest';
import { arrowTarget } from './rovingFocus';

describe('arrowTarget', () => {
  it('moves forward with ArrowRight / ArrowDown', () => {
    expect(arrowTarget('ArrowRight', 1, 5)).toBe(2);
    expect(arrowTarget('ArrowDown', 1, 5)).toBe(2);
  });

  it('moves back with ArrowLeft / ArrowUp', () => {
    expect(arrowTarget('ArrowLeft', 1, 5)).toBe(0);
    expect(arrowTarget('ArrowUp', 1, 5)).toBe(0);
  });

  it('wraps around both ends', () => {
    expect(arrowTarget('ArrowRight', 4, 5)).toBe(0);
    expect(arrowTarget('ArrowLeft', 0, 5)).toBe(4);
  });

  it('jumps to the ends with Home / End', () => {
    expect(arrowTarget('Home', 3, 5)).toBe(0);
    expect(arrowTarget('End', 1, 5)).toBe(4);
  });

  it('returns null for keys it does not handle', () => {
    expect(arrowTarget('Enter', 1, 5)).toBeNull();
    expect(arrowTarget('a', 1, 5)).toBeNull();
  });
});
