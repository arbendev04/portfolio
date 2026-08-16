import { useRef, type ElementType } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useGradientLetterStyles } from '../lib/useGradientLetters';
import { EASE_OUT, revealViewport } from '../lib/motion';
import './HoverLetters.css';

interface HoverLettersProps {
  text: string;
  className?: string;
  /** Element the split text renders as — 'h2' when this *is* the heading, 'span'
   * when it's nested inside a heading that already has other content. */
  as?: ElementType;
  /** Preserves the brand gradient across the split letters (measured per-letter
   * background position) instead of the flat hover-cyan swap used elsewhere,
   * and inverts to solid white on hover instead. */
  gradient?: boolean;
}

// Wider gap between words than a typical stagger so each one is clearly
// legible arriving on its own instead of the whole line snapping in at once.
const lineContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

// Each word blurs and slides in from the right as one unit — the letter spans
// nested inside are only there for the hover colour swap and aren't animated
// themselves, they just inherit their word's blur/opacity/transform for free
// since that's how CSS painting composites a subtree.
const wordEntrance: Variants = {
  hidden: { opacity: 0, x: 28, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE_OUT },
    // a lingering `filter: blur(0px)` still forces GPU compositing and can knock
    // out ClearType/subpixel font smoothing, leaving text looking soft even at
    // zero blur radius — snapping to `none` once the transition ends restores
    // normal crisp text rendering without affecting the animated transition itself.
    transitionEnd: { filter: 'none' },
  },
};

// Blur and a moving target are exactly what prefers-reduced-motion exists to
// avoid, so that preference gets a plain opacity fade instead of the real thing.
const wordEntranceReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE_OUT } },
};

/** Splits on whitespace runs rather than every character so a leading/trailing
 * space (e.g. "Let's build ") survives as its own token instead of vanishing. */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? [];
}

export default function HoverLetters({ text, className, as: Tag = 'span', gradient = false }: HoverLettersProps) {
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const tokens = tokenize(text);
  const letterCount = tokens.reduce((count, token) => (/\s/.test(token) ? count : count + token.length), 0);
  const { letterRefs, styles } = useGradientLetterStyles(containerRef, gradient, letterCount);
  const wordVariants = reduceMotion ? wordEntranceReduced : wordEntrance;

  let letterIndex = 0;

  return (
    <Tag
      ref={containerRef}
      className={className ? `hover-letters ${className}` : 'hover-letters'}
      aria-label={text}
    >
      <motion.span
        className="hover-line"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={lineContainer}
      >
        {tokens.map((token, ti) => {
          if (/^\s+$/.test(token)) {
            return <span key={ti}>{token}</span>;
          }

          return (
            <motion.span key={ti} className="hover-word" variants={wordVariants}>
              {token.split('').map((ch) => {
                const i = letterIndex++;
                return (
                  <span
                    key={i}
                    ref={(el: HTMLSpanElement | null) => {
                      letterRefs.current[i] = el;
                    }}
                    className={gradient ? 'hover-letter hover-letter--gradient' : 'hover-letter'}
                    aria-hidden="true"
                    style={gradient ? styles[i] : undefined}
                  >
                    {ch}
                  </span>
                );
              })}
            </motion.span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
