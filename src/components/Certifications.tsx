import { useRef } from 'react';
import { motion } from 'framer-motion';
import HoverLetters from './HoverLetters';
import { certifications, formatIssued } from '../data/certifications';
import { fadeUp, revealViewport } from '../lib/motion';
import { useSpotlight } from '../lib/spotlight';
import { formatMessage } from '../i18n/lang';
import { useLang, useT } from '../i18n/langStore';
import './Certifications.css';

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

/**
 * Verified credentials, each a small card linking straight to its public
 * verification page. The traveling globe grows behind this section on its way
 * from the tech stack dock to the contact form (data-globe-final).
 */
export default function Certifications() {
  const listRef = useRef<HTMLUListElement>(null);
  const lang = useLang();
  const t = useT();
  useSpotlight(listRef, '.certs__card');

  return (
    <section className="certs" data-globe-final>
      <div className="certs__header">
        <motion.div className="certs__eyebrow" initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeUp}>
          {t.certifications.eyebrow}
        </motion.div>
        {/* keyed by language: remounting replays the letter entrance for the new text */}
        <HoverLetters key={lang} as="h2" className="certs__title" text={t.certifications.title} />
      </div>

      <ul ref={listRef} className="certs__list">
        {certifications.map((cert, i) => (
          <motion.li
            key={cert.id}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            variants={fadeUp}
            transition={{ delay: i * 0.06 }}
          >
            <a
              className="certs__card spotlight"
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={formatMessage(t.certifications.cardLabel, { name: cert.name, issuer: cert.issuer })}
            >
              <img className="certs__badge" src={cert.image} alt="" width={84} height={84} loading="lazy" decoding="async" />
              <span className="certs__info">
                <span className="certs__meta">
                  {cert.issuer} · <time dateTime={cert.issued}>{formatIssued(cert.issued, lang)}</time>
                </span>
                <span className="certs__name">{cert.name}</span>
                <span className="certs__summary">{cert.summary[lang]}</span>
                <span className="certs__verify">
                  {t.certifications.verify}
                  {ARROW}
                </span>
              </span>
            </a>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
