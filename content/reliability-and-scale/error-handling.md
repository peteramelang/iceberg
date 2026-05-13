---
slug: error-handling
title: Error Handling
phase: reliability-and-scale
order: 8
summary: >-
  Principled strategies for catching, surfacing, containing, and recovering from
  errors in production systems, including graceful degradation and user-facing
  vs. internal error distinctions.
definition: >-
  Error handling in production systems encompasses the strategies, patterns, and
  tools for detecting, capturing, logging, and responding to failures that
  inevitably occur in distributed systems. Effective error handling requires a
  multi-layered approach: prevention through input validation and type systems,
  containment through circuit breakers and fallbacks, observation through
  structured logging and error tracking, and recovery through retry logic and
  graceful degradation. The goal is not to prevent all errors—an impossible
  task—but to make errors visible, recoverable, and learnable, ensuring systems
  degrade gracefully rather than catastrophically fail.


  Key principles include failing fast with clear error messages, using error
  boundaries to prevent cascading failures, implementing exponential backoff for
  transient errors, and maintaining observability through centralized error
  tracking and alerting. Production systems must distinguish between recoverable
  errors (transient failures, timeouts) and unrecoverable ones
  (misconfigurations, authentication failures), responding appropriately to
  each. Error handling also encompasses the organizational and tooling layer:
  establishing post-incident reviews, maintaining runbooks, and using dedicated
  error tracking services that provide alerting, session replay, and impact
  analysis to reduce mean time to resolution.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: >-
        https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
      title: React Error Boundaries Documentation
      kind: canonical-doc
      reasoning: >-
        Foundational pattern for containing rendering errors in UI applications;
        demonstrates how to prevent entire component trees from crashing due to
        child component failures.
      publisher: React (Meta)
      source: ai-researcher
    - url: 'https://go.dev/blog/error-handling-and-go'
      title: Error Handling and Go
      kind: engineering-blog
      reasoning: >-
        Canonical resource on Go's error handling philosophy; establishes the
        principle that errors are values and should be handled explicitly,
        applicable to many production systems.
      publisher: Go (Google)
      source: ai-researcher
    - url: >-
        https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/
      title: Avoiding Fallback in Distributed Systems
      kind: canonical-doc
      reasoning: >-
        Amazon's architectural guidance on designing systems resilient to
        failures; addresses when fallbacks work and when they compound problems
        in distributed contexts.
      publisher: Amazon Web Services
      source: ai-researcher
    - url: >-
        https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
      title: Circuit Breaker Pattern
      kind: canonical-doc
      reasoning: >-
        Foundational resilience pattern that prevents cascading failures by
        stopping requests to failing services; essential for production error
        handling in microservices.
      publisher: Microsoft Learn
      source: ai-researcher
  services:
    - name: Sentry
      url: 'https://sentry.io'
      category: Error Tracking
      reasoning: >-
        Real-time error tracking with source maps, session replay, and release
        tracking; enables teams to detect and fix errors before users report
        them.
      source: ai-researcher
    - name: Rollbar
      url: 'https://rollbar.com'
      category: Error Tracking
      reasoning: >-
        Comprehensive error tracking platform with intelligent grouping and
        alerting; provides context about who was affected and under what
        conditions.
      source: ai-researcher
    - name: Bugsnag
      url: 'https://www.bugsnag.com'
      category: Error Tracking
      reasoning: >-
        Cross-platform error monitoring with before-notifier filters and
        automatic error grouping; supports rich diagnostics for native and web
        applications.
      vendor: BugSnag
      source: ai-researcher
    - name: Honeybadger
      url: 'https://www.honeybadger.io'
      category: Error Tracking
      reasoning: >-
        Lightweight error tracking focused on uptime monitoring and exception
        tracking; designed for rapid setup in smaller production environments.
      source: ai-researcher
    - name: Datadog
      url: 'https://www.datadoghq.com'
      category: Error Tracking
      reasoning: >-
        Unified monitoring platform with error tracking, APM, and log analysis;
        provides correlated view of errors alongside infrastructure and
        performance data.
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Every production system fails. The question isn't whether errors will occur
  but whether your system is designed to handle them gracefully or to propagate
  them catastrophically. The difference between a system that degrades
  gracefully under failure and one that falls over completely usually comes down
  to a handful of architectural decisions made long before anything broke —
  decisions about how errors are classified, how they're surfaced, and what the
  system does next.


  The foundational distinction in error handling is between errors you should
  retry and errors you shouldn't. A database connection timeout during a traffic
  spike is transient — it will probably succeed if you try again in 100ms with
  exponential backoff. An invalid API key is not transient — retrying it 10
  times in a tight loop wastes resources, delays user feedback, and logs ten
  identical errors instead of one. Getting this classification right in your
  code is the single most impactful thing you can do for error handling. A
  service that retries recoverable failures automatically and fails fast on
  unrecoverable ones will produce dramatically better user experiences and
  cleaner logs than one that treats all errors the same way.


  The 80/20 here is: structured logging with error context, a centralized error
  tracking service (Sentry, Honeybadger, Rollbar — pick one and use it
  consistently), and explicit handling of errors at service boundaries.
  Everything else — custom error hierarchies, sophisticated circuit breaker
  configurations, retry budget systems — matters at scale, but most of the value
  is in those three things. Structured logging means your errors are queryable:
  you can filter by user ID, by request ID, by error type. Centralized error
  tracking means errors are deduplicated and alerted on rather than buried in a
  log file nobody reads. Handling errors at service boundaries means that a
  failure in your payment processor returns a clear error to the calling service
  rather than an unhandled exception that propagates up through five layers of
  call stack and surfaces as a 500 on a completely different endpoint.


  The dominant failure modes in production error handling are swallowed errors,
  missing context, and cascading failures. Swallowed errors happen when a catch
  block logs nothing useful or, worse, does nothing — the error disappears and
  the system behaves incorrectly with no indication of why. Missing context is
  when an error surfaces with a message like "something went wrong" and none of
  the information you'd need to debug it (user ID, input parameters, which
  downstream call failed). Cascading failures happen when a service that's
  struggling — slow responses, intermittent timeouts — causes upstream services
  to exhaust their thread pools or connection pools waiting for it, taking down
  the entire request path even for users who aren't touching the struggling
  service. Circuit breakers exist specifically to prevent cascading failures:
  once a downstream service starts failing consistently, stop calling it, return
  a fallback immediately, and check again after a cooldown period.


  User-facing versus internal error handling is a distinction that gets missed
  more often than it should. Users don't need stack traces; they need to know
  what happened and what they can do about it. "Your payment didn't go through —
  please try again or use a different card" is a good user-facing error. The
  internal error (which payment processor returned what error code, with what
  request parameters, at what timestamp) should be logged in full but never
  shown to users. Conflating these two — either showing users raw internal
  errors or hiding errors from your monitoring system — is a common failure
  pattern in systems built without explicit attention to error handling.


  Think of error handling as a contract your system makes with everything that
  depends on it. When a request fails, your system owes its callers a clear
  signal (the right HTTP status code, a structured error response), and it owes
  its operators a complete record (what happened, what the inputs were, what
  state the system was in). Meeting both obligations simultaneously is what good
  error handling looks like in practice. A system that surfaces clear errors,
  captures rich context, and fails gracefully under partial failures is
  significantly easier to operate and debug than one where errors are an
  afterthought.
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
