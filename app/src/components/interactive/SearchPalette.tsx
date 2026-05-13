import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taxonomy } from "../../content/index.js";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = useMemo(() => {
    if (!taxonomy || !query) return [];
    const q = query.toLowerCase();
    return Object.values(taxonomy.topics)
      .filter(t => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink/30 z-50 flex items-start justify-center pt-24" onClick={() => setOpen(false)}>
      <div className="bg-canvas border border-hairline-strong rounded-sm w-full max-w-[560px]" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="search topics…"
          className="w-full px-md py-sm bg-canvas border-b border-hairline outline-none font-mono"
        />
        <div className="max-h-[320px] overflow-auto">
          {matches.map(t => (
            <button
              key={t.slug}
              onClick={() => { setOpen(false); navigate(`/topic/${t.slug}`); }}
              className="block w-full text-left px-md py-sm hover:bg-surface-soft"
            >
              <div className="text-body-strong">[+] {t.title}</div>
              <div className="text-caption-md text-mute">{t.summary}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
