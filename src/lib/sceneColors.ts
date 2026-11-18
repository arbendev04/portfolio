/** Colours for the JS-painted scenes (agent colony canvas, cobe globe) per
 * accent palette and colour mode. Pure, so both modes are unit-tested. */

import { darkTint, hexToUnitRgb, lightTint, type AccentPalette } from './accent';
import type { ColorMode } from './mode';

export type GlobeColor = [number, number, number];

export interface ColonyInk {
  /** Brand gradient across the finished word. */
  gradientFrom: string;
  gradientTo: string;
  /** Idle, wandering agents. */
  wander: string;
  /** Agents carrying a brick to the word. */
  carrier: string;
}

export interface GlobeLook {
  dark: number;
  baseColor: GlobeColor;
  mapBrightness: number;
  markerColor: GlobeColor;
  arcColor: GlobeColor;
  glowColor: GlobeColor;
}

const WANDER_ALPHA = 0.85;
const CARRIER_ALPHA = 0.9;
/** How much of the deep accent tints the dark globe's atmosphere. */
const DARK_GLOW_TINT = 0.4;
/** How close to white the light globe's atmosphere is (a faint accent haze). */
const LIGHT_GLOW_TINT = 0.9;

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToUnitRgb(hex).map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Dark: pale tints glow on black. Light: pale tints vanish on white, so idle
 * agents use the saturated accent and carriers the deep one. */
export function colonyInk(palette: AccentPalette, mode: ColorMode): ColonyInk {
  const light = mode === 'light';
  return {
    gradientFrom: palette.deep,
    gradientTo: palette.bright,
    wander: rgba(light ? palette.bright : palette.brighter, WANDER_ALPHA),
    carrier: light ? rgba(palette.deep, CARRIER_ALPHA) : `rgba(255, 255, 255, ${CARRIER_ALPHA})`,
  };
}

/** Dark: the night globe. Light: cobe's classic white globe with grey dotted
 * continents and a barely tinted glow. Markers and arcs always in the accent. */
export function globeLook(palette: AccentPalette, mode: ColorMode): GlobeLook {
  const bright = hexToUnitRgb(palette.bright);
  const shared = { markerColor: [...bright] as GlobeColor, arcColor: [...bright] as GlobeColor };
  if (mode === 'light') {
    return { ...shared, dark: 0, baseColor: [1, 1, 1], mapBrightness: 7, glowColor: [...lightTint(bright, LIGHT_GLOW_TINT)] };
  }
  return {
    ...shared,
    dark: 1,
    baseColor: [0.22, 0.26, 0.32],
    mapBrightness: 9,
    glowColor: [...darkTint(hexToUnitRgb(palette.deep), DARK_GLOW_TINT)],
  };
}
