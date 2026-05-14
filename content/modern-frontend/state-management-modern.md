---
slug: state-management-modern
title: Modern State Management
phase: modern-frontend
order: 5
summary: >-
  Zustand, Jotai, Redux Toolkit, signals — and why less client state usually
  beats a better state library.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  State management is the discipline of deciding where application data lives,
  who can change it, and how those changes propagate to the UI. In the React
  ecosystem the pendulum has swung from Redux's global single-store architecture
  toward smaller, more localized solutions—because most applications discovered
  their state problems were really data-fetching and caching problems, not
  global state problems. Libraries like React Query and SWR handle server-state
  caching (pending, error, stale, re-fetching) with almost no boilerplate, which
  eliminates the need for Redux in the majority of CRUD apps. What remains truly
  global client state is usually small enough to fit in Zustand's one-file setup
  or React Context without ceremony.


  Zustand is a minimal, un-opinionated store built on closures that avoids
  Redux's action/reducer/selector verbosity while still being easy to inspect
  and test. Jotai takes a different atomic approach inspired by Recoil: state is
  composed from small, derived atoms, which makes fine-grained subscriptions
  trivial and prevents the 're-render everything' problem that plagues
  coarse-grained Context. Redux Toolkit (RTK) rehabilitated Redux with
  strongly-typed slices, Immer-based mutations, and RTK Query for async data; it
  remains the right choice when a team needs time-travel debugging, a strict
  unidirectional data flow, or very large shared state across many features.
  Signals (as popularized by SolidJS, Preact Signals, and Angular's new
  reactivity model) represent an even more fundamental rethink: reactive values
  that update the DOM directly without reconciling a virtual DOM tree, which is
  why they perform better than hook-based approaches for high-frequency updates.


  The key insight for production systems is that most state should not be
  global. URL state, server-cache state, and local UI state should each live in
  the appropriate layer (router, query cache, component) before reaching for a
  dedicated state library. When you do need a shared store, the guiding question
  is complexity: Zustand for simple shared state, Jotai for derived/computed
  state, RTK for large teams with strict update semantics.
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
lastUpdatedAt: '2026-05-14T12:26:04.534Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=_ngCLZ5Iz-0'
      title: Zustand in 10 minutes
      author: Beyond Fireship
      durationMinutes: 10
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        A focused, practical intro to Zustand that illustrates the minimal-API
        philosophy of modern state libraries and contrasts it implicitly with
        Redux boilerplate.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=5-1LM2NySR0'
      title: 'State Management in React — Zustand, Jotai, Redux Toolkit'
      author: Theo - t3.gg
      durationMinutes: 45
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Theo compares the major modern state libraries with real trade-off
        analysis, covering when to use each and why less state is usually the
        right answer—a production-level perspective.
      source: ai-researcher
  articles:
    - url: 'https://docs.pmnd.rs/zustand/getting-started/introduction'
      title: Zustand — Getting Started
      kind: canonical-doc
      reasoning: >-
        Zustand's official docs demonstrate the minimal API surface that makes
        it the default choice for new projects; the introduction is concise
        enough to read in minutes.
      publisher: Poimandres
      source: ai-researcher
    - url: 'https://redux-toolkit.js.org/introduction/getting-started'
      title: Redux Toolkit — Getting Started
      kind: canonical-doc
      reasoning: >-
        RTK's official guide explains slices, Immer integration, and RTK Query,
        showing why modern Redux is vastly less painful than the original
        boilerplate era.
      publisher: Redux
      source: ai-researcher
    - url: 'https://jotai.org/docs/introduction'
      title: Jotai — Introduction
      kind: canonical-doc
      reasoning: >-
        Jotai's intro explains the atomic state model and derived atoms, which
        is a meaningfully different mental model from both Zustand's store and
        Redux's reducers.
      publisher: Poimandres
      source: ai-researcher
  services:
    - name: Zustand
      url: 'https://zustand-demo.pmnd.rs'
      category: state-management
      reasoning: >-
        The most popular lightweight React state library; minimal API, no
        boilerplate, easy to test—the default for new projects that need a
        global store.
      vendor: Poimandres
      source: ai-researcher
    - name: Jotai
      url: 'https://jotai.org'
      category: state-management
      reasoning: >-
        Atomic state management for React; excels at derived state and
        fine-grained subscriptions where coarse Context or a single store would
        cause too many re-renders.
      vendor: Poimandres
      source: ai-researcher
    - name: Redux Toolkit
      url: 'https://redux-toolkit.js.org'
      category: state-management
      reasoning: >-
        The officially recommended way to use Redux; includes RTK Query for
        server state, Immer for mutations, and DevTools integration for large
        team codebases.
      vendor: Redux
      source: ai-researcher
    - name: TanStack Query
      url: 'https://tanstack.com/query'
      category: server-state-management
      reasoning: >-
        The most-adopted server-state library for React; handles caching,
        stale-while-revalidate, background refetching, and optimistic updates,
        replacing the most common Redux use case.
      vendor: TanStack
      source: ai-researcher
    - name: Preact Signals
      url: 'https://preactjs.com/guide/v10/signals/'
      category: reactive-state
      reasoning: >-
        Signals provide fine-grained reactivity without virtual DOM diffing,
        showing where React's hook model may be superseded; signals concepts are
        now in Angular, Vue, and Solid.
      vendor: Preact
      source: ai-researcher
  courses:
    - url: 'https://frontendmasters.com/courses/react-state/'
      title: 'State Management in Pure React, v2'
      provider: Frontend Masters
      paid: true
      reasoning: >-
        Steve Kinney's course builds intuition for where to put state before
        reaching for libraries, which is the most important skill for avoiding
        over-engineering.
      instructor: Steve Kinney
      source: ai-researcher
    - url: 'https://tanstack.com/query/latest/docs/framework/react/overview'
      title: TanStack Query — React Overview (Official Docs)
      provider: TanStack
      paid: false
      reasoning: >-
        The TanStack Query docs are comprehensive and teach the server-state
        model that eliminates the majority of Redux use cases; reading the
        overview through to the guides is itself a mini-course.
      instructor: TanStack team
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.534Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
