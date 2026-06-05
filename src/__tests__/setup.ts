// Node.js 22+ exposes experimental Web Storage on the global, but without
// --localstorage-file the value is undefined. This setup file provides a
// working in-memory implementation so tests can call localStorage.clear() etc.

import { vi } from 'vitest';

function makeStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string): string | null => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string): void => { store.set(key, String(value)); },
    removeItem: (key: string): void => { store.delete(key); },
    clear: (): void => { store.clear(); },
    key: (n: number): string | null => ([...store.keys()][n] ?? null),
    get length() { return store.size; },
  };
}

if (typeof localStorage === 'undefined' || localStorage === null) {
  vi.stubGlobal('localStorage', makeStorage());
}
if (typeof sessionStorage === 'undefined' || sessionStorage === null) {
  vi.stubGlobal('sessionStorage', makeStorage());
}
