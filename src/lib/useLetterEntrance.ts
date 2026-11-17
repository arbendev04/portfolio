import type { RefObject } from 'react';
import { FULL_MOTION_QUERY, REDUCED_MOTION_QUERY, gsap, useGSAP } from './gsap';

interface LetterEntranceOptions {
  /** CSS selector for the letter spans, resolved inside `scope`. */
  selector: string;
  /** true: plays when the element scrolls into view. false: plays on mount. */
  onScroll: boolean;
  delay?: number;
}

// The gsap.com "Animate anything" feel: each letter pops up from below with a
// random tilt and settles with an elastic overshoot, one after another.
const LETTER_FROM: gsap.TweenVars = {
  yPercent: 120,
  rotation: () => gsap.utils.random(-28, 28),
  scale: 0.4,
  opacity: 0,
};

const LETTER_TO: gsap.TweenVars = {
  yPercent: 0,
  rotation: 0,
  scale: 1,
  opacity: 1,
  duration: 1.4,
  ease: 'elastic.out(1, 0.45)',
  stagger: 0.035,
  // leaves no lingering inline transform once settled, so the letters stay
  // crisp and the CSS hover styles keep full control afterwards
  clearProps: 'transform',
};

const SCROLL_START = 'top 88%';

/** Letter-by-letter elastic entrance. Under prefers-reduced-motion the letters
 * only fade in — no travel, no rotation, no overshoot. */
export function useLetterEntrance(scope: RefObject<HTMLElement | null>, { selector, onScroll, delay = 0 }: LetterEntranceOptions): void {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const letters = root.querySelectorAll(selector);
      if (!letters.length) return;

      const scrollTrigger = onScroll ? { trigger: root, start: SCROLL_START, once: true } : undefined;
      const mm = gsap.matchMedia();

      mm.add(FULL_MOTION_QUERY, () => {
        gsap.fromTo(letters, LETTER_FROM, { ...LETTER_TO, delay, scrollTrigger });
      });

      mm.add(REDUCED_MOTION_QUERY, () => {
        gsap.fromTo(letters, { opacity: 0 }, { opacity: 1, duration: 0.4, delay, scrollTrigger });
      });

      return () => mm.revert();
    },
    { scope },
  );
}
