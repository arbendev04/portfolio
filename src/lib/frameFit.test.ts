import { describe, expect, it } from 'vitest';
import { fitFrame } from './frameFit';

describe('fitFrame', () => {
  it('scales a desktop-width page down to the box width', () => {
    expect(fitFrame(720, 315, 1440).scale).toBeCloseTo(0.5);
  });

  it('makes the page tall enough to fill the box once scaled', () => {
    const { scale, height } = fitFrame(720, 315, 1440);
    expect(height * scale).toBeCloseTo(315);
  });

  it('returns no scale for an unmeasured box, so nothing renders yet', () => {
    expect(fitFrame(0, 0, 1440)).toEqual({ scale: 0, height: 0 });
  });
});
