import { useEffect, useState } from "react";
import { notesStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";

export function NotesField({ slug }: { slug: string }) {
  // Subscribe so notes imported via Settings → Import refresh the open field
  // (I11). Without this, the import overwrites localStorage but the
  // currently-mounted NotesField keeps showing the old value until remount.
  useStoreTick(l => notesStore.subscribe(l));

  const stored = notesStore.get(slug);
  const [value, setValue] = useState(stored);

  // Re-sync local state when either the slug or the stored value changes.
  // Plain re-render isn't enough because the textarea is controlled by
  // local state — we need to push the new store value into it.
  useEffect(() => { setValue(stored); }, [slug, stored]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    notesStore.set(slug, v);
  };

  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder="Add notes for this topic…"
      className="w-full min-h-[120px] bg-panel border border-border-soft rounded p-md text-body text-text placeholder:text-text-dim focus:outline-none focus:border-accent"
      aria-label={`Notes for ${slug}`}
    />
  );
}
