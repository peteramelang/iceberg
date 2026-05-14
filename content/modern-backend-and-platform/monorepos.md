---
slug: monorepos
title: Monorepos
phase: modern-backend-and-platform
order: 1
summary: >-
  Turborepo, Nx, pnpm workspaces — when sharing a repo across packages helps,
  when it hurts, and how to keep CI fast.
tldr: >-
  Single repository for multiple projects with shared dependencies. Enables
  atomic commits across boundaries and easy code reuse without publishing
  packages.
definition: >-
  A monorepo is a single version-controlled repository that houses multiple
  distinct projects—frontend apps, backend services, shared libraries,
  infrastructure code—with well-defined dependency relationships between them.
  The primary benefits are atomic commits across project boundaries, easy code
  sharing without publishing packages, consistent tooling and lint
  configuration, and simpler refactoring when an interface changes across many
  consumers. Companies like Google, Meta, and Vercel use monorepos at massive
  scale.


  The JavaScript ecosystem has converged on pnpm workspaces as the package
  management layer (symlinked dependencies, fast installs, no hoisting bugs)
  paired with a task orchestration layer—either Turborepo (Rust-based, minimal
  config, remote caching) or Nx (richer plugin system, code generation,
  dependency graph analysis). The task orchestrator's job is to understand which
  packages changed, run only the affected tasks in the right order, and cache
  outputs so repeated builds are instant. Without caching, monorepos become
  slower than polyrepos as they grow.


  Monorepos are not universally better. They increase the blast radius of CI
  failures, require investment in tooling to keep tasks fast, and can create
  implicit coupling that polyrepos prevent by design. Teams benefit most when
  there is significant code sharing between packages, when cross-cutting changes
  are frequent, and when the team is large enough to amortize the tooling
  investment. Small teams or projects with minimal shared code often do better
  with a carefully structured polyrepo.
shortExplainerVideo: null
narrative: >-
  The decision to adopt a monorepo is really a decision about who pays the cost
  of coordination. In a polyrepo world, every team moves independently but pays
  a tax every time a shared contract changes — version bumps, API drift, delayed
  library updates, and the particular misery of debugging a bug that lives in
  the intersection of two packages that are deployed at different versions. A
  monorepo moves that tax to build tooling and CI discipline. You get atomic
  commits across package boundaries and honest dependency relationships, but you
  inherit the responsibility of keeping tasks fast as the codebase grows.
  Neither approach is free.


  The 80/20 of getting a monorepo to actually work in JavaScript is picking the
  right two-layer stack: pnpm workspaces for package management and Turborepo
  for task orchestration. pnpm's symlink-based node_modules avoids the hoisting
  bugs that plague npm workspaces and installs dependencies significantly faster
  at scale. Turborepo reads your package.json dependency graph, understands
  which packages changed between commits, and runs only the affected tasks —
  build, test, lint, typecheck — in correct topological order. Its remote cache
  means a task that was already run with identical inputs anywhere on your team
  or in CI will complete in under a second instead of minutes. Nx offers more
  features — code generation, module boundaries enforcement, a visual dependency
  graph — but the added capability comes with more configuration surface and a
  steeper migration cost. For most teams starting a new monorepo, Turborepo is
  the simpler choice.


  The failure modes in monorepos are structural rather than operational. The
  first is implicit coupling: because code sharing is easy, teams reach across
  package boundaries freely and gradually turn what should be independent
  packages into one giant implicit module. The packages compile separately but
  are so deeply intertwined that you cannot deploy one without validating all of
  them. This defeats the organizational benefit of separating packages in the
  first place. Nx's module boundary lint rules can enforce that packages only
  consume each other's declared public API, but the discipline has to be
  designed in early — it is very hard to retrofit. The second failure mode is CI
  time creep: without caching, every task runs on every commit, and a monorepo
  with fifteen packages and a four-minute test suite per package becomes
  unusable. Remote caching is not optional; it is what makes the model viable.


  The mental model that clarifies when a monorepo is the right call is thinking
  about the frequency of cross-cutting changes. If you routinely find yourself
  making a change to a shared library and simultaneously updating every consumer
  of that library, a monorepo makes that operation atomic and validates it in
  one PR. If your services are truly independent — different teams, different
  languages, separate deployment lifecycles, minimal shared code — a monorepo
  adds overhead without the coordination benefit. The inflection point for most
  product teams is when there are two or more TypeScript packages sharing
  business logic types or utility libraries, and the version-bumping ceremony
  across repos becomes a routine time sink.


  In the JavaScript ecosystem, the monorepo tooling has matured to the point
  where the operational risk is low for new projects. Vercel, Nx, and Turborepo
  have all published extensive guides and starter templates. The Changesets
  library handles versioning and changelogs for packages that are also published
  to npm. The remaining friction is human: monorepos require teams to agree on
  shared lint configs, shared TypeScript settings, and shared CI patterns. That
  social contract is often harder than the technical setup, and teams that skip
  it end up with a monorepo that is actually ten polyrepos duct-taped together
  in one git history.
