import { describe, expect, it } from 'vitest';
import { wrapIndex } from './wrapIndex';

describe('wrapIndex', () => {
  it('steps forward', () => {
    expect(wrapIndex(0, 1, 3)).toBe(1);
  });

  it('steps backward', () => {
    expect(wrapIndex(2, -1, 3)).toBe(1);
  });

  it('wraps from the last item to the first', () => {
    expect(wrapIndex(2, 1, 3)).toBe(0);
  });

  it('wraps from the first item to the last', () => {
    expect(wrapIndex(0, -1, 3)).toBe(2);
  });

  it('stays put with a single item', () => {
    expect(wrapIndex(0, 1, 1)).toBe(0);
  });

  it('returns -1 for an empty list', () => {
    expect(wrapIndex(0, 1, 0)).toBe(-1);
  });
});
