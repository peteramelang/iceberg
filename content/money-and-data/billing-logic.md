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
narrative: >-
  Billing is where bugs cost you money in both directions simultaneously.
  Overcharge a customer and you get a dispute, a chargeback, and a damaged
  relationship. Undercharge them and you've left revenue on the floor — often
  permanently, since retroactive billing is a customer experience disaster even
  when it's technically justified. The compounding nature of billing errors is
  what makes this domain particularly unforgiving: a proration calculation
  that's off by a few cents affects every customer who upgrades mid-cycle, every
  month, indefinitely, until someone notices and traces it back.


  The fundamental architecture decision is where truth lives. Payment processors
  like Stripe maintain their own view of subscriptions, invoices, and payment
  state. Your database maintains yours. These two views will drift. The question
  is how you handle that drift. One approach is to treat the payment processor
  as the source of truth and reconstruct your local state from webhooks. The
  other is to maintain authoritative state in your database and treat the
  processor as an execution layer. Both work; hybrid approaches are where teams
  get burned. If you're writing subscription records to your database from
  webhooks and also writing them from API responses during checkout flows, you
  need idempotency keys and careful ordering guarantees or you'll end up with
  duplicate records, phantom subscriptions, and billing state that doesn't match
  what the customer is actually being charged.


  Proration is the area that generates the most edge cases. Mid-cycle upgrades,
  downgrades, seat count changes, and trial conversions all require calculating
  the unused portion of the current billing period. Get this wrong and it shows
  up on the customer's invoice as an unexplained line item — and customers
  notice. The safest approach is to let your payment processor handle proration
  calculation rather than reimplementing it yourself. Stripe's proration modes
  are well-documented and battle-tested. What you do need to own is the business
  logic layer on top: when does a change take effect? Immediately, or at the
  next billing cycle? Does an upgrade generate an invoice today or just adjust
  the next one? These are product decisions, not just implementation details,
  and they need to be explicit.


  Dunning — the process of retrying failed payments and notifying customers — is
  often an afterthought that turns out to matter enormously for revenue
  recovery. Credit cards expire, banks decline transactions for fraud reasons
  that have nothing to do with the customer's intent to pay, and a surprising
  percentage of failed payments succeed on the second or third retry. Smart
  retry schedules (not uniform retries, but retry logic informed by the decline
  reason) with good customer communication can recover a significant fraction of
  that revenue. Involuntary churn from failed payments is a real problem for
  subscription businesses, and dunning is the primary mitigation.


  Billing logic belongs in the money-and-data phase because the compliance and
  legal dimensions are as important as the technical ones. Tax calculation (VAT
  in the EU, sales tax in US states, GST in other jurisdictions) requires either
  a dedicated service like TaxJar or Avalara, or a significant ongoing
  maintenance burden as tax rules change. Currency handling for international
  customers requires decimal precision — don't store prices as floats — and
  exchange rate decisions that affect revenue reporting. Billing pairs closely
  with subscription management, churn control, and financial reconciliation: you
  can't do meaningful churn analysis without clean billing data, and you can't
  trust your revenue metrics without a reconciliation process that catches
  discrepancies between your database and your payment processor.
