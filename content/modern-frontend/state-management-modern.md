---
slug: state-management-modern
title: Modern State Management
phase: modern-frontend
order: 5
summary: >-
  Zustand, Jotai, Redux Toolkit, signals — and why less client state usually
  beats a better state library.
tldr: >-
  Most state problems are really data-fetching problems. Use React Query or SWR
  for server state, local state in components, and Context only for
  cross-cutting concerns.
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
  The most important state management decision you can make is not which library
  to use—it is recognizing which category your state belongs to, because most
  state belongs in categories that have purpose-built solutions that are not
  general state libraries. Server cache state (data fetched from an API that can
  go stale) belongs in TanStack Query or SWR. URL state (filters, pagination,
  modal open/closed) belongs in the router. Form state belongs in React Hook
  Form or the platform form element. Local UI state (hover, focus, collapse)
  belongs in `useState` in the component that owns it. What remains after you
  have assigned state to its rightful home is usually small enough to fit in one
  Zustand store with room to spare. Teams that reach for Redux before doing this
  categorization end up storing server responses in Redux and writing custom
  cache invalidation logic that React Query would have handled with three lines.


  The pendulum swing away from Redux is real but not because Redux was wrong—it
  is because Redux was being used to solve problems it was not designed for.
  Redux is excellent for complex, event-driven state with many possible
  transitions where you need an audit trail and deterministic replay. It is
  overkill for 'I have a list of users from an API and I need to show them in a
  table.' Redux Toolkit rehabilitated the library for teams that genuinely need
  it by eliminating the boilerplate and adding RTK Query for async data, but the
  boilerplate reduction does not change the fundamental question of whether your
  state is actually complex enough to warrant a reducer.


  Zustand's mental model is worth understanding because it represents a
  different philosophy: state as a module-level closure rather than a
  framework-owned singleton. A Zustand store is a JavaScript object with an
  updater function; you access it via a hook that subscribes to specific slices
  to prevent unnecessary re-renders. There is no context provider, no action
  type constant, no selector memoization boilerplate. The entire store and its
  actions can fit in twenty lines. This makes Zustand the right tool for shared
  client state that is genuinely global—user authentication status, theme
  preference, shopping cart contents—without the overhead of Redux or the
  re-render pitfalls of React Context.


  Signals represent the furthest departure from the React mental model and are
  worth understanding as a distinct concept even if you never leave React. In a
  signals-based system, reactive values notify their dependents directly when
  they change, bypassing virtual DOM reconciliation entirely. This is why Preact
  Signals can update a text node in the DOM without re-rendering the component
  that contains it—the signal is wired directly to the DOM mutation. For
  high-frequency updates (dragging, live data feeds, collaborative cursors) this
  is a meaningful performance difference. Angular's switch to signals in v17 and
  React's exploration of compiler-based reactivity both acknowledge that the
  hook-based re-render model is not the end state.


  The production lesson is that state management problems are usually
  architecture problems in disguise. When teams find themselves with deeply
  nested global state, byzantine selector logic, or update bugs that only happen
  when two actions fire in a specific order, the root cause is almost always
  that state has been co-located away from the code that owns it. Moving state
  closer to where it is used—even if that means drilling props two levels—is
  frequently the right refactor. State management libraries are load-bearing
  when state genuinely needs to be shared across distant parts of the tree with
  complex update semantics; for everything else, they add cost without adding
  value.
pitfalls:
  - title: Using a global store for server-cache state
    explanation: >-
      Manually caching API responses in Redux or Zustand duplicates work that
      React Query or SWR do better — with deduplication, background refresh, and
      stale-while-revalidate built in. Server state and client UI state have
      different semantics and belong in different layers.
  - title: Storing everything in URL-agnostic state
    explanation: >-
      State that should be shareable via URL — filters, pagination, selected
      items — stored in memory means users can't bookmark or share the current
      view. URL search params are the right persistence layer for navigable UI
      state.
  - title: Context causing the whole tree to re-render
    explanation: >-
      React Context re-renders all consumers on every context value change,
      regardless of which part of the value they use. High-frequency state in
      Context will degrade performance; split contexts by update frequency or
      move to Zustand or Jotai for fine-grained subscriptions.
  - title: Global store holds component-local UI state
    explanation: >-
      State like 'is this dropdown open' or 'which tab is selected' placed in a
      global store makes components impossible to reuse and bloats the store
      with transient values. Local useState is the right place for state that
      has no meaning outside a component.
  - title: No selector memoization leads to excessive re-renders
    explanation: >-
      Subscribing to a large Zustand slice or a Redux selector that returns a
      new object reference on every call causes every subscribed component to
      re-render even when the relevant data is unchanged. Use shallow comparison
      or memoized selectors for derived state.
codeExamples:
  - language: typescript
    title: Zustand Store with Typed Actions
    code: |-
      import { create } from "zustand";

      interface Notification {
        id: string;
        message: string;
        type: "success" | "error" | "info";
      }

      interface NotificationStore {
        notifications: Notification[];
        add: (msg: string, type: Notification["type"]) => void;
        dismiss: (id: string) => void;
      }

      export const useNotifications = create<NotificationStore>((set) => ({
        notifications: [],

        add: (message, type) => {
          const id = crypto.randomUUID();
          set(state => ({
            notifications: [...state.notifications, { id, message, type }]
          }));
          // Auto-dismiss after 4 seconds
          setTimeout(() => set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
          })), 4000);
        },

        dismiss: (id) => set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      }));

      // Usage in any component — no Provider needed
      // const { add } = useNotifications();
      // add("Saved!", "success");
    reasoning: >-
      A complete Zustand store for a real use-case (toast notifications) that
      shows typed state, typed actions, and the no-Provider advantage over React
      Context.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.583Z'
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
