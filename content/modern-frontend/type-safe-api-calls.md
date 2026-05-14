---
slug: type-safe-api-calls
title: Type-Safe API Calls
phase: modern-frontend
order: 4
summary: >-
  End-to-end types between server and client via tRPC, OpenAPI codegen, or
  GraphQL codegen — and when to pick which.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Type-safe API calls are the practice of sharing or generating TypeScript types
  between a server and its clients so that a change in a data contract is caught
  at compile time rather than discovered as a runtime error in production. The
  core problem they solve is the classic coordination failure: a backend
  developer changes a field name or removes a response property, and the
  frontend developer is unaware until users start seeing broken UI. By encoding
  the contract in a type system and checking it automatically, this entire class
  of bugs is eliminated from the deployment cycle.


  Three dominant approaches exist. tRPC (TypeScript Remote Procedure Call) is
  the most radical: both the server and client are TypeScript and the client
  imports the server's router types directly, producing 100% inferred end-to-end
  types with zero code generation. It is ideal for full-stack TypeScript
  mono-repos and is deeply integrated with TanStack Query. OpenAPI-based codegen
  takes the opposite approach: a server exposes an OpenAPI 3 schema (possibly
  auto-generated from annotations or from a library like Zod or FastAPI), and
  tools like openapi-ts or OpenAPI Generator produce TypeScript SDK clients from
  it. This works across language boundaries—a Go or Python backend can generate
  a TypeScript client—and is the right choice when the backend is not
  TypeScript. GraphQL codegen occupies a middle ground: GraphQL already has a
  strongly-typed schema language, and tools like graphql-code-generator produce
  typed hooks and operations from .graphql files, giving type-safe fetching
  without sharing TypeScript code.


  Choosing between them depends primarily on language boundaries and team
  structure. tRPC wins for small TypeScript teams that own both ends. OpenAPI
  codegen wins when the backend is a different language or when an existing
  public API is the starting point. GraphQL codegen wins when the API layer is
  already GraphQL or when fine-grained query composition is important. In all
  three cases the mechanism is the same: a single source of truth for the
  contract, checked by the compiler, so the type error appears on the engineer's
  laptop instead of on the production error dashboard.
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
lastUpdatedAt: '2026-05-14T12:26:04.535Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=2LwTUIqjbPo'
      title: tRPC in 100 Seconds
      author: Fireship
      durationMinutes: 7
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Fireship's explainer shows the tRPC mental model—server router, client
        caller, zero generated code—in the fastest possible format.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=qCLV0Iaq9zU'
      title: How tRPC Really Works
      author: Theo - t3.gg
      durationMinutes: 50
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Theo—one of tRPC's main advocates—explains the internals, trade-offs vs
        OpenAPI/GraphQL, and real production patterns in depth; the most
        complete freely available treatment.
      source: ai-researcher
  articles:
    - url: 'https://trpc.io/docs/quickstart'
      title: tRPC — Quickstart
      kind: canonical-doc
      reasoning: >-
        The tRPC quickstart shows the full pattern (router definition to typed
        client call) in minutes; the canonical reference for the pure-TypeScript
        end-to-end approach.
      publisher: tRPC
      source: ai-researcher
    - url: 'https://openapi-ts.dev/introduction'
      title: openapi-ts — Introduction
      kind: canonical-doc
      reasoning: >-
        openapi-ts (formerly openapi-typescript) is the most actively maintained
        TypeScript client generator from OpenAPI schemas; its docs explain the
        codegen workflow that works across language boundaries.
      publisher: openapi-ts
      source: ai-researcher
    - url: 'https://the-guild.dev/graphql/codegen/docs/getting-started'
      title: GraphQL Code Generator — Getting Started
      kind: canonical-doc
      reasoning: >-
        The Guild's codegen tool is the standard solution for typed GraphQL
        clients; the getting started guide covers generating typed hooks from
        schemas and operations.
      publisher: The Guild
      source: ai-researcher
  services:
    - name: tRPC
      url: 'https://trpc.io'
      category: api-framework
      reasoning: >-
        End-to-end type safety without codegen for TypeScript full-stack apps;
        zero schema duplication because the router type is directly imported by
        the client.
      vendor: Open source
      source: ai-researcher
    - name: openapi-ts
      url: 'https://openapi-ts.dev'
      category: codegen
      reasoning: >-
        Generates type-safe TypeScript clients from OpenAPI 3 schemas; the go-to
        tool when the backend is not TypeScript or when an existing REST API
        needs typed consumers.
      vendor: Open source
      source: ai-researcher
    - name: GraphQL Code Generator
      url: 'https://the-guild.dev/graphql/codegen'
      category: codegen
      reasoning: >-
        The standard tool for generating typed React hooks and TypeScript types
        from GraphQL schemas and operation documents.
      vendor: The Guild
      source: ai-researcher
    - name: Zod
      url: 'https://zod.dev'
      category: schema-validation
      reasoning: >-
        TypeScript-first schema library used by tRPC and many OpenAPI tools to
        define types that are validated at runtime and inferred statically—the
        foundation layer for most type-safe API patterns.
      vendor: Open source
      source: ai-researcher
    - name: Hono
      url: 'https://hono.dev'
      category: api-framework
      reasoning: >-
        Edge-ready web framework with first-class RPC client support; its
        `hono/client` feature provides tRPC-like typed calls for Hono server
        routes without a separate codegen step.
      vendor: Open source
      source: ai-researcher
  courses:
    - url: 'https://frontendmasters.com/courses/fullstack-typescript/'
      title: Fullstack TypeScript (feat. tRPC & GraphQL)
      provider: Frontend Masters
      paid: true
      reasoning: >-
        Mike North's course covers end-to-end TypeScript type safety patterns
        including tRPC and GraphQL codegen—the most comprehensive structured
        treatment of the topic.
      instructor: Mike North
      source: ai-researcher
    - url: 'https://create.t3.gg/en/introduction'
      title: Create T3 App Documentation
      provider: T3 Stack
      paid: false
      reasoning: >-
        The T3 App docs explain the opinionated stack (Next.js + tRPC + Prisma +
        Zod) that brought type-safe API patterns to a mass audience; reading
        through it provides real architecture context.
      instructor: Theo / T3 community
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.535Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
