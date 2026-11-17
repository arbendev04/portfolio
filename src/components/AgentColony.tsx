import { useEffect, useRef, type RefObject } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { agentPosition, buildProgress, createAgents, repel, type Agent, type Vec } from '../lib/agentColony';
import { measureColonyLayout, sampleWordBricks } from '../lib/colonyLayout';
import { REDUCED_MOTION_QUERY } from '../lib/gsap';
import './AgentColony.css';

interface AgentColonyProps {
  /** Hero scroll progress, 0 at the top of the runway to 1 at its end. */
  progress: MotionValue<number>;
  /** Share of the runway spent building the word. */
  buildEnd: number;
  /** The hero copy block — the word is placed in the free space next to it. */
  contentRef: RefObject<HTMLElement | null>;
  word?: string;
}

interface Scene {
  agents: Agent[];
  brick: number;
  gradient: CanvasGradient;
}

const CURSOR_RADIUS = 90;
const CURSOR_PUSH = 36;
const WANDER_COLOR = 'rgba(86, 230, 255, 0.85)';
/** Idle agents need to read clearly on the dark page before any scrolling. */
const AGENT_SIZE = 3;
const CARRIER_COLOR = 'rgba(255, 255, 255, 0.9)';

function buildScene(ctx: CanvasRenderingContext2D, stage: HTMLElement, content: HTMLElement, word: string): Scene | null {
  const layout = measureColonyLayout(stage, content);
  if (!layout) return null;
  const { bricks, step } = sampleWordBricks(word, layout.word);
  const { x, y, width, height } = layout.word;
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, '#1F6BFF');
  gradient.addColorStop(1, '#19D3FF');
  return { agents: createAgents(bricks, layout.swarm), brick: step - 1, gradient };
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

/** A swarm of tiny agents that carry bricks into place to spell `word` as the
 * hero is scrolled — and take it apart again on the way back up. */
export default function AgentColony({ progress, buildEnd, contentRef, word = 'Arben' }: AgentColonyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const opacity = useTransform(progress, [buildEnd + 0.04, buildEnd + 0.2], [1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    const content = contentRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !stage || !content || !ctx) return;

    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    let scene: Scene | null = null;
    let build = buildProgress(progress.get(), buildEnd);
    let cursor: Vec | null = null;
    let frame = 0;
    let visible = true;
    let disposed = false;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (scene) drawScene(ctx, scene, reduced ? 1 : build, reduced ? 0 : time, cursor);
    };

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = stage.clientWidth * dpr;
      canvas.height = stage.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = buildScene(ctx, stage, content, word);
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
      build = buildProgress(value, buildEnd);
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
  }, [progress, buildEnd, contentRef, word]);

  return <motion.canvas ref={canvasRef} className="agent-colony" style={{ opacity }} aria-hidden="true" />;
}
