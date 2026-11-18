import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { ProjectItem } from '../data/projects';
import { icons } from '../data/techIcons';
import { useSpotlight } from '../lib/spotlight';
import { wrapIndex } from '../lib/wrapIndex';
import ProjectModal from './ProjectModal';
import { useLang } from '../i18n/langStore';
import './ProjectsGrid.css';

interface ProjectsGridProps {
  items: ProjectItem[];
  id?: string;
}

const ARROW = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </svg>
);

function TechTags({ tech }: { tech: string[] }) {
  return (
    <div className="projects-grid__tech">
      {tech.map((tag, i) => (
        <span key={tag} className="projects-grid__tech-tag">
          {icons[tag] && (
            // static, developer-authored SVG strings from techIcons — not user input
            <span className="projects-grid__tech-icon" dangerouslySetInnerHTML={{ __html: icons[tag] }} />
          )}
          {tag}
          {i < tech.length - 1 && <span className="projects-grid__tech-sep">·</span>}
        </span>
      ))}
    </div>
  );
}

interface OpenState {
  /** Card the modal grew out of — it shrinks back into this one on close. */
  originId: string;
  /** Project currently shown, which changes while browsing. */
  index: number;
  /** +1 / -1: which way the last step went, for the slide direction. */
  direction: number;
}

/** Project cards; clicking one grows it into a modal with the full story,
 * where you can then browse to the other projects without closing it. */
export default function ProjectsGrid({ items, id = 'projects-grid' }: ProjectsGridProps) {
  const [open, setOpen] = useState<OpenState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lang = useLang();
  useSpotlight(gridRef, '.projects-grid__card');

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((current) => current && { ...current, index: wrapIndex(current.index, delta, items.length), direction: delta }),
    [items.length],
  );
  const prev = useCallback(() => step(-1), [step]);
  const next = useCallback(() => step(1), [step]);
  const layoutIdFor = (itemId: string) => `${id}-${itemId}`;

  return (
    <LayoutGroup id={id}>
      <div ref={gridRef} className="projects-grid">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            layoutId={layoutIdFor(item.id)}
            className="projects-grid__card spotlight"
            onClick={() => setOpen({ originId: item.id, index, direction: 1 })}
            aria-haspopup="dialog"
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="projects-grid__content">
              <span className="projects-grid__index" aria-hidden="true">
                {item.index}
              </span>
              <h3 className="projects-grid__title">
                {item.title}
                <span className="projects-grid__arrow">{ARROW}</span>
              </h3>
              <TechTags tech={item.tech} />
              <p className="projects-grid__desc">{item.description[lang]}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <ProjectModal
            project={items[open.index]}
            layoutId={layoutIdFor(open.originId)}
            position={{ current: open.index + 1, total: items.length }}
            direction={open.direction}
            onPrev={prev}
            onNext={next}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
