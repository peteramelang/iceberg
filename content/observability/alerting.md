---
slug: alerting
title: Alerting
phase: observability
order: 2
summary: >-
  Configure threshold- and anomaly-based alerts on metrics and logs so that
  on-call engineers are notified of production problems before customers are.
definition: >-
  Effective alerting is the foundation of reliable systems, enabling on-call
  engineers to detect and respond to production issues before customers
  experience them. Alerting combines threshold-based rules (comparing metrics
  against predefined values) with anomaly-based detection (identifying
  deviations from normal behavior patterns) across both metrics and logs. The
  goal is to surface actionable, high-fidelity alerts that distinguish genuine
  problems from noise—avoiding alert fatigue while ensuring critical issues are
  never missed. Well-designed alerting systems use techniques like SLO-based
  thresholds, multi-window alert rules, intelligent grouping, and inhibition
  rules to route the right alerts to the right teams with minimal false
  positives.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://sre.google/sre-book/practical-alerting/'
      title: Practical Alerting - Google SRE Book
      kind: canonical-doc
      reasoning: >-
        Canonical Google SRE reference on alert design philosophy, what to alert
        on (symptoms not causes), and key principles for online systems, batch
        jobs, and capacity planning.
    - url: 'https://sre.google/workbook/alerting-on-slos/'
      title: Alerting on SLOs - Google SRE Workbook
      kind: canonical-doc
      reasoning: >-
        Canonical Google SRE guidance on turning SLOs into actionable alerts,
        multiwindow multi-burn-rate alerting, and balancing precision, recall,
        detection time, and reset time.
    - url: 'https://prometheus.io/docs/practices/alerting/'
      title: Alerting Best Practices - Prometheus
      kind: canonical-doc
      reasoning: >-
        Canonical Prometheus documentation covering alert philosophy, naming
        conventions, what to alert on for different system types, and
        metamonitoring practices.
    - url: >-
        https://betterstack.com/community/guides/monitoring/prometheus-alertmanager/
      title: Effective Alerting with Prometheus Alertmanager
      kind: tutorial
      reasoning: >-
        Practical guide to Alertmanager covering grouping, deduplication,
        inhibition rules, and techniques to reduce alert fatigue.
    - url: 'https://www.sysdig.com/blog/prometheus-alertmanager/'
      title: Prometheus Alertmanager Best Practices
      kind: engineering-blog
      reasoning: >-
        Comprehensive overview of Alertmanager grouping, routing, inhibition,
        high availability, and ongoing calibration of alert rules.
  services:
    - name: Prometheus Alertmanager
      url: 'https://prometheus.io'
      category: alert-routing
      reasoning: >-
        Canonical open-source alert deduplication, grouping, and routing engine;
        integrates with Prometheus server and routes to PagerDuty, OpsGenie,
        Slack, email, and webhooks.
    - name: PagerDuty
      url: 'https://www.pagerduty.com'
      category: incident-management
      reasoning: >-
        Enterprise on-call and incident management platform; receives alerts
        from Prometheus, Datadog, Grafana and routes to on-call engineers with
        escalation policies and runbooks.
    - name: OpsGenie
      url: 'https://www.opsgenie.com'
      category: incident-management
      reasoning: >-
        Atlassian on-call management platform; integrates with 500+ monitoring
        tools for alert routing, on-call scheduling, and incident response
        (note: sunsetting in 2027).
    - name: Grafana
      url: 'https://grafana.com'
      category: alerting-platform
      reasoning: >-
        Unified alerting platform supporting rule evaluation, multi-source alert
        routing, and notification to PagerDuty, OpsGenie, Slack, email, and
        webhooks.
    - name: Datadog
      url: 'https://www.datadoghq.com'
      category: monitoring-alerting
      reasoning: >-
        Full-stack monitoring platform with threshold-based and anomaly
        detection alerting on metrics and logs; integrates with PagerDuty and
        OpsGenie for incident routing.
  courses:
    - url: 'https://www.udemy.com/course/prometheus-course/'
      title: Prometheus | The Complete Hands-On for Monitoring & Alerting
      provider: Udemy
      paid: true
      reasoning: >-
        Comprehensive Prometheus course covering alerting rules, Alertmanager
        email notifiers, templates, and hands-on implementation.
    - url: 'https://training.promlabs.com/'
      title: Prometheus Trainings by PromLabs
      provider: PromLabs
      paid: true
      reasoning: >-
        Official self-paced training by Prometheus co-creators; covers
        monitoring and alerting best practices with unlimited access.
    - url: 'https://learn.grafana.com/intro-to-data-visualization-alerting'
      title: Intro to Data Visualization & Alerting
      provider: Grafana Labs
      paid: false
      reasoning: >-
        Free Grafana Labs course on transforming observability data into alerts,
        best practices for thresholds and dynamic alerting.
    - url: 'https://learn.grafana.com/proactive-monitoring-and-alerting-strategies'
      title: Proactive Monitoring and Alerting Strategies
      provider: Grafana Labs
      paid: false
      reasoning: >-
        Free Grafana Labs course on SLI/SLO-based alerting, anomaly detection,
        and reducing alert fatigue through dynamic thresholds.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Bad alerting doesn't just fail to catch problems — it actively makes your
  system harder to operate. Teams that set up alerting naively end up with one
  of two failure modes: they either get paged constantly on things that don't
  matter (alert fatigue, which leads to engineers ignoring pages and eventually
  missing real incidents), or they configured nothing and find out about outages
  from angry users on Twitter. Both are bad. The craft of alerting is threading
  the needle between those two failure states, and it requires real discipline
  to get right.


  The 80/20 here is deceptively simple: alert on symptoms, not causes. If your
  API error rate spikes, that's a symptom worth paging someone for. If your CPU
  usage is high, that might be a cause of something, or it might be harmless
  load from a batch job. Alerting on causes produces noise; alerting on symptoms
  produces signal. The canonical framing from Google's SRE book is to alert on
  SLO burn rate — how fast you're burning through your error budget relative to
  your monthly target. A 6x burn rate at 2am means you'll exhaust your SLO in
  hours; that's worth a page. A 0.5x burn rate during business hours is worth a
  ticket. This framing forces you to think about user impact before you reach
  for the threshold slider.


  Threshold-based alerting on individual metrics is where most teams start, and
  it's not wrong — it's just limited. Static thresholds break when traffic
  patterns shift seasonally or as the product grows. A static threshold of "more
  than 100 errors per minute" might be reasonable at your current scale and
  wildly over-sensitive after a big growth quarter. Anomaly detection helps
  here, but it comes with its own pitfalls: anomaly-based alerts tend to fire
  during legitimate traffic events (a viral moment, a sale, a successful
  campaign) that you don't want to be woken up for. The best setups combine
  both: SLO-based alerts as the primary paging criteria, supplemented by
  specific threshold alerts for known failure modes like queue depth saturation
  or database connection pool exhaustion.


  Alert routing is its own discipline that teams underinvest in. Not every alert
  should wake up the same person at 3am. Severity tiers — critical, warning,
  informational — with different routing (PagerDuty vs. Slack vs. email) are
  table stakes. Grouping and inhibition rules prevent alert storms: when a
  database goes down, you don't want 200 separate alerts for the 200 services
  that depend on it, you want one clear root cause alert and inhibition of the
  downstream noise. Good observability tools (Prometheus with Alertmanager,
  Datadog, Grafana OnCall) all support this, but the configuration burden is
  non-trivial.


  Alerting belongs in the observability layer but it's ultimately a human system
  as much as a technical one. The alert needs to be actionable — whoever
  receives it should be able to start debugging immediately, ideally with a
  runbook link right in the notification. If every page requires 15 minutes of
  investigation just to understand what's wrong, you'll burn out your on-call
  rotation. Alerting pairs directly with metrics and structured logging (you
  need both to diagnose what the alert is telling you) and with incident
  management practices (the alert is just the beginning of the response
  workflow).
