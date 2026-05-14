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

function isFormField(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el as HTMLElement).isContentEditable;
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  // Save the element that had focus before the palette opened so we can
  // restore focus to it on close — WAI-ARIA modal-dialog requirement.
  useEffect(() => {
    if (open) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      setQ("");
      setActiveIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    } else if (previousActiveRef.current) {
      previousActiveRef.current.focus?.();
      previousActiveRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K — toggle palette open from anywhere.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) {
          window.dispatchEvent(new CustomEvent("iceberg-open-search"));
        }
        return;
      }
      // "/" — open palette when not focused in a form field (spec §3).
      if (e.key === "/" && !open && !isFormField(document.activeElement)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("iceberg-open-search"));
        return;
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

  // Trap Tab/Shift+Tab within the dialog (WAI-ARIA modal-dialog requirement).
  // Two interactive surfaces: the input and N result buttons. We just push
  // focus back to whichever extreme the user is leaving.
  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = e.currentTarget;
    const focusables = root.querySelectorAll<HTMLElement>('input,button:not([disabled])');
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search topics, resources, connections"
      onKeyDown={onDialogKeyDown}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
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
