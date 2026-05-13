import type { Bookmark, ImportResult } from "./types.js";
export interface BookmarkStore {
  isBookmarked(topicSlug: string, resourceKey?: string): boolean;
  toggle(topicSlug: string, resourceKey?: string): void;
  list(): Bookmark[];
  subscribe(listener: () => void): () => void;
  exportData(): Bookmark[];
  importData(data: Bookmark[], mode: "merge" | "replace"): ImportResult;
}
