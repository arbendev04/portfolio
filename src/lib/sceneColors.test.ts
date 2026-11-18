import { describe, expect, it } from 'vitest';
import { findAccent, hexToUnitRgb } from './accent';
import { colonyInk, globeLook } from './sceneColors';

const cyan = findAccent('cyan');
const ocean = findAccent('ocean');

describe('colonyInk', () => {
  it('dark: idle agents in the pale tint, carriers white-hot', () => {
    const ink = colonyInk(cyan, 'dark');
    expect(ink.gradientFrom).toBe(cyan.deep);
    expect(ink.gradientTo).toBe(cyan.bright);
    expect(ink.wander).toBe('rgba(86, 230, 255, 0.85)');
    expect(ink.carrier).toBe('rgba(255, 255, 255, 0.9)');
  });

  it('light: idle agents in the saturated bright accent, carriers in the deep one', () => {
    const ink = colonyInk(ocean, 'light');
    expect(ink.wander).toBe('rgba(37, 99, 235, 0.85)');
    expect(ink.carrier).toBe('rgba(30, 64, 175, 0.9)');
  });
});

describe('globeLook', () => {
  it('dark: the existing night globe — markers in the accent, glow a dark tint of the deep end', () => {
    const look = globeLook(cyan, 'dark');
    expect(look.dark).toBe(1);
    expect(look.baseColor).toEqual([0.22, 0.26, 0.32]);
    expect(look.mapBrightness).toBe(9);
    expect(look.markerColor).toEqual([...hexToUnitRgb(cyan.bright)]);
    expect(look.arcColor).toEqual([...hexToUnitRgb(cyan.bright)]);
    const [r, g, b] = look.glowColor;
    const [dr, dg, db] = hexToUnitRgb(cyan.deep);
    expect([r, g, b]).toEqual([dr * 0.4, dg * 0.4, db * 0.4]);
  });

  it('light: a white globe with grey continents and a soft, barely tinted glow', () => {
    const look = globeLook(ocean, 'light');
    expect(look.dark).toBe(0);
    expect(look.baseColor).toEqual([1, 1, 1]);
    expect(look.mapBrightness).toBeGreaterThanOrEqual(6);
    expect(look.mapBrightness).toBeLessThanOrEqual(10);
    expect(look.markerColor).toEqual([...hexToUnitRgb(ocean.bright)]);
    look.glowColor.forEach((channel) => expect(channel).toBeGreaterThan(0.85));
  });

  it('returns fresh arrays, so cobe can never mutate a shared palette', () => {
    expect(globeLook(cyan, 'dark').markerColor).not.toBe(globeLook(cyan, 'dark').markerColor);
  });
});
