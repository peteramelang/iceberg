import type { ActivityStore, ActivityEntry, ActivityType } from "./ActivityStore.js";

const KEY = "iceberg.activity";
const MAX = 50;
const VALID_TYPES = new Set<ActivityType>(["completed", "checked", "bookmarked", "unbookmarked"]);

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
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return VALID_TYPES.has(e.type as ActivityType)
    && typeof e.topicSlug === "string"
    && typeof e.topicTitle === "string"
    && typeof e.at === "number"
    && (e.resourceKey === undefined || typeof e.resourceKey === "string")
    && (e.resourceTitle === undefined || typeof e.resourceTitle === "string");
}

export class LocalStorageActivityStore implements ActivityStore {
  private listeners = new Set<() => void>();

  append(entry: Omit<ActivityEntry, "at">): void {
    const list = read();
    list.unshift({ ...entry, at: Date.now() });
    while (list.length > MAX) list.pop();
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* quota / private-browsing */ }
    }
    this.emit();
  }

  recent(limit: number): ActivityEntry[] {
    return read().slice(0, Math.max(0, limit));
  }

  clear(): void {
    if (typeof localStorage !== "undefined") {
      try { localStorage.removeItem(KEY); } catch { /* no-op */ }
    }
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void { for (const l of this.listeners) l(); }
}
