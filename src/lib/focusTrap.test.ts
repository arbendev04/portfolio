import { describe, expect, it } from 'vitest';
import { nextFocusIndex } from './focusTrap';

describe('nextFocusIndex', () => {
  it('moves forward with Tab', () => {
    expect(nextFocusIndex(0, 3, false)).toBe(1);
  });

  it('moves backward with Shift+Tab', () => {
    expect(nextFocusIndex(2, 3, true)).toBe(1);
  });

  it('wraps from the last element back to the first', () => {
    expect(nextFocusIndex(2, 3, false)).toBe(0);
  });

  it('wraps from the first element back to the last', () => {
    expect(nextFocusIndex(0, 3, true)).toBe(2);
  });

  it('enters at the first element when focus is outside the trap', () => {
    expect(nextFocusIndex(-1, 3, false)).toBe(0);
  });

  it('enters at the last element when tabbing backwards from outside', () => {
    expect(nextFocusIndex(-1, 3, true)).toBe(2);
  });

  it('returns -1 when there is nothing to focus', () => {
    expect(nextFocusIndex(0, 0, false)).toBe(-1);
  });
});
