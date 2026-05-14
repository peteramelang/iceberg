import { progressStore } from "../stores/index.js";
import { useStoreTick } from "./useStoreSubscription.js";

export function useTopicProgress(slug: string) {
  useStoreTick(l => progressStore.subscribe(l));
  return progressStore.getTopicProgress(slug);
}
