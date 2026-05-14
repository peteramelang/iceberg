# UI Integration for Extension Data — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the new `tldr`, `shortExplainerVideo`, and `lastUpdatedAt` content fields on the iceberg app; ship a new `InfoDot` tooltip primitive that surfaces per-resource `reasoning`; fix sidebar truncation; group the Home page phases into two curriculum arcs; add `tldr` to Cmd-K search.

**Architecture:** Pure UI work in `app/src/**`. No new dependencies. The app workspace has no test runner — verification is **typecheck + build + dev-server smoke test** after each commit, run as a five-gate suite at the start and end. A new self-contained component (`InfoDot`) is added under `app/src/components/interactive/`; existing routes (`Topic`, `Path`, `Home`) get targeted edits; `ResourceRow` gains an optional `reasoning` prop. Branch off `extension-ai-and-modern-dev`, PR back to it.

**Tech Stack:** React 18, TypeScript 5, Vite, Tailwind CSS 3, react-router-dom 6, Fuse.js. No new runtime deps.

---

## Pre-flight: Verification gates green on the source branch

Before touching any UI code, prove the data side is healthy. If any gate fails, stop and debug before continuing.

### Task 0: Verify source branch builds clean

**Files:** none modified.

- [ ] **Step 1: Confirm working tree clean and on the right branch**

```bash
git status --short
git branch --show-current
```

Expected output: `git status --short` is empty (the design-spec commit was already made earlier on `ui-integration-2026-05-15`). `git branch --show-current` prints `ui-integration-2026-05-15`. If you're on `extension-ai-and-modern-dev`, create the branch first:

```bash
git checkout -b ui-integration-2026-05-15
```

- [ ] **Step 2: Run all five verification gates**

```bash
npm run typecheck
npm run test --workspace=pipeline
npm run build:content
npm run build --workspace=app
npx tsx pipeline/scripts/verify-no-placeholders.ts
```

Expected: every command exits 0. The pipeline test run reports 22 passing tests. The app build reports a bundle-size warning on `shiki` (~1.2MB) — that warning is benign and pre-existing; don't fix it as part of this work.

- [ ] **Step 3: Generate the changelog so /whats-new works in dev**

```bash
npm run generate:changelog
```

Expected: writes `app/public/changelog.json` with the ~10 extension commits.

If any gate fails, stop and debug. The rest of this plan assumes a clean baseline.

---

## Task 1: Sidebar width 260px → 300px (one-line fix)

**Files:**
- Modify: `app/src/components/layout/Sidebar.tsx:62`

This is a single-commit task on its own because if it triggers a regression on the Graph route (which already has its own 280px right rail), it's easy to bisect.

- [ ] **Step 1: Edit the sidebar width**

Open `app/src/components/layout/Sidebar.tsx`. On line 62, change the `<aside>` className.

Before:
```tsx
<aside className="w-[260px] shrink-0 bg-panel border-r border-border h-[100dvh] sticky top-0 overflow-y-auto scrollbar-thin flex flex-col">
```

After:
```tsx
<aside className="w-[300px] shrink-0 bg-panel border-r border-border h-[100dvh] sticky top-0 overflow-y-auto scrollbar-thin flex flex-col">
```

- [ ] **Step 2: Typecheck and build**

```bash
npm run typecheck && npm run build --workspace=app
```

Expected: both pass.

- [ ] **Step 3: Smoke-test in the dev server**

```bash
npm run dev
```

Open `http://localhost:5173/` in a browser. Confirm:
- All 11 phase titles in the Curriculum section render on a single line (no `…` truncation).
- "Modern Backend & Platform" and "Developer Experience & Craft" are fully visible.
- The Graph route at `/graph` still renders without horizontal scrollbars at a normal desktop viewport (≥1280px).

Stop the dev server (Ctrl-C).

- [ ] **Step 4: Commit**

```bash
git add app/src/components/layout/Sidebar.tsx
git commit -m "sidebar: widen to 300px so 11-phase titles fit on one line"
```

---

