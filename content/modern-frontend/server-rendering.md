---
slug: server-rendering
title: Server Rendering Strategies
phase: modern-frontend
order: 2
summary: >-
  SSR vs SSG vs ISR vs RSC — trade-offs in latency, hosting cost, freshness, and
  developer ergonomics for each rendering mode.
tldr: >-
  Generate HTML on the server (SSG, SSR, ISR) or use React Server Components to
  reduce client JavaScript. Choose based on content freshness and interactivity
  needs.
definition: >-
  Server rendering is the broad category of strategies that move some or all of
  HTML generation to a server or build step rather than leaving it entirely to
  the client-side JavaScript runtime. The four dominant strategies are Static
  Site Generation (SSG), Server-Side Rendering (SSR), Incremental Static
  Regeneration (ISR), and React Server Components (RSC). SSG produces HTML at
  build time: every page is a pre-built file, CDN-cacheable indefinitely, with
  zero compute cost at request time—ideal for content that changes infrequently.
  SSR generates HTML on each request, which means pages reflect real-time data
  but require a running server and add latency for the render step. ISR is a
  hybrid invented by Next.js that statically generates pages but revalidates
  them in the background after a time-to-live expires, combining most of SSG's
  CDN benefits with much of SSR's freshness.


  React Server Components (RSC) represent a more fundamental architectural
  shift. In RSC, components are divided into server components (which run only
  on the server, have direct database access, and never ship their JS to the
  browser) and client components (which hydrate and handle interactivity). This
  model blurs the SSR/client distinction: a route can mix server-rendered
  data-fetching components with client-side interactive components in the same
  tree, using a new wire format rather than HTML to stream component output.
  Next.js App Router is the primary production implementation of RSC today.


  Choosing a rendering strategy involves trading latency against freshness
  against infrastructure cost. SSG wins on performance and simplicity when
  content is cacheable. SSR wins when data must be real-time per user
  (dashboards, authenticated pages). ISR covers the middle ground for marketing
  pages or product listings where hourly freshness is sufficient. RSC adds the
  ability to move data fetching server-side without writing API routes, and is
  compelling for apps already on Next.js. Teams choosing a new stack should
  reach for SSG by default, then add SSR only for the routes that genuinely need
  it.
shortExplainerVideo: null
narrative: >-
  The rendering strategy conversation always sounds more complicated than it is
  because the surface area of acronyms is large but the underlying trade-off
  space is small. There are really only two variables: when is HTML generated
  (build time or request time) and where does data fetching happen (server or
  client). Every named strategy—SSG, SSR, ISR, RSC—is a position in that
  two-dimensional space. Once you can locate each strategy in that space, the
  trade-offs become obvious rather than arbitrary. SSG is build-time HTML with
  server-side data fetching, cached forever. SSR is request-time HTML with
  server-side data fetching, cached per-request. ISR is build-time HTML with
  background revalidation, cached with expiry. RSC moves data fetching to server
  components that can interleave with client components in the same tree.


  The production stakes are real and the wrong choice has lasting consequences.
  A team that chooses SSR for a marketing site pays for compute on every
  pageview that a CDN-cached SSG response would have served for free. A team
  that chooses SSG for an authenticated dashboard has to either live with stale
  data or implement a client-side fetch layer that effectively makes every page
  a half-SSG, half-SPA hybrid with the complexity of both. Getting the rendering
  strategy right early saves months of painful partial migrations later.


  The 80/20 is this: default to SSG, and add SSR only for routes that can
  demonstrate they need real-time data per request. Most pages on most sites do
  not need to be generated fresh for every visitor. Product listings, blog
  posts, marketing pages, documentation—all of these can tolerate the freshness
  model of ISR (regenerate every 60 seconds, serve stale while regenerating)
  without any user-visible consequence. The routes that genuinely need SSR are:
  authenticated user-specific pages, shopping carts and checkout flows, pages
  that vary by geography or A/B cohort without a shared cache key, and any page
  that makes a database query whose result changes faster than ISR's
  revalidation window.


  React Server Components deserve a more careful treatment because the mental
  model is genuinely new and the failure modes are different. The key insight is
  that RSC separates the component tree from the JavaScript delivery boundary. A
  server component can be a large, data-fetching component that renders to a
  custom wire format on the server and contributes zero bytes to the client JS
  bundle—it is never sent to the browser at all. Client components are opted
  into with `'use client'` and are the only components that ship JS, handle
  events, or use hooks. The failure mode that bites teams first is importing a
  server component from a client component, which is illegal because the client
  cannot call server-side code. Visualizing the tree as two interleaved
  layers—server and client, with data flowing down and events flowing up—is the
  mental model that makes RSC feel coherent rather than arbitrary.


  For teams choosing a new stack today, Next.js App Router is the pragmatic
  choice if RSC is appealing because it is the only production-ready RSC
  implementation. Remix is compelling for SSR-first applications with strong
  form handling needs—its loader/action model is a clean separation of data
  fetching from rendering that predates RSC. Astro is compelling for
  content-heavy sites where SSG is the default and interactivity is additive.
  SvelteKit is worth serious consideration if TypeScript-only is not a hard
  requirement and the team values small runtime size. The strategy choice and
  the framework choice are coupled but not identical: the framework constrains
  which strategies are idiomatic, but most frameworks support multiple
  strategies at the route level.
