---
slug: hydration-and-islands
title: Hydration and Islands Architecture
phase: modern-frontend
order: 3
summary: >-
  Why hydration is slow, how partial hydration and islands (Astro, Qwik, Marko)
  reduce JS shipped to the browser.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Hydration is the process by which a JavaScript framework re-runs on the client
  to attach event listeners to server-rendered HTML, turning static markup into
  an interactive application. In traditional SSR frameworks like early Next.js
  or Nuxt, the entire component tree must hydrate before any part of the page is
  interactive—even components that have no interactivity at all. This 'all or
  nothing' hydration forces the browser to download, parse, and execute the full
  JavaScript bundle of every component on every route, which inflates Time to
  Interactive and hurts Core Web Vitals regardless of how fast the initial HTML
  arrives.


  Partial hydration and the islands architecture address this by identifying
  which components actually need JavaScript and hydrating only those. In Astro's
  model, the page is mostly static HTML; interactive 'islands' are explicit
  opt-ins, each hydrated independently with a directive like `client:idle` or
  `client:visible`. Qwik takes a different angle called resumability—instead of
  replaying component logic on the client it serializes execution state into the
  HTML at build time and resumes from exactly that state, effectively reducing
  hydration cost to near zero even for highly interactive apps. Marko uses a
  compiler to automatically split components at serialization boundaries without
  any developer annotations.


  The practical impact is significant: an Astro page that has one interactive
  carousel but fifty static sections ships JavaScript only for that carousel.
  For content-heavy sites—marketing pages, documentation, blogs, e-commerce
  listings—this can cut client JS by 80-95% versus a React SPA, directly
  improving Largest Contentful Paint and Interaction to Next Paint.
  Understanding hydration and its costs is essential context for choosing a
  rendering strategy in any modern frontend project.
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
lastUpdatedAt: '2026-05-14T12:26:04.529Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=D_N9BYSMBXE'
      title: Astro in 100 Seconds
      author: Fireship
      durationMinutes: 7
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Fireship's rapid-fire intro to Astro covers the islands mental
        model—what ships zero JS by default and why—making it the fastest
        orientation to the core concept.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=x3N9f4gBaFM'
      title: Why Qwik is the Next Big Thing
      author: Theo - t3.gg
      durationMinutes: 35
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Theo's deep-dive compares hydration, resumability, and islands across
        frameworks, providing the conceptual depth needed to evaluate each
        approach for production use.
      source: ai-researcher
  articles:
    - url: 'https://docs.astro.build/en/concepts/islands/'
      title: Astro Islands
      kind: canonical-doc
      reasoning: >-
        The authoritative explanation of the islands architecture pattern from
        the framework that popularized it, covering client directives and how
        selective hydration works in practice.
      publisher: Astro
      source: ai-researcher
    - url: 'https://www.patterns.dev/posts/islands-architecture'
      title: Islands Architecture — Patterns.dev
      kind: tutorial
      reasoning: >-
        Addy Osmani's Patterns.dev site provides a framework-agnostic
        explanation of islands with visual diagrams, making it the best
        reference for understanding the pattern independent of any specific
        tool.
      publisher: Patterns.dev
      author: Addy Osmani
      source: ai-researcher
    - url: 'https://qwik.dev/docs/concepts/resumable/'
      title: Qwik Resumability
      kind: canonical-doc
      reasoning: >-
        Explains the resumability model as a complement to partial hydration,
        showing how serialized execution state eliminates the need to re-run
        component code on the client.
      publisher: Qwik
      source: ai-researcher
  services:
    - name: Astro
      url: 'https://astro.build'
      category: web-framework
      reasoning: >-
        The framework that mainstreamed islands architecture; ships zero
        JavaScript by default and lets you hydrate individual components with
        fine-grained directives.
      vendor: The Astro Technology Company
      source: ai-researcher
    - name: Qwik
      url: 'https://qwik.dev'
      category: web-framework
      reasoning: >-
        Takes the complementary resumability approach—serializing component
        state to HTML so the client never has to replay framework startup logic,
        achieving near-zero hydration cost.
      vendor: Builder.io
      source: ai-researcher
    - name: Marko
      url: 'https://markojs.com'
      category: web-framework
      reasoning: >-
        Compiler-driven framework that automatically identifies and splits
        serialization boundaries, pioneering many of the ideas later adopted by
        Astro and Qwik.
      vendor: eBay
      source: ai-researcher
    - name: Next.js
      url: 'https://nextjs.org'
      category: web-framework
      reasoning: >-
        React Server Components in Next.js 13+ are the mainstream implementation
        of the same 'skip client JS for non-interactive components' principle
        within the React ecosystem.
      vendor: Vercel
      source: ai-researcher
    - name: Remix
      url: 'https://remix.run'
      category: web-framework
      reasoning: >-
        Uses progressive enhancement and server-first data loading to minimize
        the JS surface area that must hydrate, offering an alternative to
        islands for full-stack React apps.
      vendor: Shopify
      source: ai-researcher
  courses:
    - url: 'https://frontendmasters.com/courses/astro/'
      title: Astro
      provider: Frontend Masters
      paid: true
      reasoning: >-
        Jason Lengstorf's course covers Astro's islands model end-to-end
        including when to reach for client directives, making it the most
        hands-on treatment of islands architecture.
      instructor: Jason Lengstorf
      source: ai-researcher
    - url: 'https://docs.astro.build/en/tutorial/0-introduction/'
      title: Build a Blog with Astro (Official Tutorial)
      provider: Astro
      paid: false
      reasoning: >-
        The official step-by-step Astro tutorial is free and builds real
        intuition for partial hydration by forcing the developer to explicitly
        opt components into client-side JS.
      instructor: Astro team
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.529Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
