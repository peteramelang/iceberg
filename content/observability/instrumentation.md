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
    long:
      url: 'https://www.youtube.com/watch?v=1yCKRi4fTrA'
      title: Observability with OpenTelemetry and Prometheus
      author: Cloud Native Computing Foundation
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into OTel ecosystem, metric types, cardinality control, and
        integration with Prometheus for production systems.
  articles:
    - url: 'https://opentelemetry.io/docs/specs/otel/metrics/'
      title: OpenTelemetry Metrics Specification
      kind: canonical-doc
      reasoning: >-
        Canonical reference for OTel metrics API, semantic conventions, and
        supported metric types (Counter, Gauge, Histogram, Asynchronous).
    - url: 'https://prometheus.io/docs/practices/instrumentation/'
      title: Prometheus Instrumentation Best Practices
      kind: canonical-doc
      reasoning: >-
        Industry standard guide on metric naming, label design, cardinality
        control, and avoiding high-cardinality traps.
    - url: 'https://sre.google/sre-book/monitoring-distributed-systems/'
      title: Monitoring Distributed Systems (Google SRE Book)
      kind: canonical-doc
      reasoning: >-
        Foundational principles for monitoring at scale; covers the Four Golden
        Signals and symptom-based alerting philosophy.
    - url: 'https://opentelemetry.io/docs/instrumentation/'
      title: OpenTelemetry Instrumentation Documentation
      kind: canonical-doc
      reasoning: >-
        Language-specific instrumentation guides for automatic and manual
        instrumentation, covering Java, Python, Go, Node.js, and .NET.
    - url: 'https://prometheus.io/docs/concepts/metric_types/'
      title: Prometheus Metric Types
      kind: canonical-doc
      reasoning: >-
        Detailed explanation of Counter, Gauge, Histogram, and Summary types;
        when to use each and common pitfalls.
  services:
    - name: OpenTelemetry
      url: 'https://opentelemetry.io'
      category: instrumentation_framework
      reasoning: >-
        Vendor-agnostic standard for metrics, traces, and logs; supported by all
        major observability platforms.
    - name: Prometheus
      url: 'https://prometheus.io'
      category: metrics_platform
      reasoning: >-
        Industry-standard open-source metrics server; defines metric best
        practices and pull-based collection model.
    - name: Grafana
      url: 'https://grafana.com'
      category: visualization
      reasoning: >-
        Leading visualization and alerting platform; integrates with Prometheus,
        Loki, and other datasources for dashboards and observability.
    - name: Datadog
      url: 'https://www.datadoghq.com'
      category: saas_platform
      reasoning: >-
        Enterprise SaaS observability platform with out-of-the-box integrations;
        automatic instrumentation via agents and APM.
    - name: Honeycomb
      url: 'https://www.honeycomb.io'
      category: saas_platform
      reasoning: >-
        Event-based observability focused on high-cardinality dimensions and
        exploratory analysis; strong on distributed tracing.
  courses:
    - url: 'https://www.linux.com/training/observability-with-opentelemetry/'
      title: Observability with OpenTelemetry
      provider: Linux Foundation
      paid: false
      reasoning: >-
        Free introductory course covering OTel concepts, architecture, and
        hands-on labs with metrics and traces.
    - url: 'https://www.udemy.com/course/prometheus-masterclass/'
      title: Prometheus Masterclass
      provider: Udemy
      paid: true
      reasoning: >-
        Comprehensive paid course on Prometheus, metric design, alerting, and
        Grafana integration; includes real-world examples.
    - url: 'https://learn.honeycomb.io/'
      title: Honeycomb University
      provider: Honeycomb
      paid: false
      reasoning: >-
        Free self-paced courses on modern observability, cardinality, and
        distributed tracing fundamentals.
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
