import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import {
  agentPosition,
  buildProgress,
  centeredWordBox,
  createAgents,
  repel,
  type Agent,
  type Vec,
} from '../lib/agentColony';
import { sampleWordBricks } from '../lib/colonyLayout';
import { REDUCED_MOTION_QUERY } from '../lib/gsap';
import './AgentColony.css';

interface AgentColonyProps {
  /** Hero scroll progress, 0 at the top of the runway to 1 at its end. */
  progress: MotionValue<number>;
  /** Runway share where the swarm starts gathering into the word. */
  buildStart: number;
  /** Runway share where the word is complete. It then stays until the next
   * section slides up over the hero and covers it. */
  buildEnd: number;
  word?: string;
}

interface Scene {
  agents: Agent[];
  brick: number;
  gradient: CanvasGradient;
}

const CURSOR_RADIUS = 110;
const CURSOR_PUSH = 40;
const WANDER_COLOR = 'rgba(86, 230, 255, 0.85)';
const CARRIER_COLOR = 'rgba(255, 255, 255, 0.9)';
/** Idle agents need to read clearly on the dark page before any scrolling. */
const AGENT_SIZE = 3;
/** Keeps idle agents off the very edge of the stage. */
const SWARM_MARGIN = 24;

function buildScene(ctx: CanvasRenderingContext2D, width: number, height: number, word: string): Scene {
  const box = centeredWordBox(width, height);
  const { bricks, step } = sampleWordBricks(word, box);
  const swarm = { x: SWARM_MARGIN, y: SWARM_MARGIN, width: width - SWARM_MARGIN * 2, height: height - SWARM_MARGIN * 2 };
  const gradient = ctx.createLinearGradient(box.x, box.y, box.x + box.width, box.y + box.height);
  gradient.addColorStop(0, '#1F6BFF');
  gradient.addColorStop(1, '#19D3FF');
  return { agents: createAgents(bricks, swarm), brick: Math.max(2, step - 2), gradient };
}

function drawScene(ctx: CanvasRenderingContext2D, scene: Scene, build: number, time: number, cursor: Vec | null): void {
  const half = scene.brick / 2;
  const wandering: Vec[] = [];
  const carrying: Vec[] = [];
  const placed: Vec[] = [];

  scene.agents.forEach((agent) => {
    const { pos, progress } = agentPosition(agent, build, time);
    if (progress >= 1) placed.push(pos);
    else if (progress > 0) carrying.push(pos);
    else wandering.push(repel(pos, cursor, CURSOR_RADIUS, CURSOR_PUSH));
  });

  // grouped by fill so the context switches style three times per frame,
  // not once per agent
  ctx.fillStyle = WANDER_COLOR;
  wandering.forEach((p) => ctx.fillRect(p.x - AGENT_SIZE / 2, p.y - AGENT_SIZE / 2, AGENT_SIZE, AGENT_SIZE));

  ctx.fillStyle = scene.gradient;
  placed.forEach((p) => ctx.fillRect(p.x - half, p.y - half, scene.brick, scene.brick));
  carrying.forEach((p) => ctx.fillRect(p.x - half, p.y - half, scene.brick, scene.brick));

  ctx.fillStyle = CARRIER_COLOR;
  carrying.forEach((p) => ctx.fillRect(p.x - 1, p.y - half - 3, 2, 2));
}

/** Reduced motion: nothing travels. The finished bricks simply fade in where
 * they belong as the build advances, so the word still assembles with scroll. */
function drawStill(ctx: CanvasRenderingContext2D, scene: Scene, build: number): void {
  const half = scene.brick / 2;
  ctx.globalAlpha = build;
  ctx.fillStyle = scene.gradient;
  scene.agents.forEach(({ target }) => ctx.fillRect(target.x - half, target.y - half, scene.brick, scene.brick));
  ctx.globalAlpha = 1;
}

/** A swarm of tiny agents scattered across the whole hero that gathers into
 * `word` as the hero is scrolled — and scatters again on the way back up. */
export default function AgentColony({ progress, buildStart, buildEnd, word = 'ARBEN' }: AgentColonyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !stage || !ctx) return;

    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let scene: Scene | null = null;
    let build = buildProgress(progress.get(), buildStart, buildEnd);
    let cursor: Vec | null = null;
    let frame = 0;
    let visible = true;
    let disposed = false;

    const render = (time: number) => {
      ctx.clearRect(0, 0, stage.clientWidth, stage.clientHeight);
      if (!scene) return;
      if (reduced) drawStill(ctx, scene, build);
      else drawScene(ctx, scene, build, time, cursor);
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = stage.clientWidth * dpr;
      canvas.height = stage.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = buildScene(ctx, stage.clientWidth, stage.clientHeight, word);
      render(performance.now() / 1000);
    };

    const tick = (now: number) => {
      render(now / 1000);
      frame = visible && !disposed ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!reduced && !frame && visible) frame = requestAnimationFrame(tick);
    };

    const unsubscribe = progress.on('change', (value) => {
      build = buildProgress(value, buildStart, buildEnd);
      if (reduced) render(0);
    });

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      cursor = null;
    };

    const resizeObserver = new ResizeObserver(() => layout());
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });

    // the word is sampled from the real display font, so wait for it to load
    document.fonts.ready.then(() => {
      if (disposed) return;
      layout();
      resizeObserver.observe(stage);
      visibility.observe(stage);
      start();
    });
    window.addEventListener('pointermove', onPointer);
    document.addEventListener('pointerleave', onLeave);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      unsubscribe();
      resizeObserver.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [progress, buildStart, buildEnd, word]);

  return <canvas ref={canvasRef} className="agent-colony" aria-hidden="true" />;
}
