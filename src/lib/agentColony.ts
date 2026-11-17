/**
 * Pure math behind the hero's "agent colony": a swarm of tiny agents that each
 * carry one brick into place until the bricks spell a word.
 *
 * Every position is a function of (build progress, time) — never accumulated
 * frame by frame — so scrubbing the scroll forwards, backwards or jumping
 * straight to the middle always lands on the exact same picture.
 */

export interface Vec {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Agent {
  /** Where the agent idles in the swarm before picking up its brick. */
  home: Vec;
  /** Where its brick belongs inside the word. */
  target: Vec;
  /** 0..1 — when this agent's trip starts within the overall build. */
  order: number;
  /** Per-agent offset so the swarm doesn't wander in lockstep. */
  phase: number;
  /** Sideways bulge of the carrying path, in px (signed). */
  arc: number;
}

/** Fraction of the whole build each single trip takes. Overlapping trips are
 * what make it read as a busy colony instead of a queue. */
export const TRAVEL = 0.22;

/** Small random spread on top of the left-to-right order, so neighbouring
 * bricks don't land in perfect sequence. */
const ORDER_JITTER = 0.08;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Maps raw hero scroll progress onto the build: 0 at the top, 1 once the
 * first `buildEnd` share of the runway has been scrolled. */
export function buildProgress(scrollProgress: number, buildEnd: number): number {
  return clamp(scrollProgress / buildEnd, 0, 1);
}

/** How far along its own trip one agent is, given the overall build. */
export function agentProgress(order: number, build: number): number {
  const start = order * (1 - TRAVEL);
  return clamp((build - start) / TRAVEL, 0, 1);
}

/** Idle drift: two layered sine waves per axis, bounded to roughly ±19px. */
export function wanderOffset(agent: Agent, time: number): Vec {
  const p = agent.phase;
  return {
    x: Math.sin(time * 0.9 + p) * 14 + Math.sin(time * 2.3 + p * 1.7) * 5,
    y: Math.cos(time * 0.7 + p * 1.3) * 12 + Math.cos(time * 1.9 + p) * 4,
  };
}

export interface AgentFrame {
  pos: Vec;
  /** 0 = wandering, between = carrying, 1 = brick placed. */
  progress: number;
}

export function agentPosition(agent: Agent, build: number, time: number): AgentFrame {
  const progress = agentProgress(agent.order, build);
  if (progress >= 1) return { pos: agent.target, progress };

  const drift = wanderOffset(agent, time);
  const start = { x: agent.home.x + drift.x, y: agent.home.y + drift.y };
  if (progress <= 0) return { pos: start, progress };

  const eased = easeInOutCubic(progress);
  const dx = agent.target.x - start.x;
  const dy = agent.target.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  // bulges sideways mid-trip so agents travel in arcs instead of straight lines
  const lift = Math.sin(Math.PI * eased) * agent.arc;

  return {
    pos: {
      x: lerp(start.x, agent.target.x, eased) + (-dy / length) * lift,
      y: lerp(start.y, agent.target.y, eased) + (dx / length) * lift,
    },
    progress,
  };
}

/** Pushes a point out of the cursor's radius, harder the closer it is. */
export function repel(pos: Vec, cursor: Vec | null, radius: number, strength: number): Vec {
  if (!cursor) return pos;
  const dx = pos.x - cursor.x;
  const dy = pos.y - cursor.y;
  const distance = Math.hypot(dx, dy);
  if (distance >= radius || distance === 0) return pos;

  const push = (1 - distance / radius) * strength;
  return { x: pos.x + (dx / distance) * push, y: pos.y + (dy / distance) * push };
}

/** One agent per brick. Build order runs left to right across the word, so it
 * gets written letter by letter rather than filling in all at once. */
export function createAgents(targets: Vec[], area: Rect, random: () => number = Math.random): Agent[] {
  const sorted = [...targets].sort((a, b) => a.x - b.x);
  const last = Math.max(sorted.length - 1, 1);

  return sorted.map((target, rank) => ({
    target,
    home: { x: area.x + random() * area.width, y: area.y + random() * area.height },
    order: clamp((rank / last) * (1 - ORDER_JITTER) + random() * ORDER_JITTER, 0, 0.999),
    phase: random() * Math.PI * 2,
    arc: (random() - 0.5) * 80,
  }));
}
