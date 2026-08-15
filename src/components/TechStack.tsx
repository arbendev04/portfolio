import { motion } from 'framer-motion';
import { icons, categories } from '../data/techIcons';
import HoverLetters from './HoverLetters';
import { fadeUp, revealViewport } from '../lib/motion';
import './TechStack.css';

export default function TechStack() {
  return (
    <section data-section className="skills">
      <motion.div
        className="skills__header"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeUp}
      >
        <div className="skills__eyebrow">[ 03 ] — capabilities</div>
        <HoverLetters as="h2" className="skills__title" text="The stack I reach for." />
      </motion.div>

      <div className="skills__rows">
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
                <span key={item} className="skills__pill">
                  {/* Static, developer-authored SVG strings — not user input, safe to inject */}
                  <span className="skills__pill-icon" dangerouslySetInnerHTML={{ __html: icons[item] }} />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