## Task 2: InfoDot component (new tooltip primitive)

**Files:**
- Create: `app/src/components/interactive/InfoDot.tsx`

The InfoDot is self-contained and used by multiple consumers later in the plan. Build it standalone with no consumers so a regression in the primitive is isolated from a regression in its use.

- [ ] **Step 1: Create the InfoDot component**

Create `app/src/components/interactive/InfoDot.tsx` with the following contents:

```tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface InfoDotProps {
  reasoning: string;
  label?: string;
}

// A 14px "i" glyph button that toggles a small popover containing the
// `reasoning` text. Click outside or press Escape to dismiss. The popover
// is portalled to document.body so it escapes any overflow-hidden ancestor.
export function InfoDot({ reasoning, label = "Why this was picked" }: InfoDotProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: "above" | "below" } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Compute popover position synchronously after open flips true so the
  // popover never flashes at (0,0). useLayoutEffect runs before paint.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const POPOVER_WIDTH = 280;
    const GAP = 8;

    // Place below by default; flip above if trigger sits in the bottom third.
    const placeAbove = rect.bottom > (viewportH * 2) / 3;
    const top = placeAbove
      ? rect.top + window.scrollY - GAP // popover sits above; its bottom edge will be rect.top - GAP after transform
      : rect.bottom + window.scrollY + GAP;

    // Horizontal: align popover left edge with trigger left edge, clamp to viewport.
    let left = rect.left + window.scrollX;
    const overflowRight = left + POPOVER_WIDTH - (window.scrollX + viewportW - 8);
    if (overflowRight > 0) left -= overflowRight;
    if (left < window.scrollX + 8) left = window.scrollX + 8;

    setPos({ top, left, placement: placeAbove ? "above" : "below" });
  }, [open]);

  // Outside-click + Escape dismissal. One listener registered while open.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-pill border border-current text-text-dim hover:text-text-mute text-[9px] font-semibold leading-none align-middle"
      >
        i
      </button>
      {open && pos && createPortal(
        <div
          ref={popoverRef}
          role="tooltip"
          style={{
            position: "absolute",
            top: pos.placement === "above" ? undefined : pos.top,
            // For "above", translate(-100%) on Y via inline style isn't ideal
            // in absolute mode; compute the bottom-anchored top via measuring
            // after first render. Easiest: use the dot's top and translateY(-100%).
            ...(pos.placement === "above" && triggerRef.current
              ? { top: triggerRef.current.getBoundingClientRect().top + window.scrollY - 8, transform: "translateY(-100%)" }
              : {}),
            left: pos.left,
            width: 280,
            zIndex: 50
          }}
          className="bg-panel border border-border-soft rounded p-md shadow-card text-body text-text leading-[1.5]"
        >
          {reasoning}
        </div>,
        document.body
      )}
    </>
  );
}
```

Note on positioning: the `above` branch uses a small `translateY(-100%)` trick so the popover's bottom edge sits `GAP` pixels above the trigger's top edge. This keeps the implementation portable without measuring the popover's own height.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: pass. No type errors. (No consumers yet, so this just confirms the file compiles.)

- [ ] **Step 3: Commit**

```bash
git add app/src/components/interactive/InfoDot.tsx
git commit -m "feat(ui): InfoDot tooltip primitive for per-item reasoning"
```

---

## Task 3: ResourceRow accepts optional reasoning, renders InfoDot

**Files:**
- Modify: `app/src/components/domain/ResourceRow.tsx`

The InfoDot is now usable. Thread an optional `reasoning` prop through `ResourceRow` so the four resource sections on the Topic page can pass it.

- [ ] **Step 1: Add `reasoning` prop and render an InfoDot when set**

Open `app/src/components/domain/ResourceRow.tsx`. Apply two edits.

Edit A — add the import (top of the file, after the existing imports):

```tsx
import { InfoDot } from "../interactive/InfoDot.js";
```

Edit B — update the component signature and the metadata row.

