import type { NotesStore } from "./NotesStore.js";
import type { ImportResult } from "./types.js";

const KEY = "iceberg.v1.notes";

function read(): Record<string, string> {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, string>; } catch { return {}; }
}
function write(d: Record<string, string>) { localStorage.setItem(KEY, JSON.stringify(d)); }

export class LocalStorageNotesStore implements NotesStore {
  private listeners = new Set<() => void>();
  private emit() { for (const l of this.listeners) l(); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  get(slug: string) { return read()[slug] ?? ""; }
  set(slug: string, body: string) {
    const cur = read(); cur[slug] = body; write(cur); this.emit();
  }
  exportData() { return read(); }
  importData(data: Record<string, string>, mode: "merge" | "replace"): ImportResult {
    const conflicts: string[] = [];
    if (mode === "replace") {
      write({ ...data }); this.emit();
      return { topicsMerged: 0, bookmarksMerged: 0, notesMerged: Object.keys(data).length, conflicts };
    }
    const cur = read();
    let merged = 0;
    for (const [slug, body] of Object.entries(data)) {
      if (cur[slug] && cur[slug] !== body) conflicts.push(slug);
      cur[slug] = body;
      merged++;
    }
    write(cur); this.emit();
    return { topicsMerged: 0, bookmarksMerged: 0, notesMerged: merged, conflicts };
  }
}
