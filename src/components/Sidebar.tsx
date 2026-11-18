import { useEffect, useState } from 'react';
import { scrollToSection } from '../lib/lenis';
import { useT } from '../i18n/langStore';
import type { Messages } from '../i18n/messages';
import './Sidebar.css';

const socials = [
  { href: 'https://github.com/ArbenS90', label: 'GitHub', icon: 'github' },
  { href: 'https://www.linkedin.com/in/santiago-arango-benjumea-383864219/', label: 'LinkedIn', icon: 'linkedin' },
  { href: 'https://wa.me/573001234567', label: 'WhatsApp', icon: 'whatsapp' },
  { href: 'mailto:hola@arben.dev', label: 'Email', icon: 'mail' },
];

/** In page order; each is also the key of its translated name. */
const sections: ReadonlyArray<keyof Messages['sidebar']> = ['hero', 'work', 'skills', 'contact'];

function navigateTo(index: number) {
  const target = document.querySelectorAll<HTMLElement>('[data-section]')[index];
  if (target) scrollToSection(target);
}

export default function Sidebar() {
  const [active, setActive] = useState(0);
  const t = useT();

  useEffect(() => {
    const sectionEls = document.querySelectorAll<HTMLElement>('[data-section]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(sectionEls).indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActive(idx);
          }
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );

    sectionEls.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="sidebar" aria-label={t.sidebar.label}>
      <button type="button" className="sidebar__logo" onClick={() => navigateTo(0)} aria-label={t.sidebar.home}>
        <span className="sidebar__logo-text gradient-text">ArbenDev</span>
      </button>

      <nav className="sidebar__nav" aria-label={t.sidebar.sections}>
        {sections.map((key, i) => (
          <button
            key={key}
            type="button"
            className={`sidebar__dot${active === i ? ' active' : ''}`}
            onClick={() => navigateTo(i)}
            aria-label={t.sidebar[key]}
            title={t.sidebar[key]}
          />
        ))}
      </nav>

      <div className="sidebar__socials">
        <a href={socials[0].href} target="_blank" rel="noopener" aria-label="GitHub" className="sidebar__social-link">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
        </a>
        <a href={socials[1].href} target="_blank" rel="noopener" aria-label="LinkedIn" className="sidebar__social-link">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
        </a>
        <a href={socials[2].href} target="_blank" rel="noopener" aria-label="WhatsApp" className="sidebar__social-link">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" /></svg>
        </a>
        <a href={socials[3].href} aria-label={t.social.email} className="sidebar__social-link">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
        </a>
      </div>
    </aside>
  );
}