Before (lines 13–24):
```tsx
export function ResourceRow({
  topicSlug, topicTitle, resourceKey, kind, title, meta, url, secondaryMeta
}: {
  topicSlug: string;
  topicTitle: string;
  resourceKey: string;
  kind: ResourceKind;
  title: string;
  meta: string;
  url: string;
  secondaryMeta?: string;
}) {
```

After:
```tsx
export function ResourceRow({
  topicSlug, topicTitle, resourceKey, kind, title, meta, url, secondaryMeta, reasoning
}: {
  topicSlug: string;
  topicTitle: string;
  resourceKey: string;
  kind: ResourceKind;
  title: string;
  meta: string;
  url: string;
  secondaryMeta?: string;
  reasoning?: string;
}) {
```

Edit C — update the inner `<a>` metadata row to include the InfoDot when `reasoning` is set.

Before (lines 66–80):
```tsx
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="min-w-0 outline-offset-2"
      >
        <div className="flex items-center gap-sm flex-wrap">
          <span
            className="inline-block text-[11px] px-xs py-[1px] rounded-sm border"
            style={{ color: c.fg, background: c.bg, borderColor: c.border }}
          >{kind}</span>
          <span className="text-body-strong text-text truncate">{title}</span>
        </div>
        <div className="text-caption text-text-mute mt-xs truncate">{meta}</div>
      </a>
```

After:
```tsx
      <div className="min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="block outline-offset-2"
        >
          <div className="flex items-center gap-sm flex-wrap">
            <span
              className="inline-block text-[11px] px-xs py-[1px] rounded-sm border"
              style={{ color: c.fg, background: c.bg, borderColor: c.border }}
            >{kind}</span>
            <span className="text-body-strong text-text truncate">{title}</span>
          </div>
          <div className="text-caption text-text-mute mt-xs truncate">{meta}</div>
        </a>
        {reasoning && (
          <div className="mt-xs">
            <InfoDot reasoning={reasoning} label={`Why "${title}" was picked`} />
          </div>
        )}
      </div>
```

Why the structural change: the InfoDot is a `<button>`; nesting it inside an `<a>` is invalid HTML and breaks click-to-open. Wrapping both the link and the dot in a sibling `<div>` keeps the link's full click target intact while letting the dot stand on its own.

- [ ] **Step 2: Typecheck and build**

```bash
npm run typecheck && npm run build --workspace=app
```

Expected: pass. (No call site passes `reasoning` yet, so no behavior change visible.)

- [ ] **Step 3: Commit**

```bash
git add app/src/components/domain/ResourceRow.tsx
git commit -m "feat(ui): ResourceRow accepts optional reasoning, renders InfoDot"
```

---

## Task 4: Topic page — Primer block (TLDR + video), summary removed, footer date

**Files:**
- Modify: `app/src/routes/Topic.tsx`

This is the highest-leverage change. It touches every topic page. Be deliberate.

- [ ] **Step 1: Add a small helper to format the date**

At the top of `app/src/routes/Topic.tsx`, just below the existing imports, add a tiny formatting helper. (Module scope, no React state.)

Add after the imports (around line 27, just before the route component):

```tsx
function formatUpdated(iso: string): string {
  // Render ISO datetime as YYYY-MM-DD. Returns the raw input on parse failure
  // so the page doesn't blank out on malformed data (defensive — schema says
  // it's always valid).
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
```

Also extract the YouTube video ID from a watch URL. Add this helper directly below `formatUpdated`:

```tsx
function youtubeEmbedUrl(watchUrl: string): string | null {
  // Accepts https://www.youtube.com/watch?v=<id> (the canonical form used
  // throughout content). Returns the matching /embed/ URL, or null if the
  // input doesn't parse.
  try {
    const u = new URL(watchUrl);
    const id = u.searchParams.get("v");
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}`;
  } catch {
    return null;
  }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
