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
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=uYC2kcndtVs'
      title: How to get started with SLI/SLO with Steve McGhee
      author: Steve McGhee
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        In-depth walkthrough from an SRE expert on implementing SLIs and SLOs in
        practice.
      source: ai-researcher
  articles:
    - url: 'https://sre.google/sre-book/service-level-objectives/'
      title: 'Defining SLO: Service Level Objective Meaning'
      kind: canonical-doc
      reasoning: >-
        Canonical Google SRE book chapter on SLOs, foundational reference for
        the field.
      publisher: Google SRE
      source: ai-researcher
    - url: 'https://sre.google/workbook/implementing-slos/'
      title: Implementing Service Level Objectives
      kind: tutorial
      reasoning: >-
        Google SRE workbook guidance on practical implementation of SLOs with
        concrete examples.
      publisher: Google SRE
      source: ai-researcher
    - url: 'https://sre.google/workbook/error-budget-policy/'
      title: Error Budget Policy for Service Reliability
      kind: tutorial
      reasoning: >-
        Guidance on setting error budget policies that drive data-driven
        reliability decisions.
      publisher: Google SRE
      source: ai-researcher
    - url: >-
        https://www.nobl9.com/resources/a-complete-guide-to-error-budgets-setting-up-slos-slis-and-slas-to-maintain-reliability
      title: >-
        A Complete Guide to Error Budgets: Setting up SLOs, SLIs, and SLAs to
        Maintain Reliability
      kind: tutorial
      reasoning: >-
        Comprehensive guide covering the interconnection between error budgets,
        SLOs, SLIs, and SLAs.
      publisher: Nobl9
      source: ai-researcher
    - url: 'https://www.datadoghq.com/blog/establishing-service-level-objectives/'
      title: 'SLOs: How to Establish and Define Service Level Objectives'
      kind: engineering-blog
      reasoning: >-
        Practical guidance from Datadog on designing and establishing SLOs in
        production environments.
      publisher: Datadog
      source: ai-researcher
  services:
    - name: Nobl9
      url: 'https://www.nobl9.com'
      category: SLO-Management-Platform
      reasoning: >-
        Purpose-built platform for defining, tracking, and managing SLOs with
        composite SLO support and error budget alerting.
      source: ai-researcher
    - name: Datadog Service Level Objectives
      url: 'https://www.datadoghq.com/product/service-level-objectives/'
      category: Observability-SLO-Module
      reasoning: >-
        Integrated SLO monitoring within Datadog's observability platform with
        multiple SLO types and error budget tracking.
      vendor: Datadog
      source: ai-researcher
    - name: Grafana SLO
      url: 'https://grafana.com/products/cloud/slo/'
      category: Observability-SLO-Module
      reasoning: >-
        Grafana Cloud SLO service enabling creation, management, and monitoring
        of SLOs with burn rate alerting.
      vendor: Grafana Labs
      source: ai-researcher
    - name: Google Cloud SRE
      url: 'https://sre.google'
      category: Educational-Framework
      reasoning: >-
        Google's Site Reliability Engineering site hosting foundational SLO
        resources, the SRE book, workbooks, and workshops.
      vendor: Google SRE
      source: ai-researcher
    - name: Pingdom
      url: 'https://www.pingdom.com'
      category: Uptime-Monitoring
      reasoning: >-
        Synthetic monitoring service useful for establishing SLIs around
        availability and performance.
      source: ai-researcher
  courses:
    - url: 'https://www.coursera.org/learn/measuring-managing-reliability'
      title: Measuring and Managing Reliability Specialization
      provider: Coursera (Google Cloud)
      paid: true
      reasoning: >-
        Comprehensive specialization covering SLIs, SLOs, error budgets, and
        reliability practices from Google.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
