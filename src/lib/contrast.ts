import { hexToUnitRgb } from './accent';

/** sRGB channel (0..1) → linear light, per WCAG 2.x. */
function linearize(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a hex colour: 0 for black, 1 for white. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToUnitRgb(hex).map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, 1..21, order-independent. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