pitfalls:
  - title: Using SSR for pages that could be statically generated
    explanation: >-
      Adding a running server and per-request compute cost to routes whose data
      changes at most hourly is wasteful and introduces availability risk.
      Default to SSG or ISR and add SSR only to routes that require per-request,
      per-user data.
  - title: ISR stale windows larger than the data's acceptable freshness
    explanation: >-
      Setting a 24-hour ISR revalidation window on a pricing page or inventory
      listing means users see stale data for up to a day after a change. Match
      revalidation intervals to the actual data freshness requirement, not the
      default or a round number.
  - title: SSR performance hurt by waterfall data fetching
    explanation: >-
      Sequential awaits in SSR render functions — each waiting for the previous
      query before starting the next — add server latency that the user feels as
      time-to-first-byte. Parallelize independent data fetches with Promise.all
      before the render.
  - title: RSC client/server boundary confusion causes 'use client' sprawl
    explanation: >-
      Teams adopting React Server Components often mark most components as `'use
      client'` when they hit the first hook, effectively opting out of the
      server rendering benefit. Understand which components actually need
      browser APIs or state before adding the directive.
  - title: No caching headers on SSR responses means CDN can't help
    explanation: >-
      SSR pages served without Cache-Control headers are re-rendered on every
      request even when the content could be edge-cached. Explicitly set
      appropriate cache-control directives for each route's data
      characteristics.
codeExamples:
  - language: typescript
    title: Next.js RSC Server Component Fetches Data
    code: >-
      // app/dashboard/page.tsx — React Server Component (no 'use client')

      // Runs only on the server: direct DB access, no useEffect, no API route
      needed.

      import { db } from "@/lib/db";

      import { auth } from "@/lib/auth";

      import { MetricCard } from "./MetricCard"; // client component for
      interactivity


      export const revalidate = 60; // ISR: re-render at most every 60 seconds


      export default async function DashboardPage() {
        const session = await auth();
        if (!session) return <div>Unauthorized</div>;

        // Direct DB query — no fetch(), no API route, no waterfall
        const metrics = await db
          .selectFrom("events")
          .select(["type", db.fn.count("id").as("count")])
          .where("user_id", "=", session.userId)
          .where("created_at", ">=", new Date(Date.now() - 86_400_000))
          .groupBy("type")
          .execute();

        return (
          <main>
            <h1>Dashboard</h1>
            <div style={{ display: "flex", gap: 16 }}>
              {metrics.map(m => (
                <MetricCard key={m.type} label={m.type} value={Number(m.count)} />
              ))}
            </div>
          </main>
        );
      }
    reasoning: >-
      Shows a React Server Component doing direct database access with ISR
      revalidation — concretely illustrating how RSC eliminates the API-route
      round-trip while letting ISR control freshness.
