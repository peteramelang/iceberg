---
slug: slos-and-slis
title: SLOs & SLIs
phase: observability
order: 5
summary: >-
  Define measurable reliability targets (SLOs) backed by concrete indicators
  (SLIs) and error budgets to make data-driven decisions about reliability vs.
  velocity.
definition: >-
  Service Level Objectives (SLOs) and Service Level Indicators (SLIs) are
  foundational concepts in Site Reliability Engineering that enable teams to
  establish measurable reliability targets and track actual performance against
  those targets. An SLO is an internal goal for how reliable a service should
  be—typically expressed as a percentage of successful operations over a time
  window (e.g., 99.9% uptime per month)—while an SLI is the actual measurement
  that indicates whether the SLO is being met. Together, they provide the
  quantitative basis for error budgets, which represent the acceptable amount of
  "bad" performance before breaching service level agreements with customers.


  The relationship between SLOs, SLIs, and error budgets creates a data-driven
  framework for balancing reliability with velocity. An error budget is
  calculated as 1 minus the SLO target: a 99.9% SLO yields a 0.1% error budget,
  quantifying exactly how much failure the service can tolerate. This transforms
  reliability from a subjective goal into a measurable resource that teams can
  consciously spend on feature releases, experiments, or infrastructure
  improvements. When error budget consumption accelerates unexpectedly, it
  signals the need to pause new deployments and focus on stability.


  Implementing SLOs effectively requires careful selection of SLIs that reflect
  genuine user experience, stakeholder alignment on reasonable reliability
  targets based on business impact and historical performance data, and
  organizational discipline to treat error budget policies as constraints on
  development velocity. Canonical resources from Google's Site Reliability
  Engineering practice demonstrate that SLOs are most effective when they are
  user-focused, tightly aligned with contractual SLAs (typically setting SLO
  1-2% higher than SLA to provide warning), and integrated into both
  observability dashboards and deployment decision-making processes.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=pouVbehfnqQ'
      title: 'SLAs, SLOs, and SLIs EXPLAINED in 7 Minutes (2025)'
      author: DevOps/SRE
      durationMinutes: 7
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Quick, current 2025 explainer covering the relationship between SLAs,
        SLOs, and SLIs with practical context.
    long:
      url: 'https://www.youtube.com/watch?v=uYC2kcndtVs'
      title: How to get started with SLI/SLO with Steve McGhee
      author: Steve McGhee
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        In-depth walkthrough from an SRE expert on implementing SLIs and SLOs in
        practice.
  articles:
    - url: 'https://sre.google/sre-book/service-level-objectives/'
      title: 'Defining SLO: Service Level Objective Meaning'
      kind: canonical-doc
      reasoning: >-
        Canonical Google SRE book chapter on SLOs, foundational reference for
        the field.
    - url: 'https://sre.google/workbook/implementing-slos/'
      title: Implementing Service Level Objectives
      kind: tutorial
      reasoning: >-
        Google SRE workbook guidance on practical implementation of SLOs with
        concrete examples.
    - url: 'https://sre.google/workbook/error-budget-policy/'
      title: Error Budget Policy for Service Reliability
      kind: tutorial
      reasoning: >-
        Guidance on setting error budget policies that drive data-driven
        reliability decisions.
    - url: >-
        https://www.nobl9.com/resources/a-complete-guide-to-error-budgets-setting-up-slos-slis-and-slas-to-maintain-reliability
      title: >-
        A Complete Guide to Error Budgets: Setting up SLOs, SLIs, and SLAs to
        Maintain Reliability
      kind: tutorial
      reasoning: >-
        Comprehensive guide covering the interconnection between error budgets,
        SLOs, SLIs, and SLAs.
    - url: 'https://www.datadoghq.com/blog/establishing-service-level-objectives/'
      title: 'SLOs: How to Establish and Define Service Level Objectives'
      kind: engineering-blog
      reasoning: >-
        Practical guidance from Datadog on designing and establishing SLOs in
        production environments.
  services:
    - name: Nobl9
      url: 'https://www.nobl9.com'
      category: SLO-Management-Platform
      reasoning: >-
        Purpose-built platform for defining, tracking, and managing SLOs with
        composite SLO support and error budget alerting.
    - name: Datadog Service Level Objectives
      url: 'https://www.datadoghq.com/product/service-level-objectives/'
      category: Observability-SLO-Module
      reasoning: >-
        Integrated SLO monitoring within Datadog's observability platform with
        multiple SLO types and error budget tracking.
    - name: Grafana SLO
      url: 'https://grafana.com/products/cloud/slo/'
      category: Observability-SLO-Module
      reasoning: >-
        Grafana Cloud SLO service enabling creation, management, and monitoring
        of SLOs with burn rate alerting.
    - name: Google Cloud SRE
      url: 'https://sre.google'
      category: Educational-Framework
      reasoning: >-
        Google's Site Reliability Engineering site hosting foundational SLO
        resources, the SRE book, workbooks, and workshops.
    - name: Pingdom
      url: 'https://www.pingdom.com'
      category: Uptime-Monitoring
      reasoning: >-
        Synthetic monitoring service useful for establishing SLIs around
        availability and performance.
  courses:
    - url: 'https://www.coursera.org/learn/measuring-managing-reliability'
      title: Measuring and Managing Reliability Specialization
      provider: Coursera (Google Cloud)
      paid: true
      reasoning: >-
        Comprehensive specialization covering SLIs, SLOs, error budgets, and
        reliability practices from Google.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The question "is our service reliable?" sounds simple, but it's actually
  unanswerable without first deciding what reliable means and how you're going
  to measure it. Before SLOs, most engineering teams operated on vibes: if the
  alerts weren't firing and nobody was complaining loudly, things were probably
  fine. The problem with vibes is that they don't scale and they don't give you
  a rational basis for making tradeoffs. If you can't measure your reliability
  in a way that connects to real user experience, you can't have an honest
  conversation about whether shipping that new feature is worth the risk, or
  whether you've been burning engineering cycles on stability that customers
  don't actually care about. SLOs exist to make that conversation possible.


  The 80/20 for SLOs is this: pick one or two SLIs that genuinely reflect
  whether users are having a good experience, set a realistic target based on
  your actual recent performance, and build the error budget discipline before
  you worry about anything else. The SLI choice is where most teams go wrong —
  they measure what's easy to measure rather than what matters. CPU utilization
  is easy to measure. Whether a request returned a correct response within 300
  milliseconds is harder to measure, but it's what your users actually
  experience. Latency at the 95th or 99th percentile and success rate on
  critical user journeys (search, checkout, login) are almost always the right
  starting points. Everything else — multi-window burn rate alerts, tiered SLO
  policies per customer tier, complex SLI compositions — can come later once
  you've built the habit of looking at the error budget.


  The dominant failure mode is the SLO that nobody looks at. The team ships SLOs
  because SRE best practices say to, sets up a dashboard, and then proceeds to
  make deployment decisions exactly the same way they did before. The error
  budget exists in theory but the team never actually pauses feature work when
  it's burning down. This defeats the entire purpose. The second failure mode is
  setting an SLO target that's either too tight or too loose. Too tight — say,
  99.99% when you're actually achieving 99.5% — and your error budget is always
  exhausted, the number is demoralizing and ignored, and you've just created
  noise. Too loose, and you're not learning anything useful about where your
  reliability problems actually are. Starting with a target slightly above your
  current measured baseline and tightening it over time as you improve is the
  pragmatic approach.


  The mental model that makes SLOs tractable is thinking of the error budget as
  a shared resource that the team consciously decides how to spend. You have 43
  minutes of downtime allowed this month for a 99.9% monthly SLO. Maybe you
  spend 20 of those minutes on a risky schema migration that has a chance of
  causing a brief outage. Maybe you bank them and ship more aggressively. The
  point is the decision is explicit and visible, not implicit and invisible.
  When an incident burns through two weeks of error budget in a night, the team
  can look at a number and make a concrete decision: do we keep shipping at the
  same velocity, or do we slow down and fix the reliability issues that put us
  here? That's the conversation SLOs are designed to enable.


  Within the observability ecosystem, SLOs sit above raw metrics and traces. You
  need good instrumentation and a time-series store to compute SLIs in the first
  place — Prometheus, Datadog, or whatever your stack uses to collect and
  aggregate request success rates and latency distributions. The SLO layer then
  aggregates those measurements into compliance windows and error budget burn
  rates. SLOs also connect upward to SLAs: if you have contractual commitments
  to customers, your internal SLO target should give you a buffer, so a single
  bad day doesn't immediately put you in breach of contract. The whole system
  only works if the measurement is trustworthy, which means investing in the
  underlying observability infrastructure before you can meaningfully reason
  about SLO compliance.
