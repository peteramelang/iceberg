---
slug: logging
title: Logging
phase: observability
order: 1
summary: >-
  Emit structured, queryable logs from all application components so that the
  sequence of events leading to any outcome can be reconstructed.
definition: >-
  Logging is the practice of recording timestamped events that occur during your
  application's runtime, with structured context and metadata, so you can query
  and investigate system behavior retroactively. Logs form one of the three
  pillars of observability alongside metrics and traces, enabling engineers to
  understand what their systems did, debug production incidents, and make
  data-driven decisions about reliability and performance. Modern logging
  emphasizes structured (JSON) output, correlation IDs that link logs to traces
  and requests, sensible log levels, and centralized aggregation through
  platforms that index events for fast querying at scale.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=dfpGU9al_i4'
      title: 'OpenTelemetry Demystified: An Observability Tutorial for Beginners'
      author: OpenTelemetry Community
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Beginner-friendly introduction to OpenTelemetry logging fundamentals;
        clear, foundational content from canonical source.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=BJqGCj0huvw'
      title: Complete Tutorial - How to Collect Logs with OpenTelemetry
      author: Is it Observable
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep-dive technical tutorial on collecting logs with OpenTelemetry;
        comprehensive hands-on content from recognized observability educator.
      source: ai-researcher
  articles:
    - url: 'https://opentelemetry.io/docs/specs/otel/logs/'
      title: OpenTelemetry Logging Specification
      kind: canonical-doc
      reasoning: >-
        Authoritative specification document defining the OpenTelemetry logs
        data model, API, and SDK; foundational canonical reference.
      publisher: OpenTelemetry (CNCF)
      source: ai-researcher
    - url: 'https://www.honeycomb.io/blog/engineers-checklist-logging-best-practices'
      title: 'Logging Best Practices: An Engineer''s Checklist'
      kind: engineering-blog
      reasoning: >-
        Practical guide from Honeycomb (observability pioneer); actionable
        checklist for implementing production-grade logging.
      publisher: Honeycomb
      source: ai-researcher
    - url: 'https://docs.datadoghq.com/logs/guide/best-practices-for-log-management/'
      title: Best Practices for Log Management
      kind: canonical-doc
      reasoning: >-
        Datadog's authoritative guide covering cost optimization, retention, and
        effective log management strategies at scale.
      publisher: Datadog
      source: ai-researcher
  services:
    - name: Honeycomb
      url: 'https://www.honeycomb.io/'
      category: observability-platform
      reasoning: >-
        Industry-leading observability platform for structured logging with
        high-cardinality querying and trace correlation; founded by
        observability pioneers.
      source: ai-researcher
    - name: Datadog
      url: 'https://www.datadoghq.com/'
      category: observability-platform
      reasoning: >-
        Comprehensive SaaS platform with log aggregation, indexing, and
        analysis; widely adopted enterprise solution.
      source: ai-researcher
    - name: Better Stack
      url: 'https://betterstack.com/'
      category: logging-platform
      reasoning: >-
        Cost-effective OpenTelemetry-native log management built on ClickHouse;
        strong alternative to expensive legacy platforms.
      source: ai-researcher
    - name: Axiom
      url: 'https://axiom.co/'
      category: logging-platform
      reasoning: >-
        Edge-native observability platform with unfixed retention and no
        sampling; optimized for serverless and event-driven architectures.
      source: ai-researcher
    - name: Grafana Loki
      url: 'https://grafana.com/oss/loki/'
      category: open-source-platform
      reasoning: >-
        Industry-standard open-source log aggregation system with efficient
        indexing; integrates with Grafana, Mimir, and Tempo for unified
        observability.
      vendor: Grafana Labs
      source: ai-researcher
  courses:
    - url: >-
        https://www.coursera.org/learn/monitoring-and-observability-for-development-and-devops
      title: Monitoring and Observability for Development and DevOps
      provider: Coursera (IBM)
      paid: false
      reasoning: >-
        Free foundational course covering the three pillars of observability
        including structured logging; covers industry tools like Prometheus and
        Grafana.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Logging is the oldest observability tool and, used well, still one of the most
  powerful. The pitch is simple: when something goes wrong in production, you
  need to reconstruct what happened. Logs are the record of what your system
  did, in chronological order, with enough context to understand why. Without
  them, you're left with symptoms — a user reported an error, a metric spiked —
  but no story connecting cause to effect. With good logs, you can often answer
  "what happened" in minutes rather than hours, because the answer is already
  written down, you just need to read it.


  The shift from unstructured to structured logging is the most important
  practice change in modern logging, and it's worth dwelling on because many
  systems still haven't made it. Unstructured logs are strings: "User 12345
  failed to authenticate at 14:03:22." They're human-readable but
  machine-hostile. To find all authentication failures for user 12345, you write
  a regex and grep. Structured logs are JSON objects: `{"event": "auth_failure",
  "user_id": 12345, "timestamp": "...", "reason": "invalid_token"}`. To find the
  same thing, you query a field. When you're searching across millions of events
  in a logging platform like Loki, Elasticsearch, or Datadog Logs, the
  difference between a field query and a full-text regex is the difference
  between a query that takes half a second and one that takes a minute and a
  half. Structured logging isn't about aesthetics — it's about whether your logs
  are actually queryable at the scale and speed you need during an incident.


  Log levels are the 80/20 of log quality. Most teams use INFO for everything
  important and ERROR for nothing specific, which means their logs are noisy at
  quiet times and unhelpfully cluttered during incidents. The discipline is
  simpler than it sounds: DEBUG for verbose internal state useful only during
  local development, INFO for normal operations you'd want in a production audit
  trail, WARN for conditions that are abnormal but not yet breaking, and ERROR
  for conditions that require attention. The key is that WARN and ERROR should
  be actionable — if you're logging a WARN that fires thousands of times per
  hour and everyone ignores it, that's a miscalibrated signal and a noise source
  that makes real problems harder to spot.


  Correlation IDs are what elevate logging from a collection of individual event
  records to a coherent story. When a user makes a request, generate a unique
  trace ID and propagate it through every downstream call — to the database, to
  the cache, to any microservices called along the way. When every log line for
  that request carries the same ID, you can filter to a single trace and see the
  full sequence of events in order. Without this, debugging a request that
  touched four services means manually correlating timestamps across four
  separate log streams, which is slow and error-prone. Modern observability
  stacks (OpenTelemetry, Jaeger, Datadog APM) can do this correlation
  automatically when you emit standard trace headers, and it dramatically
  changes the experience of incident investigation.


  The failure mode that bites most teams is logging too much of the wrong thing
  and too little of the right thing. Logging every SQL statement in a busy API
  might produce gigabytes of noise that costs real money and slows down queries,
  while the critical business event — "payment processing started" — might not
  be logged at all. The principle to apply is: logs should tell the story of
  your system's behavior, not its implementation details. Business events, state
  transitions, external calls and their outcomes, errors with full context —
  these are the things worth logging. Framework internals, routine health
  checks, high-frequency polling loops — these usually aren't, unless you're
  actively debugging a specific problem and plan to turn the verbosity back
  down. Logging has a real cost in storage, ingestion, and index time, and
  treating it as free leads to systems where the important signal is buried in
  noise.
