---
slug: instrumentation
title: Instrumentation
phase: observability
order: 3
summary: >-
  Add metrics, counters, histograms, and spans throughout your code to expose
  system health and business behavior to your observability stack.
definition: >-
  Instrumentation is the practice of adding metrics, counters, histograms, and
  distributed traces throughout your code to expose system behavior and health.
  This includes recording request latencies, error rates, business metrics (like
  conversion events or user actions), and resource utilization. Instrumentation
  enables observability by providing the signals needed to understand what your
  system is doing at runtime, detect anomalies, and investigate issues.


  Instrumentation spans multiple layers: application-level (custom business
  metrics and request tracing), infrastructure-level (CPU, memory, disk,
  network), and platform-level (service mesh, container orchestration). The
  OpenTelemetry standard provides a vendor-agnostic way to emit metrics and
  traces using a consistent API, while tools like Prometheus define best
  practices for metric design and collection patterns.


  Effective instrumentation requires upfront planning around cardinality
  (avoiding unbounded label dimensions), retention policies, and which metrics
  matter for your business and operational goals. This foundation enables faster
  incident response, better capacity planning, and data-driven decisions about
  system performance.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=w0mAg8FH5xI'
      title: Getting Started with OpenTelemetry Metrics
      author: Cloud Native Computing Foundation
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        CNCF official introduction to OTel metrics; covers collector, exporters,
        and basic instrumentation patterns.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=1yCKRi4fTrA'
      title: Observability with OpenTelemetry and Prometheus
      author: Cloud Native Computing Foundation
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into OTel ecosystem, metric types, cardinality control, and
        integration with Prometheus for production systems.
      source: ai-researcher
  articles:
    - url: 'https://opentelemetry.io/docs/specs/otel/metrics/'
      title: OpenTelemetry Metrics Specification
      kind: canonical-doc
      reasoning: >-
        Canonical reference for OTel metrics API, semantic conventions, and
        supported metric types (Counter, Gauge, Histogram, Asynchronous).
      publisher: OpenTelemetry (CNCF)
      source: ai-researcher
    - url: 'https://prometheus.io/docs/practices/instrumentation/'
      title: Prometheus Instrumentation Best Practices
      kind: canonical-doc
      reasoning: >-
        Industry standard guide on metric naming, label design, cardinality
        control, and avoiding high-cardinality traps.
      publisher: Prometheus (CNCF)
      source: ai-researcher
    - url: 'https://sre.google/sre-book/monitoring-distributed-systems/'
      title: Monitoring Distributed Systems (Google SRE Book)
      kind: canonical-doc
      reasoning: >-
        Foundational principles for monitoring at scale; covers the Four Golden
        Signals and symptom-based alerting philosophy.
      publisher: Google SRE
      source: ai-researcher
    - url: 'https://opentelemetry.io/docs/instrumentation/'
      title: OpenTelemetry Instrumentation Documentation
      kind: canonical-doc
      reasoning: >-
        Language-specific instrumentation guides for automatic and manual
        instrumentation, covering Java, Python, Go, Node.js, and .NET.
      publisher: OpenTelemetry (CNCF)
      source: ai-researcher
    - url: 'https://prometheus.io/docs/concepts/metric_types/'
      title: Prometheus Metric Types
      kind: canonical-doc
      reasoning: >-
        Detailed explanation of Counter, Gauge, Histogram, and Summary types;
        when to use each and common pitfalls.
      publisher: Prometheus (CNCF)
      source: ai-researcher
  services:
    - name: OpenTelemetry
      url: 'https://opentelemetry.io'
      category: instrumentation_framework
      reasoning: >-
        Vendor-agnostic standard for metrics, traces, and logs; supported by all
        major observability platforms.
      vendor: OpenTelemetry (CNCF)
      source: ai-researcher
    - name: Prometheus
      url: 'https://prometheus.io'
      category: metrics_platform
      reasoning: >-
        Industry-standard open-source metrics server; defines metric best
        practices and pull-based collection model.
      vendor: Prometheus (CNCF)
      source: ai-researcher
    - name: Grafana
      url: 'https://grafana.com'
      category: visualization
      reasoning: >-
        Leading visualization and alerting platform; integrates with Prometheus,
        Loki, and other datasources for dashboards and observability.
      vendor: Grafana Labs
      source: ai-researcher
    - name: Datadog
      url: 'https://www.datadoghq.com'
      category: saas_platform
      reasoning: >-
        Enterprise SaaS observability platform with out-of-the-box integrations;
        automatic instrumentation via agents and APM.
      source: ai-researcher
    - name: Honeycomb
      url: 'https://www.honeycomb.io'
      category: saas_platform
      reasoning: >-
        Event-based observability focused on high-cardinality dimensions and
        exploratory analysis; strong on distributed tracing.
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Instrumentation is the practice of making your running system legible. Without
  it, a production service is essentially a black box: you can observe its
  inputs and outputs, but everything in between is invisible. When latency
  spikes at 3am, you're asking "which part of the system slowed down?" If the
  answer requires reading code and guessing, you're in trouble. If you have a
  histogram of database query duration, a counter of cache hits and misses, and
  a trace showing the critical path of each request, you'll find the answer in
  under five minutes. That difference — between guessing and knowing — is
  entirely a function of how much instrumentation you put in before the incident
  happened.


  The 80/20 for instrumentation is ruthlessly practical. There are four signals
  that cover the majority of what goes wrong in production: request rate (are we
  receiving traffic?), error rate (what fraction of requests are failing?),
  latency (how slow are we?), and saturation (are we running out of some
  resource?). These are sometimes called the RED metrics (Rate, Errors,
  Duration) or the Golden Signals, and if every service emits them consistently,
  you can diagnose the majority of incidents from dashboards alone. Beyond
  those, the most valuable thing you can instrument is your business logic — the
  operations that actually matter to your users, like "payment submitted" or
  "search executed" or "file uploaded." When a business metric drops, it's often
  your first real signal that something is wrong, even before the infrastructure
  metrics start showing it.


  The most common mistake in instrumentation is cardinality explosion.
  Prometheus and similar systems index metrics by label values, which means each
  unique combination of labels creates a new time series. If you add a label for
  user_id or request_url with unbounded values, you can bring down your metrics
  infrastructure within hours of deploying to production. The rule is that
  labels should represent categorical dimensions with bounded cardinality —
  service name, endpoint name, HTTP method, status code bucket. User IDs,
  session tokens, and raw URLs never go in labels. This isn't an academic
  constraint; it's the difference between a metrics system that scales and one
  that collapses under its own weight.


  Distributed tracing is where instrumentation gets most powerful in
  microservice systems. A trace captures the entire journey of a request across
  services, showing which calls happened sequentially versus in parallel, and
  how much time each hop consumed. Without tracing, a slow request is a mystery
  that requires correlating logs across four services manually. With tracing,
  you click into the slow trace and see immediately that 800ms of a 1-second
  request was spent waiting for a synchronous call to an inventory service that
  itself spent 750ms waiting on a slow database query. That level of specificity
  tells you exactly where to focus optimization effort. OpenTelemetry has become
  the standard instrumentation API — using it means you're not locked to any
  specific backend and you can export to Jaeger, Honeycomb, Datadog, or anywhere
  else as your needs evolve.


  The mental model that helps most is thinking of instrumentation as
  documentation for your running system. The same way code comments explain the
  intent of the code, metrics and traces explain what the code is doing at
  runtime. The investment you make before launch pays back every time you
  investigate an incident, do capacity planning, make an architectural decision,
  or try to answer whether a performance optimization actually helped.
  Uninstrumented systems force you to reason about behavior from first
  principles every single time. Well-instrumented systems let you look it up.
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
