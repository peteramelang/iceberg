import { z } from "zod";
import { Head } from "../components/layout/Head.js";
import { MainColumn } from "../components/layout/MainColumn.js";
import { useTheme } from "../hooks/useTheme.js";
import { progressStore, bookmarkStore, notesStore, activityStore } from "../stores/index.js";
import type { ExportPayload } from "../stores/types.js";
import { BookmarkListSchema, NotesMapSchema, TopicProgressSchema } from "../stores/schemas.js";

const ExportPayloadSchema = z.object({
  format: z.literal("iceberg-progress"),
  version: z.literal(1),
  exportedAt: z.string(),
  data: z.object({
    progress: z.record(z.string(), TopicProgressSchema),
    bookmarks: BookmarkListSchema,
    notes: NotesMapSchema
  })
});

function downloadJSON(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer to next tick so the browser starts the download before we revoke.
  // Otherwise we leak the blob URL (memory + same-origin-fetchable handle)
  // until the tab closes.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function Settings() {
  const { mode, set } = useTheme();

  const onExport = () => {
    const payload: ExportPayload = {
      format: "iceberg-progress",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        progress: progressStore.exportData(),
        bookmarks: bookmarkStore.exportData(),
        notes: notesStore.exportData()
      }
    };
    downloadJSON(`iceberg-progress-${new Date().toISOString().slice(0, 10)}.json`, payload);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    let raw: unknown;
    try { raw = JSON.parse(text); }
    catch { alert("Invalid JSON."); return; }
    const parsed = ExportPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      alert("Unsupported or malformed export file.");
      return;
    }
    const payload = parsed.data;
    const importMode = confirm("Replace existing data with this file? Click Cancel to merge instead.") ? "replace" : "merge";
    progressStore.importData(payload.data.progress, importMode);
    bookmarkStore.importData(payload.data.bookmarks, importMode);
    notesStore.importData(payload.data.notes, importMode);
    alert("Import complete.");
    e.target.value = "";
  };

  const onClearAll = () => {
    if (!confirm("Clear all local progress, bookmarks, notes, and activity? This cannot be undone.")) return;
    progressStore.importData({}, "replace");
    bookmarkStore.importData([], "replace");
    notesStore.importData({}, "replace");
    activityStore.clear();
    // Subscribers re-render via emit() inside each store's importData/clear.
    // No reload needed — theme stays, scroll position preserved.
    alert("All local data cleared.");
  };

  return (
    <div className="p-xl">
      <Head title="Settings" />
      <MainColumn maxWidth="max-w-[720px]">
        <header className="mb-xl">
          <h1 className="text-display-xl m-0">Settings</h1>
        </header>

        <section className="mb-xl">
          <h2 className="text-label text-text-mute uppercase mb-md">Appearance</h2>
          <div className="flex gap-sm">
            {(["light","dark","system"] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => set(m)}
                aria-pressed={mode === m}
                className={[
                  "px-md py-sm rounded-sm border capitalize",
                  mode === m ? "bg-accent border-accent text-white" : "border-border text-text-mute hover:text-text hover:border-text-dim"
                ].join(" ")}
              >
                {m}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-xl">
          <h2 className="text-label text-text-mute uppercase mb-md">Data</h2>
          <div className="flex flex-wrap gap-sm">
            <button type="button" onClick={onExport} className="px-md py-sm rounded-sm border border-border text-text-mute hover:text-text hover:border-text-dim">Export progress (JSON)</button>
            <label className="px-md py-sm rounded-sm border border-border text-text-mute hover:text-text hover:border-text-dim cursor-pointer focus-within:border-accent">
              Import progress
              <input
                type="file"
                accept="application/json"
                onChange={onImport}
                aria-label="Import progress JSON"
                className="sr-only"
              />
            </label>
            <button type="button" onClick={onClearAll} className="px-md py-sm rounded-sm border border-danger text-danger hover:bg-danger hover:text-white">Clear all data</button>
          </div>
        </section>

        <section className="mb-xl">
          <h2 className="text-label text-text-mute uppercase mb-md">Keyboard shortcuts</h2>
          <ul className="text-body text-text-mute">
            <li className="py-xs border-t border-border-soft first:border-t-0"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">⌘K</kbd> open search palette</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">/</kbd> open search palette (when not focused in a form)</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">Esc</kbd> close palette / drawer</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">↑ ↓</kbd> move palette selection</li>
            <li className="py-xs border-t border-border-soft"><kbd className="font-mono text-caption border border-border rounded-sm px-xs">Enter</kbd> select / navigate</li>
          </ul>
        </section>

        <section>
          <h2 className="text-label text-text-mute uppercase mb-md">About</h2>
          <p className="text-body text-text-mute mb-sm">iceberg — a guided curriculum for production-readiness.</p>
          <ul className="text-caption text-text-mute flex flex-col gap-xs">
            <li>Version <span className="font-mono tabular-nums">{__APP_VERSION__}</span></li>
            <li><a href="/about" className="text-accent hover:underline">Why iceberg exists</a></li>
            <li><a href="/whats-new" className="text-accent hover:underline">What's new</a></li>
            <li><a href="/credits" className="text-accent hover:underline">Credits</a></li>
            <li><a href="https://github.com/peteramelang/iceberg" target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">Repository ↗</a></li>
            <li><a href="https://github.com/peteramelang/iceberg/blob/main/LICENSE" target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">License (code: MIT, content: CC BY-SA 4.0)</a></li>
          </ul>
        </section>
      </MainColumn>
    </div>
  );
}
