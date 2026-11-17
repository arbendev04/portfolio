import { useRef, type RefObject } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useGradientLetterStyles } from '../lib/useGradientLetters';
import { useLetterEntrance } from '../lib/useLetterEntrance';
import './KineticHeroName.css';

// lands after the eyebrow (0.1s) has started, before the role line (1.0s)
const NAME_ENTRANCE_DELAY = 0.15;

interface KineticHeroNameProps {
  /** Each entry renders as its own stacked line. */
  words: string[];
  /** Index of the line painted with the brand gradient. */
  accentIndex?: number;
  scrollTargetRef?: RefObject<HTMLElement | null>;
  /** Share of the scroll runway to hold still before the zoom begins (0..1). */
  zoomStart?: number;
}

interface Magnitudes {
  scaleTo: number;
  /** Opacity at the end of the travel — 0.05 leaves the faint ghost the
   * reference's "ENORME" keeps rather than blanking out entirely. */
  opacityTo: number;
}

const DESKTOP_MAGNITUDES: Magnitudes = { scaleTo: 8, opacityTo: 0.05 };
const MOBILE_MAGNITUDES: Magnitudes = { scaleTo: 5, opacityTo: 0.05 };
/** Reduced motion keeps the effect legible but well short of the full 8x zoom,
 * which is the scale of movement the preference exists to avoid. */
const REDUCED_MAGNITUDES: Magnitudes = { scaleTo: 1.6, opacityTo: 0 };

function useIsMobile(): boolean {
  return useRef(window.matchMedia('(max-width: 767px)').matches).current;
}

interface AccentWordProps {
  word: string;
  /** Only the visible fill layer needs the measured gradient position — the
   * stroked duplicate paints via inherited `-webkit-text-stroke` instead and
   * is aria-hidden, so it has nothing to gain from the extra measurement. */
  measure: boolean;
}

/** The accent line: each letter is its own hoverable span, but the gradient
 * still reads as one continuous surface across them — see useGradientLetters.
 *
 * When `measure` is false (the stroked duplicate layer), letters render with
 * the exact same plain `hero-letter` class the other two words use — no
 * gradient class, no background-clip, nothing. `background: none` does not
 * reliably reset the vendor-prefixed `-webkit-background-clip: text` set by
 * `.hero-letter--gradient` in every browser, which was letting a ghost of the
 * fill linger through the crossfade instead of hollowing out like the rest of
 * the name. An element that never had the gradient class has nothing to leak. */
function AccentWord({ word, measure }: AccentWordProps) {
  const wordRef = useRef<HTMLSpanElement>(null);
  const chars = word.split('');
  const { letterRefs, styles } = useGradientLetterStyles(wordRef, measure, chars.length);

  return (
    <span ref={wordRef} className={`kinetic-line${measure ? ' gradient-text' : ''}`}>
      {chars.map((ch, i) => (
        <span
          key={i}
          ref={(el) => {
            letterRefs.current[i] = el;
          }}
          className={measure ? 'hero-letter hero-letter--gradient' : 'hero-letter'}
          aria-hidden="true"
          style={measure ? styles[i] : undefined}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function KineticHeroName({ words, accentIndex = -1, scrollTargetRef, zoomStart = 0 }: KineticHeroNameProps) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const m = reduceMotion ? REDUCED_MAGNITUDES : isMobile ? MOBILE_MAGNITUDES : DESKTOP_MAGNITUDES;

  const internalRef = useRef<HTMLHeadingElement>(null);
  // Only the visible fill layer animates in: the stroked outline copy is fully
  // transparent until the scroll-driven crossfade, by which point the fill's
  // letters have long since settled into the same positions.
  useLetterEntrance(internalRef, { selector: '.hero-letter', onScroll: false, delay: NAME_ENTRANCE_DELAY });

  const { scrollYProgress } = useScroll({
    target: scrollTargetRef ?? internalRef,
    // the sticky wrapper stays pinned for exactly the span between these two
    offset: ['start start', 'end end'],
    // the target ref is owned by the parent Hero component, so it isn't
    // guaranteed to be attached during this component's layout effect
    layoutEffect: false,
  });

  // a fast, tightly-damped spring smooths out the raw scroll input without
  // adding noticeable lag — high stiffness catches up almost immediately, the
  // high damping stops it from overshooting into a floaty/bouncy feel
  const progress = useSpring(scrollYProgress, { stiffness: 400, damping: 40, mass: 0.3 });

  // Every keyframe below is written on a 0..1 zoom timeline and squeezed into
  // the part of the runway after `zoomStart` — before it the name holds still.
  const at = (t: number) => zoomStart + t * (1 - zoomStart);

  const scale = useTransform(progress, [at(0), 1], [1, m.scaleTo]);
  // holds full strength through the hollowing-out, then clears near the end so
  // the section hands off cleanly
  const opacity = useTransform(progress, [at(0), at(0.85), 1], [1, 1, m.opacityTo]);

  // solid fill dissolves while the stroked copy takes over, leaving the letters
  // as pure outlines for the last stretch of the growth
  const fillOpacity = useTransform(progress, [at(0.18), at(0.55)], [1, 0]);
  const outlineOpacity = useTransform(progress, [at(0.18), at(0.5)], [0, 1]);

  // Every word is split into per-letter spans for the hover effect. The accent
  // word needs the gradient-preserving treatment from AccentWord; the rest just
  // swap to solid cyan on hover.
  const renderLines = (measureAccent: boolean) =>
    words.map((word, i) =>
      i === accentIndex ? (
        <AccentWord key={word} word={word} measure={measureAccent} />
      ) : (
        <span key={word} className="kinetic-line">
          {word.split('').map((ch, ci) => (
            <span key={ci} className="hero-letter" aria-hidden="true">
              {ch}
            </span>
          ))}
        </span>
      ),
    );

  return (
    <motion.div className="kinetic-grow" style={{ scale, opacity }}>
      <div className="kinetic-stack">
        {/* Every word is now split into aria-hidden letter spans for the hover
            effect, so the heading needs an explicit accessible name — otherwise
            assistive tech would announce nothing at all. */}
        <motion.h1
          ref={internalRef}
          className="hero-name hero__title kinetic-layer"
          style={{ opacity: fillOpacity }}
          aria-label={words.join(' ')}
        >
          {renderLines(true)}
        </motion.h1>

        {/* Stroked duplicate of the same glyphs. It lives outside the <h1> so the
            heading holds the name exactly once for search engines, and is hidden
            from assistive tech so it is announced exactly once too. */}
        <motion.div
          className="hero__title kinetic-layer kinetic-layer--outline"
          style={{ opacity: outlineOpacity }}
          aria-hidden="true"
        >
          {renderLines(false)}
        </motion.div>
      </div>
    </motion.div>
  );
}
