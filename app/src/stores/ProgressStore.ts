import type { TopicProgress, OverallProgress, ExportPayload, ImportResult } from "./types.js";

export interface ProgressStore {
  getTopicProgress(slug: string): TopicProgress;
  setResourceChecked(topicSlug: string, resourceKey: string, checked: boolean): void;
  markTopicComplete(slug: string): void;
  unmarkTopicComplete(slug: string): void;
  getOverallProgress(totalResourcesPerTopic: Record<string, number>): OverallProgress;
  getLastTouchedTopic(): string | null;
  subscribe(listener: () => void): () => void;
  exportData(): ExportPayload["data"]["progress"];
  importData(data: ExportPayload["data"]["progress"], mode: "merge" | "replace"): ImportResult;
}
