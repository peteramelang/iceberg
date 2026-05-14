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
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Subscription billing looks simple until the first payment fails. Then you
  discover that "active" isn't a binary — there's active-and-current,
  active-but-past-due-and-about-to-be-cut-off,
  active-during-a-trial-that-technically-hasn't-been-charged-yet, and a dozen
  other situations where the answer to "should this user be able to do X?" is
  genuinely ambiguous if you haven't thought it through in advance. The
  consequence of not modeling subscription states explicitly is that your
  feature gating becomes a patchwork of conditions scattered across the
  codebase, each one added in response to a specific customer complaint, none of
  them consistent with each other. A user in `past_due` might be able to export
  data in one part of the app and blocked from it in another, depending on which
  engineer added which check when.


  The 80/20 is to define your state machine before you write any feature access
  code, and to make the subscription state the single source of truth for
  feature access across the entire application. You need at minimum: trialing,
  active, past_due, paused, and canceled. Every feature gate should derive from
  state, not from a direct query to Stripe or a raw boolean in the users table.
  The moment you have two places in the code that independently try to determine
  "is this user allowed to do this?", you have a consistency problem waiting to
  become a customer support ticket. Centralize the state, centralize the feature
  mapping, and make both explicit.


  The failure modes here are well-documented by anyone who has run a SaaS
  product through its first year. Payment fails, webhook from Stripe comes in,
  your handler marks the subscription `past_due` — but you forgot that Stripe's
  dunning process will retry the charge over the next week and send additional
  webhooks as it does, each one potentially arriving out of order if your queue
  is backed up. Now you have race conditions where a subscription bounces
  between `past_due` and `active` depending on which webhook was processed last.
  Or: a user cancels, you set the state to `canceled`, but they've paid through
  the end of the month and should retain access until then — except your feature
  gate just cut them off immediately because you didn't model the `non_renewing`
  intermediate state. Or: a trial expires at midnight, your cron job runs at
  2am, and for two hours users who should be on a paywall are still getting full
  access because the state transition is delayed.


  The mental model that makes subscription states manageable is treating them
  exactly like any other finite state machine in your system: a fixed set of
  states, a defined set of allowed transitions between them, and actions that
  fire on entry and exit. The state machine is the contract. If the machine says
  you can go from `active` to `past_due` but not from `canceled` to `active`
  without a new subscription, then that's enforced at the state machine
  boundary, not scattered across business logic. Drawing this out explicitly —
  literally a diagram with states as nodes and webhook events as edges — before
  writing code will save you weeks of debugging edge cases in production.


  Subscription states sit at the center of the billing and access control layers
  of your stack. They receive events from your payment provider (Stripe, Paddle,
  or equivalent) via webhooks and must translate those external events into your
  internal state model. They feed upward into feature flags and entitlement
  checks, which should query subscription state rather than calling the payment
  provider directly. They also feed into customer support tooling — a support
  agent who can see that a customer is in `past_due` because of a card decline
  in 2024, and can see the full transition history, can resolve the issue in
  minutes rather than digging through Stripe logs. Getting the state machine
  right is foundational because everything downstream — access control, billing
  recovery flows, customer communications, support tooling — builds on top of
  it.
pitfalls:
  - title: Feature access checked directly against payment provider
    explanation: >-
      Calling Stripe's API at every feature gate to determine if a user is
      active adds latency, introduces a hard dependency on a third-party, and
      scatters access logic across the codebase. Your internal subscription
      state, kept in sync via webhooks, must be the single source of truth for
      feature access.
  - title: Skipping the non-renewing intermediate state
    explanation: >-
      When a user cancels, they have often paid through the end of a billing
      period and are entitled to continued access until then. Jumping directly
      to 'canceled' and revoking access immediately generates support tickets
      and potential chargebacks; model 'non_renewing' explicitly and gate access
      on the period-end date.
  - title: Webhook race conditions producing inconsistent state
    explanation: >-
      Stripe's dunning process fires multiple webhooks as it retries failed
      charges, and network delays can deliver them out of order. A
      payment_succeeded event processed after the subscription.deleted event
      will incorrectly reactivate a canceled subscription unless your handler
      enforces idempotency and ignores stale transitions.
  - title: Feature gate logic scattered across the codebase
    explanation: >-
      Adding access checks inline wherever a feature is used — rather than in a
      single entitlement service that consults subscription state — guarantees
      drift: the same user will be allowed an action in one endpoint and blocked
      in another. Centralize all state-to-permission mapping behind one
      interface.
  - title: Trial expiry enforced only by a delayed cron job
    explanation: >-
      A cron that transitions expired trials to paused at 2am creates a window
      where users who should hit a paywall still have full access, and it
      silently fails if the job misses a run. Enforce trial expiry eagerly on
      each request using the stored expiry timestamp, not by waiting for a batch
      job.
  - title: No defined access policy for past-due subscriptions
    explanation: >-
      Leaving 'past_due' access behavior unspecified means engineers make ad-hoc
      decisions per feature — some restrict access, some don't — which confuses
      customers and creates inconsistent dunning pressure. Decide explicitly
      what past-due users can do, document it, and enforce it uniformly through
      the entitlement layer.
codeExamples:
  - language: typescript
    title: Subscription State Machine With Feature Access
    code: |-
      type SubscriptionState =
        | 'trialing'
        | 'active'
        | 'past_due'
        | 'paused'
        | 'non_renewing'
        | 'canceled'
        | 'expired';

      type Feature = 'api_access' | 'exports' | 'team_seats' | 'support';

      // Single source of truth: which states grant which features
      const FEATURE_ACCESS: Record<SubscriptionState, Set<Feature>> = {
        trialing:     new Set(['api_access', 'exports', 'team_seats', 'support']),
        active:       new Set(['api_access', 'exports', 'team_seats', 'support']),
        non_renewing: new Set(['api_access', 'exports', 'team_seats', 'support']),
        past_due:     new Set(['api_access', 'support']),  // restricted but not cut off
        paused:       new Set([]),
        canceled:     new Set([]),
        expired:      new Set([]),
      };

      // Allowed state transitions (source → valid next states)
      const TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
        trialing:     ['active', 'canceled', 'expired'],
        active:       ['past_due', 'paused', 'non_renewing', 'canceled'],
        past_due:     ['active', 'canceled', 'expired'],
        paused:       ['active', 'canceled'],
        non_renewing: ['canceled'],
        canceled:     [],
        expired:      [],
      };

      export class Subscription {
        constructor(
          public readonly id: string,
          private state: SubscriptionState,
        ) {}

        can(feature: Feature): boolean {
          return FEATURE_ACCESS[this.state].has(feature);
        }

        transition(next: SubscriptionState): void {
          const allowed = TRANSITIONS[this.state];
          if (!allowed.includes(next)) {
            throw new Error(
              `Invalid transition: ${this.state} → ${next}`
            );
          }
          this.state = next;
        }

        getState(): SubscriptionState { return this.state; }
      }

      // Usage
      const sub = new Subscription('sub_123', 'active');
      console.log(sub.can('exports'));   // true
      sub.transition('past_due');
      console.log(sub.can('exports'));   // false — restricted in past_due
      sub.transition('active');          // payment recovered
      console.log(sub.can('exports'));   // true
    reasoning: >-
      Centralizing both the transition graph and feature access in one place
      eliminates the scattered conditionals that lead to inconsistent access
      control across a codebase.
difficulty: intermediate
estimatedHours: 7
tldr: >-
  Pending tldr — short, plain-language summary for a non-technical reader or
  quick skim. Replace before publishing.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:08:53.920Z'
---
<!-- user notes -->
