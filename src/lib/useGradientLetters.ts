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
          backgroundSize: `${totalWidth}px 100%`,
          backgroundPosition: `${-(el?.offsetLeft ?? 0)}px 0`,
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
