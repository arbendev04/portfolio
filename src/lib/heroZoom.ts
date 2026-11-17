const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Scale along an exponential curve: equal stretches of scroll multiply the
 * size by the same factor, so the zoom feels like flying towards the text at
 * constant speed instead of crawling at first and lurching at the end. */
export function zoomScale(t: number, start: number, end: number): number {
  return start * (end / start) ** clamp01(t);
}

/** Scale that shows text rendered at `fontSizePx` as roughly `targetPx` on
 * screen. The text is rendered large and scaled down rather than rendered
 * small and scaled up, so it stays crisp all the way through the zoom. */
export function startScaleFor(targetPx: number, fontSizePx: number): number {
  if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) return 1;
  return Math.min(1, targetPx / fontSizePx);
}
