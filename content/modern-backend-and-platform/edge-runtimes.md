---
slug: edge-runtimes
title: Edge Runtimes
phase: modern-backend-and-platform
order: 4
summary: >-
  Cloudflare Workers, Vercel Edge, Deno Deploy — what runs there, what doesn't,
  and where the latency wins are real.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Edge runtimes execute JavaScript and WebAssembly inside V8 isolates that are
  co-located with CDN nodes around the globe, rather than in a single regional
  data center. Because the isolate model starts in under a millisecond—much
  faster than a traditional Node.js process—and because the code runs physically
  close to the user, the latency win for the first byte of a response can be
  dramatic. Cloudflare Workers, Vercel's Edge Runtime, and Deno Deploy are the
  three dominant platforms; all share the same fundamental constraint: no
  Node.js APIs, no arbitrary npm packages, and tight CPU-time limits (typically
  30–50 ms per request on the free tier, up to 30 seconds on paid tiers).


  The key architectural insight is that edge runtimes are optimized for
  stateless, low-compute tasks: serving personalized HTML from a KV store,
  rewriting request headers, A/B testing, geolocation redirects, and JWT
  authentication checks. They are not suited for database-heavy business logic,
  long-running computations, or anything requiring native Node.js APIs like
  `fs`, `child_process`, or TCP sockets (except via Cloudflare's `connect()` API
  on paid plans). Understanding what cannot run at the edge is as important as
  knowing the benefits.


  The landscape is evolving rapidly. Cloudflare expanded Workers with Durable
  Objects (strongly consistent stateful coordination), D1 (SQLite at the edge),
  and R2 (S3-compatible storage). Vercel moved away from edge-only functions
  toward a "Fluid Compute" model that blends regional and edge execution. Teams
  should benchmark their specific workloads before committing to an edge-first
  architecture.
shortExplainerVideo: null
narrative: >-
  Pending narrative — at least 400 characters of plain-English explanation of
  why this topic matters, what the dominant failure modes are, and how a learner
  should approach it. Replace this placeholder before publishing. Placeholder
  body. Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. 
pitfalls:
  - title: (pitfall 1 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 2 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 3 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 4
lastUpdatedAt: '2026-05-14T12:26:04.522Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=ze3uhkC4534'
      title: Why Am I Moving Off Edge?
      author: Theo (t3.gg)
      durationMinutes: 12
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Theo's honest assessment of where edge runtimes deliver real latency
        wins vs. where their constraints hurt—a critical counterbalance to the
        hype.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=oyOaxMY4eNo'
      title: Cloudflare Containers 101 — Run Docker Containers on the Edge
      author: Cloudflare
      durationMinutes: 30
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Deep dive into Cloudflare's evolving compute primitives, explaining
        isolates vs. containers at the edge and when to reach for each.
      source: ai-researcher
  articles:
    - url: 'https://developers.cloudflare.com/workers/reference/how-workers-works/'
      title: How Workers works
      kind: canonical-doc
      reasoning: >-
        The authoritative technical explanation of V8 isolates, the request
        lifecycle, and the execution model that underpins all Cloudflare
        Workers.
      publisher: Cloudflare
      source: ai-researcher
    - url: 'https://developers.cloudflare.com/workers/platform/limits/'
      title: Workers Platform Limits
      kind: canonical-doc
      reasoning: >-
        The definitive reference for CPU time limits, memory, request size, and
        subrequest limits—essential before designing an edge-first system.
      publisher: Cloudflare
      source: ai-researcher
    - url: >-
        https://daily.dev/blog/edge-computing-frontend-developers-cloudflare-workers-deno-deploy-vercel/
      title: 'Cloudflare Workers, Deno Deploy, and Vercel Edge'
      kind: tutorial
      reasoning: >-
        Side-by-side comparison of all three major edge platforms covering their
        runtime models, deployment ergonomics, and use-case fit.
      publisher: daily.dev
      source: ai-researcher
  services:
    - name: Cloudflare Workers
      url: 'https://workers.cloudflare.com/'
      category: edge compute platform
      reasoning: >-
        The most feature-complete edge runtime platform with 300+ global PoPs,
        Durable Objects, KV, D1, R2, and the largest ecosystem of edge
        primitives.
      vendor: Cloudflare
      source: ai-researcher
    - name: Vercel Edge Functions
      url: 'https://vercel.com/docs/functions/runtimes/edge'
      category: edge compute platform
      reasoning: >-
        Tightly integrated with Next.js and the Vercel deployment pipeline; the
        lowest-friction path for Next.js developers to deploy middleware and
        edge API routes.
      vendor: Vercel
      source: ai-researcher
    - name: Deno Deploy
      url: 'https://deno.com/deploy'
      category: edge compute platform
      reasoning: >-
        First-class TypeScript and Web Standards support with no build step,
        built-in KV and Cron, and sub-50ms cold starts across 35+ global
        regions.
      vendor: Deno Land Inc.
      source: ai-researcher
    - name: Fastly Compute
      url: 'https://www.fastly.com/products/edge-compute'
      category: edge compute platform
      reasoning: >-
        Enterprise-focused edge compute with WebAssembly support and strong
        guarantees around request isolation and POP distribution.
      vendor: Fastly
      source: ai-researcher
  courses:
    - url: 'https://developers.cloudflare.com/labs/workers'
      title: Learn Workers — Cloudflare Developer Labs
      provider: Cloudflare
      paid: false
      reasoning: >-
        Official interactive workshop from Cloudflare covering Workers
        fundamentals, KV, Durable Objects, and deployment—structured hands-on
        learning path.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.522Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
