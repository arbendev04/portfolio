import { type FormEvent } from 'react';
import { motion } from 'framer-motion';
import HoverLetters from './HoverLetters';
import SocialDock from './SocialDock';
import { fadeUp, revealViewport } from '../lib/motion';
import './Contact.css';

function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const nombre = data.get('nombre');
  const correo = data.get('correo');
  const whatsapp = data.get('whatsapp') || '';
  const proyecto = data.get('proyecto');

  const subject = encodeURIComponent(`Nuevo proyecto — ${nombre}`);
  const body = encodeURIComponent(
    `Nombre: ${nombre}\nCorreo: ${correo}\nWhatsApp: ${whatsapp}\n\nProyecto:\n${proyecto}`,
  );

  window.location.href = `mailto:hola@arben.dev?subject=${subject}&body=${body}`;
}

export default function Contact() {
  return (
    <section data-section className="contact">
      <div className="contact__inner">
        <motion.div
          className="contact__eyebrow"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={fadeUp}
        >
          [ 04 ] — contact
        </motion.div>

        {/* Left unwrapped, same reasoning as Projects' title: HoverLetters drives its
            own blur-in reveal on whileInView, so it can't sit inside a parent whose
            own (slower-to-trigger, much taller) fadeUp would still be invisible by
            the time this one finishes animating. */}
        <h2 className="contact__title">
          <HoverLetters text="Let's build " />
          {/* nowrap glues these two together — as separate sibling elements with
              no space between them, the browser still treats their boundary as
              a valid line-break point, which was dropping the "." onto its own
              line as an orphan */}
          <span style={{ whiteSpace: 'nowrap' }}>
            <HoverLetters text="something" gradient />
            <HoverLetters text="." />
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
            Open to freelance · 2025
          </div>

          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__form-row">
              <label className="contact__field">
                <span className="contact__label">Tu nombre</span>
                <input type="text" name="nombre" placeholder="Santiago García" required className="contact__input" />
              </label>
              <label className="contact__field">
                <span className="contact__label">Tu correo</span>
                <input type="email" name="correo" placeholder="correo@ejemplo.com" required className="contact__input" />
              </label>
            </div>

            <label className="contact__field">
              <span className="contact__label">WhatsApp (opcional)</span>
              <input type="tel" name="whatsapp" placeholder="+57 300 000 0000" className="contact__input" />
            </label>

            <label className="contact__field">
              <span className="contact__label">Tu proyecto</span>
              <textarea
                name="proyecto"
                rows={5}
                required
                placeholder="Cuéntame qué necesitas, qué tipo de proyecto es, y cualquier detalle relevante…"
                className="contact__textarea"
              />
            </label>

            <button type="submit" className="contact__submit">
              <span>Enviar y empezar</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
          </form>

          <SocialDock />
        </motion.div>
      </div>

      <footer className="contact__footer">
        <span>&copy; 2025 ArbenDev — Medellín, CO</span>
        <span>Designed in the dark.</span>
      </footer>
    </section>
  );
}
