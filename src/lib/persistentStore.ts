/** The slice of the Web Storage API the stores need — injectable for tests. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Store<T> {
  get(): T;
  set(value: T): void;
  subscribe(listener: () => void): () => void;
}

/** localStorage, or null where touching it throws (privacy modes, blocked
 * site data, sandboxed frames) or where there is no window at all. */
export function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Reads `key`, treating any storage failure as "nothing saved". */
export function safeRead(storage: StorageLike | null, key: string): string | null {
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes `key`. A failed write only loses the preference for the next visit,
 * so it is deliberately not surfaced. */
export function safeWrite(storage: StorageLike | null, key: string, value: string): void {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    // storage full or blocked: the in-memory value still applies this visit
  }
}

/** A minimal external store for useSyncExternalStore. `onChange` runs after
 * each real change (side effects such as persisting or syncing the DOM). */
export function createStore<T>(initial: T, onChange?: (value: T) => void): Store<T> {
  let current = initial;
  let listeners: ReadonlyArray<() => void> = [];

  return {
    get: () => current,
    set(value) {
      if (Object.is(value, current)) return;
      current = value;
      onChange?.(value);
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
  };
}
