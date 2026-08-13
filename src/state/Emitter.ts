export type Listener<T> = (payload: T) => void;

/**
 * A tiny, dependency-free, type-safe event emitter.
 *
 * Usage:
 *   type Events = { tick: { dt: number }; done: undefined };
 *   const bus = new Emitter<Events>();
 *   const off = bus.on('tick', ({ dt }) => ...);
 */
export class Emitter<E extends object> {
  private listeners = new Map<keyof E, Set<Listener<never>>>();

  /** Adds a listener; calling the returned function removes it again. */
  on<K extends keyof E>(type: K, listener: Listener<E[K]>): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener as Listener<never>);
    return () => this.off(type, listener);
  }

  off<K extends keyof E>(type: K, listener: Listener<E[K]>): void {
    this.listeners.get(type)?.delete(listener as Listener<never>);
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    const set = this.listeners.get(type);
    if (!set) return;
    // A listener may call off() while we iterate, so walk over a copy.
    for (const listener of [...set]) {
      (listener as Listener<E[K]>)(payload);
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
