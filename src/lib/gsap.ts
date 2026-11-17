import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Registered once at module load — registering inside a component would run
// again on every render.
gsap.registerPlugin(ScrollTrigger, useGSAP);

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const FULL_MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger, useGSAP };
