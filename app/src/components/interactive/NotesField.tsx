import { useEffect, useState } from "react";
import { notesStore } from "../../stores/index.js";

export function NotesField({ slug }: { slug: string }) {
  const [value, setValue] = useState("");
  useEffect(() => { setValue(notesStore.get(slug) ?? ""); }, [slug]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    notesStore.set(slug, v);
  };

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Add notes for this topic… (markdown supported)"
      className="w-full min-h-[120px] bg-panel border border-border-soft rounded p-md text-body text-text placeholder:text-text-dim focus:outline-none focus:border-accent"
      aria-label={`Notes for ${slug}`}
    />
  );
}