pitfalls:
  - title: Unstructured log strings that cannot be queried
    explanation: >-
      Logs written as free-text strings require regex or full-text search to
      extract any structured field at query time. Across millions of events
      during an incident, that is the difference between a query that returns in
      half a second and one that times out. Emit JSON from every service with
      named fields for event type, user ID, request ID, and error details so
      your logging platform can index and query them efficiently.
  - title: 'No correlation ID, so requests cannot be traced through logs'
    explanation: >-
      Without a unique request ID propagated through every service call and
      included on every log line, reconstructing the sequence of events for a
      single failing request requires manually correlating timestamps across
      multiple log streams — slow and unreliable under incident pressure.
      Generate a trace ID at the entry point of every request and pass it
      through every downstream call and log statement.
  - title: Logging everything at INFO produces noise that buries real signals
    explanation: >-
      Teams that emit INFO for every internal operation produce log volumes that
      are expensive to store, slow to query, and filled with noise that obscures
      the events that actually matter. WARN and ERROR should be rare enough that
      seeing one is meaningful. Reserve INFO for events you would genuinely want
      in a production audit trail, and use DEBUG for verbose internal state that
      is off by default.
  - title: Logging sensitive data in plaintext
    explanation: >-
      Passwords, session tokens, payment card numbers, and personally
      identifiable information have a way of leaking into log lines through
      debug statements, error stack traces, or request body logging. Once in a
      log aggregation platform, that data is typically retained for weeks or
      months, searchable by anyone with log access, and potentially shipped to
      third-party services. Audit what ends up in your logs and enforce
      redaction in your logging library before data reaches storage.
  - title: Missing logs on the most critical business operations
    explanation: >-
      Teams instrument framework internals and HTTP access logs but neglect to
      log the operations that actually matter: payment processing started,
      subscription created, file uploaded, job completed. When a user reports a
      problem, the logs show that requests arrived and responses were sent, but
      give no visibility into what the application actually did in between. Log
      state transitions and business events explicitly, not just
      infrastructure-level activity.
  - title: Treating logging as free and ignoring storage costs
    explanation: >-
      High-volume logging — SQL statements on every query, full request and
      response bodies, health-check probes — can generate gigabytes of data per
      hour that costs real money to ingest, store, and index. Teams discover
      this at the first billing cycle or when the logging platform starts
      dropping events under load. Establish log budgets per service, use
      sampling for high-volume low-value events, and actively prune log
      statements that serve no investigation purpose.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 3
---
<!-- user notes -->
