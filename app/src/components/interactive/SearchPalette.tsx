import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFuse, type SearchItem, type SearchKind } from "../../utils/fuzzyIndex.js";

const KIND_LABEL: Record<SearchKind, string> = {
  topic: "Topics",
  phase: "Phases",
  path: "Paths",
  resource: "Resources",
  connection: "Connections"
};
const KIND_ORDER: SearchKind[] = ["topic", "phase", "path", "resource", "connection"];
const LIMIT_PER_GROUP = 5;

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) {
          window.dispatchEvent(new CustomEvent("iceberg-open-search"));
        }
      }
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const grouped = useMemo(() => {
    if (q.trim().length < 2) {
      const { items } = getFuse();
      const topicsOnly = items.filter(i => i.kind === "topic").slice(0, 8);
      return { topic: topicsOnly, phase: [], path: [], resource: [], connection: [] } as Record<SearchKind, SearchItem[]>;
    }
    const { fuse } = getFuse();
    const hits = fuse.search(q, { limit: 80 }).map(r => r.item);
    const out: Record<SearchKind, SearchItem[]> = { topic: [], phase: [], path: [], resource: [], connection: [] };
    for (const h of hits) {
      if (out[h.kind].length < LIMIT_PER_GROUP) out[h.kind].push(h);
    }
    return out;
  }, [q]);

  const flat = useMemo(() => KIND_ORDER.flatMap(k => grouped[k]), [grouped]);

  const select = (item: SearchItem) => {
    onClose();
    navigate(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter")     { const it = flat[activeIdx]; if (it) { e.preventDefault(); select(it); } }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[min(640px,calc(100vw-32px))] bg-panel border border-border rounded-lg shadow-card overflow-hidden">
        <input
          ref={inputRef}
          value={q}
          onChange={e => { setQ(e.target.value); setActiveIdx(0); }}
          onKeyDown={onKeyDown}
          placeholder="Search topics, resources, connections…"
          className="w-full h-12 px-lg bg-transparent text-text outline-none border-b border-border-soft text-body"
          aria-label="Search query"
        />
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
          {flat.length === 0 && (
            <div className="px-lg py-md text-text-mute text-body">No results.</div>
          )}
          {KIND_ORDER.map(kind => {
            const group = grouped[kind];
            if (group.length === 0) return null;
            return (
              <div key={kind} className="py-xs">
                <div className="px-lg py-xs text-label text-text-dim uppercase">{KIND_LABEL[kind]}</div>
                {group.map(item => {
                  const globalIdx = flat.indexOf(item);
                  const isActive = globalIdx === activeIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      onClick={() => select(item)}
                      className={[
                        "w-full text-left px-lg py-sm flex items-center gap-md",
                        isActive ? "bg-panel-2" : "hover:bg-panel-2"
                      ].join(" ")}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-body-strong truncate">{item.title}</div>
                        <div className="text-caption text-text-mute truncate">{item.subtitle}</div>
                      </div>
                      {item.badge && <span className="text-caption text-text-dim border border-border rounded-sm px-xs py-[1px]">{item.badge}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
