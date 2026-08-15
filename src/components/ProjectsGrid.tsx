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
  /** Live site rendered as a preview inside the card. Cards without one just
   * show the plain dark surface, so it's safe to leave unset until a real
   * URL is on hand. It also turns the title into a link out to the site. */
  url?: string;
}

interface Layout {
  row1: string[];
  row2: string[];
}

function initialLayout(items: ProjectItem[]): Layout {
  const ids = items.map((item) => item.id);
  return {
    row1: ids.slice(0, 2),
    row2: ids.slice(2, Math.min(items.length, 4)),
  };
}

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
  const [layout, setLayout] = useState<Layout>(() => initialLayout(items));

  const handleExpand = (itemId: string) => {
    const inRow1 = layout.row1.includes(itemId);
    const row = inRow1 ? layout.row1 : layout.row2;
    if (row.length === 1) return;

    const neighbor = row.find((candidate) => candidate !== itemId)!;
    setLayout(
      inRow1
        ? { row1: [itemId], row2: [neighbor, ...layout.row2.filter((c) => c !== neighbor)].slice(0, 2) }
        : { row1: [neighbor, ...layout.row1.filter((c) => c !== neighbor)].slice(0, 2), row2: [itemId] },
    );
  };

  return (
    <LayoutGroup id={id}>
      <motion.div layout className="projects-grid">
        {items.map((item) => {
          const inRow1 = layout.row1.includes(item.id);
          const row = inRow1 ? layout.row1 : layout.row2;
          const isExpanded = row.length === 1 && row[0] === item.id;

          return (
            <motion.div
              key={item.id}
              layoutId={`${id}-${item.id}`}
              onClick={() => handleExpand(item.id)}
              style={{ gridRow: inRow1 ? 1 : 2, gridColumn: isExpanded ? '1 / -1' : String(row.indexOf(item.id) + 1) }}
              className={`projects-grid__card${isExpanded ? ' projects-grid__card--expanded' : ''}`}
              transition={{ layout: { type: 'spring', stiffness: 260, damping: 30 } }}
            >
              {item.url && (
                <div className="projects-grid__preview" aria-hidden="true">
                  <iframe
                    src={item.url}
                    title=""
                    tabIndex={-1}
                    loading="lazy"
                    sandbox=""
                    className="projects-grid__preview-frame"
                  />
                </div>
              )}
              <div className="projects-grid__scrim" />
              <motion.div layout="position" className="projects-grid__content">
                <span className="projects-grid__index">{item.index}</span>
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
                <h3 className="projects-grid__title">
                  {item.url ? (
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
                    </a>
                  ) : (
                    item.title
                  )}
                  <span className="projects-grid__arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>
                  </span>
                </h3>
                <p className="projects-grid__desc">{item.description}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}
