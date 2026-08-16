import { useState, type MouseEvent } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { icons } from '../data/techIcons';
import './ProjectsGrid.css';

export interface ProjectItem {
  id: string;
  index: string;
  /** Each tag renders with an icon when one exists in the shared techIcons map. */
  tech: string[];
  title: string;
  description: string;
  /** Site to link out to once the card is expanded. Cards without one just
   * render the title as plain text instead of a link, and skip the preview
   * image entirely (there's no live site to show a picture of). */
  url?: string;
  /** Set when the site sends `X-Frame-Options: DENY` (or an equivalent
   * `frame-ancestors` CSP) — it refuses to render inside anyone's iframe, ours
   * included, and there's no client-side way around that (nor should there be,
   * it's an anti-clickjacking header). Falls back to `previewImage` instead. */
  noPreview?: boolean;
  /** Static fallback for a `noPreview` card — typically the site's own
   * og:image, saved locally under public/projects/. */
  previewImage?: string;
}

// Matches .projects-grid's grid-template-columns below — kept in one place
// so the "leftover card defaults to full width" fallback stays in sync with it.
const COLS = 3;

interface ProjectsGridProps {
  items: ProjectItem[];
  id?: string;
}

function stopCardExpand(e: MouseEvent) {
  // the link opens the site in its own tab; it shouldn't also toggle which
  // card owns the row underneath it
  e.stopPropagation();
}

export default function ProjectsGrid({ items, id = 'projects-grid' }: ProjectsGridProps) {
  // Just which card (if any) is expanded — cards are left in natural document
  // order and CSS grid auto-placement handles wrapping them into rows, so
  // there's no bookkeeping here that can lose track of an item.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // A trailing single card left dangling in its own row (item count not a
  // multiple of COLS) defaults to full width instead of sitting in one column
  // with empty cells beside it — only while nothing else is expanded.
  const trailingSoloId = items.length % COLS === 1 ? items[items.length - 1].id : null;

  const handleExpand = (itemId: string) => {
    setExpandedId((current) => (current === itemId ? null : itemId));
  };

  return (
    <LayoutGroup id={id}>
      <motion.div layout className="projects-grid">
        {items.map((item) => {
          const isExpanded = expandedId ? item.id === expandedId : item.id === trailingSoloId;
          const showIframe = isExpanded && item.url && !item.noPreview;
          const showImage = isExpanded && item.noPreview && item.previewImage;
          const hasPreview = showIframe || showImage;

          return (
            <motion.div
              key={item.id}
              layoutId={`${id}-${item.id}`}
              onClick={() => handleExpand(item.id)}
              style={isExpanded ? { gridColumn: '1 / -1' } : undefined}
              className={`projects-grid__card${isExpanded ? ' projects-grid__card--expanded' : ''}`}
              transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}
            >
              {hasPreview && (
                <div className="projects-grid__image" aria-hidden="true">
                  {showIframe ? (
                    <iframe
                      src={item.url}
                      title=""
                      tabIndex={-1}
                      loading="lazy"
                      sandbox=""
                    />
                  ) : (
                    <img src={item.previewImage} alt="" loading="lazy" />
                  )}
                </div>
              )}
              <motion.div
                layout="position"
                className={`projects-grid__content${hasPreview ? ' projects-grid__content--has-preview' : ''}`}
              >
                <span className="projects-grid__index">{item.index}</span>
                <h3 className="projects-grid__title">
                  {isExpanded && item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver sitio"
                      className="projects-grid__title-link"
                      onClick={stopCardExpand}
                    >
                      {item.title}
                      {/* purely visual — `title="Ver sitio"` above already gives
                          assistive tech the same hint as an accessible
                          description, so this stays out of the a11y tree
                          rather than get concatenated onto the link's name */}
                      <span className="projects-grid__tip" aria-hidden="true">
                        Ver sitio
                      </span>
                      <span className="projects-grid__arrow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                      </span>
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <div className="projects-grid__tech">
                  {item.tech.map((tag, i) => (
                    <span key={tag} className="projects-grid__tech-tag">
                      {icons[tag] && (
                        <span className="projects-grid__tech-icon" dangerouslySetInnerHTML={{ __html: icons[tag] }} />
                      )}
                      {tag}
                      {i < item.tech.length - 1 && <span className="projects-grid__tech-sep">·</span>}
                    </span>
                  ))}
                </div>
                <p className="projects-grid__desc">{item.description}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}
