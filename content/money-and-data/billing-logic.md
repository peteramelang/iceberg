---
slug: billing-logic
title: Billing Logic
phase: money-and-data
order: 2
summary: >-
  Model invoicing, proration, credits, refunds, and dunning correctly so that
  money in the database always matches money in the payment processor.
definition: >-
  Billing logic is the backbone of any revenue-generating system, requiring
  careful modeling of invoicing, proration, credits, refunds, and dunning
  workflows. The core challenge is ensuring that the state in your application
  database always matches the truth in your payment processor—a mismatch here
  cascades into accounting errors, lost revenue, and customer disputes. This
  topic covers subscription billing patterns, handling mid-cycle changes and
  upgrades, calculating time-based prorations, managing customer credits and
  account balances, implementing refund policies, and setting up dunning (retry
  logic) to recover failed payments. You'll learn from battle-tested
  implementations at companies operating at scale, where even small billing
  errors compound across thousands of customers.


  The practical implementation involves understanding your payment processor's
  API (Stripe, Paddle, Zuora, etc.), designing a reconciliation strategy,
  handling edge cases like timezone transitions and leap seconds, and building
  observability to catch discrepancies early. Key architectural decisions
  include whether to trust the payment processor as source-of-truth or maintain
  dual state, how to model partial refunds and proration windows, and how to
  design your dunning strategy to maximize recovery without violating payment
  network rules. You'll also explore the legal and compliance dimensions—tax
  calculation, regional subscription laws, and currency handling—that directly
  impact your billing logic.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=VDqL0vSz-AY'
      title: 'Billing Systems: Proration, Invoicing & Reconciliation'
      author: Stripe
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Official Stripe video covering proration mechanics, invoice generation,
        and reconciliation patterns used in production billing systems.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=3GhEBjUxHUw'
      title: Building Reliable Billing Systems
      author: Convention Center Tech
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        In-depth walkthrough of billing architecture, covering subscription
        state machines, reconciliation logic, and handling failures at scale.
      source: ai-researcher
  articles:
    - url: 'https://stripe.com/docs/billing/subscriptions/prorations'
      title: Proration in Stripe Billing
      kind: canonical-doc
      reasoning: >-
        Authoritative documentation on how Stripe calculates prorations during
        mid-cycle changes, essential for understanding the payment processor's
        model.
      publisher: Stripe
      source: ai-researcher
    - url: 'https://stripe.com/docs/billing/invoices'
      title: Invoicing with Stripe
      kind: canonical-doc
      reasoning: >-
        Core reference for invoice generation, drafts, finalization, and
        lifecycle management in Stripe's billing system.
      publisher: Stripe
      source: ai-researcher
  services:
    - name: Stripe Billing
      url: 'https://stripe.com/billing'
      category: payment-processor
      reasoning: >-
        Industry-standard payment processor with comprehensive billing APIs for
        subscriptions, invoicing, and dunning workflows.
      vendor: Stripe
      source: ai-researcher
    - name: Zuora
      url: 'https://www.zuora.com'
      category: billing-platform
      reasoning: >-
        Dedicated billing and revenue recognition platform designed for complex
        subscription models and multi-entity accounting.
      source: ai-researcher
    - name: Chargebee
      url: 'https://www.chargebee.com'
      category: billing-platform
      reasoning: >-
        Full-featured subscription management and billing platform with built-in
        proration, dunning, and revenue recognition capabilities.
      source: ai-researcher
    - name: Orb
      url: 'https://www.getorb.com'
      category: metering-billing
      reasoning: >-
        Modern metering and usage-based billing platform for complex pricing
        models requiring real-time usage aggregation and invoice generation.
      source: ai-researcher
  courses:
    - url: 'https://www.udemy.com/course/saas-business-model/'
      title: SaaS Business Model & Metrics Fundamentals
      provider: Udemy
      paid: true
      reasoning: >-
        Covers SaaS financial mechanics including billing models, unit
        economics, and revenue recognition that inform billing system design.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
