---
slug: type-safe-api-calls
title: Type-Safe API Calls
phase: modern-frontend
order: 4
summary: >-
  End-to-end types between server and client via tRPC, OpenAPI codegen, or
  GraphQL codegen — and when to pick which.
tldr: >-
  Share types between server and client so schema changes fail at compile time,
  not in production. Use code generation or shared type libraries.
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
  The problem that type-safe API calls solve sounds mundane until you have been
  woken up at 2am because a backend deploy renamed a field and the frontend is
  now silently rendering nothing. The contract between a server and its clients
  is one of the highest-risk coordination surfaces in a distributed system—it
  crosses team boundaries, deployment boundaries, and often language boundaries.
  When that contract lives only in documentation or tribal knowledge, every
  change is a latent bug waiting for the right timing to surface. Type-safe API
  approaches make the contract explicit, machine-readable, and checked
  automatically, which turns a class of runtime production incidents into
  compile-time errors caught on the engineer's laptop before the PR is even
  opened.


  The 80/20 is picking the approach that matches your team's language boundary.
  If both the server and client are TypeScript in the same repository, tRPC
  eliminates the abstraction entirely—the client imports the server's router
  type and TypeScript infers the full request/response shape across the network
  boundary. There is no schema file to maintain, no code generation step to run,
  and no possibility of the schema diverging from the implementation because
  they are the same code. For cross-language setups—Go backend, TypeScript
  frontend—tRPC is not an option and OpenAPI codegen is the pragmatic choice:
  the server emits a spec, a codegen tool turns it into a typed client, and the
  CI pipeline fails if the spec and the generated client disagree. GraphQL
  codegen occupies the space where the API layer is already GraphQL and you want
  operation-level types rather than schema-level types, which matters when
  different clients request different shapes of the same data.


  The failure modes differ by approach. With tRPC, the main risk is becoming so
  coupled to the mono-repo assumption that extracting a service or adding a
  non-TypeScript client later requires a complete API layer rewrite. Teams that
  start with tRPC for speed and scale to needing a mobile client or a
  third-party integration often wish they had started with OpenAPI. With OpenAPI
  codegen, the failure mode is spec drift: the server says it returns one shape
  and actually returns another, either because the codegen annotations are wrong
  or because the spec is maintained manually and fell out of sync. The fix is
  runtime validation (Zod on the client, validating response shapes against the
  schema) layered on top of static type checking. With GraphQL, the failure mode
  is over-fetching in the schema—queries that seem typed but actually return
  nullable fields that the client does not handle, leading to runtime null
  errors despite full type coverage.


  The mental model that unifies all three approaches is thinking of the API
  schema as a compilation target rather than documentation. Just as TypeScript
  types catch errors before runtime, a machine-readable API schema catches
  contract violations before deployment. The schema should be generated from
  implementation (server code annotations, Zod definitions, GraphQL resolvers)
  rather than written by hand, because hand-written schemas drift. The generated
  client should be committed to version control so that the diff is visible in
  code review when the contract changes. And runtime validation of
  responses—even when types say the shape is correct—provides defense in depth
  against schema drift and unexpected server behavior that static analysis
  cannot catch.
pitfalls:
  - title: Generated client out of sync with actual server
    explanation: >-
      When the generated TypeScript client is committed to the repo and not
      regenerated in CI on every backend change, it silently drifts from the
      real API contract. Make client generation a required CI step that fails
      the build if the output differs from what's committed.
  - title: Runtime values cast to generated types without validation
    explanation: >-
      A generated type only guarantees compile-time shape; a real API response
      can still return unexpected nulls, missing fields, or different types at
      runtime. Parse responses through a runtime validator (Zod, Valibot) that
      matches the generated type instead of blindly casting.
  - title: tRPC chosen for a multi-language team
    explanation: >-
      tRPC's zero-codegen type sharing requires both server and client to be
      TypeScript in the same monorepo — it cannot generate clients for mobile
      apps, Python consumers, or public third-party integrations. OpenAPI
      codegen is the right choice when any consumer is not TypeScript.
  - title: API schema as afterthought instead of contract first
    explanation: >-
      When the OpenAPI schema is auto-generated from implementation code after
      the fact, it reflects what was built rather than what was agreed.
      Design-first schema authoring — writing the contract before the code —
      surfaces integration problems before any code is written.
  - title: Type safety stops at the network boundary
    explanation: >-
      Teams add end-to-end type safety for API calls but leave database query
      results typed as `any` or raw `unknown`. The same discipline — runtime
      validation at every external boundary — must apply to database, external
      APIs, and environment variables, not just the frontend/backend edge.
codeExamples:
  - language: typescript
    title: tRPC Router with Zod Input Validation
    code: |-
      // server/routers/posts.ts
      import { z } from "zod";
      import { router, protectedProcedure } from "../trpc";
      import { db } from "../db";

      export const postsRouter = router({
        list: protectedProcedure
          .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(100).default(20) }))
          .query(async ({ input, ctx }) => {
            const posts = await db.post.findMany({
              where: { userId: ctx.user.id },
              take: input.limit + 1,
              cursor: input.cursor ? { id: input.cursor } : undefined,
              orderBy: { createdAt: "desc" }
            });
            const hasMore = posts.length > input.limit;
            return {
              posts: posts.slice(0, input.limit),
              nextCursor: hasMore ? posts[input.limit - 1].id : null
            };
          }),

        create: protectedProcedure
          .input(z.object({ title: z.string().min(1).max(255), body: z.string().min(1) }))
          .mutation(async ({ input, ctx }) => {
            return db.post.create({ data: { ...input, userId: ctx.user.id } });
          })
      });

      // Client — fully inferred types, no codegen step:
      // const { data } = trpc.posts.list.useQuery({ limit: 10 });
      // data.posts[0].title // ← TypeScript knows the shape
    reasoning: >-
      A complete tRPC router with cursor pagination and a mutation, showing how
      input Zod schemas and return types flow automatically to the client with
      zero code generation.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.584Z'
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
