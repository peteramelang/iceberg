---
slug: distributed-tracing
title: Distributed Tracing
phase: observability
order: 4
summary: >-
  Propagate trace context across service boundaries to visualize end-to-end
  request flows and pinpoint latency bottlenecks in distributed systems.
definition: >-
  Distributed tracing instruments applications and services to capture and
  correlate request flows across service boundaries. Context propagation is the
  core mechanism that enables spans generated from different processes,
  services, and data centers to be assembled into unified end-to-end traces.
  This visibility is essential for understanding system behavior, identifying
  performance bottlenecks, and diagnosing failures in complex microservices
  architectures.


  The technique relies on embedding trace context (trace ID, span ID, trace
  flags) into requests as they traverse services. When a span is generated, it
  carries this immutable context, allowing downstream services to link their
  spans to the same trace. This creates a causal chain showing exactly how a
  request flowed through the system, what operations were performed, and how
  long each step took.


  Distributed tracing implementations like Jaeger, Zipkin, and Grafana Tempo
  provide the infrastructure to collect, store, query, and visualize these
  traces. OpenTelemetry provides the vendor-neutral instrumentation standard
  that enables applications to emit trace data. Together, these tools enable
  organizations to move from reactive alerting to proactive understanding of how
  requests behave in production systems.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=sf78d5tnrvE'
      title: >-
        Jaeger: Distributed Tracing Complete Guide - Microservices Observability
        Tutorial for Beginners
      author: Unknown
      durationMinutes: 60
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive beginner-friendly overview of Jaeger distributed tracing
        with practical examples
      source: ai-researcher
    long: null
  articles:
    - url: 'https://opentelemetry.io/docs/concepts/signals/traces/'
      title: Traces | OpenTelemetry
      kind: canonical-doc
      reasoning: >-
        Canonical OpenTelemetry documentation on trace concepts, spans, context
        propagation, and signal architecture
      publisher: OpenTelemetry (CNCF)
      source: ai-researcher
    - url: >-
        https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/
      title: 'Dapper, a Large-Scale Distributed Systems Tracing Infrastructure'
      kind: canonical-doc
      reasoning: >-
        Seminal Google paper describing design, deployment, and lessons from
        Dapper, the foundational distributed tracing system
      publisher: Google Research
      source: ai-researcher
    - url: 'https://www.honeycomb.io/blog/'
      title: Honeycomb Blog - Observability and Tracing Articles
      kind: engineering-blog
      reasoning: >-
        Recent articles on distributed tracing, OpenTelemetry semantic
        conventions, and observability best practices
      publisher: Honeycomb
      source: ai-researcher
    - url: 'https://betterstack.com/community/guides/observability/jaeger-guide/'
      title: A Practical Guide to Distributed Tracing with Jaeger
      kind: tutorial
      reasoning: >-
        Hands-on guide covering Jaeger setup, instrumentation, and practical
        usage patterns
      publisher: Better Stack
      source: ai-researcher
    - url: 'https://signoz.io/blog/opentelemetry-tracing/'
      title: Complete Guide to OpenTelemetry Tracing (with Code Examples)
      kind: engineering-blog
      reasoning: >-
        Technical guide with code examples for implementing OpenTelemetry
        tracing in applications
      publisher: Signoz
      source: ai-researcher
  services:
    - name: OpenTelemetry
      url: 'https://opentelemetry.io'
      category: instrumentation
      reasoning: >-
        Vendor-neutral open-source observability framework for collecting and
        exporting trace data
      vendor: OpenTelemetry (CNCF)
      source: ai-researcher
    - name: Jaeger
      url: 'https://www.jaegertracing.io'
      category: backend
      reasoning: >-
        Open-source, cloud-native distributed tracing platform for monitoring
        microservices architectures
      vendor: Jaeger (CNCF)
      source: ai-researcher
    - name: Zipkin
      url: 'https://zipkin.io'
      category: backend
      reasoning: >-
        Open-source distributed tracing system for collecting and visualizing
        trace data across services
      source: ai-researcher
    - name: Grafana Tempo
      url: 'https://grafana.com/oss/tempo/'
      category: backend
      reasoning: >-
        Scalable, cost-efficient open-source distributed tracing backend using
        object storage
      vendor: Grafana Labs
      source: ai-researcher
    - name: Honeycomb
      url: 'https://www.honeycomb.io'
      category: platform
      reasoning: >-
        Commercial AI-ready observability platform with unified tracing, logs,
        and metrics
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
