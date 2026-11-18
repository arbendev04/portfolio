import Lenis from 'lenis';
import { ScrollTrigger } from './gsap';

let lenis: Lenis | null = null;

export function initLenis(): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    touchMultiplier: 2,
  });

  // keeps ScrollTrigger's positions in step with Lenis' smoothed scroll
  lenis.on('scroll', ScrollTrigger.update);

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export interface ScrollToSectionOptions {
  /** Jump instead of animating (reduced motion). */
  immediate?: boolean;
  /** Runs once the scroll has landed (right away when Lenis isn't running). */
  onComplete?: () => void;
}

export function scrollToSection(target: Element, { immediate = false, onComplete }: ScrollToSectionOptions = {}): void {
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset: 0, immediate, onComplete });
  } else {
    target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
    onComplete?.();
  }
}
