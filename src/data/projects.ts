import type { Localized } from '../i18n/lang';

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
  description: Localized<string>;
  /** Live site — the modal's "Visit site" button links here. */
  url?: string;
  /** Header image for the modal (e.g. the site's own og:image, saved under
   * public/projects/). Without one the modal shows a branded placeholder. */
  image?: string;
  details: Localized<ProjectDetails>;
}

// TODO(santiago): every `details` block below is a DRAFT written only from the
// one-line descriptions that already existed — no facts were added. Replace
// them with what was really built, and add an `image` per project if you can.
// The Spanish copy is a direct translation of the English — no facts added.
export const projects: ProjectItem[] = [
  {
    id: 'arango-dental-clinic',
    index: '01',
    tech: ['Astro', 'SEO'],
    title: 'Arango Dental Clinic',
    description: {
      en: 'A dental clinic in Benidorm, Spain — minimalist, trust-first visuals, a full service showcase, and a direct line to WhatsApp.',
      es: 'Una clínica dental en Benidorm, España — estética minimalista que inspira confianza, una muestra completa de servicios y contacto directo por WhatsApp.',
    },
    url: 'https://www.arangodentalclinic.es/',
    details: {
      en: {
        challenge: 'A dental clinic in Benidorm, Spain, needed a website that earns patients’ trust before their first visit.',
        solution: 'A minimalist site built with Astro, with trust-first visuals and a structure prepared for search engines.',
        features: ['Full showcase of the clinic’s services', 'Direct line to WhatsApp', 'SEO-ready structure'],
      },
      es: {
        challenge: 'Una clínica dental en Benidorm, España, necesitaba un sitio web que se ganara la confianza de los pacientes antes de su primera visita.',
        solution: 'Un sitio minimalista construido con Astro, con una estética que inspira confianza y una estructura preparada para los motores de búsqueda.',
        features: ['Muestra completa de los servicios de la clínica', 'Contacto directo por WhatsApp', 'Estructura optimizada para SEO'],
      },
    },
  },
  {
    id: 'rdg-accounting',
    index: '02',
    tech: ['Astro'],
    title: 'RDG Accounting Group',
    description: {
      en: 'A bilingual accounting and tax firm — service showcase, consultation booking, and WhatsApp-driven course inquiries in English and Spanish.',
      es: 'Una firma bilingüe de contabilidad e impuestos — muestra de servicios, reserva de consultas y consultas sobre cursos por WhatsApp, en inglés y español.',
    },
    url: 'https://www.rdgaccountinggroup.com/en',
    details: {
      en: {
        challenge: 'An accounting and tax firm serving clients in English and Spanish needed one site that works for both.',
        solution: 'A bilingual Astro site that presents the firm’s services and turns visits into consultations and course inquiries.',
        features: ['English and Spanish versions', 'Service showcase', 'Consultation booking', 'WhatsApp-driven course inquiries'],
      },
      es: {
        challenge: 'Una firma de contabilidad e impuestos con clientes en inglés y español necesitaba un solo sitio que funcionara para ambos.',
        solution: 'Un sitio bilingüe en Astro que presenta los servicios de la firma y convierte las visitas en consultas y solicitudes de información sobre cursos.',
        features: ['Versiones en inglés y español', 'Muestra de servicios', 'Reserva de consultas', 'Consultas sobre cursos por WhatsApp'],
      },
    },
  },
  {
    id: 'certcol',
    index: '03',
    tech: ['Next.js'],
    title: 'certCol',
    description: {
      en: 'A lead-gen platform for selling Colombian CID investment certificates — a multi-step valuation form with DIAN validation and Habeas Data compliance.',
      es: 'Una plataforma de captación de clientes para vender certificados de inversión CID colombianos — un formulario de valoración por pasos con validación DIAN y cumplimiento de Habeas Data.',
    },
    url: 'https://www.certcol.co/',
    image: '/projects/certcol.webp',
    details: {
      en: {
        challenge: 'Selling Colombian CID investment certificates requires capturing qualified leads while meeting Colombian data regulations.',
        solution: 'A Next.js lead-generation platform built around a guided, multi-step valuation form.',
        features: ['Multi-step valuation form', 'DIAN validation', 'Habeas Data compliance'],
      },
      es: {
        challenge: 'Vender certificados de inversión CID colombianos exige captar clientes potenciales calificados cumpliendo la normativa colombiana de datos.',
        solution: 'Una plataforma de captación de clientes en Next.js construida en torno a un formulario de valoración guiado por pasos.',
        features: ['Formulario de valoración por pasos', 'Validación DIAN', 'Cumplimiento de Habeas Data'],
      },
    },
  },
];
