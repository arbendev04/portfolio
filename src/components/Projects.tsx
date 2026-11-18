import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HoverLetters from './HoverLetters';
import ProjectsGrid from './ProjectsGrid';
import TravelingGlobe from './TravelingGlobe';
import { groupProjects, projects, type ProjectItem } from '../data/projects';
import { useLang, useT } from '../i18n/langStore';
import './Projects.css';

const { client, personal } = groupProjects(projects);

interface ProjectGroupProps {
  id: string;
  label: string;
  items: ProjectItem[];
}

/** One labelled group of cards. Each group is its own grid, so the modal's
 * prev / next arrows only browse within it. Empty groups render nothing. */
function ProjectGroup({ id, label, items }: ProjectGroupProps) {
  if (items.length === 0) return null;
  const headingId = `${id}-heading`;
  return (
    <section className="work__group" aria-labelledby={headingId}>
      <h3 id={headingId} className="work__group-label">
        {label}
      </h3>
      <ProjectsGrid id={id} items={items} />
    </section>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const lang = useLang();
  const t = useT();
  // Scroll-scrubbed instead of a once-off whileInView trigger: progress ties
  // directly to scroll position, the same way the hero's own fade is driven,
  // so this section is already catching up by the time the hero recedes
  // instead of popping in afterwards on a separate trigger.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start center'],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.6], [40, 0]);

  // starts a little after the header and finishes a little later, so the
  // grid trails in behind the heading instead of arriving in lockstep
  const gridOpacity = useTransform(scrollYProgress, [0.2, 0.85], [0, 1]);
  const gridY = useTransform(scrollYProgress, [0.2, 0.85], [50, 0]);

  return (
    <section data-section ref={sectionRef} className="work work--cover">
      {/* background here, then travels to dock beside the tech stack */}
      <TravelingGlobe />
      {/* The eyebrow keeps the scroll-scrubbed fade tied to scrollYProgress, but the
          title is left unwrapped: HoverLetters drives its own letter-by-letter
          reveal on scroll, and nesting it inside a still-fading-in parent would let that
          reveal finish while the parent was still invisible. */}
      <div className="work__header">
        <motion.div className="work__eyebrow" style={{ opacity: headerOpacity, y: headerY }}>
          {t.projects.eyebrow}
        </motion.div>
        {/* keyed by language: remounting replays the letter entrance for the new text */}
        <HoverLetters key={lang} as="h2" className="work__title" text={t.projects.title} />
      </div>

      <motion.div className="work__groups" style={{ opacity: gridOpacity, y: gridY }}>
        <ProjectGroup id="projects-client" label={t.projects.clientGroup} items={client} />
        <ProjectGroup id="projects-personal" label={t.projects.personalGroup} items={personal} />
      </motion.div>
    </section>
  );
}
