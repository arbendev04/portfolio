import { useRef } from 'react';
import { motion } from 'framer-motion';
import { acronyms, icons, categories } from '../data/techIcons';
import HoverLetters from './HoverLetters';
import { fadeUp, revealViewport } from '../lib/motion';
import { useSpotlight } from '../lib/spotlight';
import { useLang, useT } from '../i18n/langStore';
import './TechStack.css';

export default function TechStack() {
  const rowsRef = useRef<HTMLDivElement>(null);
  const lang = useLang();
  const t = useT();
  useSpotlight(rowsRef, '.skills__pill');

  return (
    <section data-section className="skills">
      {/* stays pinned for a short extra stretch of scroll (see .skills), so
          the docked globe holds here before growing behind the contact form */}
      <div className="skills__pin">
        <div className="skills__header">
          <motion.div
            className="skills__eyebrow"
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            variants={fadeUp}
          >
            {t.skills.eyebrow}
          </motion.div>
          {/* keyed by language: remounting replays the letter entrance for the new text */}
          <HoverLetters key={lang} as="h2" className="skills__title" text={t.skills.title} />
        </div>

        <div className="skills__body">
          {/* empty on purpose: TravelingGlobe docks into this square */}
          <div className="skills__globe-slot" data-globe-slot aria-hidden="true" />
          <div ref={rowsRef} className="skills__rows">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.key}
                className="skills__row"
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
              >
                <div className="skills__row-label">{t.skills.categories[cat.key]}</div>
                <div className="skills__pills">
                  {cat.items.map((item) => {
                    const meaning = acronyms[item]?.[lang];
                    const name = meaning ? `${item} — ${meaning}` : item;
                    return (
                      // Icon only; the name shows in a tooltip on hover or focus.
                      // Focusable so keyboard and touch users can reveal it too, and
                      // labelled so screen readers still get the name.
                      <span key={item} className="skills__pill spotlight" data-tech={item} role="img" aria-label={name} tabIndex={0}>
                        {meaning ? (
                          // a practice, not a product: no logo, so the acronym is the glyph
                          <span className="skills__pill-acronym" aria-hidden="true">
                            {item}
                          </span>
                        ) : (
                          // Static, developer-authored SVG strings — not user input, safe to inject
                          <span className="skills__pill-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[item] }} />
                        )}
                        <span className={meaning ? 'skills__tip skills__tip--wide' : 'skills__tip'} aria-hidden="true">
                          {name}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
