import { wrapIndex } from './wrapIndex';

const STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** Index a keyboard key moves focus to inside a group of `count` items (as in
 * a radio group): arrows step and wrap, Home/End jump to the ends. null for
 * any other key, so the caller can leave it alone. */
export function arrowTarget(key: string, index: number, count: number): number | null {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const step = STEPS[key];
  return step === undefined ? null : wrapIndex(index, step, count);
}
