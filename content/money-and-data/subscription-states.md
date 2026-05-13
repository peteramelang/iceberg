---
slug: subscription-states
title: Subscription States
phase: money-and-data
order: 3
summary: >-
  Model the full lifecycle of a subscription (trial, active, past-due, paused,
  canceled) as an explicit state machine with correct feature access at each
  state.
definition: >-
  A subscription state machine models the complete lifecycle of recurring
  billing from creation through active use, potential pauses, and eventual
  cancellation or expiration. Core states include Future (scheduled), Trialing
  (trial period), Active (billing cycle), Past_Due (payment failed), Paused
  (temporarily halted), Non_Renewing (scheduled for cancellation), and
  Canceled/Expired. Each state determines feature access, billing eligibility,
  and allowable transitions. Feature access must be strictly controlled—active
  subscriptions grant full features, past_due may restrict access, paused
  subscriptions suspend features entirely, and canceled/expired subscriptions
  deny all access. Implementation requires explicit state-to-features mapping
  and guard clauses that prevent unauthorized feature usage from invalid states.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=ELGWMpuwUTw'
      title: >-
        Billing 101: Understanding Subscription and Traditional Billing with
        Stripe
      author: Stripe
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Direct overview of subscription billing models from official Stripe,
        covers state transitions in billing lifecycle
    long: null
  articles:
    - url: 'https://docs.stripe.com/billing/subscriptions/overview'
      title: How subscriptions work
      kind: canonical-doc
      reasoning: >-
        Canonical Stripe documentation on subscription states: incomplete,
        trialing, active, past_due, canceled, unpaid
    - url: >-
        https://docs.recurly.com/recurly-subscriptions/docs/subscription-lifecycle
      title: Subscription lifecycle
      kind: canonical-doc
      reasoning: >-
        Recurly's complete subscription lifecycle model including pauses,
        expirations, and state transitions
    - url: 'https://www.chargebee.com/docs/2.0/subscription-life-time.html'
      title: Subscription Lifetime
      kind: canonical-doc
      reasoning: >-
        Chargebee documentation on subscription states: Future, In Trial,
        Active, Non Renewing, Paused, Canceled
    - url: 'https://xstate.js.org/'
      title: XState - JavaScript State Machines and Statecharts
      kind: canonical-doc
      reasoning: >-
        Production-ready state machine library for implementing subscription
        state machines with explicit guards and actions
    - url: 'https://stately.ai/docs/xstate'
      title: XState Documentation
      kind: canonical-doc
      reasoning: >-
        Comprehensive guide to building state machines and actors for complex
        subscription workflows
  services:
    - name: Stripe Billing
      url: 'https://stripe.com/billing'
      category: payment_processor
      reasoning: >-
        Industry standard for managing subscription states with comprehensive
        API for state transitions and webhooks
    - name: Recurly
      url: 'https://recurly.com'
      category: subscription_management
      reasoning: >-
        Purpose-built subscription management platform with explicit lifecycle
        states and feature gates
    - name: Chargebee
      url: 'https://www.chargebee.com'
      category: subscription_management
      reasoning: >-
        Comprehensive subscription billing with state machine model supporting
        pauses, non-renewing, and cancellation
    - name: Stigg
      url: 'https://www.stigg.io'
      category: entitlement_control
      reasoning: >-
        Monetization control layer that manages feature access based on
        subscription state and entitlements
    - name: Paddle
      url: 'https://www.paddle.com'
      category: subscription_management
      reasoning: >-
        Billing and revenue optimization platform with subscription lifecycle
        and state management features
  courses:
    - url: 'https://stately.ai/docs/machines'
      title: State machines
      provider: Stately
      paid: false
      reasoning: >-
        Free foundational documentation on designing state machines applicable
        to subscription modeling
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
