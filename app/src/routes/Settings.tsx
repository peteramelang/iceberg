import { useRef, useState } from "react";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { progressStore, bookmarkStore, notesStore } from "../stores/index.js";
import type { ExportPayload, ImportResult } from "../stores/types.js";

export function Settings() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");

  function doExport() {
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iceberg-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doImport(file: File, mode: "merge" | "replace") {
    const text = await file.text();
    let payload: ExportPayload;
    try { payload = JSON.parse(text); } catch { setStatus("[!] invalid JSON"); return; }
    if (payload.format !== "iceberg-progress") { setStatus("[!] not an iceberg-progress export"); return; }
    if (payload.version !== 1) { setStatus(`[!] unsupported version ${payload.version}`); return; }

    const r1: ImportResult = progressStore.importData(payload.data.progress, mode);
    const r2 = bookmarkStore.importData(payload.data.bookmarks, mode);
    const r3 = notesStore.importData(payload.data.notes, mode);
    setStatus(`[x] imported: ${r1.topicsMerged} topics, ${r2.bookmarksMerged} bookmarks, ${r3.notesMerged} notes${r3.conflicts.length ? ` (conflicts: ${r3.conflicts.join(", ")})` : ""}`);
  }

  return (
    <Page>
      <Section label="Export">
        <button onClick={doExport} className="px-lg py-xs bg-ink text-canvas rounded-sm">[+] download progress</button>
      </Section>
      <Section label="Import">
        <input ref={fileInput} type="file" accept="application/json" className="block" />
        <div className="mt-md flex gap-md">
          <button
            onClick={() => fileInput.current?.files?.[0] && doImport(fileInput.current.files[0], "merge")}
            className="px-lg py-xs border border-hairline-strong rounded-sm"
          >[+] merge</button>
          <button
            onClick={() => {
              if (!fileInput.current?.files?.[0]) return;
              if (confirm("Replace all local progress with imported data?")) {
                doImport(fileInput.current.files[0], "replace");
              }
            }}
            className="px-lg py-xs border border-danger text-danger rounded-sm"
          >[!] replace</button>
        </div>
        {status && <div className="mt-md text-caption-md">{status}</div>}
      </Section>
    </Page>
  );
}
