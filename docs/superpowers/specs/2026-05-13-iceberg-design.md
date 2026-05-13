# Iceberg — Design Spec

**Date:** 2026-05-13
**Status:** Approved, ready for implementation planning
**Repo:** https://github.com/peteramelang/iceberg.git

## Purpose

Iceberg is a personal, interactive learning guide for the production-readiness topics that sit "below the waterline" of the well-known *Vibe Coding vs. Production Reality* iceberg image — authentication, payments, scalability, CI/CD, observability, compliance, and ~30 other concepts that distinguish a deployed MVP from a production-ready application.

The product has two halves:
1. A **fully autonomous content pipeline** that researches, validates, and stabilizes curated learning resources (text definitions, popular YouTube videos, canonical articles, representative services, deeper courses) for every topic, with multiple validation rounds and cross-topic connection mapping.
2. A **static web app** (Vite + React + TypeScript + Tailwind) that presents the content as a structured learning path with progress tracking, bookmarks, notes, and a knowledge graph view.

It is a tool for one user (the author), runs locally, persists state in `localStorage`, and is deployed as a static site to Vercel.

## Goals

- **Structured learning path** — phases → topics → resources, in an opinionated order.
- **Curated, not generic** — every resource is justified by reasoning recorded in provenance.
- **Genuinely autonomous content generation** — kick off the pipeline, walk away, resume cleanly if interrupted. No human input mid-run except the single Stage 0 taxonomy review gate.
- **Cross-topic awareness** — typed relationships between topics (prerequisite / related / often-confused-with / pairs-with), surfaced as a "related topics" sidebar and as an interactive knowledge graph.
- **Aesthetic identity** — implements the imported `DESIGN.md` (OpenCode-design-analysis): Berkeley Mono (or JetBrains Mono fallback) on warm cream, ASCII bracket markers as iconography, single dark "TUI mockup" hero moment, no decorative chrome.
- **Forward-compatibility for sync** — progress/bookmarks/notes behind store interfaces so a Firebase or similar backend can be swapped in later without rewriting consumers.
- **Resilience** — pipeline must self-recover from interruption (crash, ctrl-C, session end) with no human input, using a durable on-disk ledger plus git history as the only state.

## Non-goals (v1)

- Authentication, accounts, multi-user support.
- Backend sync (Firebase) — interfaces are ready, implementation is deferred.
- Mobile-specific UI beyond the responsive rules already in `DESIGN.md`.
- A real `iceberg` CLI binary. The project is named iceberg; there is no command-line tool.
- Internationalization.
- Tests for the web app (manual QA is sufficient; pipeline lib is tested).

## Architecture

Two decoupled halves sharing a single content directory:

```
iceberg/
├── content/                          single source of truth (committed to git)
│   ├── _ledger.json                  pipeline state machine
│   ├── _taxonomy.json                phases, topics, ordering (Stage 0 output)
│   ├── _connections.json             typed cross-topic relationships (Stage 5 output)
│   └── <phase-slug>/<topic-slug>.md  frontmatter (resources, metadata) + body (user notes)
├── pipeline/                         autonomous content generation
│   ├── runbook.md                    step-by-step orchestrator FSM
│   ├── prompts/                      sub-agent prompt templates (one per stage)
│   ├── schemas/                      JSON Schema files for all data
│   ├── smoke-taxonomy.json           2-topic minimal taxonomy for smoke runs
│   ├── lib/                          TS helpers: ledger, content, validate, commit
│   └── scripts/build-content.ts      parses content/*.md → app bundle
└── app/                              Vite + React + TS + Tailwind, fully static
    └── src/
        ├── routes/                   Home, Phase, Topic, Graph, Bookmarks, Settings
        ├── components/               layout / domain / interactive
        ├── stores/                   ProgressStore, BookmarkStore, NotesStore (interfaces)
        ├── hooks/                    useTopicProgress, useBookmark, useNotes
        └── content/                  generated bundle imported from /content
```

**Key principles:**
- `content/` is the contract between the two halves. Pipeline writes it, app reads it. Either half can be rebuilt without breaking the other.
- The ledger is the pipeline's only durable state. Parent Claude session is disposable — any session can resume any in-progress run by reading the ledger.
- Storage interfaces (`ProgressStore`, `BookmarkStore`, `NotesStore`) abstract localStorage today and Firebase tomorrow.
- `DESIGN.md` at repo root is the authoritative design system source.

## Content pipeline

The pipeline is a finite state machine implemented as a runbook (`pipeline/runbook.md`) that Claude executes step-by-step in a terminal Claude Code session. Sub-agents (dispatched via the `Agent` tool) do all heavy lifting in fresh context windows; the parent session stays a lean coordinator.

