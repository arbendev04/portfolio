/** A square on screen: top-left corner plus side length, in px. */
export interface SquareRect {
  x: number;
  y: number;
  size: number;
}

/** How faint the globe is while it sits behind the project cards. */
export const BACKGROUND_OPACITY = 0.35;
/** Background globe size, as a share of the screen's shorter side. */
const BACKGROUND_SCALE = 0.92;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Gap the dock slot must clear above the bottom edge to count as on screen. */
const DOCK_BOTTOM_MARGIN = 0.05;

/**
 * Travel from background (0) to docked (1), driven by where the dock slot is.
 * Starts as the slot enters from the bottom of the screen and completes once
 * the whole slot is on screen — not when it's exactly centred, since a pinned
 * section's heading can hold it a little low for good. From then on it stays
 * 1, so the globe simply follows the slot as the page keeps scrolling.
 */
export function dockProgress(slotTop: number, slotHeight: number, viewportHeight: number): number {
  const start = viewportHeight;
  const end = viewportHeight * (1 - DOCK_BOTTOM_MARGIN) - slotHeight;
  return clamp01((start - slotTop) / (start - end));
}

export function lerpRect(from: SquareRect, to: SquareRect, t: number): SquareRect {
  return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t), size: lerp(from.size, to.size, t) };
}

/** The large globe centred behind the project cards. */
export function backgroundRect(viewportWidth: number, viewportHeight: number): SquareRect {
  const size = Math.min(viewportWidth, viewportHeight) * BACKGROUND_SCALE;
  return { x: (viewportWidth - size) / 2, y: (viewportHeight - size) / 2, size };
}

export function globeOpacity(progress: number): number {
  return lerp(BACKGROUND_OPACITY, 1, clamp01(progress));
}

/** How faint the globe is behind the contact form, so the form stays legible. */
export const CONTACT_OPACITY = 0.45;
/** Share of the screen a section must rise through for its leg to complete. */
const ENTER_SPAN = 0.8;
/** Max swing either side of the focus view, in radians — small enough that
 * the three places never rotate onto the far side of the globe. */
export const SWAY_RANGE = 0.5;
const SWAY_SPEED = 0.35;

/** Progress of a leg that plays as a section rises into view: 0 while its top
 * is still below the screen, 1 once it has risen ENTER_SPAN of the way up. */
export function enterProgress(sectionTop: number, viewportHeight: number): number {
  return clamp01((viewportHeight - sectionTop) / (viewportHeight * ENTER_SPAN));
}

/** Opacity across the whole trip: faint background → opaque dock (`dock`),
 * then faint again behind the contact form (`contact`). */
export function stageOpacity(dock: number, contact: number): number {
  return lerp(globeOpacity(dock), CONTACT_OPACITY, clamp01(contact));
}

/** Gentle back-and-forth rotation (radians) around the focus view, so the
 * globe never sits still yet keeps its three places facing the viewer. */
export function sway(timeSeconds: number): number {
  return SWAY_RANGE * Math.sin(timeSeconds * SWAY_SPEED);
}