pitfalls:
  - title: Alerting on causes instead of symptoms
    explanation: >-
      Paging on high CPU, high memory, or elevated queue depth produces noise —
      those metrics may spike without users noticing anything wrong. Alerts
      should fire on user-facing symptoms like elevated error rates or latency
      SLO burn, which directly reflect whether your service is failing its
      users.
  - title: Alert fatigue from too many low-signal pages
    explanation: >-
      When on-call engineers receive too many alerts that either self-resolve or
      turn out to be non-issues, they start ignoring or silencing pages — which
      is when a real incident gets missed. Every alert that fires should be
      actionable, and alerts that consistently resolve without intervention
      should be deleted or demoted.
  - title: Static thresholds that break as traffic scales
    explanation: >-
      An error count threshold that is appropriate at current traffic becomes
      either over-sensitive or blind as the product grows or traffic shifts
      seasonally. Prefer rate-based or SLO burn-rate thresholds over absolute
      counts so alert sensitivity scales automatically with load.
  - title: Alert storms from cascading dependency failures
    explanation: >-
      When a shared dependency like a database goes down, every service that
      depends on it fires its own alert simultaneously, burying the root cause
      in noise. Alertmanager inhibition rules or dependency-aware alert grouping
      should suppress downstream alerts when a known upstream cause is already
      firing.
  - title: Alerts without runbooks or actionable context
    explanation: >-
      A page that says 'error rate elevated' with no link to a runbook forces
      the on-call engineer to spend the first 15 minutes of an incident just
      figuring out where to look. Every high-severity alert should include a
      direct link to the relevant runbook and enough context in the alert body
      to start debugging immediately.
