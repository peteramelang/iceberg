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
  - title: Swallowing Errors in Catch Blocks
    explanation: >-
      A catch block that logs nothing or silently returns a default value makes
      the system behave incorrectly with no indication of why, turning a
      detectable bug into an invisible one. Every caught error should produce a
      log entry with enough context to reconstruct what happened — at minimum
      the error type, the inputs, and the operation that failed. Silent failure
      is the hardest class of bug to diagnose in production.
  - title: Retrying Non-Retriable Errors in a Tight Loop
    explanation: >-
      Treating an invalid API key or a 400 Bad Request the same as a transient
      timeout causes the system to retry an operation that will never succeed,
      wasting resources, delaying user feedback, and flooding logs with
      identical failures. Classify errors explicitly at call sites: transient
      errors (network timeouts, 429 rate limits, 503s) get retried with
      exponential backoff; permanent errors (auth failures, 400s, 404s) fail
      fast and surface immediately.
  - title: Missing Error Context Makes Debugging Impossible
    explanation: >-
      An error message that says 'payment failed' with no user ID, no payment
      processor response, and no request parameters forces an engineer to
      reconstruct the failure from nothing during an incident. Capture the full
      context at the point of failure: the inputs, the downstream response, and
      any relevant identifiers. The cost of logging too much is storage; the
      cost of logging too little is an undebuggable outage.
  - title: Slow Downstream Services That Cascade Into Full Outages
    explanation: >-
      A single struggling downstream service that returns slow timeouts can
      exhaust upstream thread pools and connection pools, taking down request
      paths that have nothing to do with the failing service. Circuit breakers
      prevent this: once a downstream service starts failing consistently, stop
      calling it, return a fallback immediately, and probe again after a
      cooldown period. Without circuit breakers, one slow dependency can take
      down an entire application.
  - title: Exposing Internal Errors to End Users
    explanation: >-
      Stack traces and raw exception messages in API responses or user-facing
      UIs leak implementation details that help attackers and confuse users.
      Users need to know what happened and what to do next; operators need the
      full technical detail. Maintain a clear boundary: return a structured,
      user-appropriate error message to clients while logging the full internal
      error with context on the server side. These are two different audiences
      with two different needs.
  - title: No Centralized Error Tracking Means Errors Go Unnoticed
    explanation: >-
      Errors buried in log files that nobody reads actively are not being
      monitored — they are accumulating silently until a user complains or the
      error rate becomes visible in a metric. Centralized error tracking that
      deduplicates errors, groups them by type, and alerts on new or spiking
      errors is the difference between finding a bug in minutes and finding it
      after a week of customer complaints. Set it up before you need it.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 5
---
<!-- user notes -->
