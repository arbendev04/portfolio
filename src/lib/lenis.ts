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

export function scrollToSection(target: Element): void {
  if (lenis) {
    lenis.scrollTo(target as HTMLElement, { offset: 0 });
  } else {
    target.scrollIntoView({ behavior: 'smooth' });
  }
}
