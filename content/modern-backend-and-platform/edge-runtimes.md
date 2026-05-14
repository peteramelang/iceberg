---
slug: edge-runtimes
title: Edge Runtimes
phase: modern-backend-and-platform
order: 4
summary: >-
  Cloudflare Workers, Vercel Edge, Deno Deploy — what runs there, what doesn't,
  and where the latency wins are real.
tldr: >-
  Run JavaScript on CDN nodes globally, closer to users, with faster startup
  than traditional servers. Trade off for restricted APIs and coldstart latency.
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
  Edge runtimes exist because the speed of light is a hard constraint and
  regional data centers are a blunt instrument. If your entire backend runs in
  us-east-1, a user in Singapore gets somewhere between 150 and 300 milliseconds
  of pure network overhead before your application code even starts executing.
  For a static asset that overhead is solved by a CDN; for dynamic, personalized
  responses that require server-side logic, edge runtimes are the closest thing
  to a solution that currently exists. The V8 isolate model — cold start under a
  millisecond, execution on infrastructure co-located with CDN nodes — is a
  genuine architectural innovation that makes certain classes of latency
  problems disappear.


  The 80/20 of edge runtimes is learning the constraint matrix before designing
  around the latency benefits. Edge functions run in a subset of the Web
  Platform APIs, not in Node.js. There is no `fs`, no `child_process`, no `net`
  module, no arbitrary native addons. CPU time is limited, memory is limited,
  and anything that requires a stateful connection to an external service — like
  a primary Postgres database — requires that connection to cross the same
  network distance you were trying to eliminate. This is why the killer use
  cases for edge are all stateless or near-stateless: JWT verification, A/B test
  bucket assignment, geolocation-based routing, rate limiting against a
  distributed KV store, and serving personalized HTML assembled from a globally
  replicated cache. If your handler requires a round-trip to a database in a
  single region, you have not eliminated the latency problem; you have just
  moved where the latency sits.


  The failure modes are mostly architectural mistakes that come from misreading
  what "edge" actually means. Teams reach for edge functions on Vercel or
  Cloudflare and then connect to a Postgres database in us-east-1, adding 200ms
  of database latency that was never there before — worse than a regional
  Node.js server would have been. The other common mistake is pulling in npm
  packages that work fine in Node.js but include `require('crypto')` or `Buffer`
  in ways that reference Node.js globals — the edge runtime will silently fail
  or throw at cold-start time. Third-party packages have inconsistent edge
  compatibility, and you often only discover the problem in a deploy preview.


  The right mental model is to think of edge compute as a programmable layer
  that sits between your CDN and your origin, not as a replacement for your
  origin. It is where you put logic that genuinely needs to run close to the
  user without database access: auth checks, request rewriting, experimentation
  assignment, regional redirects. Everything that needs your database, your file
  system, or complex computation stays in a regional server with a warm
  connection pool. Cloudflare's expansion — Durable Objects for stateful
  coordination, D1 for SQLite at the edge, Hyperdrive for connection pooling to
  regional databases — is a bet that the edge layer can eventually absorb more
  of the stack, but that future is not yet production-ready for most teams.


  In the ecosystem, the edge runtime story is still actively being written.
  Vercel's shift toward "Fluid Compute" is an acknowledgment that the original
  binary of "edge or serverless" was too rigid — real applications need both,
  and the routing layer should decide dynamically. Cloudflare Workers has the
  most complete peripheral ecosystem and the least vendor dependency on a
  framework. Deno Deploy is technically excellent but has a smaller ecosystem
  and weaker CDN integration than Cloudflare. For a team evaluating edge today,
  Cloudflare Workers is the most production-hardened option; Vercel is the
  highest-leverage choice if you are already on Next.js and your use case fits
  the stateless pattern.
pitfalls:
  - title: Assuming all npm packages work at the edge
    explanation: >-
      Edge runtimes exclude Node.js APIs like `fs`, `net`, `child_process`, and
      most native addons, causing packages that use them to fail at runtime
      rather than build time. Verify edge compatibility for every dependency
      before committing to an edge deployment model.
  - title: Database queries running at the edge far from the database
    explanation: >-
      An edge function co-located with users but making round-trips to a
      database in us-east-1 adds latency at the network layer, negating the edge
      latency benefit. Edge functions work best for stateless logic; database
      calls belong in a regional function co-located with the database.
  - title: Cold start times assumed to be zero
    explanation: >-
      V8 isolates start faster than Node.js processes but are not truly instant
      — first-request latency is still measurable under load and can spike
      during isolate recycling. Benchmark actual cold starts under production
      traffic patterns before claiming edge removes latency.
  - title: CPU time limits hit under unexpectedly complex requests
    explanation: >-
      Edge functions have hard CPU time limits (often 30-50ms on free tiers)
      that will terminate a request mid-processing without a clear error
      message. Any significant computation, parsing, or crypto work at the edge
      will hit these limits before you expect it.
  - title: No fallback for edge function failures
    explanation: >-
      When an edge function crashes, the request fails entirely unless a
      fallback origin is configured. Define explicit fallback behavior — serve
      cached content, fall back to a regional function — for every edge route to
      prevent outages from cascading to users.
codeExamples:
  - language: typescript
    title: 'Cloudflare Worker: JWT Auth at Edge'
    code: >-
      // src/index.ts — Cloudflare Worker (no Node.js APIs, Web Crypto only)

      export default {
        async fetch(request: Request, env: Env): Promise<Response> {
          const url = new URL(request.url);

          // Only protect /api/* routes
          if (!url.pathname.startsWith("/api/")) {
            return fetch(request); // pass through to origin
          }

          const authHeader = request.headers.get("Authorization") ?? "";
          const token = authHeader.replace("Bearer ", "");

          if (!token) {
            return new Response("Unauthorized", { status: 401 });
          }

          try {
            const payload = await verifyJwt(token, env.JWT_SECRET);
            // Attach user id as a header so the origin doesn't re-verify
            const modified = new Request(request, {
              headers: { ...Object.fromEntries(request.headers), "X-User-Id": payload.sub }
            });
            return fetch(modified);
          } catch {
            return new Response("Invalid token", { status: 401 });
          }
        }
      };


      async function verifyJwt(token: string, secret: string): Promise<{ sub:
      string }> {
        const key = await crypto.subtle.importKey(
          "raw", new TextEncoder().encode(secret),
          { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
        );
        const [header, payload, sig] = token.split(".");
        const data = new TextEncoder().encode(`${header}.${payload}`);
        const sigBytes = Uint8Array.from(atob(sig.replace(/-/g,"+").replace(/_/g,"/")), c => c.charCodeAt(0));
        const valid = await crypto.subtle.verify("HMAC", key, sigBytes, data);
        if (!valid) throw new Error("Bad signature");
        return JSON.parse(atob(payload));
      }


      interface Env { JWT_SECRET: string; }
    reasoning: >-
      JWT verification using only Web Crypto (no Node.js) at the edge — the
      canonical use case that shows what edge runtimes are actually suited for
      and their API constraints.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.572Z'
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
