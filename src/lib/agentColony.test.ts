import { describe, expect, it } from 'vitest';
import {
  TRAVEL,
  agentPosition,
  agentProgress,
  buildProgress,
  centeredWordBox,
  createAgents,
  repel,
  type Agent,
} from './agentColony';

const agent: Agent = {
  home: { x: 0, y: 0 },
  target: { x: 100, y: 50 },
  order: 0.5,
  phase: 0,
  arc: 20,
};

describe('buildProgress', () => {
  it('maps its stretch of the hero scroll onto a full 0→1 build', () => {
    expect(buildProgress(0.3, 0.3, 0.8)).toBe(0);
    expect(buildProgress(0.55, 0.3, 0.8)).toBeCloseTo(0.5);
    expect(buildProgress(0.8, 0.3, 0.8)).toBe(1);
  });

  it('holds at 0 before the stretch and at 1 after it', () => {
    expect(buildProgress(0.1, 0.3, 0.8)).toBe(0);
    expect(buildProgress(0.95, 0.3, 0.8)).toBe(1);
  });
});

describe('centeredWordBox', () => {
  it('centres the word box in the stage', () => {
    const box = centeredWordBox(1600, 900);
    expect(box.x + box.width / 2).toBeCloseTo(800);
    expect(box.y + box.height / 2).toBeCloseTo(450);
  });

  it('stays inside the stage on a narrow phone screen', () => {
    const box = centeredWordBox(375, 812);
    expect(box.x).toBeGreaterThan(0);
    expect(box.x + box.width).toBeLessThan(375);
    expect(box.height).toBeGreaterThan(0);
  });
});

describe('agentProgress', () => {
  it('is 0 before the agent’s own window and 1 after it', () => {
    const start = 0.5 * (1 - TRAVEL);
    expect(agentProgress(0.5, start - 0.01)).toBe(0);
    expect(agentProgress(0.5, start + TRAVEL + 0.01)).toBe(1);
  });

  it('never decreases as the build advances, so scrolling back simply rewinds it', () => {
    let previous = 0;
    for (let b = 0; b <= 1; b += 0.01) {
      const current = agentProgress(0.3, b);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });

  it('lets the last agent in line still finish exactly at the end of the build', () => {
    expect(agentProgress(0.999, 1)).toBe(1);
  });
});

describe('agentPosition', () => {
  it('sits exactly on its brick once placed', () => {
    const { pos, progress } = agentPosition(agent, 1, 3.2);
    expect(progress).toBe(1);
    expect(pos).toEqual(agent.target);
  });

  it('wanders near home before it starts carrying', () => {
    const { pos, progress } = agentPosition(agent, 0, 1.5);
    expect(progress).toBe(0);
    expect(Math.hypot(pos.x - agent.home.x, pos.y - agent.home.y)).toBeLessThan(40);
  });

  it('is somewhere between home and target while carrying', () => {
    const mid = 0.5 * (1 - TRAVEL) + TRAVEL / 2;
    const { pos, progress } = agentPosition(agent, mid, 0);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
    expect(pos.x).toBeGreaterThan(-40);
    expect(pos.x).toBeLessThan(140);
  });

  it('is deterministic for the same build and time', () => {
    expect(agentPosition(agent, 0.4, 2)).toEqual(agentPosition(agent, 0.4, 2));
  });
});

describe('repel', () => {
  it('pushes a point away from a nearby cursor', () => {
    const pushed = repel({ x: 10, y: 0 }, { x: 0, y: 0 }, 50, 30);
    expect(pushed.x).toBeGreaterThan(10);
  });

  it('leaves points outside the radius untouched', () => {
    expect(repel({ x: 100, y: 0 }, { x: 0, y: 0 }, 50, 30)).toEqual({ x: 100, y: 0 });
  });

  it('does nothing without a cursor', () => {
    expect(repel({ x: 5, y: 5 }, null, 50, 30)).toEqual({ x: 5, y: 5 });
  });
});

describe('createAgents', () => {
  const targets = [
    { x: 300, y: 10 },
    { x: 10, y: 10 },
    { x: 150, y: 10 },
  ];
  const area = { x: 0, y: 0, width: 400, height: 200 };
  const fixedRandom = () => 0.5;

  it('creates one agent per brick, keeping every target', () => {
    const agents = createAgents(targets, area, fixedRandom);
    expect(agents).toHaveLength(3);
    expect(agents.map((a) => a.target)).toEqual(expect.arrayContaining(targets));
  });

  it('orders the build left to right so the word is written letter by letter', () => {
    const agents = createAgents(targets, area, fixedRandom);
    const orderOf = (x: number) => agents.find((a) => a.target.x === x)!.order;
    expect(orderOf(10)).toBeLessThan(orderOf(150));
    expect(orderOf(150)).toBeLessThan(orderOf(300));
  });

  it('keeps every order inside [0, 1)', () => {
    const agents = createAgents(targets, area, Math.random);
    agents.forEach((a) => {
      expect(a.order).toBeGreaterThanOrEqual(0);
      expect(a.order).toBeLessThan(1);
    });
  });

  it('spawns homes inside the swarm area', () => {
    createAgents(targets, area, Math.random).forEach(({ home }) => {
      expect(home.x).toBeGreaterThanOrEqual(area.x);
      expect(home.x).toBeLessThanOrEqual(area.x + area.width);
      expect(home.y).toBeGreaterThanOrEqual(area.y);
      expect(home.y).toBeLessThanOrEqual(area.y + area.height);
    });
  });
});
