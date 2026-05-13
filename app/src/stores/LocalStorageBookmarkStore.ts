import type { BookmarkStore } from "./BookmarkStore.js";
import type { Bookmark, ImportResult } from "./types.js";

const KEY = "iceberg.v1.bookmarks";

function read(): Bookmark[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Bookmark[]; } catch { return []; }
}
function write(list: Bookmark[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

function keyOf(b: Bookmark) { return `${b.topic}::${b.resource ?? ""}`; }

export class LocalStorageBookmarkStore implements BookmarkStore {
  private listeners = new Set<() => void>();
  private emit() { for (const l of this.listeners) l(); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }

  isBookmarked(topic: string, resource?: string) {
    return read().some(b => b.topic === topic && b.resource === resource);
  }
  toggle(topic: string, resource?: string) {
    const list = read();
    const k = keyOf({ topic, resource, addedAt: "" });
    const idx = list.findIndex(b => keyOf(b) === k);
    if (idx === -1) list.push({ topic, resource, addedAt: new Date().toISOString() });
    else list.splice(idx, 1);
    write(list);
    this.emit();
  }
  list() { return read(); }
  exportData() { return read(); }
  importData(data: Bookmark[], mode: "merge" | "replace"): ImportResult {
    if (mode === "replace") {
      write([...data]); this.emit();
      return { topicsMerged: 0, bookmarksMerged: data.length, notesMerged: 0, conflicts: [] };
    }
    const cur = read();
    const seen = new Set(cur.map(keyOf));
    let added = 0;
    for (const b of data) if (!seen.has(keyOf(b))) { cur.push(b); added++; }
    write(cur); this.emit();
    return { topicsMerged: 0, bookmarksMerged: added, notesMerged: 0, conflicts: [] };
  }
}