### Stages

```
Stage 0 — Curation & Outline (one-time, gated)
  0a. Taxonomy discovery     3 parallel agents propose phases + topics, including
                              additions beyond the source iceberg image
  0b. Synthesis               1 agent merges proposals into canonical taxonomy
  0c. Phase assignment        1 agent groups topics into phases with prerequisites
  0d. Human gate              user reviews _taxonomy.json before continuing
  0e. Scaffold content/       create empty <phase>/<topic>.md stubs

Stage 1 — Research (per topic, parallel batches of 5)
  For each topic, 2 independent agents propose resources per the protocol:
    - 1 short YouTube video, 1 long YouTube video
    - 2-3 canonical articles / docs
    - 3-5 representative services / tools
    - 1-2 deeper courses
    - 1 short text definition (2-3 paragraphs)

Stage 2 — Self-consistency
  Compare the 2 runs per topic. Picks chosen by both → high-confidence.
  Divergences → 3rd tiebreaker agent picks one.

Stage 3 — Adversarial
  Per topic: 1 challenger agent tries to find strictly better alternatives than
  consensus picks. 1 judge agent decides keep/swap per slot.

Stage 4 — Liveness & freshness
  Verify every URL resolves, video isn't private/deleted, dates are acceptable,
  service still exists. Failed slots → retry from Stage 1 (max 3 retries).

Stage 5 — Cross-topic connections
  1 agent reads full finalized taxonomy + topic summaries, produces _connections.json
  with typed edges: prerequisite | related | often-confused-with | pairs-with.

Stage 6 — Stabilization loop
  If any topic was swapped/retried this round, re-run Stages 3-5.
  Stop when a full round produces zero changes, or after 5 iterations.
```

### Sub-agent context discipline

- Each sub-agent receives a tight, self-contained prompt for one scoped task (one topic for research, one topic-pair for adversarial, etc.).
- Sub-agents return **structured short summaries** (JSON-shaped), not raw research dumps.
- Parent writes summaries to disk directly, then validates against schemas. The parent never holds full topic content in conversation context.

### Parallelism

- Stage isolation: a batch contains tasks from one stage only.
- Default batch size: 5 sub-agents dispatched concurrently in one parent message.
- For ~35 topics, Stage 1 is ~14 batches of 5; full pipeline is approximately 250-300 sub-agent dispatches total.

### Resumability

- The ledger is updated atomically: write artifact → write per-run dump → `git add` + `git commit` → mark ledger entry `completed`. Failure at any point leaves the entry in `in_progress` or `failed`.
- On any session start, parent reads `content/_ledger.json`, finds the first non-completed (stage, topic, round) tuple, and resumes there.
- Per-run dumps (full sub-agent output) live at `.git/iceberg-runs/<timestamp>-<stage>-<topic>-<agentId>.json` — outside the working tree, not committed, but durable locally for forensic re-inspection.

### Failure handling

