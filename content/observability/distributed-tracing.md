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
    long: null
  articles:
    - url: 'https://opentelemetry.io/docs/concepts/signals/traces/'
      title: Traces | OpenTelemetry
      kind: canonical-doc
      reasoning: >-
        Canonical OpenTelemetry documentation on trace concepts, spans, context
        propagation, and signal architecture
    - url: >-
        https://research.google/pubs/dapper-a-large-scale-distributed-systems-tracing-infrastructure/
      title: 'Dapper, a Large-Scale Distributed Systems Tracing Infrastructure'
      kind: canonical-doc
      reasoning: >-
        Seminal Google paper describing design, deployment, and lessons from
        Dapper, the foundational distributed tracing system
    - url: 'https://www.honeycomb.io/blog/'
      title: Honeycomb Blog - Observability and Tracing Articles
      kind: engineering-blog
      reasoning: >-
        Recent articles on distributed tracing, OpenTelemetry semantic
        conventions, and observability best practices
    - url: 'https://betterstack.com/community/guides/observability/jaeger-guide/'
      title: A Practical Guide to Distributed Tracing with Jaeger
      kind: tutorial
      reasoning: >-
        Hands-on guide covering Jaeger setup, instrumentation, and practical
        usage patterns
    - url: 'https://signoz.io/blog/opentelemetry-tracing/'
      title: Complete Guide to OpenTelemetry Tracing (with Code Examples)
      kind: engineering-blog
      reasoning: >-
        Technical guide with code examples for implementing OpenTelemetry
        tracing in applications
  services:
    - name: OpenTelemetry
      url: 'https://opentelemetry.io'
      category: instrumentation
      reasoning: >-
        Vendor-neutral open-source observability framework for collecting and
        exporting trace data
    - name: Jaeger
      url: 'https://www.jaegertracing.io'
      category: backend
      reasoning: >-
        Open-source, cloud-native distributed tracing platform for monitoring
        microservices architectures
    - name: Zipkin
      url: 'https://zipkin.io'
      category: backend
      reasoning: >-
        Open-source distributed tracing system for collecting and visualizing
        trace data across services
    - name: Grafana Tempo
      url: 'https://grafana.com/oss/tempo/'
      category: backend
      reasoning: >-
        Scalable, cost-efficient open-source distributed tracing backend using
        object storage
    - name: Honeycomb
      url: 'https://www.honeycomb.io'
      category: platform
      reasoning: >-
        Commercial AI-ready observability platform with unified tracing, logs,
        and metrics
  courses:
    - url: >-
        https://www.linkedin.com/learning/devops-foundations-distributed-tracing/
      title: 'DevOps Foundations: Distributed Tracing'
      provider: LinkedIn Learning
      paid: true
      reasoning: >-
        Comprehensive course covering distributed tracing fundamentals and
        implementation strategies
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Before distributed tracing, debugging a slow API request in a microservices
  system meant reading logs across six services, correlating timestamps by hand,
  and hoping that the thing you found in service C was actually caused by the
  thing that happened in service A three hops earlier. It was archaeology.
  Engineers who were good at it developed a kind of institutional sixth sense —
  an intuition built from hundreds of hours of log-reading that couldn't be
  transferred to anyone else. Distributed tracing replaces that intuition with
  an instrument: a causal chain you can actually look at.


  The core mechanism is context propagation. When a request enters your system —
  say, a user clicking "checkout" — a trace ID is generated and attached to that
  request. Every downstream service call inherits that trace ID and adds its own
  span: a start time, end time, metadata about what it did, and a reference back
  to its parent span. When those spans are collected and assembled, you get a
  Gantt-chart-like view of everything that happened to satisfy that one request:
  the auth service took 12ms, the inventory service took 200ms (that's the
  problem), the payment processor call was fine. Without tracing, you'd see a
  slow checkout request in your metrics and start guessing. With tracing, you
  see exactly which span owned the latency.


  The 80/20 of distributed tracing centers on a few things that matter
  enormously and many configuration knobs that don't. What matters: getting
  trace context propagated correctly at every service boundary (HTTP headers,
  message queue metadata, gRPC metadata — wherever requests cross process
  boundaries), sampling at a rate that captures enough signal without drowning
  your backend in data, and instrumenting the operations that actually matter
  (database queries, external API calls, cache interactions). What doesn't
  matter much in the early stages: tail-based sampling configurations, custom
  span processors, advanced baggage propagation, or the fine points of
  OpenTelemetry's collector pipeline. OpenTelemetry has become the
  instrumentation standard — use its auto-instrumentation for your language
  runtime first, then add manual spans for the business-logic operations that
  matter to you.


  The failure modes are predictable. The most common one is incomplete
  propagation: you instrument your HTTP services but forget your background job
  workers, your Kafka consumers, or your GraphQL gateway, and traces start but
  don't finish. You end up with orphaned spans that are more confusing than no
  tracing at all. The second common failure is sampling that's either too
  aggressive (you miss the rare slow request that matters) or too permissive
  (you store every trace and drown your Tempo or Jaeger backend in data and
  cost). The third failure mode is treating tracing as a fire-and-forget setup —
  you get it working once and then infrastructure changes (new services, new
  libraries, framework upgrades) quietly break propagation and you don't notice
  until the next incident.


  The mental model that makes distributed tracing click is to think of each
  trace as a receipt for a request. It's an immutable record of every meaningful
  operation that happened, in the right causal order, with timings attached. The
  trace ID is the receipt number. Spans are the line items. When a customer
  complains that checkout was slow, you pull up their trace ID — if you're
  logging it or surfacing it in your UI — and read the receipt. When you're
  investigating a latency regression after a deploy, you compare receipts from
  before and after. The power of the tool is proportional to the quality of your
  instrumentation: vague span names and missing attributes produce unreadable
  receipts; well-named spans with relevant metadata (user ID, order ID, cache
  hit/miss) produce receipts you can read in 30 seconds.


  Distributed tracing sits in the observability triad alongside metrics and
  logs, and it's worth being clear about what each tool is for. Metrics tell you
  something is wrong (p99 latency spiked). Logs tell you what happened inside a
  single service. Traces tell you where across the system the problem lives. In
  a monolith, logs are often enough. In a system with more than three or four
  services, traces become the thing you reach for first when latency is the
  symptom, because they eliminate the guessing that otherwise eats the first
  hour of every incident.
