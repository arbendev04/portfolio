import type { Variants } from 'framer-motion';

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
// Matches the design system's --ease-spring token: a small, controlled overshoot.
export const EASE_SPRING = [0.34, 1.56, 0.64, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

export const revealViewport = { once: true, margin: '0px 0px -8% 0px', amount: 0.12 };
