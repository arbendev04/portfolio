import { describe, expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import {
  ACCENTS,
  DARK_ACCENTS,
  LIGHT_ACCENTS,
  accentStorageKey,
  darkTint,
  defaultAccentFor,
  findAccent,
  hexToUnitRgb,
  isAccentId,
  lightTint,
  palettesFor,
  resolveAccent,
} from './accent';
import { contrastRatio } from './contrast';
import { MODES, MODE_STORAGE_KEY, PAGE_BACKGROUND } from './mode';

/** WCAG AA for normal-size text. */
const AA_TEXT = 4.5;
/** Light-mode cards are pure white, so accent text must hold up there too. */
const LIGHT_CARD = '#FFFFFF';

describe('palettes', () => {
  it('offers five dark palettes, cyan first as the dark default', () => {
    expect(DARK_ACCENTS.map((a) => a.id)).toEqual(['cyan', 'violet', 'emerald', 'amber', 'rose']);
    expect(defaultAccentFor('dark')).toBe('cyan');
  });

  it('offers five light palettes, ocean first as the light default', () => {
    expect(LIGHT_ACCENTS.map((a) => a.id)).toEqual(['ocean', 'indigo', 'teal', 'crimson', 'burnt-orange']);
    expect(defaultAccentFor('light')).toBe('ocean');
  });

  it('keeps ids unique across modes, so the [data-accent] CSS blocks never collide', () => {
    const ids = ACCENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(10);
  });

  it('keeps the rgb triplet in sync with the bright hex of every palette', () => {
    ACCENTS.forEach((a) => {
      const [r, g, b] = hexToUnitRgb(a.bright).map((c) => Math.round(c * 255));
      expect([r, g, b]).toEqual(a.rgb);
    });
  });

  it('defines an increasing spotlight hue range', () => {
    ACCENTS.forEach((a) => expect(a.hueTo).toBeGreaterThan(a.hueFrom));
  });
});

describe('accent text contrast (WCAG AA, 4.5:1)', () => {
  it('dark palettes: the bright accent reads on the dark page', () => {
    DARK_ACCENTS.forEach((a) => {
      expect(contrastRatio(a.bright, PAGE_BACKGROUND.dark), a.id).toBeGreaterThanOrEqual(AA_TEXT);
    });
  });

  it('light palettes: bright and deep read on the light page and on white cards', () => {
    LIGHT_ACCENTS.forEach((a) => {
      [a.bright, a.deep].forEach((colour) => {
        expect(contrastRatio(colour, PAGE_BACKGROUND.light), `${a.id} ${colour} on page`).toBeGreaterThanOrEqual(AA_TEXT);
        expect(contrastRatio(colour, LIGHT_CARD), `${a.id} ${colour} on card`).toBeGreaterThanOrEqual(AA_TEXT);
      });
    });
  });
});

describe('palettesFor', () => {
  it('returns the palettes of the given mode only', () => {
    expect(palettesFor('dark')).toBe(DARK_ACCENTS);
    expect(palettesFor('light')).toBe(LIGHT_ACCENTS);
  });
});

describe('accentStorageKey', () => {
  it('keeps the original key for dark (backwards compatible) and adds one for light', () => {
    expect(accentStorageKey('dark')).toBe('arben:accent');
    expect(accentStorageKey('light')).toBe('arben:accent-light');
  });
});

describe('resolveAccent', () => {
  it('accepts a stored id belonging to the mode', () => {
    expect(resolveAccent('dark', 'rose')).toBe('rose');
    expect(resolveAccent('light', 'teal')).toBe('teal');
  });

  it('trims and lower-cases what it reads', () => {
    expect(resolveAccent('dark', '  AMBER ')).toBe('amber');
    expect(resolveAccent('light', ' Burnt-Orange')).toBe('burnt-orange');
  });

  it("rejects the other mode's ids, falling back to the mode default", () => {
    expect(resolveAccent('light', 'cyan')).toBe('ocean');
    expect(resolveAccent('dark', 'ocean')).toBe('cyan');
  });

  it('falls back to the mode default for missing or tampered values', () => {
    expect(resolveAccent('dark', null)).toBe('cyan');
    expect(resolveAccent('light', null)).toBe('ocean');
    expect(resolveAccent('light', '"teal"')).toBe('ocean');
  });
});

describe('isAccentId', () => {
  it('accepts known ids of either mode only', () => {
    expect(isAccentId('violet')).toBe(true);
    expect(isAccentId('crimson')).toBe(true);
    expect(isAccentId('purple')).toBe(false);
    expect(isAccentId(42)).toBe(false);
    expect(isAccentId(null)).toBe(false);
  });
});

describe('findAccent', () => {
  it('returns the palette for a known id of either mode', () => {
    expect(findAccent('emerald').bright).toBe('#34D399');
    expect(findAccent('ocean').id).toBe('ocean');
  });

  it('falls back to cyan for unknown or garbage input', () => {
    expect(findAccent('nope').id).toBe('cyan');
    expect(findAccent(undefined).id).toBe('cyan');
    expect(findAccent({}).id).toBe('cyan');
  });
});

describe('index.html pre-paint script', () => {
  it('knows every palette id and storage key, so no saved choice is dropped before first paint', () => {
    ACCENTS.forEach((a) => expect(indexHtml).toContain(`'${a.id}'`));
    MODES.forEach((mode) => expect(indexHtml).toContain(`'${accentStorageKey(mode)}'`));
    expect(indexHtml).toContain(`'${MODE_STORAGE_KEY}'`);
  });
});

describe('hexToUnitRgb', () => {
  it('normalises a 6-digit hex into 0..1 channels', () => {
    expect(hexToUnitRgb('#FF0000')).toEqual([1, 0, 0]);
    const [r, g, b] = hexToUnitRgb('#19D3FF');
    expect(r).toBeCloseTo(25 / 255);
    expect(g).toBeCloseTo(211 / 255);
    expect(b).toBe(1);
  });

  it('accepts lower case and a missing #', () => {
    expect(hexToUnitRgb('00ff00')).toEqual([0, 1, 0]);
  });

  it('expands 3-digit shorthand', () => {
    expect(hexToUnitRgb('#fff')).toEqual([1, 1, 1]);
  });

  it('returns black for malformed input instead of NaN', () => {
    expect(hexToUnitRgb('not-a-colour')).toEqual([0, 0, 0]);
  });
});

describe('darkTint', () => {
  it('scales every channel down by the factor', () => {
    const [r, g, b] = darkTint([1, 0.5, 0], 0.2);
    expect(r).toBeCloseTo(0.2);
    expect(g).toBeCloseTo(0.1);
    expect(b).toBe(0);
  });

  it('clamps the factor to 0..1', () => {
    expect(darkTint([0.5, 0.5, 0.5], 3)).toEqual([0.5, 0.5, 0.5]);
    expect(darkTint([0.5, 0.5, 0.5], -1)).toEqual([0, 0, 0]);
  });
});

describe('lightTint', () => {
  it('mixes every channel towards white by the factor', () => {
    const [r, g, b] = lightTint([0, 0.5, 1], 0.8);
    expect(r).toBeCloseTo(0.8);
    expect(g).toBeCloseTo(0.9);
    expect(b).toBe(1);
  });

  it('clamps the factor to 0..1', () => {
    expect(lightTint([0.5, 0.5, 0.5], 3)).toEqual([1, 1, 1]);
    expect(lightTint([0.5, 0.5, 0.5], -1)).toEqual([0.5, 0.5, 0.5]);
  });
});