pitfalls:
  - title: CI runs all tasks for every change regardless of affected packages
    explanation: >-
      A monorepo without task graph analysis will run tests for every package on
      every commit, making CI times grow linearly with repo size. Configure the
      task orchestrator to derive the affected package set from the change diff
      and only run those tasks.
  - title: No remote cache means repeated builds waste CI minutes
    explanation: >-
      Without shared remote cache, each CI run re-executes tasks whose inputs
      haven't changed since the last run, duplicating work across PRs and
      branches. Enable remote caching from the start — the payoff compounds with
      team size.
  - title: Implicit cross-package dependencies create hidden coupling
    explanation: >-
      When packages import each other without declaring it in package.json, the
      dependency graph is invisible to the task orchestrator and to other
      engineers. Enforce declared dependencies via lint rules and let the
      orchestrator own execution order.
  - title: Package versioning strategy chosen too late
    explanation: >-
      Teams that don't decide on independent versus fixed versioning before
      their first release end up with a patchwork of semver policies that makes
      changelogs confusing and automated release tools unreliable. Lock in the
      strategy before publishing any package.
  - title: Monorepo adopted for code that has no meaningful sharing
    explanation: >-
      Moving unrelated services into a monorepo without shared libraries or
      frequent cross-cutting changes adds tooling overhead without the
      coordination benefit. Evaluate whether real sharing exists before
      migrating; polyrepos have lower baseline friction.
codeExamples:
  - language: json
    title: Turborepo Pipeline with Remote Cache
    code: |-
      {
        "$schema": "https://turbo.build/schema.json",
        "remoteCache": {
          "enabled": true
        },
        "tasks": {
          "build": {
            "dependsOn": ["^build"],
            "outputs": [".next/**", "dist/**", ".turbo/**"]
          },
          "test": {
            "dependsOn": ["^build"],
            "outputs": ["coverage/**"]
          },
          "lint": {
            "outputs": []
          },
          "type-check": {
            "dependsOn": ["^build"],
            "outputs": []
          },
          "dev": {
            "cache": false,
            "persistent": true
          }
        }
      }
    reasoning: >-
      The turbo.json that defines task dependencies and output globs — the two
      keys to correct caching in a Turborepo monorepo, showing why ^
      (topological order) matters.
difficulty: intermediate
estimatedHours: 8
lastUpdatedAt: '2026-05-14T12:31:47.574Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=9iU_IE6vnJ8'
      title: Monorepos — How the Pros Scale Huge Software Projects // Turborepo vs Nx
      author: Fireship
      durationMinutes: 9
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Fireship's signature fast-paced format explaining what monorepos are,
        when to use them, and how Turborepo and Nx compare—ideal introductory
        watch.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=YX5yoApjI3M'
      title: Turborepo Demo and Walkthrough (High-Performance Monorepos)
      author: Vercel
      durationMinutes: 40
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Official Vercel demo walking through setting up a Turborepo monorepo
        from scratch with remote caching, task pipelines, and deployment—the
        practical companion to the docs.
      source: ai-researcher
  articles:
    - url: 'https://turborepo.dev/docs'
      title: Turborepo Documentation
      kind: canonical-doc
      reasoning: >-
        The official Turborepo docs covering workspace setup, task
        configuration, caching, remote caching, and CI integration.
      publisher: Vercel
      source: ai-researcher
    - url: >-
        https://nx.dev/blog/setup-a-monorepo-with-pnpm-workspaces-and-speed-it-up-with-nx
      title: Setup a Monorepo with PNPM workspaces and speed it up with Nx
      kind: tutorial
      reasoning: >-
        Step-by-step guide from the Nx team on pairing pnpm workspaces with Nx
        for task scheduling, caching, and affected command filtering.
      publisher: Nx
      source: ai-researcher
    - url: 'https://monorepo.tools/'
      title: Monorepo Explained
      kind: canonical-doc
      reasoning: >-
        Community reference comparing all major monorepo tools (Turborepo, Nx,
        Lerna, Bazel) across dimensions like task scheduling, caching, and CI
        integration.
      publisher: Nx team
      source: ai-researcher
  services:
    - name: Turborepo
      url: 'https://turborepo.dev/'
      category: monorepo build system
      reasoning: >-
        Minimal-config Rust-based task orchestrator with remote caching,
        incremental builds, and first-class pnpm workspace support—the default
        choice for most JS/TS monorepos.
      vendor: Vercel
      source: ai-researcher
    - name: Nx
      url: 'https://nx.dev/'
      category: monorepo build system
      reasoning: >-
        Feature-rich alternative to Turborepo with code generators, project
        graph visualization, first-party plugins, and stronger support for large
        enterprise polyglot repos.
      vendor: Nrwl
      source: ai-researcher
    - name: pnpm
      url: 'https://pnpm.io/'
      category: package manager
      reasoning: >-
        The recommended package manager for monorepos; content-addressable store
        eliminates duplication, workspaces support symlinked cross-package
        dependencies cleanly.
      vendor: open source
      source: ai-researcher
    - name: Changesets
      url: 'https://github.com/changesets/changesets'
      category: monorepo release management
      reasoning: >-
        The standard tool for versioning and changelog management across
        packages in a monorepo—automates npm publishing and GitHub Release
        notes.
      vendor: open source
      source: ai-researcher
  courses:
    - url: >-
        https://egghead.io/courses/build-high-speed-monorepos-with-nx-and-pnpm-workspaces-27703a7a
      title: Build High-Speed Monorepos with Nx and pnpm Workspaces
      provider: egghead.io
      paid: true
      reasoning: >-
        Concise 43-minute intermediate course by Nx core team member Juri
        Strumpflohner covering pnpm workspaces + Nx caching, pipelines, and
        affected commands.
      instructor: Juri Strumpflohner
      source: ai-researcher
    - url: 'https://www.udemy.com/course/monorepo-from-zero-to-hero/'
      title: Monorepos — From Zero to Hero
      provider: Udemy
      paid: true
      reasoning: >-
        Comprehensive Udemy course covering Turborepo, Nx, Lerna, and pnpm
        workspaces with CI/CD integration and GitHub Actions—good for teams
        adopting monorepos for the first time.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.524Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
