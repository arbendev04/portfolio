import { describe, expect, it } from 'vitest';
import { DEFAULT_MODE, MODES, MODE_STORAGE_KEY, PAGE_BACKGROUND, otherMode, parseMode } from './mode';

describe('MODES', () => {
  it('offers dark and light, dark being the default identity of the site', () => {
    expect(MODES).toEqual(['dark', 'light']);
    expect(DEFAULT_MODE).toBe('dark');
    expect(MODE_STORAGE_KEY).toBe('arben:mode');
  });

  it('knows the page background of each mode (mirrors --bg-page in tokens.css)', () => {
    expect(PAGE_BACKGROUND).toEqual({ dark: '#060708', light: '#F7F8FA' });
  });
});

describe('parseMode', () => {
  it('reads a stored mode', () => {
    expect(parseMode('light')).toBe('light');
    expect(parseMode('dark')).toBe('dark');
  });

  it('trims and lower-cases what it reads', () => {
    expect(parseMode('  LIGHT ')).toBe('light');
  });

  it('falls back to dark for missing or tampered values', () => {
    expect(parseMode(null)).toBe('dark');
    expect(parseMode('')).toBe('dark');
    expect(parseMode('sepia')).toBe('dark');
    expect(parseMode('"light"')).toBe('dark');
  });
});

describe('otherMode', () => {
  it('flips between the two modes', () => {
    expect(otherMode('dark')).toBe('light');
    expect(otherMode('light')).toBe('dark');
  });
});
