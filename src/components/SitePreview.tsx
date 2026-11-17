import { useLayoutEffect, useRef, useState } from 'react';
import { fitFrame } from '../lib/frameFit';

interface SitePreviewProps {
  url: string;
}

/** Desktop viewport width the site is rendered at before being scaled down,
 * so the preview shows its real desktop layout, not its mobile breakpoint. */
const RENDER_WIDTH = 1440;
/** The page renders with a viewport this many times taller than the visible
 * box, which is clipped to the top. Bars pinned to the bottom of the viewport
 * (cookie banners, chat widgets…) then fall outside the visible area instead
 * of covering the preview — and they can't be dismissed from out here. */
const VIEWPORT_OVERSCAN = 2.2;

/**
 * A live, non-interactive thumbnail of a website: the page renders at desktop
 * width and is scaled to fill this box, like a screenshot of its top section.
 * It stays invisible until loaded, so whatever sits underneath (the modal's
 * placeholder) shows instead of a blank frame while the site loads.
 */
export default function SitePreview({ url }: SitePreviewProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    // measured right away rather than waiting for the observer's first
    // callback, which only arrives on the next rendered frame
    setBox({ width: el.clientWidth, height: el.clientHeight });
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { scale, height } = fitFrame(box.width, box.height, RENDER_WIDTH);

  return (
    <div ref={boxRef} className={`site-preview${loaded ? ' is-loaded' : ''}`}>
      {scale > 0 && (
        <iframe
          src={url}
          title=""
          tabIndex={-1}
          // Scripts run because many sites only reveal content via JS (and would
          // preview blank), and allow-same-origin lets those scripts use their
          // own storage. Safe only because every previewed site is a different
          // domain from this page: the same-origin policy still walls it off,
          // and the sandbox still blocks popups, forms and top navigation.
          // Never preview a page on this site's own domain.
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => setLoaded(true)}
          style={{ width: RENDER_WIDTH, height: height * VIEWPORT_OVERSCAN, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
}