```

- [ ] **Step 2: Replace the header block (remove summary, add Primer)**

Find this block in `app/src/routes/Topic.tsx` (currently lines 104–123 inside `TopicView`):

```tsx
        <header className="mb-md">
          {fromPath && (
            <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
              In path:{" "}
              <Link to={`/path/${fromPath.slug}`} className="text-accent hover:text-accent-hover">
                {fromPath.title}
              </Link>
            </div>
          )}
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            {!fromPath && <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />}
            {phase?.title} · Topic {phaseIndex} of {phase?.topics.length}
          </div>
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="text-display-xl m-0">{fm.title}</h1>
            <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
          </div>
          <p className="text-body text-text-mute mt-sm max-w-[720px]">{fm.summary}</p>
        </header>
```

Replace it with this (removes the `<p>{fm.summary}</p>` line; adds the Primer block immediately after the header):

```tsx
        <header className="mb-md">
          {fromPath && (
            <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />
              In path:{" "}
              <Link to={`/path/${fromPath.slug}`} className="text-accent hover:text-accent-hover">
                {fromPath.title}
              </Link>
            </div>
          )}
          <div className="text-label text-text-mute uppercase mb-sm flex items-center gap-sm">
            {!fromPath && <span className="inline-block w-[6px] h-[6px] rounded-full bg-accent" />}
            {phase?.title} · Topic {phaseIndex} of {phase?.topics.length}
          </div>
          <div className="flex items-center gap-md flex-wrap">
            <h1 className="text-display-xl m-0">{fm.title}</h1>
            <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
          </div>
        </header>

        <Primer fm={fm} />
```

Notes:
- The `<p>{fm.summary}</p>` is gone. `summary` still lives in the data and is used by `<Head description={fm.summary} />` on line 102 — DO NOT change that; SEO meta should stay tech-leaning.
- The Primer component is defined in Step 3 below. It receives the whole `fm` so it can branch on `fm.shortExplainerVideo`.

- [ ] **Step 3: Define the Primer component inside Topic.tsx**

At the bottom of `app/src/routes/Topic.tsx`, after the closing brace of `TopicView`, add the Primer component:

```tsx
function Primer({ fm }: { fm: TopicFrontmatter }) {
  const v = fm.shortExplainerVideo;
  const embedUrl = v ? youtubeEmbedUrl(v.url) : null;

  return (
    <section
      className={[
        "mb-xl bg-panel-2 border border-border-soft rounded p-lg",
        v && embedUrl
          ? "grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)] gap-lg items-start"
          : ""
      ].join(" ")}
    >
      <p className="text-title text-text leading-[1.55] m-0">{fm.tldr}</p>
      {v && embedUrl && (
        <div>
          <div className="aspect-video w-full rounded-sm overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title={v.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <div className="mt-sm flex items-start gap-sm">
            <div className="min-w-0 flex-1">
              <div className="text-body-strong text-text truncate">{v.title}</div>
              <div className="text-caption text-text-mute truncate">{v.author} · {formatDuration(v.durationSeconds)}</div>
            </div>
            <InfoDot reasoning={v.reasoning} label={`Why this primer was picked`} />
          </div>
        </div>
      )}
    </section>
  );
}
```

Note: `Primer` uses `youtubeEmbedUrl` and `formatDuration` from Step 1, plus the `InfoDot` and `TopicFrontmatter` type. Add these imports at the top of the file:

```tsx
import { InfoDot } from "../components/interactive/InfoDot.js";
```

`TopicFrontmatter` is already imported on line 22 — no change needed there.

- [ ] **Step 4: Add `reasoning` to the four resource sections**

The Topic.tsx file currently passes `reasoning` to none of its `ResourceRow` instances. Add it to all five resource rows.

Find the videos.short block (around line 161):

```tsx
              {fm.resources.videos.short && (
                <ResourceRow topicSlug={fm.slug} topicTitle={fm.title} resourceKey="videos.short" kind="Video" title={fm.resources.videos.short.title} meta={fm.resources.videos.short.author} url={fm.resources.videos.short.url} secondaryMeta={`${fm.resources.videos.short.durationMinutes} min`} />
              )}
              {fm.resources.videos.long && (
                <ResourceRow topicSlug={fm.slug} topicTitle={fm.title} resourceKey="videos.long" kind="Video" title={fm.resources.videos.long.title} meta={fm.resources.videos.long.author} url={fm.resources.videos.long.url} secondaryMeta={`${fm.resources.videos.long.durationMinutes} min`} />
              )}
