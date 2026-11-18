import { useEffect, type RefObject } from 'react';
import '../styles/spotlight.css';

/** Used only if the accent hue range can't be read from the CSS tokens. */
const FALLBACK_HUE_FROM = 192;
const FALLBACK_HUE_TO = 220;

interface Point {
  x: number;
  y: number;
}

/** Cursor position relative to a card's top-left corner. Negative or larger
 * than the card when the cursor is outside it — which is what lets the glow
 * creep onto a card's border as the cursor approaches from a neighbour. */
export function localPoint(pointer: Point, rect: { left: number; top: number }): Point {
  return { x: pointer.x - rect.left, y: pointer.y - rect.top };
}

/** The glow's hue drifts across the accent's hue range (`from` at the left
 * edge, `to` at the right) as the cursor crosses the screen. */
export function glowHue(pointerX: number, viewportWidth: number, from: number, to: number): number {
  if (viewportWidth <= 0) return from;
  const t = Math.min(1, Math.max(0, pointerX / viewportWidth));
  return from + (to - from) * t;
}

/** A hue read from a CSS custom property, or `fallback` if it isn't a number. */
export function parseHue(raw: string, fallback: number): number {
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** The current accent's hue range, from --glow-hue-from/--glow-hue-to (set
 * per accent in tokens.css). Read on each frame, so switching accents applies
 * immediately — getComputedStyle on the root is cheap. */
function accentHueRange(): [number, number] {
  const styles = getComputedStyle(document.documentElement);
  return [
    parseHue(styles.getPropertyValue('--glow-hue-from'), FALLBACK_HUE_FROM),
    parseHue(styles.getPropertyValue('--glow-hue-to'), FALLBACK_HUE_TO),
  ];
}

/**
 * Feeds the pointer position to every `selector` element inside `containerRef`
 * as CSS variables (--glow-x/--glow-y per card, --glow-hue on the container),
 * which the card styles turn into a spotlight and a lit-up border.
 *
 * Positions are computed per card rather than with `background-attachment:
 * fixed` (as the original snippet does), because fixed backgrounds stop
 * tracking the viewport inside transformed elements — and these cards animate
 * with transforms. Updates are batched to one per animation frame.
 */
export function useSpotlight(containerRef: RefObject<HTMLElement | null>, selector: string): void {
  useEffect(() => {
    const container = containerRef.current;
    // touch screens have no hovering cursor to follow
    if (!container || !window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;
    let pointer: Point | null = null;

    const apply = () => {
      frame = 0;
      if (!pointer) return;
      const [from, to] = accentHueRange();
      container.style.setProperty('--glow-hue', glowHue(pointer.x, window.innerWidth, from, to).toFixed(1));
      container.querySelectorAll<HTMLElement>(selector).forEach((card) => {
        const { x, y } = localPoint(pointer!, card.getBoundingClientRect());
        card.style.setProperty('--glow-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--glow-y', `${y.toFixed(1)}px`);
      });
    };

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(apply);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [containerRef, selector]);
}
