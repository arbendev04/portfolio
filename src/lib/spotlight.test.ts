import { describe, expect, it } from 'vitest';
import { GLOW_HUE_FROM, GLOW_HUE_TO, glowHue, localPoint } from './spotlight';

describe('localPoint', () => {
  it('converts a viewport position into a position inside the card', () => {
    expect(localPoint({ x: 150, y: 260 }, { left: 100, top: 200 })).toEqual({ x: 50, y: 60 });
  });

  it('goes negative when the cursor is left of / above the card, so the glow can approach from outside', () => {
    expect(localPoint({ x: 40, y: 10 }, { left: 100, top: 200 })).toEqual({ x: -60, y: -190 });
  });
});

describe('glowHue', () => {
  it('is brand cyan at the left edge of the screen', () => {
    expect(glowHue(0, 1600)).toBe(GLOW_HUE_FROM);
  });

  it('is brand blue at the right edge of the screen', () => {
    expect(glowHue(1600, 1600)).toBe(GLOW_HUE_TO);
  });

  it('blends linearly in between', () => {
    expect(glowHue(800, 1600)).toBeCloseTo((GLOW_HUE_FROM + GLOW_HUE_TO) / 2);
  });

  it('stays inside the brand range even past the screen edges', () => {
    expect(glowHue(-200, 1600)).toBe(GLOW_HUE_FROM);
    expect(glowHue(2400, 1600)).toBe(GLOW_HUE_TO);
  });

  it('falls back to the start of the range for a zero-width viewport', () => {
    expect(glowHue(100, 0)).toBe(GLOW_HUE_FROM);
  });
});