```

Replace with:

```tsx
              {fm.resources.videos.short && (
                <ResourceRow topicSlug={fm.slug} topicTitle={fm.title} resourceKey="videos.short" kind="Video" title={fm.resources.videos.short.title} meta={fm.resources.videos.short.author} url={fm.resources.videos.short.url} secondaryMeta={`${fm.resources.videos.short.durationMinutes} min`} reasoning={fm.resources.videos.short.reasoning} />
              )}
              {fm.resources.videos.long && (
                <ResourceRow topicSlug={fm.slug} topicTitle={fm.title} resourceKey="videos.long" kind="Video" title={fm.resources.videos.long.title} meta={fm.resources.videos.long.author} url={fm.resources.videos.long.url} secondaryMeta={`${fm.resources.videos.long.durationMinutes} min`} reasoning={fm.resources.videos.long.reasoning} />
              )}
```

Find the articles block (around line 177):

```tsx
              {fm.resources.articles.map((a, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`articles.${i}`} kind="Article" title={a.title} meta={a.publisher ?? a.author ?? a.kind} url={a.url} />
              ))}
```

Replace with:

```tsx
              {fm.resources.articles.map((a, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`articles.${i}`} kind="Article" title={a.title} meta={a.publisher ?? a.author ?? a.kind} url={a.url} reasoning={a.reasoning} />
              ))}
```

Find the services block (around line 191):

```tsx
              {fm.resources.services.map((s, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`services.${i}`} kind="Service" title={s.name} meta={`${s.category}${s.vendor ? " · " + s.vendor : ""}`} url={s.url} />
              ))}
```

Replace with:

```tsx
              {fm.resources.services.map((s, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`services.${i}`} kind="Service" title={s.name} meta={`${s.category}${s.vendor ? " · " + s.vendor : ""}`} url={s.url} reasoning={s.reasoning} />
              ))}
```

Find the courses block (around line 205):

```tsx
              {fm.resources.courses.map((c, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`courses.${i}`} kind="Course" title={c.title} meta={`${c.provider}${c.paid ? " · paid" : " · free"}`} url={c.url} />
              ))}
```

Replace with:

```tsx
              {fm.resources.courses.map((c, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} topicTitle={fm.title} resourceKey={`courses.${i}`} kind="Course" title={c.title} meta={`${c.provider}${c.paid ? " · paid" : " · free"}`} url={c.url} reasoning={c.reasoning} />
              ))}
```

- [ ] **Step 5: Add the footer "Updated" line**

Find the Notes section + the trailing fromPath blocks. Insert the Updated line at the very end of MainColumn, after the existing Notes section and after the fromPath/nextInPath blocks.

Locate the closing `</MainColumn>` tag (around line 250). Just before it, after the last existing section, insert:

```tsx
        <div className="pt-xl mt-xl border-t border-border-soft text-caption text-text-dim">
          Updated {formatUpdated(fm.lastUpdatedAt)}
        </div>
```

The MainColumn closing block ends up as:

```tsx
        {fromPath && !nextInPath && (
          <section className="pt-xl mt-xl border-t border-border-soft">
            <div className="text-label text-text-mute uppercase mb-sm">End of path</div>
            <Link to={`/path/${fromPath.slug}`} className="text-accent hover:text-accent-hover text-body">
              ← Back to {fromPath.title}
            </Link>
          </section>
        )}

        <div className="pt-xl mt-xl border-t border-border-soft text-caption text-text-dim">
          Updated {formatUpdated(fm.lastUpdatedAt)}
        </div>
      </MainColumn>
