import { describe, expect, it, vi } from 'vitest';
import { createStore, safeRead, safeWrite, type StorageLike } from './persistentStore';

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
};

describe('safeRead', () => {
  it('reads a stored value', () => {
    const storage = memoryStorage();
    storage.setItem('k', 'v');
    expect(safeRead(storage, 'k')).toBe('v');
  });

  it('returns null without storage or when storage throws', () => {
    expect(safeRead(null, 'k')).toBeNull();
    expect(safeRead(throwingStorage, 'k')).toBeNull();
  });
});

describe('safeWrite', () => {
  it('writes through to storage', () => {
    const storage = memoryStorage();
    safeWrite(storage, 'k', 'v');
    expect(storage.data.get('k')).toBe('v');
  });

  it('never throws, even when storage does', () => {
    expect(() => safeWrite(throwingStorage, 'k', 'v')).not.toThrow();
    expect(() => safeWrite(null, 'k', 'v')).not.toThrow();
  });
});

describe('createStore', () => {
  it('starts at the initial value', () => {
    expect(createStore('a').get()).toBe('a');
  });

  it('notifies subscribers and runs onChange when the value changes', () => {
    const onChange = vi.fn();
    const store = createStore<string>('a', onChange);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set('b');

    expect(store.get()).toBe('b');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('ignores a set to the current value', () => {
    const onChange = vi.fn();
    const store = createStore<string>('a', onChange);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set('a');

    expect(listener).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore(1);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();

    store.set(2);

    expect(listener).not.toHaveBeenCalled();
  });
});
