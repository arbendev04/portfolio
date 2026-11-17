import { describe, expect, it } from 'vitest';
import { startScaleFor, zoomScale } from './heroZoom';

describe('zoomScale', () => {
  it('starts at the start scale and ends at the end scale', () => {
    expect(zoomScale(0, 0.15, 8)).toBeCloseTo(0.15);
    expect(zoomScale(1, 0.15, 8)).toBeCloseTo(8);
  });

  it('grows geometrically, so the halfway point is the geometric mean', () => {
    expect(zoomScale(0.5, 0.25, 4)).toBeCloseTo(1);
  });

  it('multiplies by the same factor over equal stretches of scroll', () => {
    const ratioEarly = zoomScale(0.2, 0.15, 8) / zoomScale(0.1, 0.15, 8);
    const ratioLate = zoomScale(0.9, 0.15, 8) / zoomScale(0.8, 0.15, 8);
    expect(ratioEarly).toBeCloseTo(ratioLate);
  });

  it('clamps outside the 0..1 range', () => {
    expect(zoomScale(-0.5, 0.15, 8)).toBeCloseTo(0.15);
    expect(zoomScale(2, 0.15, 8)).toBeCloseTo(8);
  });
});

describe('startScaleFor', () => {
  it('scales a large rendered font down to the target on-screen size', () => {
    expect(startScaleFor(30, 200)).toBeCloseTo(0.15);
  });

  it('never enlarges past the natural size when the font is already small', () => {
    expect(startScaleFor(30, 20)).toBe(1);
  });

  it('falls back to 1 when the font size cannot be measured', () => {
    expect(startScaleFor(30, 0)).toBe(1);
    expect(startScaleFor(30, Number.NaN)).toBe(1);
  });
});
