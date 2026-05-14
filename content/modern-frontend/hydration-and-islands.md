---
slug: hydration-and-islands
title: Hydration and Islands Architecture
phase: modern-frontend
order: 3
summary: >-
  Why hydration is slow, how partial hydration and islands (Astro, Qwik, Marko)
  reduce JS shipped to the browser.
tldr: >-
  Server renders HTML; JavaScript makes it interactive. Islands architecture
  renders only interactive pieces on the server, avoiding waterfall delays on
  load.
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
  The hydration problem is fundamentally a billing problem. When your SSR
  framework generates 40 KB of HTML on the server and then forces the browser to
  download, parse, and re-execute 400 KB of JavaScript before the page responds
  to a click, you are charging users twice: once for the server render and once
  for the full client re-render. For most of that JS bundle, the work is pure
  overhead—reestablishing facts the server already knew, attaching event
  listeners to elements that have no events, rebuilding component state that
  will never change. Islands architecture is the recognition that this bill can
  be itemized and paid only where interactivity actually exists.


  The 80/20 here is understanding which parts of your page are genuinely
  interactive versus which parts just happen to be rendered by a JavaScript
  framework. In the average marketing site or e-commerce product listing, the
  ratio is stark: a hero section, a navigation with a mobile menu toggle, maybe
  an image carousel, and the rest is static content. Shipping the full React
  runtime and component tree to hydrate a paragraph of text is waste. Astro's
  `client:visible` directive is a clean expression of the right mental model—pay
  the hydration cost only when the user is actually about to see and interact
  with the component, not before.


  The failure modes are worth knowing before you adopt any of these approaches.
  Astro's island model is simple but requires you to think carefully about state
  sharing between islands—since each island is independent, crossing island
  boundaries with shared state requires a store like nanostores rather than
  normal React context. Qwik's resumability model sounds like magic but has real
  constraints: it requires that component state be serializable to HTML, which
  means closures and class instances that cannot be JSON-serialized require
  careful handling. The compiler-based approaches (Marko, Million.js) reduce the
  annotation burden but introduce a build-time dependency that makes debugging
  harder—the code that runs in the browser may not match what you wrote.


  Mentally, the right frame for hydration decisions is distinguishing between
  the tree of components and the tree of interactive boundaries. Frameworks that
  conflate the two force you to hydrate the whole tree. Frameworks that separate
  them let you hydrate only the interactive boundaries. Once you see it that
  way, you can apply the insight even in React: React 18's selective hydration,
  Suspense, and `startTransition` are partial answers to the same problem within
  the React ecosystem, giving you priority-ordered hydration without leaving
  React entirely.


  For production decisions: islands architecture is compelling primarily for
  content-heavy sites where server HTML is the main product and interactivity is
  sprinkled on. For highly interactive applications—dashboards, collaborative
  editors, real-time feeds—the JS cost of full hydration is unavoidable because
  the entire page is interactive surface. Picking the wrong model for your
  content type is common and expensive: teams building SPAs with Astro fight the
  framework constantly, while teams building marketing sites with full SPA
  frameworks ship unnecessary weight. The frame is not 'which framework is
  faster' but 'what percentage of my page actually needs JavaScript to run.'
pitfalls:
  - title: Hydrating the whole page when most of it is static
    explanation: >-
      The default SSR setup in many React frameworks ships and executes
      JavaScript for every component on the page, even those with no
      interactivity. This inflates Time to Interactive with zero user benefit —
      identify static subtrees and exclude them from client JS.
  - title: Hydration mismatch errors silent in production
    explanation: >-
      When server-rendered HTML doesn't match the client render, React
      suppresses the error in production and falls back to a full client
      re-render, defeating the SSR benefit and sometimes causing layout flashes.
      Mismatches from Date.now(), random IDs, or user-agent checks must be
      addressed, not ignored.
  - title: Eagerly hydrating islands that are offscreen
    explanation: >-
      Hydrating an island on page load even when it is far below the fold wastes
      the user's initial JS budget on content they may never see. Use
      `client:visible` or intersection-observer-based lazy hydration to defer
      cost until the island is needed.
  - title: Sharing mutable state across island boundaries
    explanation: >-
      Islands that need to communicate typically resort to global stores or
      event buses, recreating a mini-SPA architecture that undermines the
      performance benefits of islands. Design islands to be stateless or
      self-contained; extract shared state into URL params or server-side
      session.
  - title: Resumability misconceived as a drop-in replacement for hydration
    explanation: >-
      Qwik's resumability model requires authoring components differently from
      React — event handlers must be serializable, no closure capture of
      non-serializable values. Adopting a resumability framework without
      understanding its constraints leads to subtle runtime errors and degraded
      performance.
codeExamples:
  - language: typescript
    title: 'Astro Island with client:visible Directive'
    code: >-
      ---

      // src/pages/product.astro

      // Static page with ONE interactive island — carousel only hydrates when
      visible.

      import ProductCarousel from "../components/ProductCarousel.tsx";

      import ReviewList from "../components/ReviewList.astro"; // static, zero
      JS


      const product = await fetch(`/api/products/42`).then(r => r.json());

      ---


      <html lang="en">
        <head><title>{product.name}</title></head>
        <body>
          <h1>{product.name}</h1>
          <p>{product.description}</p>

          <!-- This island ships ~4 KB of React, hydrated only when scrolled into view -->
          <ProductCarousel
            client:visible
            images={product.images}
          />

          <!-- ReviewList is a plain .astro component: renders to HTML, ships 0 bytes of JS -->
          <ReviewList reviews={product.reviews} />

          <footer>© 2026 Acme</footer>
        </body>
      </html>
    reasoning: >-
      Shows the islands pattern concretely: one interactive React component with
      client:visible, all other components as zero-JS Astro components — making
      the JS/static boundary explicit.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.579Z'
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
