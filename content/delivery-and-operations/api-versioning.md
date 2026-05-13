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
---
<!-- user notes -->
