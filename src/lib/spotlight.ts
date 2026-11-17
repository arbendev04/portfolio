import { useEffect, type RefObject } from 'react';
import '../styles/spotlight.css';

/** Hue at the left edge of the screen — brand cyan (#19D3FF). */
export const GLOW_HUE_FROM = 192;
/** Hue at the right edge of the screen — brand blue (#1F6BFF). */
export const GLOW_HUE_TO = 220;

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

/** The glow's hue drifts from cyan to blue as the cursor crosses the screen. */
export function glowHue(pointerX: number, viewportWidth: number): number {
  if (viewportWidth <= 0) return GLOW_HUE_FROM;
  const t = Math.min(1, Math.max(0, pointerX / viewportWidth));
  return GLOW_HUE_FROM + (GLOW_HUE_TO - GLOW_HUE_FROM) * t;
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
      container.style.setProperty('--glow-hue', glowHue(pointer.x, window.innerWidth).toFixed(1));
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
