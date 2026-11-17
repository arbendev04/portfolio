import { describe, expect, it } from 'vitest';
import {
  BACKGROUND_OPACITY,
  CONTACT_OPACITY,
  SWAY_RANGE,
  backgroundRect,
  dockProgress,
  enterProgress,
  globeOpacity,
  lerpRect,
  stageOpacity,
  sway,
} from './globeTravel';

describe('enterProgress', () => {
  const vh = 900;

  it('is 0 until the section reaches the bottom of the screen', () => {
    expect(enterProgress(vh + 10, vh)).toBe(0);
  });

  it('is 1 once the section has risen most of the way up', () => {
    expect(enterProgress(vh * 0.2, vh)).toBe(1);
    expect(enterProgress(-400, vh)).toBe(1);
  });

  it('grows steadily as the section comes up', () => {
    expect(enterProgress(vh * 0.6, vh)).toBeCloseTo(0.5);
  });
});

describe('stageOpacity', () => {
  it('goes from faint background, to fully opaque docked, to faint again behind the form', () => {
    expect(stageOpacity(0, 0)).toBe(BACKGROUND_OPACITY);
    expect(stageOpacity(1, 0)).toBe(1);
    expect(stageOpacity(1, 1)).toBeCloseTo(CONTACT_OPACITY);
  });
});

describe('sway', () => {
  it('stays within the sway range so the three places never turn out of view', () => {
    for (let t = 0; t < 60; t += 0.7) {
      expect(Math.abs(sway(t))).toBeLessThanOrEqual(SWAY_RANGE);
    }
  });

  it('keeps moving over time', () => {
    expect(sway(1)).not.toBeCloseTo(sway(3));
  });
});

describe('dockProgress', () => {
  const vh = 900;
  const slotHeight = 400;

  it('is 0 while the dock slot is still below the screen', () => {
    expect(dockProgress(vh + 50, slotHeight, vh)).toBe(0);
  });

  it('is 1 once the whole slot is on screen, even if it sits below the centre', () => {
    // e.g. a pinned section whose heading pushes the slot a little low
    const lowButFullyVisibleTop = vh - slotHeight - 60;
    expect(dockProgress(lowButFullyVisibleTop, slotHeight, vh)).toBe(1);
  });

  it('is 1 when the slot is centred', () => {
    expect(dockProgress(vh / 2 - slotHeight / 2, slotHeight, vh)).toBe(1);
  });

  it('is still below 1 while the slot is partly off the bottom', () => {
    expect(dockProgress(vh - slotHeight / 2, slotHeight, vh)).toBeLessThan(1);
  });

  it('stays 1 after the slot scrolls on up, so the globe keeps following it', () => {
    expect(dockProgress(-300, slotHeight, vh)).toBe(1);
  });
});

describe('lerpRect', () => {
  const a = { x: 0, y: 0, size: 100 };
  const b = { x: 200, y: 100, size: 50 };

  it('returns the start rect at 0 and the end rect at 1', () => {
    expect(lerpRect(a, b, 0)).toEqual(a);
    expect(lerpRect(a, b, 1)).toEqual(b);
  });

  it('blends position and size in between', () => {
    expect(lerpRect(a, b, 0.5)).toEqual({ x: 100, y: 50, size: 75 });
  });
});

describe('backgroundRect', () => {
  it('centres a large globe on the screen', () => {
    const rect = backgroundRect(1600, 900);
    expect(rect.x + rect.size / 2).toBeCloseTo(800);
    expect(rect.y + rect.size / 2).toBeCloseTo(450);
  });

  it('is sized by the shorter side so it fits on a phone too', () => {
    expect(backgroundRect(375, 812).size).toBeLessThanOrEqual(375);
  });
});

describe('globeOpacity', () => {
  it('is faint as a background and fully opaque once docked', () => {
    expect(globeOpacity(0)).toBe(BACKGROUND_OPACITY);
    expect(globeOpacity(1)).toBe(1);
  });
});