pitfalls:
  - title: 'Measuring what''s easy, not what users experience'
    explanation: >-
      Teams reach for CPU utilization or uptime pings because they are already
      instrumented, but those metrics don't capture whether a user's checkout
      succeeded in under 300ms. SLIs must track user-facing success rate and
      latency on critical journeys or the SLO is measuring the wrong thing
      entirely.
  - title: Setting SLO targets disconnected from actual baseline
    explanation: >-
      An SLO of 99.99% when you are currently achieving 99.5% means your error
      budget is perpetually exhausted from day one, the number is ignored, and
      no useful decisions flow from it. Start your target slightly above recent
      measured performance and tighten it as reliability improves.
  - title: Error budget exists on a dashboard nobody opens
    explanation: >-
      Publishing an SLO without a policy that actually changes team behavior —
      slowing feature velocity when the budget burns down — produces theater,
      not reliability improvement. The error budget only works as a
      decision-forcing function if leadership enforces it.
  - title: SLO windows that hide chronic low-level failures
    explanation: >-
      A 30-day rolling SLO can absorb a steady drip of 0.05% daily failures
      without ever triggering an alert, even though that drip represents
      thousands of failed user requests. Complement long-window compliance with
      burn-rate alerts that fire when recent consumption will exhaust the budget
      early.
  - title: Including planned maintenance in error budget consumption
    explanation: >-
      Counting a scheduled deployment window as downtime against your SLO
      discourages maintenance and distorts the signal. Maintenance windows
      should be excluded from SLI measurement or accounted for separately so the
      budget reflects unplanned reliability, not intentional operational events.
