import type { Rect, Vec } from './agentColony';

export interface ColonyLayout {
  /** Box the word is fitted into. */
  word: Rect;
  /** Box the idle swarm roams in. */
  swarm: Rect;
}

/** Below this much free width beside the name, the word moves underneath it. */
const MIN_SIDE_WIDTH = 240;
const MIN_BAND_HEIGHT = 70;
/** Keeps the bottom band clear of the "scroll" cue in the corner. */
const BOTTOM_RESERVE = 90;
const FONT = '700 100px "Space Grotesk", sans-serif';

const toLocal = (rect: DOMRect, origin: DOMRect): Rect => ({
  x: rect.left - origin.left,
  y: rect.top - origin.top,
  width: rect.width,
  height: rect.height,
});

/** Right edge of a name line's actual glyphs. The line box itself spans the
 * full width, and the letters may still be mid-entrance (transformed), so this
 * uses the last letter's untransformed layout offset rather than its rect. */
function glyphRight(line: HTMLElement, origin: DOMRect): number {
  const letters = line.querySelectorAll<HTMLElement>('.hero-letter');
  const last = letters[letters.length - 1];
  const lineLeft = line.getBoundingClientRect().left - origin.left;
  return last ? lineLeft + last.offsetLeft + last.offsetWidth : lineLeft;
}

/** Finds the free space beside the first two lines of the name (desktop) or
 * under the hero copy (narrow screens). Returns null if neither fits. */
export function measureColonyLayout(stage: HTMLElement, content: HTMLElement): ColonyLayout | null {
  const origin = stage.getBoundingClientRect();
  const lines = Array.from(content.querySelectorAll<HTMLElement>('h1 .kinetic-line')).slice(0, 2);
  if (lines.length < 2) return null;

  const [first, second] = lines.map((line) => toLocal(line.getBoundingClientRect(), origin));
  const nameRight = Math.max(...lines.map((line) => glyphRight(line, origin)));
  const gap = origin.width * 0.04;
  const sideX = nameRight + gap;
  const sideWidth = origin.width - sideX - origin.width * 0.05;

  if (sideWidth >= MIN_SIDE_WIDTH) {
    const word = { x: sideX, y: first.y, width: sideWidth, height: second.y + second.height - first.y };
    const swarm = { x: sideX - gap / 2, y: Math.max(0, first.y - 40), width: origin.width - sideX, height: word.height + 160 };
    return { word, swarm };
  }

  const contentBox = toLocal(content.getBoundingClientRect(), origin);
  const bandY = contentBox.y + contentBox.height + 16;
  const bandHeight = origin.height - bandY - BOTTOM_RESERVE;
  if (bandHeight < MIN_BAND_HEIGHT) return null;

  const pad = origin.width * 0.06;
  const word = { x: pad, y: bandY, width: origin.width - pad * 2, height: bandHeight };
  return { word, swarm: word };
}

/** Rasterises the word off-screen at the largest size that fits `box`, then
 * samples a grid over its filled pixels — every hit becomes one brick. */
export function sampleWordBricks(word: string, box: Rect): { bricks: Vec[]; step: number } {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(box.width));
  canvas.height = Math.max(1, Math.floor(box.height));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { bricks: [], step: 1 };

  ctx.font = FONT;
  const metrics = ctx.measureText(word);
  const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const scale = Math.min((box.width * 0.96) / metrics.width, (box.height * 0.9) / glyphHeight);
  const fontSize = 100 * scale;

  ctx.font = FONT.replace('100px', `${fontSize}px`);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  const textWidth = metrics.width * scale;
  const ascent = metrics.actualBoundingBoxAscent * scale;
  const descent = metrics.actualBoundingBoxDescent * scale;
  const baseline = (canvas.height - (ascent + descent)) / 2 + ascent;
  ctx.fillText(word, (canvas.width - textWidth) / 2, baseline);

  const step = Math.min(9, Math.max(4, Math.round(fontSize / 18)));
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const bricks: Vec[] = [];
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) {
        bricks.push({ x: box.x + x, y: box.y + y });
      }
    }
  }
  return { bricks, step };
}
