import { bookmarkStore } from "../stores/index.js";
import { useStoreSubscription } from "./useStoreSubscription.js";

export function useBookmark(topic: string, resource?: string) {
  const isBookmarked = useStoreSubscription(
    l => bookmarkStore.subscribe(l),
    () => bookmarkStore.isBookmarked(topic, resource)
  );
  return { isBookmarked, toggle: () => bookmarkStore.toggle(topic, resource) };
}
