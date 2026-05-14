// Tiny ephemeral signal used to drive "completion moment" animations across the
// app (spec §1 Motion: B — restrained + completion moments). When a topic is
// completed, components opt-in via useCompletionPulse(slug) and get back a
// boolean that is true for PULSE_DURATION_MS and then auto-clears.
//
// Intentionally not persisted to localStorage — pulses are visual confetti, not
// state. A page reload should not retrigger the animation.

const PULSE_DURATION_MS = 1200;

export interface CompletionPulseStore {
  pulse(slug: string): void;
  isPulsing(slug: string): boolean;
  subscribe(listener: () => void): () => void;
}

export class InMemoryCompletionPulseStore implements CompletionPulseStore {
  private active = new Map<string, number>(); // slug -> setTimeout handle
  private pulsing = new Set<string>();
  private listeners = new Set<() => void>();

  pulse(slug: string): void {
    const existing = this.active.get(slug);
    if (existing) clearTimeout(existing);
    this.pulsing.add(slug);
    const handle = window.setTimeout(() => {
      this.pulsing.delete(slug);
      this.active.delete(slug);
      this.emit();
    }, PULSE_DURATION_MS);
    this.active.set(slug, handle);
    this.emit();
  }

  isPulsing(slug: string): boolean {
    return this.pulsing.has(slug);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }
}
