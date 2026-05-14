import { useEffect, useState } from "react";
import { z } from "zod";

export interface ChangelogEntry { sha: string; date: string; message: string; touchedTopics: string[]; }

const ChangelogEntrySchema: z.ZodType<ChangelogEntry> = z.object({
  sha: z.string(),
  date: z.string(),
  message: z.string(),
  touchedTopics: z.array(z.string())
});

const ChangelogSchema = z.array(ChangelogEntrySchema);

export function useChangelog(): ChangelogEntry[] {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch("/changelog.json")
      .then(r => r.ok ? r.json() : [])
      .then(raw => {
        if (cancelled) return;
        const parsed = ChangelogSchema.safeParse(raw);
        setEntries(parsed.success ? parsed.data : []);
      })
      .catch(() => { if (!cancelled) setEntries([]); });
    return () => { cancelled = true; };
  }, []);
  return entries;
}
