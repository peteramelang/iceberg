# Handover — UI Integration for Extension Data

**For:** A fresh Claude Code session, no prior context.
**Date:** 2026-05-15
**Branch to work on:** new branch off `extension-ai-and-modern-dev` (do NOT
work directly on `main`).

## Read me first

If you only read one paragraph, read this one.

The iceberg curriculum just doubled in size (46 → 80 topics, 7 → 12 paths,
7 → 11 phases) and gained three new data fields on every topic and path.
The pipeline + content side is fully done, validated, tested, and pushed
to `origin/extension-ai-and-modern-dev`. **No UI changes have been made
yet.** Your job is to render the new fields in the app, ship any path/phase
navigation changes the new content needs, and verify the result is good.

The new fields are:
- `tldr` (string, 40–320 chars) — plain-language summary for non-technical
  readers or quick skim. Required on every topic and every path.
- `shortExplainerVideo` (object or null) — a 15–600s primer video. Present
  on 27 of 80 topics; `null` on the rest. Optional.
- `lastUpdatedAt` (ISO datetime string) — required on every topic and
  every path. Intended to be surfaced so users see how fresh the entry is.

That's the entirety of what's new on the data side. The rest of this
document tells you exactly where to find things, what to build, and what
gotchas exist.

## Starting the session

```bash
cd /Users/peteramelang/dev/private/learn-prod-stack
git fetch origin
git checkout extension-ai-and-modern-dev
git pull
git checkout -b ui-integration-2026-05-15
```

Read these files before doing anything else (in this order):

1. `docs/superpowers/extension-summary-2026-05-15.md` — what shipped on
   the data side, why, and the new phase/path inventory.
2. `docs/superpowers/extension-issues-2026-05-15.md` — known gaps and
   follow-ups, including things you can ignore for the UI work.
3. `docs/superpowers/specs/2026-05-15-extension-ai-and-modern-dev.md` —
   the brainstorm + spec doc. Useful for understanding the intent of each
   new phase.

Then verify everything still builds:

```bash
npm run build:content
npm run typecheck
npm run build --workspace=app
npm run test --workspace=pipeline
npx tsx pipeline/scripts/verify-no-placeholders.ts
```

Expected: clean on all five. If any fail, stop and debug before touching UI.

## Data shapes (read these in the source)

The authoritative type definitions live in:

- `pipeline/lib/content.ts` — TypeScript interfaces used by the pipeline.
- `app/src/content/types.ts` — Zod schemas + inferred types used by the app.

The shapes you'll touch most:

```ts
// Topic frontmatter (excerpt — full type in pipeline/lib/content.ts):
{
  slug: string;
  title: string;
  phase: string;
  summary: string;           // tech-leaning one-liner
  tldr: string;              // NEW: 40-320 chars, plain language
  definition: string;        // tech-leaning paragraph
  shortExplainerVideo: {     // NEW: optional, null when no good source
    url: string;             // canonical YouTube URL
    title: string;
    author: string;
    durationSeconds: number; // 15-600
    reasoning: string;
    source?: "ai-researcher" | "human-curator";
  } | null;
  narrative: string;         // long-form, ≥400 chars
  pitfalls: { title; explanation }[];
  codeExamples: { language; title; code; reasoning }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  lastUpdatedAt: string;     // NEW: ISO datetime
  // ... resources, provenance, etc.
}

// Path:
{
  slug: string;
  title: string;
  tldr: string;              // NEW
  description: string;
  audience: string;
  estimatedHours: number;
  topics: string[];
  lastUpdatedAt: string;     // NEW
}
```

The app's runtime parser is `app/src/content/index.ts`, which exposes
`topics`, `paths`, `taxonomy`, `connections`, `getTopic(slug)`,
`getPath(slug)`, `getPhase(slug)`. All the data is ready to read.

## What the UI should do (proposed plan — adapt as you see fit)

### A. Topic page (`app/src/routes/Topic.tsx`)

Add three things, in this order, near the top of the page (after the
title + difficulty badge but before the technical `definition`):