difficulty: intermediate
estimatedHours: 8
lastUpdatedAt: '2026-05-14T12:31:47.582Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=Dkx5ydvtpCA'
      title: Static vs Server Rendering
      author: Fireship
      durationMinutes: 9
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Explains SSG vs SSR vs ISR with clear diagrams and trade-off language;
        probably the fastest way for a developer to build the right mental model
        for choosing between strategies.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=2tJedF8I-8Q'
      title: 'React Server Components — The Good, Bad, and Ugly'
      author: Theo - t3.gg
      durationMinutes: 42
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Theo's detailed analysis of RSC covers the conceptual model, the new
        wire format, composition patterns, and real trade-offs that production
        teams encounter—the deepest freely available RSC explainer.
      source: ai-researcher
  articles:
    - url: 'https://nextjs.org/docs/app/building-your-application/rendering'
      title: Rendering — Next.js Docs
      kind: canonical-doc
      reasoning: >-
        Next.js is the reference implementation for SSR, SSG, ISR, and RSC; its
        rendering documentation is the most practical canonical source covering
        all four strategies with code examples.
      publisher: Vercel
      source: ai-researcher
    - url: >-
        https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023
      title: 'React Labs: What We Have Been Working On'
      kind: engineering-blog
      reasoning: >-
        The React team's blog post explains the origins and design goals of
        Server Components directly from the people who built them.
      publisher: Meta / React
      author: React team
      source: ai-researcher
    - url: 'https://web.dev/articles/rendering-on-the-web'
      title: Rendering on the Web — web.dev
      kind: canonical-doc
      reasoning: >-
        Google's authoritative survey of all rendering strategies including SSR,
        CSR, SSG, streaming SSR, and progressive hydration with measured
        performance implications for each.
      publisher: Google
      source: ai-researcher
  services:
    - name: Next.js
      url: 'https://nextjs.org'
      category: web-framework
      reasoning: >-
        The reference framework for SSG, SSR, ISR, and RSC in the React
        ecosystem; understanding Next.js rendering modes is nearly synonymous
        with understanding modern server rendering.
      vendor: Vercel
      source: ai-researcher
    - name: Astro
      url: 'https://astro.build'
      category: web-framework
      reasoning: >-
        SSG-first framework with an SSR adapter model; ideal for content sites
        that need zero client JS by default with selective island hydration.
      vendor: The Astro Technology Company
      source: ai-researcher
    - name: Remix
      url: 'https://remix.run'
      category: web-framework
      reasoning: >-
        SSR-first React framework built around web fundamentals (Forms, Fetch,
        HTTP caching); the strongest alternative to Next.js for server-rendered
        full-stack React apps.
      vendor: Shopify
      source: ai-researcher
    - name: TanStack Start
      url: 'https://tanstack.com/start'
      category: web-framework
      reasoning: >-
        Full-stack React framework from the TanStack team built on TanStack
        Router with first-class SSR and type-safe server functions; a newer
        option gaining significant adoption.
      vendor: TanStack
      source: ai-researcher
    - name: Vercel
      url: 'https://vercel.com'
      category: hosting-platform
      reasoning: >-
        The deployment platform that invented ISR and provides the
        infrastructure primitives (Edge Functions, CDN) that make SSG/ISR/SSR
        trade-offs practical to implement and measure.
      vendor: Vercel
      source: ai-researcher
  courses:
    - url: 'https://frontendmasters.com/courses/next-js-v3/'
      title: 'Introduction to Next.js, v3'
      provider: Frontend Masters
      paid: true
      reasoning: >-
        Scott Moss's course covers App Router, Server Components, SSG, SSR, and
        ISR patterns hands-on, making it the most structured introduction to
        modern rendering strategies in React.
      instructor: Scott Moss
      source: ai-researcher
    - url: 'https://nextjs.org/learn'
      title: Learn Next.js (Official)
      provider: Vercel / Next.js
      paid: false
      reasoning: >-
        The official Next.js tutorial teaches rendering strategies through
        building a real app with the App Router, making it the most accessible
        free starting point.
      instructor: Vercel team
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.532Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
