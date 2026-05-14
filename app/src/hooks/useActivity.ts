import { useSyncExternalStore } from "react";
import { activityStore } from "../stores/index.js";
import type { ActivityEntry } from "../stores/index.js";

export function useActivity(limit = 5): ActivityEntry[] {
  return useSyncExternalStore(
    listener => activityStore.subscribe(listener),
    () => activityStore.recent(limit),
    () => [] as ActivityEntry[]
  );
}