1. **TLDR strip.** Render `fm.tldr` in a visually distinct block — a
   slightly larger font, a softer background, maybe with a small label
   like "In a nutshell" or no label at all if the design is clear.
   It exists to give non-technical readers and skimmers the gist in
   under 10 seconds. Treat it as the FIRST thing a reader sees on the
   page; the existing `definition` follows below as the technical depth.
   The current Topic layout already has a `Narrative` component that
   renders the long-form prose — don't conflate it with TLDR.
2. **Short explainer video.** When `fm.shortExplainerVideo` is non-null,
   render a small embedded player or a clickable thumbnail card. YouTube
   embeds work via `https://www.youtube.com/embed/<id>` derived from the
   `url` field (the URL is always `https://www.youtube.com/watch?v=<id>`).
   Show the title, author, and duration ("4:30" formatted from
   `durationSeconds`). When it is `null`, render nothing — do NOT show
   "no video" as a placeholder.
3. **Last updated.** Small, mute text somewhere unobtrusive — probably
   alongside the difficulty badge or in the page footer area of the
   topic. Format `fm.lastUpdatedAt` as "Updated <relative time>" or
   "Updated YYYY-MM-DD" depending on the design vibe. `date-fns` is not
   currently a dependency; either add it (small) or do the formatting
   inline.

### B. Path page (`app/src/routes/Path.tsx`)

Mirror what you do for topics:

1. **TLDR strip** at the top, above `path.description`.
2. **Last updated** in the metadata line that already shows audience /
   topic count / hours.

### C. Phase/Home navigation for 4 new phases

The taxonomy now has 11 phases. The current Home page renders all phases
in a list. With 11 phases it may need a visual rework — group them, or
use tiles, or keep the list but make the new phase descriptions readable.
The four new phases:

- `ai-assisted-development`
- `modern-frontend`
- `modern-backend-and-platform`
- `developer-experience-and-craft`

