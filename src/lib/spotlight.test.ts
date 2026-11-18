import { describe, expect, it } from 'vitest';
import { glowHue, localPoint, parseHue } from './spotlight';

const FROM = 192;
const TO = 220;

describe('localPoint', () => {
  it('converts a viewport position into a position inside the card', () => {
    expect(localPoint({ x: 150, y: 260 }, { left: 100, top: 200 })).toEqual({ x: 50, y: 60 });
  });

  it('goes negative when the cursor is left of / above the card, so the glow can approach from outside', () => {
    expect(localPoint({ x: 40, y: 10 }, { left: 100, top: 200 })).toEqual({ x: -60, y: -190 });
  });
});

describe('glowHue', () => {
  it('is the start of the accent range at the left edge of the screen', () => {
    expect(glowHue(0, 1600, FROM, TO)).toBe(FROM);
  });

  it('is the end of the accent range at the right edge of the screen', () => {
    expect(glowHue(1600, 1600, FROM, TO)).toBe(TO);
  });

  it('blends linearly in between', () => {
    expect(glowHue(800, 1600, FROM, TO)).toBeCloseTo((FROM + TO) / 2);
  });

  it('stays inside the accent range even past the screen edges', () => {
    expect(glowHue(-200, 1600, FROM, TO)).toBe(FROM);
    expect(glowHue(2400, 1600, FROM, TO)).toBe(TO);
  });

  it('falls back to the start of the range for a zero-width viewport', () => {
    expect(glowHue(100, 0, FROM, TO)).toBe(FROM);
  });

  it('follows whichever range the current accent defines', () => {
    expect(glowHue(800, 1600, 340, 356)).toBeCloseTo(348);
  });
});

describe('parseHue', () => {
  it('reads a number from a CSS custom property value', () => {
    expect(parseHue(' 268', 0)).toBe(268);
  });

  it('falls back when the property is unset or not a number', () => {
    expect(parseHue('', 192)).toBe(192);
    expect(parseHue('auto', 192)).toBe(192);
  });
});
