import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type RefObject } from 'react';
import { palettesFor, type AccentPalette } from '../lib/accent';
import { setAccent, useAccent } from '../lib/accentStore';
import { toggleMode, useMode } from '../lib/modeStore';
import { arrowTarget } from '../lib/rovingFocus';
import { LANGS, formatMessage, type Lang } from '../i18n/lang';
import { setLang, useLang, useT } from '../i18n/langStore';
import './SiteControls.css';

/** Each language is named in itself, as language pickers conventionally do. */
const LANG_NAMES: Readonly<Record<Lang, string>> = { en: 'English', es: 'Español' };

const swatchStyle = (palette: AccentPalette): CSSProperties => ({
  background: `linear-gradient(135deg, ${palette.deep}, ${palette.bright})`,
});

function LangSwitch() {
  const lang = useLang();
  const t = useT();
  return (
    <div className="site-controls__lang" role="group" aria-label={t.controls.language}>
      {LANGS.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          className="site-controls__lang-btn"
          aria-pressed={lang === code}
          aria-label={LANG_NAMES[code]}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Closes the popover on Escape (handing focus back to the trigger) and on a
 * press anywhere outside `rootRef`. */
function useDismiss(rootRef: RefObject<HTMLElement | null>, triggerRef: RefObject<HTMLElement | null>, open: boolean, close: () => void): void {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [rootRef, triggerRef, open, close]);
}

interface SwatchesProps {
  id: string;
  onPicked: () => void;
}

/** The accent options as a radio group: arrows move focus, Enter/Space pick. */
function Swatches({ id, onPicked }: SwatchesProps) {
  const accent = useAccent();
  const palettes = palettesFor(useMode());
  const t = useT();
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const checkedIndex = Math.max(0, palettes.findIndex((a) => a.id === accent));

  // opening lands on the current choice, as a radio group should — only on
  // mount, so later re-renders never steal focus back
  const initialIndex = useRef(checkedIndex);
  useEffect(() => {
    swatchRefs.current[initialIndex.current]?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const from = swatchRefs.current.findIndex((el) => el === document.activeElement);
    const to = arrowTarget(e.key, Math.max(0, from), palettes.length);
    if (to === null) return;
    e.preventDefault();
    swatchRefs.current[to]?.focus();
  };

  const pick = (palette: AccentPalette) => {
    setAccent(palette.id);
    onPicked();
  };

  return (
    <div id={id} className="site-controls__popover" role="radiogroup" aria-label={t.controls.accentOptions} onKeyDown={onKeyDown}>
      {palettes.map((palette, i) => (
        <button
          key={palette.id}
          ref={(el) => {
            swatchRefs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={palette.id === accent}
          aria-label={t.controls.accents[palette.id]}
          title={t.controls.accents[palette.id]}
          tabIndex={i === checkedIndex ? 0 : -1}
          className="site-controls__swatch"
          style={swatchStyle(palette)}
          onClick={() => pick(palette)}
        />
      ))}
    </div>
  );
}

function AccentPicker() {
  const [open, setOpen] = useState(false);
  const accent = useAccent();
  const t = useT();
  const popoverId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, triggerRef, open, close);

  return (
    <div ref={rootRef} className="site-controls__accent">
      <button
        ref={triggerRef}
        type="button"
        className="site-controls__accent-btn"
        aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        aria-label={formatMessage(t.controls.accentCurrent, { name: t.controls.accents[accent] })}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="site-controls__dot" aria-hidden="true" />
      </button>
      {open && (
        <Swatches
          id={popoverId}
          onPicked={() => {
            close();
            triggerRef.current?.focus();
          }}
        />
      )}
    </div>
  );
}

const SUN_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/** Sun in dark mode, moon in light mode: the icon shows where a press leads,
 * and the label states that action. */
function ModeToggle() {
  const mode = useMode();
  const t = useT();
  const label = mode === 'dark' ? t.controls.toLight : t.controls.toDark;
  return (
    <button type="button" className="site-controls__mode-btn" aria-label={label} title={label} onClick={toggleMode}>
      {mode === 'dark' ? SUN_ICON : MOON_ICON}
    </button>
  );
}

/** Fixed top-right pill: language switch, colour mode toggle and accent colour picker. */
export default function SiteControls() {
  const t = useT();
  return (
    <div className="site-controls" role="group" aria-label={t.controls.label}>
      <LangSwitch />
      <span className="site-controls__divider" aria-hidden="true" />
      <ModeToggle />
      <AccentPicker />
    </div>
  );
}
