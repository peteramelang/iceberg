# Extension Summary — AI-Assisted & Modern Full-Stack Dev

**Branch:** `extension-ai-and-modern-dev` (not yet merged to `main`)
**Date:** 2026-05-15
**Status:** Zero-placeholder verification PASS. All 22 pipeline tests pass.

## What changed

### Schema (commit `11b5663`)
Three new fields added to topic frontmatter:
- `tldr` — required, 40-320 chars, plain-language summary for non-technical readers / quick skim.
- `shortExplainerVideo` — optional, 15-600 second video for a quick primer. Can be `null` when no strong canonical source is available.
- `lastUpdatedAt` — required ISO datetime, intended to be surfaced in the UI later.

Path schema also gained `tldr` (required) and `lastUpdatedAt` (required).

The Zod schemas in `app/src/content/types.ts` mirror these changes so the
runtime bundle validation stays consistent with build-time Ajv validation.

### Content footprint
- **Existing 46 topics:** received `tldr` and `lastUpdatedAt`. 20 of them
  also received a `shortExplainerVideo`; 26 are explicitly `null`.
- **34 new topics** added across 4 new phases (see below). Every new topic
  has a full set: definition, narrative (≥400 chars), 3-6 pitfalls, 1-2
  code examples, difficulty + hours, tldr, lastUpdatedAt, and curated
  resources (videos, articles, services, courses).
- **5 new learning paths** designed over the expanded 80-topic corpus.
- **All 12 paths** (7 existing + 5 new) now have plain-language `tldr`
  and `lastUpdatedAt`.
- **319 connection edges** in `_connections.json` (up from 160), generated
  by a new `regen-connections.ts` script that preserves the existing
  topic frontmatter (the previous `full-finalize.ts` was destructive on
  re-run because it rewrites resources from `.git/iceberg-runs/`).

### New phases (4)
1. **AI-Assisted Development** (10 topics) — prompting, context engineering,
   agent loops, AI code review, MCP and tooling, AI evals, hallucination
   mitigation, AI security & PII, AI coding cost management, AI attribution
   and licensing.
2. **Modern Frontend** (8 topics) — module bundlers, server rendering,
   hydration and islands, type-safe API calls, modern state management,
   image and media pipelines, web vitals, design systems.
3. **Modern Backend & Platform** (9 topics) — monorepos, dev containers,
   type-safe ORMs, edge runtimes, realtime protocols, background jobs,
   search and vector stores, file uploads and streaming, webhooks as a
   platform.
4. **Developer Experience & Craft** (7 topics) — local dev environment,
   debugging mindset, code review craft, git workflows,
   documentation-driven development, pair and mob programming,
   sustainable pace.

### New learning paths (5)
1. `ai-first-web-developer` — 12 topics, ~28h.
2. `modern-frontend-foundations` — 8 topics, ~20h.
3. `modern-backend-foundations` — 11 topics, ~25h.
4. `ai-coding-tools-operator` — 10 topics, ~17h.
5. `greenfield-solo-builder` — 15 topics, ~35h.

### New scripts
- `pipeline/prompts/stage_6_tldr_writer.md` — TLDR enrichment prompt.
- `pipeline/prompts/stage_6_short_explainer_finder.md` — explainer video
  finder prompt.
- `pipeline/scripts/enrich-tldr.ts` + `apply-tldr.ts`
- `pipeline/scripts/enrich-short-explainer.ts` + `apply-short-explainer.ts`
- `pipeline/scripts/enrich-research-new.ts` + `apply-research-new.ts` —
  variant of stage 1 research that targets only un-researched topics, with
  resilient handling of `null` and empty-string optional fields.
- `pipeline/scripts/apply-paths-additive.ts` — additive variant of
  `apply-paths.ts` that merges new paths into existing `_paths.json`
  without overwriting.
- `pipeline/scripts/regen-connections.ts` — connections-only regenerator
  that does NOT touch topic frontmatter (replaces the destructive
  re-run path through `full-finalize.ts`).

### Tests
- `pipeline/tests/paths.test.ts` and `pipeline/tests/validate.test.ts`
  updated to include the new required fields.
- All 22 pipeline tests pass.

## What the user should know before merging

1. **The branch is up to date with `main`** at branch point `f464ee3`.
   Nothing has been merged.

2. **The schema migration is breaking for any topic file that doesn't
   include `tldr` and `lastUpdatedAt`.** All current content already has
   them, but anyone hand-authoring a new topic must include them or
   `readTopicFile` will throw.

3. **UI does not yet render the new fields.** Per the user's instruction,
   UI changes are deferred. The data is in `topics.generated.json`; the
   Topic and Path routes can read `fm.tldr`, `fm.shortExplainerVideo`,
   `fm.lastUpdatedAt`, `path.tldr`, `path.lastUpdatedAt` whenever you want.

4. **34 new topics show as `needsManualPick: false`** with real resources.
   They were researched by AI sub-agents; I have not personally clicked
   every URL. A future adversarial round (the existing `run-adversarial.ts`
   workflow) can validate them.

5. **See `docs/superpowers/extension-issues-2026-05-15.md`** for known
   gaps and follow-ups.
