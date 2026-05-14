import { useEffect, useState } from "react";

export interface ChangelogEntry { sha: string; date: string; message: string; touchedTopics: string[]; }

export function useChangelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  useEffect(() => {
    fetch("/changelog.json")
      .then(r => r.ok ? r.json() : [])
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);
  return entries;
}
