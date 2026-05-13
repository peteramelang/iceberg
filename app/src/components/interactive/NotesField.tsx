import { useNotes } from "../../hooks/useNotes.js";

export function NotesField({ slug }: { slug: string }) {
  const { body, set } = useNotes(slug);
  return (
    <textarea
      value={body}
      onChange={e => set(e.target.value)}
      placeholder="your notes…"
      className="w-full min-h-[160px] p-md bg-surface-soft text-ink rounded-sm border border-hairline focus:border-ink outline-none font-mono"
    />
  );
}
