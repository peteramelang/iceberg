# UI Integration for Extension Data — Design

**Date:** 2026-05-15
**Branch (to be created):** `ui-integration-2026-05-15` off `extension-ai-and-modern-dev`
**Status:** Design locked, awaiting user review before plan writing.

## Context

The iceberg curriculum extension (`extension-ai-and-modern-dev`) doubled
the corpus: 46 → 80 topics, 7 → 12 paths, 7 → 11 phases. Three new fields
landed on the data side and are not yet surfaced in the UI:

- `tldr` (topics + paths) — plain-language 40–320 char summary.
- `shortExplainerVideo` (topics, optional) — a 15–600s YouTube primer.
  Present on 27 of 80 topics; `null` on the rest.
- `lastUpdatedAt` (topics + paths) — ISO datetime, trust signal.

In addition, every resource (videos.short, videos.long, articles,
services, courses) and the new `shortExplainerVideo` carries a
`reasoning` string explaining why it was curated. The reasoning is in
the data but currently hidden on the UI for resources. This design
surfaces it through a new info-dot tooltip primitive.

The Sidebar component truncates phase titles at 260px; the two new
phase titles ("Modern Backend & Platform", "Developer Experience &
Craft") get cut off. The sidebar widens to fit them.

## Goals

1. Surface `tldr`, `shortExplainerVideo`, `lastUpdatedAt` on Topic and
   Path pages without cluttering them.
2. Make reasoning discoverable per-resource without flooding the page
   with prose.
3. Accommodate 11 phases on the Home page in a way that tells the
   curriculum's story (foundations vs. modern + AI).
4. Fix sidebar truncation.
5. Make TLDR-style natural-language queries findable via Cmd-K.

## Non-goals (this branch)

- Global "non-technical reading mode" toggle.
- Global "last data refresh" sidebar/topbar line.
- Lite-thumbnail video pattern (we inline the iframe with
  `loading="lazy"` instead).
- Converting code-example and connection-edge reasoning to the InfoDot
  pattern — they already show reasoning inline; not regressing.
- Bundle-size optimizations.
- Any content, schema, pipeline, or DESIGN.md changes.

## Design

### 1. Sidebar — width bump to 300px

**Change:** `app/src/components/layout/Sidebar.tsx:62` —
`w-[260px]` → `w-[300px]`.

**Rationale:** With 11 phases, two new titles overflow 260px. Wrapping
to two lines was the alternative; widening keeps row heights uniform
and is the smaller behavioral change. 300px is the user-chosen width.

**Side effects:** Main content area is 40px narrower at every viewport
≥ `lg`. The Graph route has its own 280px right rail; combined with
300px sidebar that's 580px of chrome. Verify the Graph route still
reads well at the smallest desktop breakpoint.

### 2. Topic page — Primer block, removed summary, footer date

**File:** `app/src/routes/Topic.tsx`.

**Header sequence becomes:**

```
phase breadcrumb · Topic 3 of 7
Title                                       [intermediate · 4h]

┌────────────────────────────────────────────────────────────┐
│ Primer (bg-panel-2, rounded, padded)                       │
│                                                            │
│  TLDR text          │  [16:9 inline YouTube iframe + dot]  │
│  text-body-lg       │  loading="lazy"                      │
│                                                            │
└────────────────────────────────────────────────────────────┘

JumpNav
Definition (technical)
In Depth (narrative)
... existing sections unchanged ...

[main column footer]
Updated YYYY-MM-DD
```

**Specifics:**

- The existing `<p>{fm.summary}</p>` line is **removed** from this
  page. `summary` still serves Phase cards, search results, and
  `<meta description>` (which is set via `<Head description={...} />`
  — that must keep using `fm.summary`, not `fm.tldr`, because Head is
  the SEO surface).
- The Primer block is a single soft-panel container, `bg-panel-2`,
  rounded, padded to match existing RailCard treatment.
- Inside the Primer: a responsive 2-column grid (`grid-cols-1
  lg:grid-cols-[1fr_minmax(0,360px)] gap-md` or similar). On mobile,
  TLDR stacks on top of the video.
- TLDR text uses `text-title` (18px / lh 1.4 / weight 600) — the
  design system's "lead paragraph" size. Overrides line-height to
  `leading-[1.55]` for readable prose body.
- **No-video case (53 of 80 topics):** Primer collapses to a single
  full-width column with the TLDR only. The grid template falls back
  to one column when `fm.shortExplainerVideo == null`.
- **Video case (27 of 80):** the video card is the right-column of the
  grid and contains:
  - 16:9 YouTube iframe at
    `https://www.youtube.com/embed/<id>` derived from
    `shortExplainerVideo.url` (always
    `https://www.youtube.com/watch?v=<id>`). `aspect-video` utility
    enforces ratio. `loading="lazy"` avoids ~600KB initial JS cost.
  - Below the iframe: a metadata row containing title, author,
    formatted duration (`MM:SS` derived from `durationSeconds`), and
    the reasoning **InfoDot** (see §6).
- **Footer date:** a small `text-caption text-text-dim` line at the
  bottom of the main column, after the Notes section and before the
  Next-in-path card. Text: `Updated YYYY-MM-DD` (ISO date, no
  date-fns dependency).

**Defensive reads:** `fm.shortExplainerVideo` is declared
`nullable().optional()` in Zod. Read as
`const v = fm.shortExplainerVideo; if (v) { ... }`.

### 3. Path page — TLDR panel, description below, date in metadata

**File:** `app/src/routes/Path.tsx`.

**Structure becomes:**

```
Title
audience · 11 topics · ~25h · Updated YYYY-MM-DD

┌────────────────────────────────────────────────────────────┐
│ TLDR (bg-panel-2, rounded, padded)                         │
│ path.tldr text                                             │
└────────────────────────────────────────────────────────────┘

path.description as plain prose, current treatment

... topic cards ...
```

**Specifics:**

- TLDR sits in a soft panel (`bg-panel-2`, rounded, padded) — same
  chrome as the Topic page Primer for visual consistency.
- `path.description` stays in its current position, directly below
  the TLDR panel, with no treatment change.
- The metadata line gains `Updated YYYY-MM-DD` as a final segment.
- No InfoDot on the Path page (paths carry no `reasoning` field).

### 4. Home page — grouped phase sections

**File:** `app/src/routes/Home.tsx`, the "All phases" section only.

**Change:** Replace the single grid of 11 tiles with two grids, each
under its own sub-heading:

- **Production-Readiness Foundations** — phases at index 0–6 (the
  original 7).
- **Modern Full-Stack + AI** — phases at index 7–10 (the new 4).

**Specifics:**

- Existing 3-column grid (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`)
  and `PhaseTile` component are reused unchanged.
- Sub-headings: `h3`, `text-label text-text-mute uppercase` — matches
  existing section-label pattern.
- The split index lives as a single constant in `Home.tsx`
  (`FOUNDATION_PHASE_COUNT = 7`). Future taxonomy additions go to the
  second group by default; the constant is editable when curriculum
  arcs shift.
- Section count display (`<span>11</span>`) on the parent "All phases"
  header stays.

### 5. Cmd-K search — TLDR indexed

**File:** `app/src/utils/fuzzyIndex.ts`.

**Change:** Add `fm.tldr` to the topic-row text blob built around the
existing `title + summary + definition + resources` concatenation.
Add `path.tldr` to the path-row text blob if paths are indexed in the
same file.

**Specifics:**

- Equal weight with existing fields — single-line addition to the
  string concatenation.
- No ranking, weighting, or UI changes.

### 6. InfoDot — new tooltip primitive

**New file:** `app/src/components/interactive/InfoDot.tsx`.

**Visual:**

- ~14px circle containing a lowercase "i" glyph. `text-text-dim` at
  rest, `text-text-mute` on hover. Cursor pointer.
- Renders inline; intended placement: trailing the title or in a
  metadata row, with `gap-xs` from the preceding content.

**Interaction:**

- Click toggles open/closed. Touch tap = click. Keyboard:
  `Tab`-focusable button, `Enter` and `Space` toggle.
- Click outside closes. `Escape` closes.
- Single global open: opening one InfoDot closes any other. Achieved
  via outside-click handler (which closes whichever is open) plus an
  optional module-level open-id tracker for hard guarantees if more
  than one is open simultaneously.

**Popover content:**

- The `reasoning` string as plain text, `text-body` size, 1.5 line
  height. No internal header.
- Container: `bg-panel border border-border-soft rounded`, padded,
  subtle shadow. Width capped at 280px so 1–3-sentence reasoning
  paragraphs wrap nicely.

**Placement:**

- Floats above or below the trigger, auto-flipped based on viewport
  space. Default: below. If the trigger's bottom edge is in the
  bottom third of the viewport, render above instead.
- Horizontal: align popover left edge with trigger left edge; clamp
  the popover within the viewport's horizontal bounds so it cannot
  escape on the right.
- Position computed at open time via `getBoundingClientRect()` on the
  trigger and applied via inline `style={{ top, left }}`. No resize
  observer — outside-click on scroll closes the popover anyway.
- Rendered via React portal (`createPortal(_, document.body)`) so
  it escapes any `overflow: hidden` ancestor.

**Props:**

```ts
interface InfoDotProps {
  reasoning: string;     // text shown in the popover
  label?: string;        // aria-label override; default "Why this was picked"
}
```

**Where it appears:**

- Topic page Primer block, on the explainer-video card metadata row
  (when `fm.shortExplainerVideo` is non-null).
- Topic page resource sections — every `ResourceRow` for videos,
  articles, services, and courses. The InfoDot renders in the
  existing metadata cluster, after the secondary meta.

**`ResourceRow` change:**

- File: `app/src/components/domain/ResourceRow.tsx`.
- Add optional `reasoning?: string` prop.
- When set, render an `<InfoDot reasoning={reasoning} />` inside the
  row's metadata cluster. When undefined, render nothing (no layout
  shift).
- All call sites in `Topic.tsx` pass the matching `reasoning` field
  from the underlying resource object.

**What InfoDot does NOT touch:**

- `CodeExamples.tsx` renders `ex.reasoning` inline as italic mute
  text — leave as-is. (User instruction: don't regress existing
  inline reasoning.)
- `ConnectionGroup.tsx` and `Graph.tsx` render `c.reasoning` inline —
  leave as-is.

## Verification

Before UI work begins, all five gates must be clean:

```bash
npm run typecheck
npm run test --workspace=pipeline
npm run build:content
npm run build --workspace=app
npx tsx pipeline/scripts/verify-no-placeholders.ts
```

After UI work, the same five gates plus a dev-server smoke test:

```bash
npm run generate:changelog   # so /whats-new isn't empty in dev
npm run dev
```

Click through:

- `/` — confirm 11 phases split into two sub-sections under "All phases"
- `/topic/logging` — Primer block with video, reasoning InfoDot,
  footer "Updated YYYY-MM-DD"
- `/topic/prompting-for-code` — Primer block with TLDR only (no video,
  collapsed to single column)
- `/path/first-production-deploy` — TLDR panel, description below,
  "Updated YYYY-MM-DD" in metadata
- `/path/ai-first-web-developer` — same, new path with new-topic links
- `/phase/ai-assisted-development` — new phase route data-renders
- `/whats-new` — recent extension commits appear
- Cmd-K — typing "non-technical", "fast responses", partial new
  slugs ("prompt", "vector", "monorepo") finds the right topics
- Resource InfoDot — click an info-dot on a video / article /
  service / course row; popover appears with correct reasoning;
  outside click + Escape dismiss; touch tap works on a narrow viewport

## Constraints

- Branch: `ui-integration-2026-05-15` off
  `extension-ai-and-modern-dev`. Never push to `main`.
- Commits: incremental, no AI attribution in messages.
- PR target: `extension-ai-and-modern-dev`.
- Do not modify: `DESIGN.md`, `pipeline/schemas/*`,
  `pipeline/scripts/*`, content markdown files. Bug-fix exceptions
  go in a separate, small, clearly-scoped commit.
- Do not run `pipeline/scripts/full-finalize.ts`.

## Notes for the implementation plan

- The InfoDot is a foundation for any future per-item "why" surface.
  Build it small; resist scope-expanding it during this branch.
- The Primer block on the Topic page is the highest-leverage change
  (visible on every topic). Ship it first to de-risk; then Path TLDR;
  then Home grouping; then search; then InfoDot integration on
  resource rows.
- `Updated YYYY-MM-DD` formatting: derive from
  `new Date(fm.lastUpdatedAt).toISOString().slice(0, 10)`. No
  `date-fns`.
- The sidebar width change is one line. Worth a separate commit so
  any layout regression on the Graph route is easy to bisect.
