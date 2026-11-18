import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

describe('relativeLuminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });

  it('matches the WCAG reference value for a mid grey', () => {
    // #777777 → 0.1845 per the WCAG 2.x sRGB formula
    expect(relativeLuminance('#777777')).toBeCloseTo(0.1845, 3);
  });
});

describe('contrastRatio', () => {
  it('is 21:1 for black on white, whichever order', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });

  it('is 1:1 for identical colours', () => {
    expect(contrastRatio('#2563EB', '#2563EB')).toBe(1);
  });

  it('matches known pairs', () => {
    // #767676 on white is the classic "just passes AA" grey (4.54:1)
    expect(contrastRatio('#767676', '#FFFFFF')).toBeCloseTo(4.54, 2);
    expect(contrastRatio('#2563EB', '#FFFFFF')).toBeCloseTo(5.17, 2);
  });
});
