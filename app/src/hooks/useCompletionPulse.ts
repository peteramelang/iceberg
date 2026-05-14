import { useSyncExternalStore } from "react";
import { completionPulseStore } from "../stores/index.js";

// Returns true for ~1.2s after a topic is marked complete, then auto-clears.
// Snapshot is a primitive (boolean), so React's snapshot-stability check passes.
export function useCompletionPulse(slug: string): boolean {
  return useSyncExternalStore(
    listener => completionPulseStore.subscribe(listener),
    () => completionPulseStore.isPulsing(slug),
    () => false
  );
}
