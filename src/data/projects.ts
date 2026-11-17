export interface ProjectDetails {
  /** What the client needed — one or two sentences. */
  challenge: string;
  /** What was built to solve it. */
  solution: string;
  /** Concrete things the site does, shown as a list. */
  features: string[];
}

export interface ProjectItem {
  id: string;
  index: string;
  /** Each tag renders with an icon when one exists in the shared techIcons map. */
  tech: string[];
  title: string;
  /** One line, shown on the card itself. */
  description: string;
  /** Live site — the modal's "Visit site" button links here. */
  url?: string;
  /** Header image for the modal (e.g. the site's own og:image, saved under
   * public/projects/). Without one the modal shows a branded placeholder. */
  image?: string;
  details: ProjectDetails;
}

// TODO(santiago): every `details` block below is a DRAFT written only from the
// one-line descriptions that already existed — no facts were added. Replace
// them with what was really built, and add an `image` per project if you can.
export const projects: ProjectItem[] = [
  {
    id: 'arango-dental-clinic',
    index: '01',
    tech: ['Astro', 'SEO'],
    title: 'Arango Dental Clinic',
    description: 'A dental clinic in Benidorm, Spain — minimalist, trust-first visuals, a full service showcase, and a direct line to WhatsApp.',
    url: 'https://www.arangodentalclinic.es/',
    details: {
      challenge: 'A dental clinic in Benidorm, Spain, needed a website that earns patients’ trust before their first visit.',
      solution: 'A minimalist site built with Astro, with trust-first visuals and a structure prepared for search engines.',
      features: ['Full showcase of the clinic’s services', 'Direct line to WhatsApp', 'SEO-ready structure'],
    },
  },
  {
    id: 'rdg-accounting',
    index: '02',
    tech: ['Astro'],
    title: 'RDG Accounting Group',
    description: 'A bilingual accounting and tax firm — service showcase, consultation booking, and WhatsApp-driven course inquiries in English and Spanish.',
    url: 'https://www.rdgaccountinggroup.com/en',
    details: {
      challenge: 'An accounting and tax firm serving clients in English and Spanish needed one site that works for both.',
      solution: 'A bilingual Astro site that presents the firm’s services and turns visits into consultations and course inquiries.',
      features: ['English and Spanish versions', 'Service showcase', 'Consultation booking', 'WhatsApp-driven course inquiries'],
    },
  },
  {
    id: 'certcol',
    index: '03',
    tech: ['Next.js'],
    title: 'certCol',
    description: 'A lead-gen platform for selling Colombian CID investment certificates — a multi-step valuation form with DIAN validation and Habeas Data compliance.',
    url: 'https://www.certcol.co/',
    image: '/projects/certcol.webp',
    details: {
      challenge: 'Selling Colombian CID investment certificates requires capturing qualified leads while meeting Colombian data regulations.',
      solution: 'A Next.js lead-generation platform built around a guided, multi-step valuation form.',
      features: ['Multi-step valuation form', 'DIAN validation', 'Habeas Data compliance'],
    },
  },
];
