export interface TopicProgress {
  resources: Record<string, boolean>;
  completed: boolean;
  lastTouchedAt: string | null;
}
export interface OverallProgress {
  totalTopics: number;
  completedTopics: number;
  resourcesCompleted: number;
  resourcesTotal: number;
}
export interface Bookmark {
  topic: string;
  resource?: string;
  addedAt: string;
}
export interface ExportPayload {
  format: "iceberg-progress";
  version: 1;
  exportedAt: string;
  data: {
    progress: Record<string, TopicProgress>;
    bookmarks: Bookmark[];
    notes: Record<string, string>;
  };
}
export interface ImportResult {
  topicsMerged: number;
  bookmarksMerged: number;
  notesMerged: number;
  conflicts: string[];
}