- Malformed sub-agent JSON: retry once with the same prompt. Second failure: mark stage `failed`, halt.
- Schema-invalid pick (e.g., tweet URL submitted as a long video): retry once, then halt.
- Liveness failure on a URL: that slot returns to Stage 1 for re-research, capped at 3 retries per slot (tracked in the ledger's `retryCounts`). After cap, the slot is left empty with `needsManualPick: true` flagged in the topic frontmatter. The app renders such slots with a muted `[!] needs manual pick` row in place of the resource, and the topic is not considered "fully populated" for progress purposes (its checklist excludes that slot rather than blocking completion).
- Pipeline halts cleanly with ledger reflecting exact state; last successful commit is the last good state.

### Smoke-test mode

- `ICEBERG_MODE=smoke` reads `pipeline/smoke-taxonomy.json` (2 hardcoded topics) and writes to `content-smoke/` + `_ledger.smoke.json`. Same stages, same agents, same schemas, separate output tree. Used to validate prompts and schemas before kicking off the multi-hour full run.
- `ICEBERG_MODE=full` (default) uses the real taxonomy and writes to `content/`.

## Data schemas

All schemas live at `pipeline/schemas/` as JSON Schema files and are enforced on every read/write via Ajv (pipeline) and Zod (app).

### `content/_ledger.json` — pipeline state machine

```jsonc
{
  "version": 1,
  "createdAt": "2026-05-13T22:30:00Z",
  "updatedAt": "2026-05-13T23:45:00Z",
  "currentRound": 1,
  "mode": "full",                      // "full" | "smoke"
  "stages": {
    "stage_0_taxonomy": {
      "status": "completed",           // pending | in_progress | completed | failed
      "completedAt": "2026-05-13T22:45:00Z",
      "userApprovedAt": "2026-05-13T22:50:00Z",
      "artifactPath": "content/_taxonomy.json",
      "agentRunIds": ["..."]
    }
  },
  "topics": {
    "logging": {
      "phase": "reliability",
      "stages": {
        "research":      { "status": "completed", "round": 1, "agentRunIds": ["..."], "artifactPath": "content/reliability/logging.md" },
        "consistency":   { "status": "completed", "round": 1, "agentRunIds": ["..."] },
        "adversarial":   { "status": "in_progress", "round": 1, "agentRunIds": ["..."] },
        "liveness":      { "status": "pending" },
        "stabilized":    false
      },
      "lastSwapAt": null,
      "retryCounts":   { "research": 0, "liveness": 0 }
    }
  },
  "connections": {
    "status": "pending",
    "artifactPath": "content/_connections.json"
  }
}
```

**Invariants:**
- Only one stage per topic may be `in_progress` at a time.
- A stage transitions to `completed` only after artifact write + git commit both succeed.
- `stabilized: true` is set when a topic survives a full Stages 3-5 round with zero swaps.
- Pipeline halts and reports if any stage stays `failed` after its retry cap.

### `content/_taxonomy.json` — phases & topics (Stage 0 output)

```jsonc
{
  "version": 1,
  "phases": [
    {
      "slug": "foundations",
      "title": "Foundations",
      "order": 1,
      "description": "What every production app needs from day one.",
      "topics": ["authentication", "payments", "crud-logic", "access-control", "data-integrity"]
    }
  ],
  "topics": {
    "authentication": {
      "slug": "authentication",
      "title": "Authentication",
      "phase": "foundations",
      "order": 1,
      "summary": "Verifying who a user is — passwords, sessions, tokens, SSO, MFA.",
      "prerequisites": [],
      "tags": ["security", "identity"],
      "addedByStage0": false
    }
  }
}
```

### Topic markdown — `content/<phase-slug>/<topic-slug>.md`

Frontmatter is pipeline-owned (structured fields). Body is user-owned (free-form notes); the pipeline never writes the body after the initial scaffold.

```yaml
---
slug: logging
title: Logging
phase: reliability
order: 3
summary: "Recording what your application did, so you can answer questions about it later."
definition: |
  A 2-3 paragraph plain-English explanation written by the research agent.
  Surfaces at the top of the topic page before the resources.
resources:
  videos:
    short:
      url: "https://youtube.com/watch?v=..."
      title: "..."
      author: "..."
      durationMinutes: 5
      addedAt: "2026-05-13T23:10:00Z"
      reasoning: "..."
    long:
      url: "..."
      title: "..."
      author: "..."
      durationMinutes: 45
      reasoning: "..."
  articles:
    - url: "..."
      title: "..."
      kind: "canonical-doc"            # canonical-doc | engineering-blog | tutorial
      reasoning: "..."
  services:
    - name: "..."
      url: "..."
      category: "..."
      reasoning: "..."
  courses:
    - url: "..."
      title: "..."
      provider: "..."
      paid: true
      reasoning: "..."
provenance:
  researchedAt: "2026-05-13T23:10:00Z"
  pipelineVersion: 1
  rounds: 1
  stabilized: true
needsManualPick: false
---

<!-- Body is for user notes. Pipeline doesn't touch this after scaffold. -->
```

### `content/_connections.json` — typed cross-topic edges (Stage 5 output)

```jsonc
{
  "version": 1,
  "edges": [
    {
      "from": "logging",
      "to": "alerting",
      "type": "pairs-with",            // prerequisite | related | often-confused-with | pairs-with
      "weight": 0.9,                   // 0-1, drives graph-view edge thickness
      "reasoning": "Logs feed alerting rules; you can't alert on what you don't log."
    }
  ]
}
```

## Web app

Vite + React 18 + TypeScript + Tailwind. Fully static. Imports the generated content bundle at build time.

### Routes

| Path | Purpose |
|---|---|
| `/` | Home — phase overview as a man-page-style table of contents, overall progress, "continue where you left off" link |
| `/phase/:phaseSlug` | List of topics in this phase with per-topic progress markers |
| `/topic/:topicSlug` | Definition, resources grouped by kind, related-topics sidebar, mark-complete + bookmark controls, free-form notes textarea |
| `/graph` | `react-flow` knowledge graph: monochrome nodes (bracketed labels), 1px hairline edges, prerequisite edges show `▸` glyph |
| `/bookmarks` | Flat list of saved topics + resources |
| `/settings` | Export / import progress + bookmarks + notes |

### Component layers

- **Layout primitives** (map 1:1 to `DESIGN.md` components): `Section`, `HairlineRule`, `BracketList`, `ListRow`, `PrimaryNav`, `Footer`.
- **Domain components**: `PhaseCard`, `TopicRow`, `ResourceRow`, `ProgressMarker` (renders `[ ]` / `[~]` / `[x]`), `ConnectionSidebar`, `GraphView`.
- **Interactive**: `BookmarkButton` (renders `[*]` / `[ ]`), `MarkCompleteButton`, `NotesField`, `SearchPalette` (Cmd-K fuzzy search).

### State management

No external store library for v1. Two stores plus a notes store, all behind interfaces:

```ts
export interface ProgressStore {
  getTopicProgress(slug: string): TopicProgress;
  setResourceChecked(topicSlug: string, resourceKey: string, checked: boolean): void;
  markTopicComplete(slug: string): void;
  unmarkTopicComplete(slug: string): void;
  getOverallProgress(): OverallProgress;
  getLastTouchedTopic(): string | null;
  subscribe(listener: () => void): () => void;
  export(): ExportPayload;
  import(payload: ExportPayload, mode: "merge" | "replace"): ImportResult;
}

export interface BookmarkStore {
  isBookmarked(topicSlug: string, resourceKey?: string): boolean;
  toggle(topicSlug: string, resourceKey?: string): void;
  list(): Bookmark[];
  subscribe(listener: () => void): () => void;
  export(): ExportPayload;
  import(payload: ExportPayload, mode: "merge" | "replace"): ImportResult;
}

export interface NotesStore {
  get(topicSlug: string): string;
  set(topicSlug: string, body: string): void;
  subscribe(listener: () => void): () => void;
  export(): ExportPayload;
  import(payload: ExportPayload, mode: "merge" | "replace"): ImportResult;
}
```

React consumes via hooks (`useTopicProgress(slug)`, `useBookmark(slug, key?)`, `useNotes(slug)`) that wrap `subscribe()` and re-render on change.

**localStorage schema (versioned):**

```jsonc
{
  "iceberg.v1.progress": {
    "topics": {
      "logging": {
        "resources": { "videos.short": true, "videos.long": false },
        "completed": false,
        "lastTouchedAt": "..."
      }
    }
  },
  "iceberg.v1.bookmarks": [
    { "topic": "logging", "resource": "videos.long", "addedAt": "..." }
  ],
  "iceberg.v1.notes": {
    "logging": "freeform markdown text..."
  }
}
```

### Export / import

A user-facing JSON file format on the `/settings` route:

```jsonc
{
  "format": "iceberg-progress",
  "version": 1,
  "exportedAt": "2026-05-13T22:00:00Z",
  "data": {
    "progress": { ... },
    "bookmarks": [ ... ],
    "notes": { ... }
  }
}
```

- **Export**: produces `iceberg-progress-YYYY-MM-DD.json` via Blob + `URL.createObjectURL`.
- **Import**: file picker validates wrapper (`format`, supported `version`), then merges with a chosen strategy:
  - **Merge** (default): union of checked resources; OR of `completed`; latest `lastTouchedAt` wins; bookmark union; notes use latest timestamp with conflict warning when both sides have notes.
  - **Replace**: wipes local state after explicit confirmation dialog.
- Schema-version mismatch handled by migration functions; importing a newer-version export into an older app fails with a clear error toast (`[!] import failed: unsupported version 2`).

### Content loading

Build-time JSON imports:

```ts
// app/src/content/index.ts
import taxonomy from "../../../content/_taxonomy.json";
import connections from "../../../content/_connections.json";
import topics from "./topics.generated.json"; // produced by pipeline/scripts/build-content.ts
```

`pipeline/scripts/build-content.ts` parses every `content/<phase>/<topic>.md` (gray-matter for frontmatter, marked for body) into `app/src/content/topics.generated.json`. Runs automatically before `vite build` via a `prebuild` npm script.

### Aesthetic & reactivity

Implements `DESIGN.md` faithfully: JetBrains Mono on `#fdfcfc` cream, single dark surface only inside one hero TUI mockup on the home page, 4px radius on interactive elements, 0px on containers, 96px section rhythm, ASCII bracket markers as the only icon vocabulary, no drop shadows, no gradients.

Reactivity touches that fit the man-page voice:
- `[ ]` → `[~]` → `[x]` progress markers with a single-character flicker animation on transition.
- Cmd-K palette: instant fuzzy search across topics + resources.
- Header momentum line: `[x] 7 topics this week` when active.
- Home page "continue" hint: `>> Continue: Logging (3/5 resources)` as a man-page "see also" line.
- Graph-view nodes are bordered bracketed labels (`[ Logging ]`); edges use 1px hairline; prerequisite edges carry a `▸` glyph.

Explicitly excluded: confetti, sound effects, animated backgrounds, dark mode toggle (DESIGN.md is light-only by design).

### Fonts

JetBrains Mono via `@fontsource/jetbrains-mono` (self-hosted; no Google Fonts CDN). DESIGN.md notes Berkeley Mono as the commercial original; if licensed later, drop the font files into `app/public/fonts/` and swap the CSS face declaration.

### Build & dev commands

```
npm run dev              vite dev server with hot reload
npm run build            build:content + vite build, outputs app/dist/
npm run build:content    regenerate app/src/content/topics.generated.json
npm run preview          serve the built bundle locally
npm run typecheck        tsc --noEmit across workspaces
npm run lint             eslint + prettier
npm run pipeline         entry point that asks Claude to read pipeline/runbook.md and continue
npm run pipeline:smoke   same, with ICEBERG_MODE=smoke
```

`npm run pipeline` and `npm run pipeline:smoke` are thin wrappers that print the runbook entry instructions; the actual execution happens inside a Claude Code session.

## Tooling

- **Package manager**: `npm` workspaces (`app`, `pipeline`).
- **TypeScript**: strict mode in both workspaces; `tsconfig.base.json` at repo root.
- **Linting**: ESLint + Prettier, default-style configs.
- **Testing**: Vitest for `pipeline/lib/` (ledger read/write, schema validation, commit helper) and for the store interfaces. Web app has no tests for v1.
- **Schema validation**: Ajv for JSON Schema enforcement in the pipeline; Zod for runtime parsing inside TS code.
- **Markdown**: `gray-matter` for frontmatter, `marked` for body rendering.
- **Graph**: `react-flow` v12.

## Git & commit discipline

- `git init`, remote `origin` set to `https://github.com/peteramelang/iceberg.git`. No push to GitHub until spec approval.
- **Frequent atomic commits**: every meaningful step is its own commit (scaffold, schema, lib module, runbook section, prompt, each topic completing each stage). Commit messages follow `<area>: <what>` format, e.g., `research: logging round 1 complete`, `app: add ProgressMarker component`, `pipeline: write ledger schema`.
- A stage transitions to `completed` only after its commit succeeds. If a commit fails (hook rejection, etc.), the ledger entry stays non-completed and the runbook will retry on resume.
- `.gitignore` covers: `node_modules/`, `app/dist/`, `app/src/content/topics.generated.json`, `content-smoke/`, `_ledger.smoke.json`, `.env*`, `.DS_Store`.
- `.git/iceberg-runs/` is naturally outside the working tree.

## Deployment

Vercel static deployment:
- Connect the GitHub repo to a Vercel project.
- Build command: `npm run build` (runs in the `app` workspace via the root `package.json` script).
- Output directory: `app/dist/`.
- No environment variables required at runtime — the app is fully static.
- No backend, no serverless functions, no edge logic for v1.

## Ship order

1. **Bootstrap**: `git init`, remote, npm workspaces, `.gitignore`, README stub. First commit.
2. **Import DESIGN.md** as the canonical design source (already at repo root).
3. **Schemas first**: write all JSON schemas — ledger, taxonomy, topic-frontmatter, connections.
4. **Pipeline lib**: `ledger.ts`, `content.ts`, `validate.ts`, `commit.ts` with Vitest coverage.
5. **Sub-agent prompts**: write all 8 prompt templates and review for cross-consistency.
6. **Runbook**: write `pipeline/runbook.md` including the resume-protocol header block.
7. **Smoke run**: `ICEBERG_MODE=smoke` against `smoke-taxonomy.json`. Iterate prompts until end-to-end clean.
8. **Full run**: `ICEBERG_MODE=full`. Walk away. Resume if interrupted.
9. **App scaffold**: Vite + React + Tailwind + `tokens.css` derived from `DESIGN.md`.
10. **App layout primitives**: `Section`, `ListRow`, `BracketList`, `PrimaryNav`, `Footer`.
11. **Stores + hooks** behind interfaces.
12. **Routes** in order: Home → Phase → Topic → Bookmarks → Settings → Graph.
13. **Export / import**.
14. **Polish**: Cmd-K palette, streaks line, "continue where you left off", micro-animations.
15. **Deploy to Vercel**.

## Open questions

None at spec-approval time. Any later questions get raised during the implementation plan or during execution and resolved by amending this spec.
