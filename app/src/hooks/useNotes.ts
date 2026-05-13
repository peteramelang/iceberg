import { notesStore } from "../stores/index.js";
import { useStoreSubscription } from "./useStoreSubscription.js";

export function useNotes(slug: string) {
  const body = useStoreSubscription(
    l => notesStore.subscribe(l),
    () => notesStore.get(slug)
  );
  return { body, set: (b: string) => notesStore.set(slug, b) };
}
