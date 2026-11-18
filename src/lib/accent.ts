/** Accent colour palettes (one set per colour mode) and the pure helpers
 * around them. The live store (current accent, setAccent, useAccent) is in
 * accentStore.ts. */

import type { ColorMode } from './mode';

export type DarkAccentId = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose';
export type LightAccentId = 'ocean' | 'indigo' | 'teal' | 'crimson' | 'burnt-orange';
export type AccentId = DarkAccentId | LightAccentId;
export type UnitRgb = readonly [number, number, number];

export interface AccentPalette {
  id: AccentId;
  /** Darker end of the brand gradient. */
  deep: string;
  /** The main accent colour — the one used for accent text. */
  bright: string;
  /** A lighter tint, for highlights. */
  brighter: string;
  /** `bright` as 0..255 channels — mirrors --accent-rgb in tokens.css. */
  rgb: readonly [number, number, number];
  /** Spotlight hue range (degrees), left → right edge of the screen. */
  hueFrom: number;
  hueTo: number;
}

/** Keep both lists in sync with the [data-accent] blocks in tokens.css and the
 * id lists in the pre-paint script in index.html (a test checks the latter). */
export const DARK_ACCENTS: readonly AccentPalette[] = [
  { id: 'cyan', deep: '#1F6BFF', bright: '#19D3FF', brighter: '#56E6FF', rgb: [25, 211, 255], hueFrom: 192, hueTo: 220 },
  { id: 'violet', deep: '#7C3AED', bright: '#C084FC', brighter: '#D8B4FE', rgb: [192, 132, 252], hueFrom: 268, hueTo: 290 },
  { id: 'emerald', deep: '#059669', bright: '#34D399', brighter: '#6EE7B7', rgb: [52, 211, 153], hueFrom: 150, hueTo: 168 },
  { id: 'amber', deep: '#EA580C', bright: '#FBBF24', brighter: '#FCD34D', rgb: [251, 191, 36], hueFrom: 25, hueTo: 45 },
  { id: 'rose', deep: '#E11D48', bright: '#FB7185', brighter: '#FDA4AF', rgb: [251, 113, 133], hueFrom: 340, hueTo: 356 },
];

/** Chosen for a white page: `bright` and `deep` both reach WCAG AA (4.5:1) as
 * text on the light page and on white cards — accent.test.ts enforces it. */
export const LIGHT_ACCENTS: readonly AccentPalette[] = [
  { id: 'ocean', deep: '#1E40AF', bright: '#2563EB', brighter: '#3B82F6', rgb: [37, 99, 235], hueFrom: 214, hueTo: 226 },
  { id: 'indigo', deep: '#3730A3', bright: '#4F46E5', brighter: '#6366F1', rgb: [79, 70, 229], hueFrom: 238, hueTo: 250 },
  { id: 'teal', deep: '#115E59', bright: '#0F766E', brighter: '#0D9488', rgb: [15, 118, 110], hueFrom: 170, hueTo: 182 },
  { id: 'crimson', deep: '#9F1239', bright: '#BE123C', brighter: '#E11D48', rgb: [190, 18, 60], hueFrom: 340, hueTo: 352 },
  { id: 'burnt-orange', deep: '#9A3412', bright: '#C2410C', brighter: '#EA580C', rgb: [194, 65, 12], hueFrom: 14, hueTo: 26 },
];

/** Every palette of every mode. */
export const ACCENTS: readonly AccentPalette[] = [...DARK_ACCENTS, ...LIGHT_ACCENTS];

const PALETTES: Readonly<Record<ColorMode, readonly AccentPalette[]>> = { dark: DARK_ACCENTS, light: LIGHT_ACCENTS };

/** Each mode remembers its own accent. Dark keeps the original key, so accents
 * saved before light mode existed still apply. */
const STORAGE_KEYS: Readonly<Record<ColorMode, string>> = { dark: 'arben:accent', light: 'arben:accent-light' };

export function palettesFor(mode: ColorMode): readonly AccentPalette[] {
  return PALETTES[mode];
}

export function defaultAccentFor(mode: ColorMode): AccentId {
  return PALETTES[mode][0].id;
}

export function accentStorageKey(mode: ColorMode): string {
  return STORAGE_KEYS[mode];
}

export function isAccentId(value: unknown): value is AccentId {
  return typeof value === 'string' && ACCENTS.some((a) => a.id === value);
}

/** The palette for `id` (either mode), or the dark default for anything unrecognised. */
export function findAccent(id: unknown): AccentPalette {
  return ACCENTS.find((a) => a.id === id) ?? DARK_ACCENTS[0];
}

/** A stored accent id for `mode`, validated — storage is user-editable, so
 * never trust it. An id from the other mode counts as invalid. */
export function resolveAccent(mode: ColorMode, raw: string | null): AccentId {
  const value = raw?.trim().toLowerCase();
  const match = PALETTES[mode].find((a) => a.id === value);
  return match ? match.id : defaultAccentFor(mode);
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** '#RRGGBB' (or '#RGB') as 0..1 channels, the format cobe expects. */
export function hexToUnitRgb(hex: string): UnitRgb {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match) return [0, 0, 0];
  const digits = match[1].length === 3 ? [...match[1]].map((d) => d + d).join('') : match[1];
  const channel = (i: number) => parseInt(digits.slice(i * 2, i * 2 + 2), 16) / 255;
  return [channel(0), channel(1), channel(2)];
}

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

/** `rgb` darkened towards black — factor 1 keeps it, 0 is black. */
export function darkTint(rgb: UnitRgb, factor: number): UnitRgb {
  const f = clampUnit(factor);
  return [rgb[0] * f, rgb[1] * f, rgb[2] * f];
}

/** `rgb` mixed towards white — factor 0 keeps it, 1 is white. */
export function lightTint(rgb: UnitRgb, factor: number): UnitRgb {
  const f = clampUnit(factor);
  return [rgb[0] + (1 - rgb[0]) * f, rgb[1] + (1 - rgb[1]) * f, rgb[2] + (1 - rgb[2]) * f];
}