```

- [ ] **Step 6: Typecheck and build**

```bash
npm run typecheck && npm run build --workspace=app
```

Expected: both pass.

- [ ] **Step 7: Smoke-test in the dev server**

```bash
npm run dev
```

Verify in the browser:
- `/topic/logging` — Primer block renders, soft panel background, TLDR text on the left at title size, 16:9 YouTube embed on the right, video metadata + InfoDot below the player. The technical `summary` paragraph is GONE from the header. The `Definition` section still renders below.
- `/topic/prompting-for-code` — Primer block renders TLDR only, full width (no video column). No empty video slot.
- Below each resource row's title/meta block, a small "i" InfoDot appears. Click it: popover appears below the dot (or above if near the viewport bottom), contains the reasoning text, dismisses on outside click and on Escape.
- On the Primer's video card, an "i" InfoDot appears next to the video title/author row. Click works the same way.
- Scroll to the bottom of any topic page. Confirm "Updated YYYY-MM-DD" appears as a small mute line above the next-in-path card (if any) or just at the page bottom.

Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add app/src/routes/Topic.tsx
git commit -m "feat(ui): topic Primer block (tldr + video) + lastUpdated footer + per-resource reasoning"
```

---

## Task 5: Path page — TLDR panel, description below, date in metadata

**Files:**
- Modify: `app/src/routes/Path.tsx`

- [ ] **Step 1: Add the same date helper at the top of Path.tsx**

Open `app/src/routes/Path.tsx`. Just after the imports (around line 11, before `export function Path()`), add:

```tsx
function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().slice(0, 10);
}
```

(This duplicates the helper in Topic.tsx. Two small duplications of a 4-line pure function across two routes is acceptable; extracting to a shared util is unnecessary for now. YAGNI.)

- [ ] **Step 2: Update the header block**

Find the existing header (lines 34–38):

```tsx
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm">{p.audience} · ~{p.estimatedHours}h · {p.topics.length} topics</div>
          <h1 className="text-display-xl m-0 mb-xs">{p.title}</h1>
          <p className="text-body text-text-mute max-w-[720px]">{p.description}</p>
        </header>
```

Replace with:

```tsx
        <header className="mb-xl">
          <div className="text-label text-text-mute uppercase mb-sm">{p.audience} · ~{p.estimatedHours}h · {p.topics.length} topics · Updated {formatUpdated(p.lastUpdatedAt)}</div>
          <h1 className="text-display-xl m-0 mb-md">{p.title}</h1>
          <div className="bg-panel-2 border border-border-soft rounded p-lg mb-md">
            <p className="text-title text-text leading-[1.55] m-0">{p.tldr}</p>
          </div>
          <p className="text-body text-text-mute max-w-[720px]">{p.description}</p>
        </header>
```

Changes:
- The metadata line gains `· Updated YYYY-MM-DD`.
- The `<h1>` margin bumps from `mb-xs` to `mb-md` so the TLDR panel doesn't crowd the title.
- A new soft-panel block holds `p.tldr` at title size (matches Topic Primer typography).
- `<p>{p.description}</p>` stays below — same treatment as before.

- [ ] **Step 3: Typecheck and build**

```bash
npm run typecheck && npm run build --workspace=app
```

Expected: pass.

- [ ] **Step 4: Smoke-test**

```bash
npm run dev
```

Verify:
- `/path/first-production-deploy` — title sits above a soft-panel TLDR block ("Get your app ready for real users…"), description ("The critical foundation a solo founder needs…") sits below in plain prose. Metadata line shows "Updated YYYY-MM-DD" at the end.
- `/path/ai-first-web-developer` — same structure, new path content.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/src/routes/Path.tsx
git commit -m "feat(ui): path TLDR panel + lastUpdated in metadata line"
```

---

## Task 6: Home — grouped phase sections

**Files:**
- Modify: `app/src/routes/Home.tsx`

- [ ] **Step 1: Add the split-index constant and replace the "All phases" section**

Open `app/src/routes/Home.tsx`. Locate the "All phases" section (lines 133–145):

```tsx
        {phases.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">All phases</h2>
              <span className="text-caption text-text-dim">{phases.length}</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
              {phases.map((p, i) => (
                <PhaseTile key={p.slug} index={i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
              ))}
            </div>
          </section>
        )}
