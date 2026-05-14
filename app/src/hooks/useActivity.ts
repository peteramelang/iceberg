import { activityStore } from "../stores/index.js";
import type { ActivityEntry } from "../stores/index.js";
import { useStoreTick } from "./useStoreSubscription.js";

export function useActivity(limit = 5): ActivityEntry[] {
  useStoreTick(l => activityStore.subscribe(l));
  return activityStore.recent(limit);
}
