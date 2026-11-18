import { describe, expect, it } from 'vitest';
import { currentYear } from './year';

describe('currentYear', () => {
  it('reads the year from the given date', () => {
    expect(currentYear(new Date(2031, 5, 1))).toBe(2031);
  });

  it('defaults to today', () => {
    expect(currentYear()).toBe(new Date().getFullYear());
  });
});
