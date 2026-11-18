import type { MouseEvent } from 'react';
import { motion, useTransform, type MotionProps, type MotionValue } from 'framer-motion';
import { scrollToSection } from '../lib/lenis';

/** id of the contact section — the CTA's real href, so it works without JS. */
export const CONTACT_SECTION_ID = 'contacto';

interface HeroCtaProps {
  label: string;
  /** Shared fade of the hero's supporting copy (1 → 0 as the hero scrolls). */
  opacity: MotionValue<number>;
  reduceMotion: boolean;
  /** framer-motion entrance props, same as the rest of the supporting copy. */
  entrance: Pick<MotionProps, 'initial' | 'animate' | 'transition'>;
}

/** Smooth-scrolls to the contact form, then puts the cursor in its first field. */
function goToContact(event: MouseEvent<HTMLAnchorElement>, immediate: boolean): void {
  const section = document.getElementById(CONTACT_SECTION_ID);
  if (!section) return; // let the plain anchor jump handle it
  event.preventDefault();

  const focusFirstField = () =>
    section.querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"]), textarea')?.focus({
      preventScroll: true,
    });
  scrollToSection(section, { immediate, onComplete: focusFirstField });
}

export default function HeroCta({ label, opacity, reduceMotion, entrance }: HeroCtaProps) {
  // once faded out it must not catch clicks meant for what is underneath
  const pointerEvents = useTransform(opacity, (o) => (o < 0.05 ? 'none' : 'auto'));

  return (
    <motion.a
      href={`#${CONTACT_SECTION_ID}`}
      className="hero__cta"
      onClick={(event) => goToContact(event, reduceMotion)}
      style={{ opacity, pointerEvents }}
      {...entrance}
    >
      <span>{label}</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </motion.a>
  );
}
