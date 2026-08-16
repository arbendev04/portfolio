import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';

/** Measures each letter's pixel offset inside `containerRef` so a
 * `background-clip: text` gradient split across sibling spans paints as one
 * continuous surface instead of repeating per glyph. Pass `active: false` to
 * skip measuring entirely for callers that don't need it. */
export function useGradientLetterStyles(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  charCount: number,
) {
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [styles, setStyles] = useState<CSSProperties[]>([]);

  useLayoutEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const totalWidth = container.offsetWidth;
      if (!totalWidth) return;
      setStyles(
        letterRefs.current.map((el) => ({
          // Taller than the box (160%) and vertically centered — a descender
          // like the "g" in "something" can dip slightly past the box's own
          // line-height, and a gradient sized to exactly 100% stops painting
          // right at that edge, leaving the tip of the descender transparent
          // (unpainted, not just unclipped) instead of filled.
          backgroundSize: `${totalWidth}px 160%`,
          backgroundPosition: `${-(el?.offsetLeft ?? 0)}px center`,
        })),
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef, active, charCount]);

  return { letterRefs, styles };
}
