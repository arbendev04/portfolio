import { useEffect, useRef, type CSSProperties } from 'react';
import createGlobe from 'cobe';
import { backgroundRect, dockProgress, enterProgress, lerpRect, stageOpacity, sway } from '../lib/globeTravel';
import { REDUCED_MOTION_QUERY } from '../lib/gsap';
import { accentStore, currentPalette } from '../lib/accentStore';
import { modeStore } from '../lib/modeStore';
import { globeLook } from '../lib/sceneColors';
import { useT } from '../i18n/langStore';
import type { Messages } from '../i18n/messages';
import './TravelingGlobe.css';

interface Place {
  /** Also the key of the place's (translated) label in messages.globe. */
  id: keyof Messages['globe'];
  location: [number, number];
}

const HOME: Place = { id: 'medellin', location: [6.2442, -75.5812] };
const PLACES: Place[] = [
  HOME,
  { id: 'miami', location: [25.7617, -80.1918] },
  { id: 'spain', location: [40.4168, -3.7038] },
];
const ARCS = PLACES.filter((p) => p !== HOME).map((p) => ({ id: `${HOME.id}-${p.id}`, from: HOME.location, to: p.location }));

/** Rotation that puts the mid-Atlantic in front, so all three places show. */
const FOCUS_PHI = 5.5;
const FOCUS_THETA = 0.3;
const AUTO_SPEED = 0.0025;
/** Extra rotation per px scrolled. */
const SCROLL_SPIN = 0.0016;
const TWO_PI = Math.PI * 2;

/** The dock slot lives in the tech stack section, a different component. */
const SLOT_SELECTOR = '[data-globe-slot]';
/** The first section after the tech stack. Its rising into view starts the
 * last leg, so the globe leaves the dock while the slot is still on screen and
 * then stays a faint background through every section after it (credentials,
 * contact). Driving it from a later section instead would let the docked globe
 * scroll away with the tech stack and fly back in from above. */
const FINAL_SELECTOR = '[data-globe-final]';

/** Equivalent of `target` closest to `current`, so easing never spins the long way round. */
const nearestTurn = (current: number, target: number) => target + TWO_PI * Math.round((current - target) / TWO_PI);

/** The globe's colours for the current accent and colour mode. */
const currentLook = () => globeLook(currentPalette(), modeStore.get());

function startGlobe(canvas: HTMLCanvasElement, size: number) {
  return createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width: size,
    height: size,
    phi: FOCUS_PHI,
    theta: FOCUS_THETA,
    diffuse: 1.2,
    mapSamples: 16000,
    ...currentLook(),
    arcWidth: 0.6,
    arcHeight: 0.3,
    markerElevation: 0.02,
    opacity: 0.85,
    markers: PLACES.map((p) => ({ id: p.id, location: p.location, size: p.id === HOME.id ? 0.06 : 0.045 })),
    arcs: ARCS,
  });
}

/**
 * One globe that travels through three stops as the page scrolls:
 *   1. a large, faint background behind the project cards, spinning freely;
 *   2. docked into the slot beside the tech stack, where hovering it reveals
 *      where Santiago works;
 *   3. grown again into a faint background behind the credentials and the
 *      contact form, with the three places always labelled.
 * At stops 2 and 3 it sways gently around the Atlantic instead of spinning,
 * so it keeps moving even when the page doesn't, without ever turning the
 * labelled places away.
 *
 * The canvas renders once at the background size and is only moved and scaled
 * with transforms from then on. Each frame interpolates between the stops'
 * rects — the dock one measured live — so while docked it follows the slot.
 */
export default function TravelingGlobe() {
  const t = useT();
  const clipRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const clip = clipRef.current;
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const section = clip?.closest('section');
    const slot = document.querySelector<HTMLElement>(SLOT_SELECTOR);
    const contact = document.querySelector<HTMLElement>(FINAL_SELECTOR);
    if (!clip || !layer || !canvas || !section || !slot) return;

    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let size = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;
    let frame = 0;
    let spin = FOCUS_PHI;

    const build = () => {
      globe?.destroy();
      size = Math.round(backgroundRect(window.innerWidth, window.innerHeight).size);
      layer.style.width = `${size}px`;
      layer.style.height = `${size}px`;
      globe = startGlobe(canvas, size);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const vh = window.innerHeight;
      const slotRect = slot.getBoundingClientRect();
      const dockRect = { x: slotRect.left, y: slotRect.top, size: slotRect.width };
      const bgRect = backgroundRect(window.innerWidth, vh);

      // leg 1 → 2 is driven by the dock slot, leg 2 → 3 by the contact section
      // rising into view; reduced motion just stays docked
      const dockT = reduced ? 1 : dockProgress(slotRect.top, slotRect.height, vh);
      const contactT = reduced || !contact ? 0 : enterProgress(contact.getBoundingClientRect().top, vh);
      const rect = contactT > 0 ? lerpRect(dockRect, bgRect, contactT) : lerpRect(bgRect, dockRect, dockT);

      // while the projects sheet is still sliding up, cut the globe off at the
      // sheet's top edge so it never shows over the hero behind it
      const clipTop = Math.max(0, section.getBoundingClientRect().top);
      clip.style.clipPath = `inset(${clipTop}px 0 0 0)`;
      if (clipTop >= vh || rect.y + rect.size < 0) return; // nothing on screen

      layer.style.transform = `translate(${rect.x}px, ${rect.y}px) scale(${rect.size / size})`;
      layer.style.opacity = String(reduced ? 1 : stageOpacity(dockT, contactT));
      layer.classList.toggle('is-docked', dockT > 0.98 && contactT < 0.02);
      layer.classList.toggle('is-contact', contactT > 0.6);

      if (!reduced) spin += AUTO_SPEED;
      const freePhi = spin + window.scrollY * (reduced ? 0 : SCROLL_SPIN);
      // free spin as a background; near the dock (and from then on) it eases
      // into a gentle sway around the focus view instead
      const target = FOCUS_PHI + (reduced ? 0 : sway(now / 1000));
      const settle = Math.max(dockT * dockT, contactT);
      const phi = freePhi + (nearestTurn(freePhi, target) - freePhi) * settle;
      globe?.update({ phi, theta: FOCUS_THETA });
    };

    build();
    frame = requestAnimationFrame(tick);
    window.addEventListener('resize', build);
    // recolours the running globe in place — no rebuild, no remount
    const recolor = () => globe?.update(currentLook());
    const unsubscribeAccent = accentStore.subscribe(recolor);
    const unsubscribeMode = modeStore.subscribe(recolor);
    return () => {
      cancelAnimationFrame(frame);
      unsubscribeAccent();
      unsubscribeMode();
      window.removeEventListener('resize', build);
      globe?.destroy();
    };
  }, []);

  return (
    <div ref={clipRef} className="traveling-globe" aria-hidden="true">
      <div ref={layerRef} className="traveling-globe__layer">
        <canvas ref={canvasRef} className="traveling-globe__canvas" />
        {/* only shown while the docked globe is hovered (see the CSS) */}
        <div className="traveling-globe__labels">
          {PLACES.map((place) => (
            <span
              key={place.id}
              className="traveling-globe__label"
              style={
                {
                  // pinned to the anchor cobe keeps on this marker
                  positionAnchor: `--cobe-${place.id}`,
                  // cobe defines --cobe-visible-<id> (as a deliberately invalid
                  // value) only while the marker faces the viewer: then this
                  // resolves to opacity's initial 1, otherwise to the 0 fallback
                  opacity: `var(--cobe-visible-${place.id}, 0)`,
                } as CSSProperties
              }
            >
              {t.globe[place.id]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
