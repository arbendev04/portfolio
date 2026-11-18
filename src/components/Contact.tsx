import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import HoverLetters from './HoverLetters';
import SocialDock from './SocialDock';
import { CONTACT_SECTION_ID } from './HeroCta';
import { fadeUp, revealViewport } from '../lib/motion';
import { CONTACT_FORM_NAME, HONEYPOT_FIELD, submitContactForm } from '../lib/contactForm';
import { currentYear } from '../lib/year';
import { formatMessage } from '../i18n/lang';
import { useLang, useT } from '../i18n/langStore';
import { useMode } from '../lib/modeStore';
import './Contact.css';

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const CONTACT_EMAIL = 'hola@arben.dev';

/** Read once per load — a visit spanning New Year's Eve can live with it. */
const YEAR = currentYear();

export default function Contact() {
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const isSending = status === 'sending';
  const lang = useLang();
  const t = useT();
  const copy = t.contact;
  const mode = useMode();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');

    try {
      await submitContactForm(new FormData(form));
      form.reset();
      setStatus('success');
    } catch {
      // the message below already tells the visitor what to do next, and the
      // email fallback keeps the lead from being lost
      setStatus('error');
    }
  }

  return (
    <section id={CONTACT_SECTION_ID} data-section className="contact">
      <div className="contact__inner">
        <motion.div
          className="contact__eyebrow"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeUp}
        >
          {copy.eyebrow}
        </motion.div>

        {/* Left unwrapped, same reasoning as Projects' title: HoverLetters drives its
            own letter-by-letter reveal on scroll, so it can't sit inside a parent whose
            own (slower-to-trigger, much taller) fadeUp would still be invisible by
            the time this one finishes animating. */}
        {/* keyed by language: remounting replays the letter entrance for the new text */}
        <h2 key={lang} className="contact__title">
          <HoverLetters text={copy.titleLead} />
          {/* nowrap glues these two together — as separate sibling elements with
              no space between them, the browser still treats their boundary as
              a valid line-break point, which was dropping the "." onto its own
              line as an orphan */}
          <span style={{ whiteSpace: 'nowrap' }}>
            <HoverLetters text={copy.titleAccent} gradient />
            <HoverLetters text={copy.titleEnd} />
          </span>
        </h2>

        <motion.div
          className="contact__rest"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeUp}
        >
          <div className="contact__badge">
            <span className="contact__badge-dot" />
            {formatMessage(copy.badge, { year: YEAR })}
          </div>

          <form
            className="contact__form"
            name={CONTACT_FORM_NAME}
            method="POST"
            data-netlify="true"
            netlify-honeypot={HONEYPOT_FIELD}
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="form-name" value={CONTACT_FORM_NAME} />
            {/* honeypot: hidden from people and assistive tech, bots fill it in */}
            <label className="contact__honeypot" aria-hidden="true">
              {copy.honeypot}
              <input name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
            </label>

            <div className="contact__form-row">
              <label className="contact__field">
                <span className="contact__label">{copy.nameLabel}</span>
                <input type="text" name="nombre" placeholder={copy.namePlaceholder} required className="contact__input" />
              </label>
              <label className="contact__field">
                <span className="contact__label">{copy.emailLabel}</span>
                <input type="email" name="correo" placeholder={copy.emailPlaceholder} required className="contact__input" />
              </label>
            </div>

            <label className="contact__field">
              <span className="contact__label">{copy.whatsappLabel}</span>
              <input type="tel" name="whatsapp" placeholder="+57 300 000 0000" className="contact__input" />
            </label>

            <label className="contact__field">
              <span className="contact__label">{copy.projectLabel}</span>
              <textarea
                name="proyecto"
                rows={5}
                required
                placeholder={copy.projectPlaceholder}
                className="contact__textarea"
              />
            </label>

            <button type="submit" className="contact__submit" disabled={isSending} aria-busy={isSending}>
              <span>{isSending ? copy.sending : copy.submit}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>

            <p className={`contact__status contact__status--${status}`} role="status" aria-live="polite">
              {status === 'success' && copy.success}
              {status === 'error' && (
                <>
                  {copy.error}{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="contact__status-link">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </>
              )}
            </p>
          </form>

          <SocialDock />
        </motion.div>
      </div>

      <footer className="contact__footer">
        <span>{formatMessage(copy.copyright, { year: YEAR })}</span>
        {/* the wordplay follows the colour mode: "in the dark" vs "with clarity" */}
        <span>{mode === 'light' ? copy.taglineLight : copy.tagline}</span>
      </footer>
    </section>
  );
}
