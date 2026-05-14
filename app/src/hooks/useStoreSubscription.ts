import { useRef, useSyncExternalStore } from "react";

export function useStoreSubscription<T>(
  subscribe: (l: () => void) => () => void,
  getSnapshot: () => T
): T {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Re-render the component whenever the store emits. Snapshot is a tick that
// only changes inside subscribe(), so React's snapshot-stability check passes.
export function useStoreTick(subscribe: (l: () => void) => () => void): number {
  const tickRef = useRef(0);
  return useSyncExternalStore(
    listener =>
      subscribe(() => {
        tickRef.current += 1;
        listener();
      }),
    () => tickRef.current,
    () => 0
  );
}
