import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { scrollToSection } from '../lib/lenis';
import { EASE_OUT } from '../lib/motion';
import KineticHeroName from './KineticHeroName';
import AgentColony from './AgentColony';
import HeroCta from './HeroCta';
import { useT } from '../i18n/langStore';
import './Hero.css';

// Hero runway timeline (shares of the 380vh scroll runway, 0..1):
//   0     → 0.405  the name grows from small until it leaves the screen
//   0.22  → 0.575  meanwhile the swarm gathers into "ARBEN"
//   0.575 → 0.737  "ARBEN" holds, complete
//   0.737 → 1      the projects section slides up over it like a curtain —
//                  that's the last 100vh, set by .work--cover's -100vh margin
const NAME_EXIT_END = 0.405;
const COLONY_BUILD_START = 0.22;
const COLONY_BUILD_END = 0.575;

function scrollToWork() {
  const target = document.querySelectorAll<HTMLElement>('[data-section]')[1];
  if (target) scrollToSection(target);
}

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const t = useT();
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
        <AgentColony progress={scrollYProgress} buildStart={COLONY_BUILD_START} buildEnd={COLONY_BUILD_END} />

        <div className="hero__content">
          <motion.div className="hero-eyebrow hero__eyebrow" style={{ opacity: supportOpacity }} {...fadeIn(0.1)}>
            {t.hero.eyebrow}
          </motion.div>

          <KineticHeroName
            words={['Santiago', 'Arango', 'Benjumea']}
            accentIndex={2}
            scrollTargetRef={heroRef}
            zoomEnd={NAME_EXIT_END}
          />

          <motion.div className="hero-role hero__role" style={{ opacity: supportOpacity }} {...fadeIn(1.0)}>
            {t.hero.role}
            <span className="cursor-blink" style={{ color: 'var(--brand-cyan)', marginLeft: 4 }}>
              ▍
            </span>
          </motion.div>

          {/* the value proposition is the most prominent supporting line; the
              role above it stays the small mono tag */}
          <motion.p className="hero__value" style={{ opacity: supportOpacity }} {...fadeIn(1.15)}>
            {t.hero.value}
          </motion.p>

          <HeroCta label={t.hero.cta} opacity={supportOpacity} reduceMotion={!!reduceMotion} entrance={fadeIn(1.3)} />
        </div>

        <motion.button
          type="button"
          className="hero-scroll hero__scroll"
          onClick={scrollToWork}
          aria-label={t.hero.scrollLabel}
          style={{ opacity: supportOpacity }}
          {...fadeIn(1.45)}
        >
          <span className="hero__scroll-label">{t.hero.scroll}</span>
          <span className="chev">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
          </span>
        </motion.button>
      </div>
    </section>
  );
}
