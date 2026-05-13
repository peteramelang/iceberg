import type { ImportResult } from "./types.js";
export interface NotesStore {
  get(topicSlug: string): string;
  set(topicSlug: string, body: string): void;
  subscribe(listener: () => void): () => void;
  exportData(): Record<string, string>;
  importData(data: Record<string, string>, mode: "merge" | "replace"): ImportResult;
}
