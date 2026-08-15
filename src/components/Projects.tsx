import { motion } from 'framer-motion';
import HoverLetters from './HoverLetters';
import ProjectsGrid, { type ProjectItem } from './ProjectsGrid';
import { fadeUp, revealViewport } from '../lib/motion';
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
    id: 'concierge-bot',
    index: '02',
    tech: ['WhatsApp API', 'n8n', 'Supabase'],
    title: 'Concierge Bot',
    description: 'An automated sales and support agent running 24/7, wired straight into a live CRM.',
  },
  {
    id: 'flujo-ai',
    index: '03',
    tech: ['Python', 'n8n', 'OpenAI'],
    title: 'Flujo AI',
    description: 'An AI workflow that triages incoming leads and drafts replies in seconds.',
  },
];

export default function Projects() {
  return (
    <section data-section className="work">
      <motion.div
        className="work__header"
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        variants={fadeUp}
      >
        <div className="work__eyebrow">[ 02 ] — selected work</div>
        <HoverLetters as="h2" className="work__title" text="Things I have built." />
      </motion.div>

      <motion.div initial="hidden" whileInView="visible" viewport={revealViewport} variants={fadeUp}>
        <ProjectsGrid items={projects} />
      </motion.div>
    </section>
  );
}
