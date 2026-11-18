import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import type { ProjectItem } from '../data/projects';
import { icons } from '../data/techIcons';
import { useFocusTrap } from '../lib/focusTrap';
import { getLenis } from '../lib/lenis';
import SitePreview from './SitePreview';
import { useLang, useT } from '../i18n/langStore';
import './ProjectModal.css';

interface ProjectModalProps {
  project: ProjectItem;
  /** Shared with the card the modal was opened from, so that card morphs into
   * the modal (and the modal back into it on close). It stays fixed while
   * browsing between projects — only the content inside slides. */
  layoutId: string;
  /** 1-based position of `project` and the total, for the "02 / 03" counter. */
  position: { current: number; total: number };
  /** +1 after moving forward, -1 after moving back — sets the slide direction. */
  direction: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Content slides in from the side being navigated towards. On first open it
 * waits a moment so the panel has (mostly) grown out of the card. */
const SLIDE = 36;
const contentSlide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: SLIDE * direction }),
  center: { opacity: 1, x: 0, transition: { delay: 0.12, duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
  exit: (direction: number) => ({ opacity: 0, x: -SLIDE * direction, transition: { duration: 0.14 } }),
};

const icon = (paths: string[]) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);
const CLOSE_ICON = icon(['M18 6 6 18', 'm6 6 12 12']);
const PREV_ICON = icon(['m15 18-6-6 6-6']);
const NEXT_ICON = icon(['m9 18 6-6-6-6']);
const ARROW_ICON = icon(['M7 17 17 7', 'M7 7h10v10']);

const pad = (n: number) => String(n).padStart(2, '0');

/** Smooth scrolling would scroll the page behind the modal, so it's paused
 * while the modal is open. */
function usePausedPageScroll(): void {
  useEffect(() => {
    const lenis = getLenis();
    lenis?.stop();
    return () => lenis?.start();
  }, []);
}

/** ← / → browse between projects while the modal is open. */
function useArrowKeys(onPrev: () => void, onNext: () => void): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onPrev, onNext]);
}

/** A screenshot when the project has one (sites that refuse to be framed);
 * otherwise a live preview of the site, layered over a branded placeholder
 * that shows until the site has loaded. */
function ModalHeader({ project }: { project: ProjectItem }) {
  if (project.image) {
    return <img className="project-modal__image" src={project.image} alt="" />;
  }
  return (
    <div className="project-modal__placeholder" aria-hidden="true">
      <span>{project.index}</span>
      {project.url && <SitePreview url={project.url} />}
    </div>
  );
}

function TechList({ tech }: { tech: string[] }) {
  return (
    <ul className="project-modal__tech">
      {tech.map((tag) => (
        <li key={tag} className="project-modal__tech-tag">
          {icons[tag] && (
            // static, developer-authored SVG strings from techIcons — not user input
            <span className="project-modal__tech-icon" dangerouslySetInnerHTML={{ __html: icons[tag] }} />
          )}
          {tag}
        </li>
      ))}
    </ul>
  );
}

function ProjectNav({ position, onPrev, onNext }: Pick<ProjectModalProps, 'position' | 'onPrev' | 'onNext'>) {
  const t = useT();
  if (position.total < 2) return null;
  return (
    <div className="project-modal__nav">
      <button type="button" className="project-modal__icon-btn" onClick={onPrev} aria-label={t.modal.previous}>
        {PREV_ICON}
      </button>
      <span className="project-modal__count" aria-live="polite">
        {pad(position.current)} / {pad(position.total)}
      </span>
      <button type="button" className="project-modal__icon-btn" onClick={onNext} aria-label={t.modal.next}>
        {NEXT_ICON}
      </button>
    </div>
  );
}

function ProjectContent({ project, titleId }: { project: ProjectItem; titleId: string }) {
  const lang = useLang();
  const t = useT();
  const details = project.details[lang];
  return (
    <>
      <ModalHeader project={project} />

      <div className="project-modal__body">
        <div className="project-modal__main">
          <span className="project-modal__index">{project.index}</span>
          <h3 id={titleId} className="project-modal__title">
            {project.title}
          </h3>
          <p className="project-modal__lead">{project.description[lang]}</p>

          <h4 className="project-modal__label">{t.modal.challenge}</h4>
          <p className="project-modal__text">{details.challenge}</p>

          <h4 className="project-modal__label">{t.modal.solution}</h4>
          <p className="project-modal__text">{details.solution}</p>
        </div>

        <aside className="project-modal__side">
          <h4 className="project-modal__label">{t.modal.highlights}</h4>
          <ul className="project-modal__features">
            {details.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <h4 className="project-modal__label">{t.modal.stack}</h4>
          <TechList tech={project.tech} />

          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-modal__cta">
              {t.modal.visit} {ARROW_ICON}
            </a>
          )}
        </aside>
      </div>
    </>
  );
}

export default function ProjectModal({ project, layoutId, position, direction, onPrev, onNext, onClose }: ProjectModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const titleId = `project-modal-title-${project.id}`;
  useFocusTrap(panelRef, true, onClose);
  useArrowKeys(onPrev, onNext);
  usePausedPageScroll();

  return createPortal(
    <div className="project-modal">
      <motion.div className="project-modal__backdrop" onClick={onClose} {...fadeIn} />

      <motion.div
        ref={panelRef}
        layoutId={layoutId}
        className="project-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        <ProjectNav position={position} onPrev={onPrev} onNext={onNext} />
        <button type="button" className="project-modal__icon-btn project-modal__close" onClick={onClose} aria-label={t.modal.close}>
          {CLOSE_ICON}
        </button>

        <AnimatePresence mode="wait" custom={direction}>
          {/* keyed per project: each one gets a fresh scroll box, so browsing
              always lands at the top. data-lenis-prevent lets it scroll
              natively while Lenis is paused. */}
          <motion.div
            key={project.id}
            className="project-modal__scroll"
            data-lenis-prevent
            custom={direction}
            variants={contentSlide}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ProjectContent project={project} titleId={titleId} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body,
  );
}
