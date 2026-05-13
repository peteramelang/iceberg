import { useSyncExternalStore } from "react";

export function useStoreSubscription<T>(
  subscribe: (l: () => void) => () => void,
  getSnapshot: () => T
): T {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
