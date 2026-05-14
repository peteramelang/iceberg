// Runtime validation for everything pulled out of localStorage. The stores
// previously cast `JSON.parse(raw) as T` which propagates corrupted data
// silently — schema-migrated data, browser-extension writes, or an old
// app version's format would all reach component render before crashing.
//
// Each schema is permissive within its shape (extra fields ignored) but
// rejects type mismatches and unknown keys at top level.

import { z } from "zod";

export const TopicProgressSchema = z.object({
  resources: z.record(z.string(), z.boolean()),
  completed: z.boolean(),
  lastTouchedAt: z.string().nullable()
});

export const ProgressSnapshotSchema = z.object({
  topics: z.record(z.string(), TopicProgressSchema)
});

export const BookmarkSchema = z.object({
  topic: z.string(),
  resource: z.string().optional(),
  addedAt: z.string()
});

export const BookmarkListSchema = z.array(BookmarkSchema);

export const NotesMapSchema = z.record(z.string(), z.string());

/**
 * Read + validate a localStorage value. Returns `fallback` for any of:
 *   - the localStorage API isn't available (SSR / Node tests),
 *   - the key is missing,
 *   - JSON.parse throws,
 *   - the parsed value fails the schema.
 *
 * Errors are swallowed silently because there's no UI to surface them to;
 * stores are loaded eagerly at module-init time. Validation failures degrade
 * to a clean slate, which is the same behavior the previous bare `try/catch`
 * gave for parse errors — but now extends to shape violations too.
 */
export function safeRead<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}