pitfalls:
  - title: Storing monetary amounts as floating-point numbers
    explanation: >-
      Floating-point arithmetic cannot represent many decimal values exactly,
      causing rounding errors that compound across proration calculations,
      refunds, and aggregations — producing invoices that are off by a cent in
      ways that are hard to trace. Store amounts as integers in the smallest
      currency unit (cents for USD) or use a fixed-precision decimal type.
  - title: Dual-writing billing state without idempotency guarantees
    explanation: >-
      Writing subscription records to your database from both API responses
      during checkout and webhook events simultaneously, without idempotency
      keys and ordered conflict resolution, creates duplicate records, phantom
      subscriptions, and billing state that diverges from the payment processor.
      Choose a single authoritative source and design all writes to be
      idempotent.
  - title: Reimplementing proration logic that the processor already handles
    explanation: >-
      Hand-rolling proration for mid-cycle upgrades, downgrades, and seat
      changes introduces edge cases — leap days, timezone transitions, billing
      period boundaries — that payment processors have already battle-tested.
      Let the processor calculate proration amounts and own only the
      business-layer decisions around when changes take effect.
  - title: Ignoring dunning as an afterthought
    explanation: >-
      Treating failed payment retries as a minor operational detail means losing
      a significant fraction of revenue to involuntary churn from expired cards
      and soft declines that would succeed on a second or third attempt. Smart
      dunning with retry timing informed by decline reason, paired with direct
      customer outreach, materially recovers that revenue.
  - title: No reconciliation process between database and payment processor
    explanation: >-
      Without a periodic reconciliation job that compares your database's view
      of active subscriptions against the processor's, small discrepancies
      accumulate silently — customers charged for cancelled plans, or active
      customers not being charged at all. A regular diff between the two sources
      of truth is the only way to catch drift before it compounds.
  - title: Skipping tax calculation and assuming a flat rate applies everywhere
    explanation: >-
      VAT in the EU, sales tax by US state, and GST in other jurisdictions each
      have distinct rules and rates that change over time, and charging the
      wrong amount creates both liability and customer disputes. Tax calculation
      for SaaS is complex enough that a dedicated service is almost always
      cheaper than getting it wrong.
codeExamples:
  - language: typescript
    title: Idempotent Stripe webhook handler
    code: >-
      import Stripe from 'stripe';

      import type { Request, Response } from 'express';


      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion:
      '2024-04-10' });


      export async function stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
          event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
        } catch (err) {
          res.status(400).send(`Webhook signature verification failed`);
          return;
        }

        // Idempotency: skip events already processed
        const alreadyProcessed = await db.webhookEvents.findUnique({ where: { stripeEventId: event.id } });
        if (alreadyProcessed) {
          res.json({ received: true });
          return;
        }

        switch (event.type) {
          case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            await db.subscriptions.update({
              where: { stripeCustomerId: invoice.customer as string },
              data: { status: 'active', currentPeriodEnd: new Date(invoice.period_end * 1000) },
            });
            break;
          }
          case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            await db.subscriptions.update({
              where: { stripeCustomerId: invoice.customer as string },
              data: { status: 'past_due' },
            });
            break;
          }
        }

        await db.webhookEvents.create({ data: { stripeEventId: event.id, processedAt: new Date() } });
        res.json({ received: true });
      }


      // db is a Prisma client stub

      declare const db: any;
    reasoning: >-
      Recording processed webhook event IDs prevents double-billing when Stripe
      retries delivery — this idempotency check is the single most important
      pattern in billing webhook handlers.
  - language: sql
    title: Store money as integer cents not float
    code: |-
      -- Never store money as FLOAT or DOUBLE — floating point cannot represent
      -- many decimal values exactly, causing rounding errors that compound.
      -- Store as integer cents (or smallest currency unit) instead.

      CREATE TABLE invoices (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id   UUID NOT NULL REFERENCES customers(id),
        -- All monetary values stored as integer cents (USD: 100 = $1.00)
        subtotal_cents   INTEGER NOT NULL CHECK (subtotal_cents >= 0),
        tax_cents        INTEGER NOT NULL CHECK (tax_cents >= 0),
        discount_cents   INTEGER NOT NULL CHECK (discount_cents >= 0),
        total_cents      INTEGER GENERATED ALWAYS AS
                           (subtotal_cents + tax_cents - discount_cents) STORED,
        currency         CHAR(3) NOT NULL DEFAULT 'USD',
        status           TEXT NOT NULL DEFAULT 'draft',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Query: display as dollars in application layer, not DB
      -- SELECT id, total_cents / 100.0 AS total_dollars FROM invoices;
    reasoning: >-
      Storing prices as integer cents and enforcing non-negativity constraints
      at the schema level eliminates an entire class of floating-point rounding
      bugs that silently corrupt billing totals.
difficulty: advanced
estimatedHours: 16
---
<!-- user notes -->
