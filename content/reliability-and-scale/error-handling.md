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
    - url: 'https://go.dev/blog/error-handling-and-go'
      title: Error Handling and Go
      kind: engineering-blog
      reasoning: >-
        Canonical resource on Go's error handling philosophy; establishes the
        principle that errors are values and should be handled explicitly,
        applicable to many production systems.
    - url: >-
        https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/
      title: Avoiding Fallback in Distributed Systems
      kind: canonical-doc
      reasoning: >-
        Amazon's architectural guidance on designing systems resilient to
        failures; addresses when fallbacks work and when they compound problems
        in distributed contexts.
    - url: >-
        https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker
      title: Circuit Breaker Pattern
      kind: canonical-doc
      reasoning: >-
        Foundational resilience pattern that prevents cascading failures by
        stopping requests to failing services; essential for production error
        handling in microservices.
  services:
    - name: Sentry
      url: 'https://sentry.io'
      category: Error Tracking
      reasoning: >-
        Real-time error tracking with source maps, session replay, and release
        tracking; enables teams to detect and fix errors before users report
        them.
    - name: Rollbar
      url: 'https://rollbar.com'
      category: Error Tracking
      reasoning: >-
        Comprehensive error tracking platform with intelligent grouping and
        alerting; provides context about who was affected and under what
        conditions.
    - name: Bugsnag
      url: 'https://www.bugsnag.com'
      category: Error Tracking
      reasoning: >-
        Cross-platform error monitoring with before-notifier filters and
        automatic error grouping; supports rich diagnostics for native and web
        applications.
    - name: Honeybadger
      url: 'https://www.honeybadger.io'
      category: Error Tracking
      reasoning: >-
        Lightweight error tracking focused on uptime monitoring and exception
        tracking; designed for rapid setup in smaller production environments.
    - name: Datadog
      url: 'https://www.datadoghq.com'
      category: Error Tracking
      reasoning: >-
        Unified monitoring platform with error tracking, APM, and log analysis;
        provides correlated view of errors alongside infrastructure and
        performance data.
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
