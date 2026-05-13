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
      publisher: Google SRE
      source: ai-researcher
    - url: 'https://sre.google/workbook/alerting-on-slos/'
      title: Alerting on SLOs - Google SRE Workbook
      kind: canonical-doc
      reasoning: >-
        Canonical Google SRE guidance on turning SLOs into actionable alerts,
        multiwindow multi-burn-rate alerting, and balancing precision, recall,
        detection time, and reset time.
      publisher: Google SRE
      source: ai-researcher
    - url: 'https://prometheus.io/docs/practices/alerting/'
      title: Alerting Best Practices - Prometheus
      kind: canonical-doc
      reasoning: >-
        Canonical Prometheus documentation covering alert philosophy, naming
        conventions, what to alert on for different system types, and
        metamonitoring practices.
      publisher: Prometheus (CNCF)
      source: ai-researcher
    - url: >-
        https://betterstack.com/community/guides/monitoring/prometheus-alertmanager/
      title: Effective Alerting with Prometheus Alertmanager
      kind: tutorial
      reasoning: >-
        Practical guide to Alertmanager covering grouping, deduplication,
        inhibition rules, and techniques to reduce alert fatigue.
      publisher: Better Stack
      source: ai-researcher
    - url: 'https://www.sysdig.com/blog/prometheus-alertmanager/'
      title: Prometheus Alertmanager Best Practices
      kind: engineering-blog
      reasoning: >-
        Comprehensive overview of Alertmanager grouping, routing, inhibition,
        high availability, and ongoing calibration of alert rules.
      publisher: Sysdig
      source: ai-researcher
  services:
    - name: Prometheus Alertmanager
      url: 'https://prometheus.io'
      category: alert-routing
      reasoning: >-
        Canonical open-source alert deduplication, grouping, and routing engine;
        integrates with Prometheus server and routes to PagerDuty, OpsGenie,
        Slack, email, and webhooks.
      vendor: Prometheus (CNCF)
      source: ai-researcher
    - name: PagerDuty
      url: 'https://www.pagerduty.com'
      category: incident-management
      reasoning: >-
        Enterprise on-call and incident management platform; receives alerts
        from Prometheus, Datadog, Grafana and routes to on-call engineers with
        escalation policies and runbooks.
      source: ai-researcher
    - name: OpsGenie
      url: 'https://www.opsgenie.com'
      category: incident-management
      reasoning: >-
        Atlassian on-call management platform; integrates with 500+ monitoring
        tools for alert routing, on-call scheduling, and incident response
        (note: sunsetting in 2027).
      vendor: Atlassian (Opsgenie)
      source: ai-researcher
    - name: Grafana
      url: 'https://grafana.com'
      category: alerting-platform
      reasoning: >-
        Unified alerting platform supporting rule evaluation, multi-source alert
        routing, and notification to PagerDuty, OpsGenie, Slack, email, and
        webhooks.
      vendor: Grafana Labs
      source: ai-researcher
    - name: Datadog
      url: 'https://www.datadoghq.com'
      category: monitoring-alerting
      reasoning: >-
        Full-stack monitoring platform with threshold-based and anomaly
        detection alerting on metrics and logs; integrates with PagerDuty and
        OpsGenie for incident routing.
      source: ai-researcher
  courses:
    - url: 'https://www.udemy.com/course/prometheus-course/'
      title: Prometheus | The Complete Hands-On for Monitoring & Alerting
      provider: Udemy
      paid: true
      reasoning: >-
        Comprehensive Prometheus course covering alerting rules, Alertmanager
        email notifiers, templates, and hands-on implementation.
      source: ai-researcher
    - url: 'https://training.promlabs.com/'
      title: Prometheus Trainings by PromLabs
      provider: PromLabs
      paid: true
      reasoning: >-
        Official self-paced training by Prometheus co-creators; covers
        monitoring and alerting best practices with unlimited access.
      source: ai-researcher
    - url: 'https://learn.grafana.com/intro-to-data-visualization-alerting'
      title: Intro to Data Visualization & Alerting
      provider: Grafana Labs
      paid: false
      reasoning: >-
        Free Grafana Labs course on transforming observability data into alerts,
        best practices for thresholds and dynamic alerting.
      source: ai-researcher
    - url: 'https://learn.grafana.com/proactive-monitoring-and-alerting-strategies'
      title: Proactive Monitoring and Alerting Strategies
      provider: Grafana Labs
      paid: false
      reasoning: >-
        Free Grafana Labs course on SLI/SLO-based alerting, anomaly detection,
        and reducing alert fatigue through dynamic thresholds.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
