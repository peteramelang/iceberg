import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "./useStoreSubscription.js";

export function useTopicProgress(slug: string) {
  return useStoreSubscription(
    l => progressStore.subscribe(l),
    () => progressStore.getTopicProgress(slug)
  );
}