Each has 7–10 topics. The Phase route should already work for them
(it's data-driven), but please click through and confirm.

### D. Cmd-K search

`app/src/utils/fuzzyIndex.ts` builds the search index. It indexes
`title`, `summary`, `definition`, `resources`. Consider adding `tldr` so
that searches like "non-technical" or plain-language phrasings find the
right topic. One-line addition to the index builder + key weights.

### E. Whats-new (`app/src/routes/WhatsNew.tsx`)

This route reads `/changelog.json` (built from git history of `content/`
during `npm run build`). The extension branch has ~10 large content
commits the user will want to see. Verify the page renders them and
they read sensibly.

### F. Sidebar / Topbar

`app/src/components/layout/Sidebar.tsx` and `Topbar.tsx` already exist.
If you add a "Last Updated" feature globally, consider whether the
Sidebar should show "Last data refresh: <date>" — the most-recent
`lastUpdatedAt` across all content gives you that date with one reduce.

### G. (Optional) "Non-technical mode" toggle

The user explicitly asked about non-technical readers when proposing
`tldr`. If you want to go further, consider a global toggle (probably in
Settings) that swaps `definition` for `tldr` on the Topic page so
non-tech readers don't get hit with technical paragraphs. This is OUT of
scope for a minimal UI integration but worth proposing once the basics
are shipped.

## Things to NOT touch

- `DESIGN.md` — the project owner has explicitly excluded it from any
  edits.
- The schema files (`pipeline/schemas/*.json`) — they're already correct.
- The pipeline scripts (`pipeline/scripts/*.ts`) — they're done.
- The content markdown — it's done. If you find a problematic topic
  (typo, bad link), fix it in a separate small commit, not as part of
  the UI work.
- `pipeline/scripts/full-finalize.ts` — it's destructive and now
  guarded behind `--force`. Don't run it.

## Gotchas

1. **27 of 80 topics have an explainer video; 53 do not.** Make sure your
   rendering gracefully omits the video block when `shortExplainerVideo`
   is `null`. The Topic page should not have an empty box.

2. **The Zod schema for `shortExplainerVideo` is `nullable().optional()`**
   (`app/src/content/types.ts`). The field is always present in current
   content but a future stub could omit it. Read it defensively:
   `const v = fm.shortExplainerVideo; if (v) { ... }`

3. **Path order in `_paths.json` is fixed insertion order** (12 paths, 7
   existing + 5 new at the end). If you sort paths anywhere in the UI,
   pick a stable ordering (by `audience`, by `estimatedHours`, by
   `lastUpdatedAt` descending — whatever fits the design).

4. **The 5 new paths use new-topic slugs.** When you click into a new
   path, make sure the per-topic links work. Most new topics are in
   phases that don't exist on the current Home phase list — confirm
   the Home/Sidebar lists ALL 11 phases.

5. **`changelog.json` is gitignored** (`app/public/changelog.json`).
   It's regenerated by `npm run build`. If you preview in dev mode
   (`vite`), run `npm run generate:changelog` first or you'll see an
   empty whats-new page.

6. **Bundle size warning is benign.** `shiki` is heavy (~1.2MB) and
   the build complains. You don't need to fix it as part of this work,
   but if you want to ship a lazy-load for `CodeExamples.tsx`, it's a
   nice polish.

7. **27 explainer videos use YouTube; the duration is the canonical
   value to display.** Format `durationSeconds` as `MM:SS` or as text
   ("~4 min"). Don't trust the YouTube embed's reported duration.

## Sample data for fast iteration

When testing, pick a topic that has rich data:

- **`logging`** — full set: tldr, narrative, 5 pitfalls, 2 code examples,
  short explainer video by Arpit Bhayani (Asli Engineering), articles,
  services, courses.
  - File: `content/observability/logging.md`
- **`prompting-for-code`** — full set, new topic from the extension,
  `shortExplainerVideo: null`.
  - File: `content/ai-assisted-development/prompting-for-code.md`

For paths:
- **`first-production-deploy`** — original 7-path set with new tldr.
- **`ai-first-web-developer`** — new path, references mostly new topics.

## When you're done

1. Run the full verification suite:
   ```bash
   npm run typecheck
   npm run test --workspace=pipeline
   npm run build:content
   npm run generate:changelog
   npm run build --workspace=app
   ```
   All should be clean.
2. Spin up the dev server (`npm run dev`) and click through:
   - Home → see 11 phases listed
   - A new phase (e.g., `/phase/ai-assisted-development`)
   - A new topic (e.g., `/topic/prompting-for-code`) — verify tldr,
     narrative, pitfalls, code, no broken video block
   - A topic with an explainer video (`/topic/logging`) — verify the
     player or thumbnail renders correctly
   - A new path (e.g., `/path/ai-first-web-developer`) — verify tldr,
     sequence, and each topic link works
   - `/whats-new` — verify recent commits appear with the right
     touched-topics links
   - Cmd-K search — try typing partial new topic names ("prompt",
     "monorepo", "vector")
3. Commit incrementally with clear messages. Don't push to `main`. Open
   a PR from `ui-integration-2026-05-15` against
   `extension-ai-and-modern-dev` so the user can review both branches
   together, or open it against `main` if you're confident.

## Stuff I'd handle differently if I were doing the UI

A few opinions from the data-side build that may save you time:

- The plain-language `tldr` is the most powerful new field. The
  non-tech reader is a real audience the user is reaching for. If you
  only have time for ONE UI change, surface `tldr` prominently on
  Topic and Path pages. Everything else is bonus.

- `shortExplainerVideo` is a "nice but not essential" addition. Don't
  block on it; if the embed feels janky, ship a "Watch on YouTube"
  link card instead. The data captures `durationSeconds` and `author`
  for free.

- `lastUpdatedAt` is the most data-discipline-y of the three. Show it
  small and unobtrusive. Don't make it a feature; make it a footer.

- The 11-phase home page is going to need a real layout decision.
  Listing 11 in a flat list is fine but loses the existing visual
  rhythm. Consider grouping by "Production-readiness foundations"
  (the original 7 phases) and "Modern full-stack + AI" (the 4 new
  phases) at the section level.

## Branch state when this handover was written

- Branch: `extension-ai-and-modern-dev`
- HEAD: commit `892aa7c`
- Pushed to GitHub: yes
- Status: clean working tree, all gates green
- 11 commits ahead of `main`
- Not merged. PR creation link:
  https://github.com/peteramelang/iceberg/pull/new/extension-ai-and-modern-dev
