import type { ActivityStore, ActivityEntry } from "./ActivityStore.js";

const KEY = "iceberg.activity";
const MAX = 50;

function read(): ActivityEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch { return []; }
}

function isEntry(x: unknown): x is ActivityEntry {
  return !!x && typeof x === "object"
    && typeof (x as ActivityEntry).type === "string"
    && typeof (x as ActivityEntry).topicSlug === "string"
    && typeof (x as ActivityEntry).at === "number";
}

export class LocalStorageActivityStore implements ActivityStore {
  private listeners = new Set<() => void>();

  append(entry: Omit<ActivityEntry, "at">): void {
    const list = read();
    list.unshift({ ...entry, at: Date.now() });
    while (list.length > MAX) list.pop();
    localStorage.setItem(KEY, JSON.stringify(list));
    this.emit();
  }

  recent(limit: number): ActivityEntry[] {
    return read().slice(0, Math.max(0, limit));
  }

  clear(): void {
    localStorage.removeItem(KEY);
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void { for (const l of this.listeners) l(); }
}
