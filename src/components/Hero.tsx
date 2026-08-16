import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { scrollToSection } from '../lib/lenis';
import { EASE_OUT } from '../lib/motion';
import KineticHeroName from './KineticHeroName';
import './Hero.css';

function scrollToWork() {
  const target = document.querySelectorAll<HTMLElement>('[data-section]')[1];
  if (target) scrollToSection(target);
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end end'],
  });
  // the supporting copy clears out in the first stretch of the (now much
  // longer) runway so the growing name owns the screen for the rest of it
  const supportOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0], { clamp: true });

  const fadeIn = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE_OUT, delay },
  });

  return (
    <section data-section ref={heroRef} className="hero">
      <div className="hero__sticky">
        <div className="hero__glow" />

        <div className="hero__content">
          <motion.div className="hero-eyebrow hero__eyebrow" style={{ opacity: supportOpacity }} {...fadeIn(0.1)}>
            // freelance systems engineer
          </motion.div>

          <KineticHeroName words={['Santiago', 'Arango', 'Benjumea']} accentIndex={2} scrollTargetRef={heroRef} />

          <motion.div className="hero-role hero__role" style={{ opacity: supportOpacity }} {...fadeIn(1.0)}>
            Systems Engineer · Web Developer · Medellín
            <span className="cursor-blink" style={{ color: 'var(--brand-cyan)', marginLeft: 4 }}>
              ▍
            </span>
          </motion.div>
        </div>

        <motion.button
          type="button"
          className="hero-scroll hero__scroll"
          onClick={scrollToWork}
          aria-label="Scroll to work"
          style={{ opacity: supportOpacity }}
          {...fadeIn(1.45)}
        >
          <span className="hero__scroll-label">scroll</span>
          <span className="chev">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </motion.button>
      </div>
    </section>
  );
}
