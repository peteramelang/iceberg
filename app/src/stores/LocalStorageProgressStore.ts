import type { ProgressStore } from "./ProgressStore.js";
import type { TopicProgress, OverallProgress, ImportResult } from "./types.js";

const KEY = "iceberg.v1.progress";

interface Snapshot {
  topics: Record<string, TopicProgress>;
}

function readSnapshot(): Snapshot {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { topics: {} };
  try { return JSON.parse(raw) as Snapshot; } catch { return { topics: {} }; }
}
function writeSnapshot(s: Snapshot) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export class LocalStorageProgressStore implements ProgressStore {
  private listeners = new Set<() => void>();

  private emit() { for (const l of this.listeners) l(); }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  getTopicProgress(slug: string): TopicProgress {
    return readSnapshot().topics[slug] ?? { resources: {}, completed: false, lastTouchedAt: null };
  }

  setResourceChecked(topicSlug: string, resourceKey: string, checked: boolean): void {
    const snap = readSnapshot();
    const cur = snap.topics[topicSlug] ?? { resources: {}, completed: false, lastTouchedAt: null };
    cur.resources[resourceKey] = checked;
    cur.lastTouchedAt = new Date().toISOString();
    snap.topics[topicSlug] = cur;
    writeSnapshot(snap);
    this.emit();
  }

  markTopicComplete(slug: string): void {
    const snap = readSnapshot();
    const cur = snap.topics[slug] ?? { resources: {}, completed: false, lastTouchedAt: null };
    cur.completed = true;
    cur.lastTouchedAt = new Date().toISOString();
    snap.topics[slug] = cur;
    writeSnapshot(snap);
    this.emit();
  }

  unmarkTopicComplete(slug: string): void {
    const snap = readSnapshot();
    const cur = snap.topics[slug];
    if (!cur) return;
    cur.completed = false;
    cur.lastTouchedAt = new Date().toISOString();
    writeSnapshot(snap);
    this.emit();
  }

  getOverallProgress(totalResourcesPerTopic: Record<string, number>): OverallProgress {
    const snap = readSnapshot();
    const slugs = Object.keys(totalResourcesPerTopic);
    let completedTopics = 0;
    let resourcesCompleted = 0;
    let resourcesTotal = 0;
    for (const slug of slugs) {
      const t = snap.topics[slug];
      resourcesTotal += totalResourcesPerTopic[slug] ?? 0;
      if (t) {
        if (t.completed) completedTopics++;
        resourcesCompleted += Object.values(t.resources).filter(Boolean).length;
      }
    }
    return { totalTopics: slugs.length, completedTopics, resourcesCompleted, resourcesTotal };
  }

  getLastTouchedTopic(): string | null {
    const snap = readSnapshot();
    let best: { slug: string; at: string } | null = null;
    for (const [slug, t] of Object.entries(snap.topics)) {
      if (t.lastTouchedAt && (!best || t.lastTouchedAt > best.at)) {
        best = { slug, at: t.lastTouchedAt };
      }
    }
    return best?.slug ?? null;
  }

  exportData() { return readSnapshot().topics; }

  importData(data: Record<string, TopicProgress>, mode: "merge" | "replace"): ImportResult {
    const conflicts: string[] = [];
    if (mode === "replace") {
      writeSnapshot({ topics: { ...data } });
      this.emit();
      return { topicsMerged: Object.keys(data).length, bookmarksMerged: 0, notesMerged: 0, conflicts };
    }
    const snap = readSnapshot();
    let merged = 0;
    for (const [slug, incoming] of Object.entries(data)) {
      const cur = snap.topics[slug];
      if (!cur) { snap.topics[slug] = incoming; merged++; continue; }
      const mergedResources = { ...cur.resources };
      for (const [k, v] of Object.entries(incoming.resources)) {
        if (v) mergedResources[k] = true;
      }
      snap.topics[slug] = {
        resources: mergedResources,
        completed: cur.completed || incoming.completed,
        lastTouchedAt:
          (incoming.lastTouchedAt && (!cur.lastTouchedAt || incoming.lastTouchedAt > cur.lastTouchedAt))
            ? incoming.lastTouchedAt
            : cur.lastTouchedAt
      };
      merged++;
    }
    writeSnapshot(snap);
    this.emit();
    return { topicsMerged: merged, bookmarksMerged: 0, notesMerged: 0, conflicts };
  }
}
