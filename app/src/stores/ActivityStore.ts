export type ActivityType = "completed" | "checked" | "bookmarked" | "unbookmarked";

export interface ActivityEntry {
  type: ActivityType;
  topicSlug: string;
  topicTitle: string;
  resourceKey?: string;
  resourceTitle?: string;
  at: number;
}

export interface ActivityStore {
  append(entry: Omit<ActivityEntry, "at">): void;
  recent(limit: number): ActivityEntry[];
  clear(): void;
  subscribe(listener: () => void): () => void;
}