pitfalls:
  - title: Incomplete Context Propagation Leaves Orphaned Spans
    explanation: >-
      HTTP services get instrumented but background job workers, Kafka
      consumers, and async queues are missed, causing traces to terminate
      mid-journey. The resulting orphaned spans are more confusing than no
      tracing at all because they imply a path that cannot be followed. Audit
      every process boundary — HTTP headers, message queue metadata, gRPC
      metadata — and verify propagation end-to-end, not just at the entry point.
  - title: Sampling Too Aggressively and Missing the Slow Outliers
    explanation: >-
      A 1% head-based sampling rate cuts infrastructure cost but discards 99 out
      of 100 requests, almost guaranteeing you miss the rare slow tail-latency
      events that matter most during incidents. Implement tail-based sampling or
      rate-limit sampling so that traces with high latency, errors, or specific
      attributes are always captured regardless of overall volume. The traces
      you throw away are the ones you will wish you had during the next
      incident.
  - title: Treating Tracing as a One-Time Setup
    explanation: >-
      Propagation breaks silently when services are updated, new libraries are
      added, or framework versions change, and there is no automated check to
      catch it. A tracing setup that is not continuously validated becomes
      unreliable exactly when reliability matters most. Add span-count smoke
      tests or trace-completeness checks to your CI or synthetic monitoring so
      you are notified before an incident reveals the gap.
  - title: Using Vague Span Names That Produce Unreadable Traces
    explanation: >-
      Spans named 'process', 'handler', or 'db-call' tell you nothing useful
      about what operation took 800ms. Good span names and attributes —
      including the query type, cache hit or miss, and relevant business
      identifiers like order ID — are what make a trace readable in 30 seconds
      rather than 10 minutes. Treat span naming as part of your instrumentation
      standard and review it during code review.
  - title: Skipping Manual Instrumentation for Business-Critical Paths
    explanation: >-
      Auto-instrumentation covers library calls and framework middleware but has
      no visibility into the business logic between them — the pricing
      calculation loop or the eligibility check that actually owns the latency.
      Manual spans around the operations that matter to your users are what
      convert tracing from infrastructure plumbing into a genuinely useful
      debugging tool. Start with the five operations that appear most often in
      customer-reported slowness.
codeExamples:
  - language: typescript
    title: OpenTelemetry Trace Context Propagation
    code: >-
      import { NodeSDK } from '@opentelemetry/sdk-node';

      import { OTLPTraceExporter } from
      '@opentelemetry/exporter-trace-otlp-http';

      import { trace, context, propagation } from '@opentelemetry/api';

      import { W3CTraceContextPropagator } from '@opentelemetry/core';


      // Bootstrap once at app entry point

      const sdk = new NodeSDK({
        traceExporter: new OTLPTraceExporter({ url: 'http://otel-collector:4318/v1/traces' }),
      });

      sdk.start();


      const tracer = trace.getTracer('payments-service', '1.0.0');


      // Inbound request: extract context from HTTP headers

      async function handleCheckout(headers: Record<string, string>, orderId:
      string) {
        const parentCtx = propagation.extract(context.active(), headers);

        return context.with(parentCtx, async () => {
          const span = tracer.startSpan('checkout.process', {
            attributes: { 'order.id': orderId },
          });
          return context.with(trace.setSpan(context.active(), span), async () => {
            try {
              await chargeCard(orderId);
              span.setStatus({ code: 1 }); // OK
            } catch (err: any) {
              span.recordException(err);
              span.setStatus({ code: 2, message: err.message }); // ERROR
              throw err;
            } finally {
              span.end();
            }
          });
        });
      }


      // Outbound call: inject context into headers so downstream spans link up

      async function chargeCard(orderId: string) {
        const outboundHeaders: Record<string, string> = {};
        propagation.inject(context.active(), outboundHeaders);

        await fetch('http://payment-processor/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...outboundHeaders },
          body: JSON.stringify({ orderId }),
        });
      }
    reasoning: >-
      Context propagation — extracting on inbound and injecting on outbound — is
      the single mechanism that stitches spans from different services into one
      trace; without it you get orphaned spans that reveal nothing about
      cross-service latency.
difficulty: intermediate
estimatedHours: 8
tldr: >-
  Follow a request through your entire system to see which service is slow or
  broken by attaching a tracking ID and recording each step, turning guesswork
  into fact.
shortExplainerVideo:
  url: 'https://www.youtube.com/watch?v=hLvwoow3XTk'
  title: 'OpenTelemetry: Simplifying Hybrid Cloud Monitoring'
  author: IBM Technology
  durationSeconds: 340
  reasoning: >-
    IBM Technology's 5:40 explainer covers OpenTelemetry's core concepts—traces,
    metrics, logs—and how context propagation works across service boundaries.
    OpenTelemetry is now the de-facto instrumentation standard for distributed
    tracing, so this directly maps to the topic's focus on trace context
    propagation and vendor-neutral instrumentation. Strong preferred source,
    correct duration, no tutorial bloat.
  source: ai-researcher
lastUpdatedAt: '2026-05-14T12:33:14.467Z'
---
<!-- user notes -->
