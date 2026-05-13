---
slug: api-versioning
title: API Versioning
phase: delivery-and-operations
order: 8
summary: >-
  Evolve APIs without breaking existing clients: URL/header versioning,
  deprecation policies, and backward-compatibility contracts.
definition: >-
  API versioning enables services to evolve their interfaces without breaking
  existing clients, a critical requirement for production systems serving
  diverse stakeholders. Modern approaches include URL path versioning (e.g.,
  /v1/users), header-based versioning (e.g., Accept-Version header), and
  date-based versioning (as implemented by Stripe and GitHub). Deprecation
  policies establish clear communication timelines when versions will reach
  end-of-life, typically ranging from 24 months to indefinite support depending
  on the service. Backward-compatibility contracts specify which changes are
  non-breaking (adding new optional fields, new endpoints) versus breaking
  (removing fields, changing field types, altering authentication). Semantic
  versioning (MAJOR.MINOR.PATCH) provides a standardized framework for version
  numbering, while Google's channel-based approach uses stability levels (alpha,
  beta, stable) to communicate feature maturity. Effective API versioning
  reduces technical debt by codifying compatibility rules, automating changelog
  generation, and maintaining separation between version-change logic and core
  business logic—enabling rapid iteration while preserving stability for
  production consumers.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://stripe.com/blog/api-versioning'
      title: 'Designing for Backward Compatibility: Stripe''s API Versioning Strategy'
      kind: engineering-blog
      reasoning: >-
        Canonical explanation of Stripe's date-based versioning with automatic
        pinning, backward-compatibility preservation, and version-change module
        architecture used to manage 100+ breaking changes over six years.
      publisher: Stripe
      source: ai-researcher
    - url: 'https://docs.github.com/en/rest/overview/api-versions'
      title: API Versions - GitHub REST API Documentation
      kind: canonical-doc
      reasoning: >-
        GitHub's date-based versioning approach with X-GitHub-Api-Version header
        specification, 24-month minimum deprecation periods, and
        Deprecation/Sunset header standards per RFC 7231 and RFC 8594.
      publisher: GitHub
      source: ai-researcher
    - url: 'https://semver.org'
      title: Semantic Versioning 2.0.0
      kind: canonical-doc
      reasoning: >-
        Official Semantic Versioning specification defining MAJOR.MINOR.PATCH
        increment rules, pre-release versioning, and the principle that versions
        must be immutable after release.
      publisher: Semantic Versioning
      source: ai-researcher
    - url: 'https://google.aip.dev/185'
      title: Custom Methods - API Improvement Proposals (AIP-185)
      kind: tutorial
      reasoning: >-
        Google's API design guidance covering channel-based versioning
        (alpha/beta/stable), release-based versioning, and visibility-based
        versioning patterns; emphasizes avoiding minor/patch version exposure in
        URIs.
      publisher: Aip
      source: ai-researcher
    - url: 'https://swagger.io/resources/articles/best-practices-in-api-design/'
      title: Best Practices in API Design
      kind: tutorial
      reasoning: >-
        OpenAPI/Swagger guidance on API versioning strategies, deprecation
        communication, and maintaining consistency across versions.
      publisher: SmartBear (Swagger)
      source: ai-researcher
  services:
    - name: Stripe
      url: 'https://stripe.com'
      category: production-api-example
      reasoning: >-
        Production reference implementation using date-based versioning with
        automatic account pinning, demonstrating how to manage hundreds of
        breaking changes while maintaining backward compatibility.
      source: ai-researcher
    - name: GitHub
      url: 'https://docs.github.com'
      category: production-api-example
      reasoning: >-
        Production reference implementation using date-based versioning with
        explicit version headers, standardized deprecation timelines, and
        RFC-compliant sunset signaling.
      source: ai-researcher
    - name: Swagger/OpenAPI
      url: 'https://swagger.io'
      category: api-documentation-standard
      reasoning: >-
        Canonical standard for API documentation that includes versioning
        metadata, deprecation markers, and machine-readable API contracts for
        automated tooling.
      vendor: SmartBear (Swagger)
      source: ai-researcher
    - name: Postman
      url: 'https://www.postman.com'
      category: api-testing-platform
      reasoning: >-
        API testing and documentation platform supporting multiple versioning
        strategies, API mocking, and version comparison workflows.
      source: ai-researcher
    - name: OpenAPI Initiative
      url: 'https://www.openapis.org'
      category: api-specification-governance
      reasoning: >-
        Governance body for OpenAPI specification, standardizing API versioning
        annotations, deprecation metadata, and contract versioning across the
        industry.
      vendor: OpenAPI Initiative (Linux Foundation)
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  API versioning is a problem that feels hypothetical until it isn't. The first
  time you need to rename a field, remove an endpoint, or change the shape of a
  response — and you have external clients or mobile apps that can't be
  force-updated — you'll understand why teams that skipped versioning strategy
  are now frozen in place, unable to clean up years of technical debt without
  risk. The real cost isn't the versioning infrastructure. It's the indefinite
  maintenance of undocumented compatibility constraints that accumulate when you
  don't have a formal strategy.


  URL path versioning is the most common approach and the most pragmatic for
  REST APIs: /v1/users, /v2/users. It's explicit, easy to route, easy to test,
  and the version is visible in logs. Header-based versioning (Accept-Version:
  2024-01-01) is cleaner for API purists because it doesn't technically violate
  REST constraints, but it's harder to debug and cache. Stripe's date-based
  versioning is elegant — you pin a client to the API's behavior on the date
  they integrated, which means you can evolve the API continuously without
  breaking existing integrations — but it requires significant infrastructure to
  maintain multiple behavioral snapshots. Pick URL versioning by default unless
  you have a specific reason to do otherwise.


  The distinction between breaking and non-breaking changes is the foundation
  everything else is built on. Adding a new optional field to a response?
  Non-breaking — clients that don't know about it will ignore it. Removing a
  field? Breaking. Changing a field from a string to an integer? Breaking.
  Changing a required field to optional? Depends on your client contract. The
  mistake teams make is treating any server-side change as non-breaking by
  default, without thinking about what clients actually depend on. This is why
  having an explicit compatibility policy — written down, versioned, and shared
  with API consumers — is so valuable. It forces you to be deliberate.


  Deprecation is where API versioning either works or doesn't. You can have the
  best versioning scheme in the world, but if you don't actively drive clients
  off old versions, you'll support them forever. Effective deprecation means:
  announcing a sunset date well in advance, instrumenting API version usage so
  you know which clients are still on old versions, reaching out to high-traffic
  clients directly, and ultimately enforcing the sunset. The timeline should be
  generous — 12 to 24 months is standard for externally-facing APIs — but the
  enforcement needs to be real, or the whole deprecation process becomes
  theater.


  This topic lives in delivery-and-operations because it's really a change
  management problem with a technical implementation. It pairs naturally with
  SDK design (if you own client libraries, the SDK version often abstracts the
  API version from end users), with changelog automation (generating accurate
  breaking-change summaries from API diffs is achievable with tools like
  openapi-diff), and with contract testing (consumer-driven contract tests like
  Pact give you automated verification that your API still works for known
  clients before you deploy a change). The teams that do this well treat their
  API as a product with a backwards-compatibility promise, not as an internal
  implementation detail.
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
---
<!-- user notes -->
