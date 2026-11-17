export interface FrameFit {
  /** Factor the page is scaled by to fit the box's width. */
  scale: number;
  /** Unscaled page height that, once scaled, exactly fills the box. */
  height: number;
}

/** Fits a page rendered at `renderWidth` (a desktop viewport) into a box,
 * matching the box's width — the way a screenshot thumbnail is framed. */
export function fitFrame(boxWidth: number, boxHeight: number, renderWidth: number): FrameFit {
  if (boxWidth <= 0 || boxHeight <= 0 || renderWidth <= 0) return { scale: 0, height: 0 };
  const scale = boxWidth / renderWidth;
  return { scale, height: boxHeight / scale };
}
