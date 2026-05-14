# Iceberg Extension — AI-Assisted & Modern Full-Stack Dev

**Goal:** Extend the iceberg curriculum with topics and paths for the modern
full-stack web developer who uses AI coding tools. This complements (not
replaces) the existing production-readiness curriculum.

**Branch:** `extension-ai-and-modern-dev` — committed independently from `main`.

## New phases

Four new phases extend the current seven. Each phase has 6-10 topics. All
slugs are kebab-case, unique across the corpus.

### Phase 8 — `ai-assisted-development` (10 topics)

For developers using Claude Code, Cursor, Copilot, ChatGPT, or agent tools.
Focus is *how to get useful output* and *how to keep it safe*, not on any
specific vendor's UI.

- `prompting-for-code` — how to ask an AI model for code that compiles, runs,
  and matches your codebase conventions.
- `context-engineering` — what to feed an AI tool (which files, which docs,
  which examples) to maximize signal and minimize hallucination.
- `agent-loops` — autonomous coding agents that plan, edit, run, and verify
  in a loop. Limits, oversight, when to stop.
- `ai-code-review` — using AI as a reviewer (and as a reviewee); workflows
  for catching regressions before merge.
- `mcp-and-tooling` — Model Context Protocol and the broader pattern of
  giving AI tools structured access to your systems.
- `ai-evals` — measuring whether your AI features (or your AI-assisted
  workflow) actually work; offline + online evaluation.
- `hallucination-mitigation` — strategies for detecting and reducing
  fabricated APIs, made-up types, and false claims in AI output.
- `ai-security-and-pii` — what NOT to paste into a model. Prompt injection.
  Data exfiltration. Vendor data-handling policies.
- `ai-coding-cost-management` — token economics. When to use a small model.
  When to batch. When the cheapest model is the most expensive (because it
  takes 3x as many turns).
- `ai-attribution-and-licensing` — what AI-generated code means for your
  license, your IP, and your team's expectations.

### Phase 9 — `modern-frontend` (8 topics)

Browser-side concerns the production-readiness phases don't cover yet.

- `module-bundlers` — Vite, Turbopack, esbuild, Rspack. What they do, what
  they skip, when bundling stops being needed (native ESM).
- `server-rendering` — SSR vs SSG vs ISR vs RSC. Trade-offs in latency,
  cost, freshness.
- `hydration-and-islands` — hydration costs, partial hydration, islands
  architecture (Astro, Qwik, Marko).
- `type-safe-api-calls` — tRPC, OpenAPI codegen, GraphQL codegen, RPC vs
  REST decisions.
- `state-management-modern` — Zustand, Jotai, Redux Toolkit, signals.
  How "less state" beats "better state library."
- `image-and-media-pipelines` — modern image formats (AVIF, WebP),
  responsive images, video streaming basics, CDNs for media.
- `web-vitals` — LCP, INP, CLS. How to actually measure. Field vs lab data.
- `design-systems` — tokens, primitives, headless UI, shadcn-style copy-in
  vs npm-distributed. When a design system pays for itself.

### Phase 10 — `modern-backend-and-platform` (9 topics)

Backend topics adjacent to (but not duplicating) the existing
production-readiness phases.

- `monorepos` — Turborepo, Nx, pnpm workspaces. When monorepos help, when
  they hurt.
- `dev-containers` — devcontainers / nix / docker compose for reproducible
  local environments. The "works on my machine" cure.
- `type-safe-orms` — Prisma, Drizzle, Kysely. Migration ergonomics.
  N+1 prevention. When to drop the ORM.
- `edge-runtimes` — Cloudflare Workers, Vercel Edge, Deno Deploy.
  What runs there, what doesn't, latency wins.
- `realtime-protocols` — websockets vs SSE vs long-polling. Scaling pub/sub.
  When NOT to go realtime.
- `background-jobs` — durable jobs (BullMQ, pg-boss, Temporal, Inngest).
  At-least-once semantics, scheduled jobs, retries.
- `search-and-vector-store` — full-text search (Postgres FTS, Meilisearch,
  Typesense) and vector stores (pgvector, Qdrant). Choosing between them.
- `file-uploads-and-streaming` — multipart uploads, signed URLs, resumable
  uploads, virus scanning, image transforms.
- `webhooks-as-platform` — receiving webhooks (idempotency, signing,
  replay), and emitting them (delivery, retries, observability).

### Phase 11 — `developer-experience-and-craft` (7 topics)

How the developer's environment, habits, and team workflows shape output
quality. Soft skills that compound.

- `local-dev-environment` — reproducible setups, editor configuration,
  language servers, terminal multiplexers. The 5% setup investment.
- `debugging-mindset` — systematic debugging, hypothesis-driven
  investigation, when to add logs vs use a debugger.
- `code-review-craft` — the human side of PR review: what good feedback
  looks like, how to push back kindly, what to nitpick vs ignore.
- `git-workflows` — branching strategies that survive AI tooling, rebase vs
  merge, conventional commits, when to squash.
- `documentation-driven-development` — writing the README first, ADRs as
  code, doc tests, doc-as-API contract.
- `pair-and-mob-programming` — including AI as a "pair." When pairing
  multiplies output, when it halves it.
- `sustainable-pace` — the engineering-discipline version of mental health:
  recognizing burnout, on-call recovery, deep work cycles.

## New paths (5 additional)

These layer on top of the existing 7 paths:

1. **AI-First Web Developer** — for someone learning to ship full-stack
   apps primarily through AI coding tools. ~25-30h.
2. **Modern Frontend Foundations** — for a backend dev getting current on
   modern web frontend in 2026. ~18-22h.
3. **Modern Backend Foundations** — for a frontend dev getting current on
   modern backend in 2026. ~22-28h.
4. **AI Coding Tools Operator** — for a senior dev integrating AI into
   their team workflow. ~15-20h.
5. **Greenfield Solo Builder** — for an indie hacker shipping their first
   AI-assisted product end-to-end. ~30-40h.

## Schema additions (shipped in commit `11b5663`)

- `tldr` (required, 40-320 chars) — plain-language summary for non-tech
  readers / quick skim.
- `shortExplainerVideo` (optional, 15-600s) — one short primer video per
  topic, when a strong one exists.
- `lastUpdatedAt` (required, ISO datetime) — surfaced in UI later.
- Paths gain `tldr` (required) and `lastUpdatedAt` (required).

## Out of scope for this branch

- UI changes to render new fields — separate effort.
- Migrating any existing topic out of its current phase.
- Adversarial round on the new topics in this pass (resources will be fresh
  from research, so the bias to keep is even stronger).

## Total footprint

- Existing: 46 topics, 7 paths, 7 phases.
- New: 34 topics, 5 paths, 4 phases.
- After this branch: 80 topics, 12 paths, 11 phases.
