import { useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useT } from '../i18n/langStore';
import './SocialDock.css';

interface SocialLink {
  /** Stable id — names the CSS modifier class, whatever the language. */
  id: string;
  title: string;
  href: string;
  icon: string;
  /** The network's own colour, which the icon takes on hover or focus. */
  brand: string;
  external?: boolean;
}

/** Instagram's brand colour is a gradient, which a flat `color` can't express:
 * the icon carries it as an SVG gradient, applied to its stroke on hover (see
 * .social-dock__link--instagram in the CSS). userSpaceOnUse spans the gradient
 * across the whole icon rather than restarting on each shape. */
const INSTAGRAM_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="social-dock-instagram" gradientUnits="userSpaceOnUse" x1="2" y1="22" x2="22" y2="2"><stop offset="0" stop-color="#FEDA75" /><stop offset="0.3" stop-color="#FA7E1E" /><stop offset="0.55" stop-color="#D62976" /><stop offset="0.8" stop-color="#962FBF" /><stop offset="1" stop-color="#4F5BD5" /></linearGradient></defs><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>`;

const SOCIALS: SocialLink[] = [
  {
    id: 'github',
    title: 'GitHub',
    href: 'https://github.com/ArbenS90',
    // GitHub's mark is black; on this dark UI it uses its official light variant
    brand: 'var(--brand-github)',
    external: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>`,
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/in/santiago-arango-benjumea-383864219/',
    brand: '#0A66C2',
    external: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>`,
  },
  {
    id: 'instagram',
    title: 'Instagram',
    href: 'https://www.instagram.com/arbendev/',
    brand: '#D62976',
    external: true,
    icon: INSTAGRAM_ICON,
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    href: 'https://wa.me/573001234567',
    brand: '#25D366',
    external: true,
    icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" /></svg>`,
  },
  {
    id: 'email',
    // replaced by the translated word at render time (messages.social.email)
    title: 'Email',
    href: 'mailto:hola@arben.dev',
    // not a brand of its own — uses the site's accent
    brand: 'var(--brand-cyan)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>`,
  },
];

// matches the reference implementation's magnet curve exactly: 40→80px over a
// ±150px catchment around the cursor, eased by the same spring config
const BASE_SIZE = 40;
const HOVER_SIZE = 80;
const MAGNET_RANGE = 150;
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

interface DockIconProps extends SocialLink {
  mouseX: MotionValue<number>;
}

// The magnify effect is deliberately not gated behind prefers-reduced-motion:
// it only ever reacts to the reader's own cursor and settles back the instant
// they move away, the same reasoning already applied to the hero's scroll-
// driven growth — see KineticHeroName.tsx.
function DockIcon({ id, title, href, icon, brand, external, mouseX }: DockIconProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  const widthTransform = useTransform(distance, [-MAGNET_RANGE, 0, MAGNET_RANGE], [BASE_SIZE, HOVER_SIZE, BASE_SIZE]);
  const width = useSpring(widthTransform, SPRING);
  const iconSize = useTransform(width, (w) => w / 2);

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      aria-label={title}
      className={`social-dock__link social-dock__link--${id}`}
      style={{ '--brand': brand } as CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.span ref={ref} style={{ width, height: width }} className="social-dock__bubble">
        <motion.span
          style={{ width: iconSize, height: iconSize }}
          className="social-dock__icon"
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      </motion.span>
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 2, x: '-50%' }}
            className="social-dock__tip"
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}

export default function SocialDock() {
  const mouseX = useMotionValue(Infinity);
  const t = useT();

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="social-dock"
    >
      {SOCIALS.map((item) => (
        <DockIcon key={item.id} mouseX={mouseX} {...item} title={item.id === 'email' ? t.social.email : item.title} />
      ))}
    </motion.div>
  );
}