codeExamples:
  - language: yaml
    title: SLO burn rate alert in Prometheus
    code: |-
      # AlertManager rule: page on fast error-budget burn before SLO breach
      groups:
        - name: slo_alerts
          rules:
            - alert: HighErrorBudgetBurn
              expr: |
                (
                  rate(http_requests_total{job="api",status=~"5.."}[1h])
                  /
                  rate(http_requests_total{job="api"}[1h])
                ) > 14.4 * 0.001
              for: 2m
              labels:
                severity: page
              annotations:
                summary: "High error budget burn rate (>14.4x)"
                description: |
                  API is burning error budget at {{ $value | humanizePercentage }} error rate.
                  At this rate the monthly SLO budget will be exhausted in ~2 hours.
                runbook: https://wiki.example.com/runbooks/high-error-rate
    reasoning: >-
      Alerting on SLO burn rate (how fast you consume error budget) rather than
      raw error count produces alerts that fire only when user impact is
      meaningful, directly reducing alert fatigue.
  - language: yaml
    title: Alert inhibition to suppress downstream noise
    code: >-
      # AlertManager config: suppress downstream alerts when the database is
      down

      inhibit_rules:
        - source_match:
            alertname: DatabaseDown
            severity: page
          target_match_re:
            # Silence any service-level error alerts while DB is the root cause
            alertname: HighErrorBudgetBurn|SlowResponseTime|QueueDepthHigh
          equal:
            - env

      route:
        receiver: pagerduty-critical
        group_by: ['alertname', 'env']
        group_wait: 30s
        group_interval: 5m
        repeat_interval: 4h
        routes:
          - match:
              severity: warning
            receiver: slack-warnings
            continue: false
    reasoning: >-
      Inhibition rules prevent alert storms — when a database goes down and 50
      services degrade, only the root cause fires a page rather than 50
      simultaneous notifications that overwhelm the on-call engineer.
difficulty: intermediate
estimatedHours: 6
---
<!-- user notes -->
