import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HoverLetters from './HoverLetters';
import ProjectsGrid, { type ProjectItem } from './ProjectsGrid';
import './Projects.css';

const projects: ProjectItem[] = [
  {
    id: 'arango-dental-clinic',
    index: '01',
    tech: ['Astro', 'SEO'],
    title: 'Arango Dental Clinic',
    description: 'A dental clinic in Benidorm, Spain — minimalist, trust-first visuals, a full service showcase, and a direct line to WhatsApp.',
    url: 'https://www.arangodentalclinic.es/',
  },
  {
    id: 'rdg-accounting',
    index: '02',
    tech: ['Astro'],
    title: 'RDG Accounting Group',
    description: 'A bilingual accounting and tax firm — service showcase, consultation booking, and WhatsApp-driven course inquiries in English and Spanish.',
    url: 'https://www.rdgaccountinggroup.com/en',
  },
  {
    id: 'certcol',
    index: '03',
    tech: ['Next.js'],
    title: 'certCol',
    description: 'A lead-gen platform for selling Colombian CID investment certificates — a multi-step valuation form with DIAN validation and Habeas Data compliance.',
    url: 'https://www.certcol.co/',
    // certcol.co sends X-Frame-Options: DENY — it refuses to render inside any
    // iframe, so this falls back to a static image instead.
    noPreview: true,
    previewImage: '/projects/certcol.webp',
  },
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
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
    <section data-section ref={sectionRef} className="work">
      {/* The eyebrow keeps the scroll-scrubbed fade tied to scrollYProgress, but the
          title is left unwrapped: HoverLetters drives its own blur-in reveal on
          whileInView, and nesting it inside a still-fading-in parent would let that
          reveal finish while the parent was still invisible. */}
      <div className="work__header">
        <motion.div className="work__eyebrow" style={{ opacity: headerOpacity, y: headerY }}>
          [ 02 ] — selected work
        </motion.div>
        <HoverLetters as="h2" className="work__title" text="Things I have built." />
      </div>

      <motion.div style={{ opacity: gridOpacity, y: gridY }}>
        <ProjectsGrid items={projects} />
      </motion.div>
    </section>
  );
}