codeExamples:
  - language: python
    title: Compute Error Budget Burn Rate
    code: >-
      from dataclasses import dataclass

      from datetime import datetime, timedelta



      @dataclass

      class SLOWindow:
          name: str           # e.g. "30d", "1h"
          duration: timedelta
          slo_target: float   # e.g. 0.999 for 99.9%


      @dataclass

      class SLISnapshot:
          good_requests: int
          total_requests: int
          window_start: datetime
          window_end: datetime


      def error_budget_remaining(window: SLOWindow, snapshot: SLISnapshot) ->
      dict:
          """Return error budget status for a given SLO window."""
          if snapshot.total_requests == 0:
              return {"error": "no data"}

          sli = snapshot.good_requests / snapshot.total_requests
          allowed_bad_rate = 1.0 - window.slo_target
          actual_bad_rate = 1.0 - sli

          budget_total_minutes = window.duration.total_seconds() / 60 * allowed_bad_rate
          budget_consumed_minutes = window.duration.total_seconds() / 60 * actual_bad_rate
          budget_remaining_pct = max(0.0, 1.0 - (actual_bad_rate / allowed_bad_rate))

          burn_rate = actual_bad_rate / allowed_bad_rate  # >1 means burning too fast

          return {
              "sli": round(sli, 6),
              "slo_target": window.slo_target,
              "budget_total_minutes": round(budget_total_minutes, 2),
              "budget_consumed_minutes": round(budget_consumed_minutes, 2),
              "budget_remaining_pct": round(budget_remaining_pct * 100, 2),
              "burn_rate": round(burn_rate, 3),
              "status": "OK" if burn_rate <= 1.0 else "BURNING",
          }


      # Example: 99.9% SLO over 30 days, 150 bad requests out of 200_000

      window = SLOWindow("30d", timedelta(days=30), slo_target=0.999)

      snapshot = SLISnapshot(
          good_requests=199_850,
          total_requests=200_000,
          window_start=datetime(2026, 5, 1),
          window_end=datetime(2026, 5, 14),
      )

      print(error_budget_remaining(window, snapshot))
    reasoning: >-
      Burn rate — not raw uptime percentage — is what tells you whether you're
      on track to exhaust the error budget before the window closes; this shows
      the core calculation concretely.
  - language: yaml
    title: Prometheus SLO Recording Rules
    code: >-
      # prometheus/rules/slo-api.yml

      # Records 5-minute SLI windows so multi-window burn rate alerts are cheap
      to query.


      groups:
        - name: slo_api_availability
          interval: 1m
          rules:
            # SLI: fraction of HTTP requests that are 'good' (non-5xx, <500ms)
            - record: job:http_requests_good:rate5m
              expr: |
                sum(rate(http_requests_total{job="api",status!~"5.."}[5m]))

            - record: job:http_requests_total:rate5m
              expr: |
                sum(rate(http_requests_total{job="api"}[5m]))

            - record: job:sli_availability:ratio_rate5m
              expr: |
                job:http_requests_good:rate5m
                /
                job:http_requests_total:rate5m

        - name: slo_api_burn_rate_alerts
          rules:
            # Fast burn: consuming 14.4x budget — page immediately
            - alert: SLOFastBurn
              expr: |
                (
                  1 - job:sli_availability:ratio_rate5m
                ) / (1 - 0.999) > 14.4
              for: 2m
              labels:
                severity: page
              annotations:
                summary: "API error budget burning 14x faster than allowed"

            # Slow burn: consuming 3x budget — ticket in business hours
            - alert: SLOSlowBurn
              expr: |
                (
                  1 - job:sli_availability:ratio_rate5m
                ) / (1 - 0.999) > 3
              for: 30m
              labels:
                severity: ticket
    reasoning: >-
      Multi-window burn rate alerting is the Google SRE recommendation and this
      shows the exact Prometheus rule structure — more actionable than a raw
      uptime threshold.
difficulty: intermediate
estimatedHours: 5
---
<!-- user notes -->
