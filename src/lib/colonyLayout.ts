import type { Rect, Vec } from './agentColony';

const FONT = '700 100px "Space Grotesk", sans-serif';
/** Brick grid spacing, scaled with the word so a big word doesn't turn into
 * thousands of agents, and a small one keeps enough bricks to stay legible. */
const MIN_STEP = 4;
const MAX_STEP = 14;
const FONT_PER_STEP = 24;

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

  const step = Math.min(MAX_STEP, Math.max(MIN_STEP, Math.round(fontSize / FONT_PER_STEP)));
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