```

Replace with:

```tsx
        {phases.length > 0 && (
          <section className="mt-xl">
            <header className="flex items-baseline gap-md mb-md">
              <h2 className="text-label text-text-mute uppercase m-0">All phases</h2>
              <span className="text-caption text-text-dim">{phases.length}</span>
            </header>
            {(() => {
              // Split point: the original curriculum had 7 production-readiness
              // phases; the extension added 4 modern-fullstack-and-AI phases at
              // the end. Edit this constant if the curriculum arcs ever shift.
              const FOUNDATION_PHASE_COUNT = 7;
              const foundations = phases.slice(0, FOUNDATION_PHASE_COUNT);
              const modern = phases.slice(FOUNDATION_PHASE_COUNT);
              return (
                <>
                  {foundations.length > 0 && (
                    <>
                      <h3 className="text-label text-text-dim uppercase mt-md mb-md">Production-Readiness Foundations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                        {foundations.map((p, i) => (
                          <PhaseTile key={p.slug} index={i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
                        ))}
                      </div>
                    </>
                  )}
                  {modern.length > 0 && (
                    <>
                      <h3 className="text-label text-text-dim uppercase mt-xl mb-md">Modern Full-Stack + AI</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                        {modern.map((p, i) => (
                          <PhaseTile key={p.slug} index={FOUNDATION_PHASE_COUNT + i + 1} slug={p.slug} title={p.title} topicSlugs={p.topics} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </section>
        )}
```

Note the `index` math in the second grid: the `PhaseTile` index prop is 1-based and continues across the split (8, 9, 10, 11 for the modern phases), preserving the existing tile numbering.

- [ ] **Step 2: Typecheck and build**

```bash
npm run typecheck && npm run build --workspace=app
```

Expected: pass.

- [ ] **Step 3: Smoke-test**

```bash
npm run dev
```

Verify on `/`:
- The "All phases" section shows two sub-sections.
- First sub-section is labeled "Production-Readiness Foundations" with 7 tiles (Foundations, Reliability and Scale, …).
- Second sub-section is labeled "Modern Full-Stack + AI" with 4 tiles (AI-Assisted Development, Modern Frontend, Modern Backend & Platform, Developer Experience & Craft).
- Tile numbering reads 1–7 for the first group and 8–11 for the second.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/src/routes/Home.tsx
git commit -m "feat(ui): home — group phases into foundations vs modern+AI"
```

---

## Task 7: Cmd-K search — add tldr to topic and path index entries

**Files:**
- Modify: `app/src/utils/fuzzyIndex.ts`

- [ ] **Step 1: Add `fm.tldr` to the topic text blob and `p.tldr` to the path text blob**

Open `app/src/utils/fuzzyIndex.ts`. Two single-line edits.

Edit A — topic text blob (line 39):

Before:
```tsx
      text: `${fm.title} ${fm.summary} ${fm.definition} ${fm.slug}`,
```

After:
```tsx
      text: `${fm.title} ${fm.tldr} ${fm.summary} ${fm.definition} ${fm.slug}`,
```

Edit B — path text blob (line 110):

Before:
```tsx
      text: `${p.title} ${p.description} ${p.audience}`,
```

After:
```tsx
      text: `${p.title} ${p.tldr} ${p.description} ${p.audience}`,
```

- [ ] **Step 2: Typecheck and build**

```bash
npm run typecheck && npm run build --workspace=app
```

Expected: pass.

- [ ] **Step 3: Smoke-test**

```bash
npm run dev
```

Open Cmd-K (`Cmd/Ctrl + K`):
- Type "non-technical" — at least one topic with a plain-language tldr containing similar phrasing should appear. (Try also: "fast responses", "compiles and runs", "be specific".)
- Type "prompt" — `prompting-for-code` appears.
- Type "vector" — `search-and-vector-store` appears.
- Type "monorepo" — `monorepos` appears.

Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/src/utils/fuzzyIndex.ts
git commit -m "feat(search): index topic and path tldr for natural-language queries"
```

---

## Task 8: Final verification suite + dev-server walkthrough

**Files:** none modified.

- [ ] **Step 1: Run the full five-gate suite**

```bash
npm run typecheck
npm run test --workspace=pipeline
npm run build:content
npm run build --workspace=app
npx tsx pipeline/scripts/verify-no-placeholders.ts
```

Expected: every command exits 0.

- [ ] **Step 2: Regenerate changelog and start the dev server**

```bash
npm run generate:changelog
npm run dev
```

- [ ] **Step 3: Walk through the full smoke list**

Click through and confirm each:

- `/` — Home page. 11 phases split into "Production-Readiness Foundations" (7 tiles) and "Modern Full-Stack + AI" (4 tiles).
- Sidebar — all 11 phase titles fit on one line; "Modern Backend & Platform" and "Developer Experience & Craft" are not truncated.
- `/topic/logging` — Primer block, TLDR on left, 16:9 video on right, video metadata with InfoDot. Resources sections render InfoDots on the right of each row. Footer shows "Updated YYYY-MM-DD".
- `/topic/prompting-for-code` — Primer block with TLDR only, full width, no video slot.
- `/topic/multi-region-support` — sanity check on a topic from the original 46; Primer + footer date + InfoDots all work.
- Click an InfoDot → popover renders; outside-click dismisses; Escape dismisses; second click on the same dot toggles it off.
- `/path/first-production-deploy` — TLDR panel below title, description below, "Updated YYYY-MM-DD" in metadata.
- `/path/ai-first-web-developer` — same structure on a new path.
- `/phase/ai-assisted-development` — phase route still renders (data-driven, no changes expected).
- `/whats-new` — recent extension commits appear.
- Cmd-K — partial searches for "prompt", "monorepo", "vector", "non-technical" all surface the expected topics.

Stop the dev server.

- [ ] **Step 4: Final summary commit (if needed)**

If any cleanup edits were made during the walkthrough, commit them. Otherwise skip.

```bash
git status --short
```

If clean, no commit needed.

- [ ] **Step 5: Push branch and open PR**

```bash
git push -u origin ui-integration-2026-05-15
```

Then open a PR via `gh`:

```bash
gh pr create --base extension-ai-and-modern-dev --title "UI integration for extension data" --body "$(cat <<'EOF'
## Summary
- Surfaces the new `tldr`, `shortExplainerVideo`, and `lastUpdatedAt` fields on Topic and Path pages.
- Adds an `InfoDot` tooltip primitive that exposes per-resource `reasoning` (videos, articles, services, courses, primer video).
- Widens sidebar to 300px so all 11 phase titles fit on one line.
- Groups the Home "All phases" section into Production-Readiness Foundations (7) and Modern Full-Stack + AI (4).
- Adds topic and path `tldr` to the Cmd-K search index.

## Test plan
- [ ] All five verification gates green (typecheck, pipeline test, build:content, app build, verify-no-placeholders).
- [ ] Smoke walkthrough completed per `docs/superpowers/plans/2026-05-15-ui-integration.md` Task 8 Step 3.
EOF
)"
```

Done. The plan is fully shipped.

---

## Notes for the engineer

- The `app/` workspace has no test runner. Verification = typecheck + build + browser smoke. Do not add a test runner as part of this work; that's its own project.
- All file paths are absolute from the repo root. Line numbers reflect the state of `extension-ai-and-modern-dev` HEAD at plan-writing time; if you've branched and made interim edits, line numbers may have drifted — match by surrounding code instead.
- Every commit lands on `ui-integration-2026-05-15`. Never push to `main`. PR target is `extension-ai-and-modern-dev`.
- Don't run `pipeline/scripts/full-finalize.ts` (destructive).
- Don't touch `DESIGN.md`, `pipeline/schemas/*`, `pipeline/scripts/*`, or content markdown.
- Commit messages: no AI attribution (per user's global instruction in CLAUDE.md).
