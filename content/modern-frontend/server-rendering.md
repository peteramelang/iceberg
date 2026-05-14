---
slug: server-rendering
title: Server Rendering Strategies
phase: modern-frontend
order: 2
summary: >-
  SSR vs SSG vs ISR vs RSC — trade-offs in latency, hosting cost, freshness, and
  developer ergonomics for each rendering mode.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
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
lastUpdatedAt: '2026-05-14T12:26:04.532Z'
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
