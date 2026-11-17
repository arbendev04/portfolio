import { useRef } from 'react';
import { motion } from 'framer-motion';
import { icons, categories } from '../data/techIcons';
import HoverLetters from './HoverLetters';
import { fadeUp, revealViewport } from '../lib/motion';
import { useSpotlight } from '../lib/spotlight';
import './TechStack.css';

export default function TechStack() {
  const rowsRef = useRef<HTMLDivElement>(null);
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
            [ 03 ] — capabilities
          </motion.div>
          <HoverLetters as="h2" className="skills__title" text="The stack I reach for." />
        </div>

        <div className="skills__body">
          {/* empty on purpose: TravelingGlobe docks into this square */}
          <div className="skills__globe-slot" data-globe-slot aria-hidden="true" />
          <div ref={rowsRef} className="skills__rows">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.label}
                className="skills__row"
                initial="hidden"
                whileInView="visible"
                viewport={revealViewport}
                variants={fadeUp}
                transition={{ delay: i * 0.06 }}
              >
                <div className="skills__row-label">{cat.label}</div>
                <div className="skills__pills">
                  {cat.items.map((item) => (
                    // Icon only; the name shows in a tooltip on hover or focus.
                    // Focusable so keyboard and touch users can reveal it too, and
                    // labelled so screen readers still get the name.
                    <span key={item} className="skills__pill spotlight" role="img" aria-label={item} tabIndex={0}>
                      {/* Static, developer-authored SVG strings — not user input, safe to inject */}
                      <span className="skills__pill-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[item] }} />
                      <span className="skills__tip" aria-hidden="true">
                        {item}
                      </span>
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
