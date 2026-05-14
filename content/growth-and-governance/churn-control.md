---
slug: churn-control
title: Churn Control
phase: growth-and-governance
order: 2
summary: >-
  Identify at-risk subscribers, trigger proactive interventions, and handle
  cancellation flows to reduce involuntary and voluntary churn.
definition: >-
  Identify at-risk subscribers, trigger proactive interventions, and handle
  cancellation flows to reduce involuntary and voluntary churn.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles: []
  services: []
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Churn is the metric that determines whether a subscription business actually
  works. You can acquire customers efficiently and have a great product and
  still not survive if churn is high enough, because the economics of acquiring
  a customer to replace one you lost are brutal — you've spent CAC twice and
  have nothing to show for it. The distinction between voluntary churn (the
  customer decided to leave) and involuntary churn (a payment failed and the
  subscription lapsed) is important because they require completely different
  interventions, and most early-stage teams underestimate how much involuntary
  churn they're experiencing.


  Involuntary churn is the lower-hanging fruit. Credit cards decline for all
  sorts of reasons that have nothing to do with the customer's intention to
  cancel: the card expired, the bank flagged it as a potential fraud, the card
  was replaced. A meaningful percentage of these payments succeed on retry,
  especially if you wait a few days and use intelligent retry logic informed by
  the decline reason. A soft decline (insufficient funds) warrants different
  retry timing than a hard decline (card reported stolen). Good dunning also
  involves reaching out to the customer directly — an email saying "we had
  trouble processing your payment" with a link to update their card converts a
  significant fraction of would-be churned users. This is infrastructure work
  with a direct revenue impact, and it's underinvested in at most companies.


  Voluntary churn is harder because it's a signal about the product, not the
  payment infrastructure. The intervention starts earlier, when you can identify
  at-risk users before they cancel. Engagement signals — login frequency,
  feature usage depth, support ticket patterns — can predict who is at risk
  weeks before they reach for the cancel button. The specifics vary by product,
  but a user who was logging in daily and now hasn't logged in for two weeks is
  a different kind of customer than one who has always logged in weekly.
  Building this detection requires clean product analytics and some willingness
  to act on the signals by proactively reaching out, offering help, or surfacing
  value the user may not have discovered.


  The cancellation flow itself is worth investing in thoughtfully, not as a dark
  pattern, but as a genuine last chance to understand and respond to the
  customer's intent. Offering a pause option instead of cancellation helps users
  who are canceling for temporary reasons like budget tightening. Offering a
  downgrade to a cheaper tier retains customers who found the current plan too
  expensive. A brief exit survey — one question, not five — gives you data that
  is otherwise invisible: the reasons people churn at scale. That data feeds
  back into product decisions and into your interventions for at-risk users.


  Churn control sits in the growth-and-governance phase because it's where
  retention strategy meets operational systems. It depends on clean billing
  infrastructure (you can't fix involuntary churn without reliable dunning),
  solid product analytics (you can't identify at-risk users without usage data),
  and good customer communication tooling (you need to reach users via email or
  in-app messaging at the right moment). It pairs naturally with billing logic
  (involuntary churn is a billing problem) and with customer success workflows
  (voluntary churn is a relationship problem). The teams that do this well treat
  it as a system — instrumented, automated where possible, and continuously
  improved based on what's actually working.
pitfalls:
  - title: Ignoring involuntary churn from failed payments
    explanation: >-
      Most teams focus entirely on voluntary cancellations and miss that a
      significant portion of churn comes from expired cards and soft declines
      that would succeed on a retry — revenue that is simply left on the floor.
      Intelligent dunning with decline-reason-aware retry timing and direct
      customer outreach recovers a material fraction of that involuntary churn.
  - title: Waiting until the cancel button is clicked to intervene
    explanation: >-
      By the time a customer reaches the cancellation flow, the decision is
      largely made; the highest-leverage intervention is identifying
      disengagement signals — dropped login frequency, unused features, support
      tickets — weeks before cancellation. Acting on those signals proactively
      is far more effective than optimizing the cancel-flow copy.
  - title: No cancellation flow — just immediate termination
    explanation: >-
      Immediately cancelling a subscription with no alternatives presented
      misses customers who would accept a pause, a downgrade, or a short
      discount to stay — all of which are cheaper than re-acquiring a churned
      user later. A simple cancellation flow that offers a pause or a cheaper
      tier retains a measurable share of otherwise-lost customers.
  - title: Using dark patterns in cancellation flows
    explanation: >-
      Hiding the cancel button, adding guilt-tripping language, or requiring a
      phone call to cancel creates short-term churn reduction that erodes trust,
      drives negative reviews, and in some jurisdictions exposes you to
      regulatory risk. The goal of a cancellation flow is to understand why the
      customer is leaving and offer a genuine alternative, not to obstruct them.
  - title: No exit survey data to feed back into the product
    explanation: >-
      Without systematically collecting why customers cancel, churn reasons
      remain invisible — teams guess at the cause and invest in the wrong
      interventions. A one-question exit survey at cancellation is a
      low-friction way to build a dataset that directly informs both product
      priorities and at-risk user interventions.
codeExamples:
  - language: sql
    title: Identify at-risk users by engagement drop
    code: >-
      -- Users who were active in the prior 14-day window but went silent in the
      last 7 days

      -- Useful as a daily job to populate a churn-risk queue for outreach

      SELECT
        u.id,
        u.email,
        u.plan,
        MAX(e.occurred_at) AS last_seen,
        COUNT(CASE WHEN e.occurred_at >= NOW() - INTERVAL '7 days' THEN 1 END)  AS events_last_7d,
        COUNT(CASE WHEN e.occurred_at >= NOW() - INTERVAL '21 days'
                    AND e.occurred_at <  NOW() - INTERVAL '7 days' THEN 1 END) AS events_prior_14d
      FROM users u

      JOIN events e ON e.user_id = u.id

      WHERE
        u.plan IS NOT NULL                          -- paying customers only
        AND u.cancelled_at IS NULL                  -- not already churned
        AND e.occurred_at >= NOW() - INTERVAL '21 days'
      GROUP BY u.id, u.email, u.plan

      HAVING
        COUNT(CASE WHEN e.occurred_at >= NOW() - INTERVAL '7 days' THEN 1 END) = 0
        AND COUNT(CASE WHEN e.occurred_at >= NOW() - INTERVAL '21 days'
                        AND e.occurred_at <  NOW() - INTERVAL '7 days' THEN 1 END) >= 3
      ORDER BY last_seen ASC;
    reasoning: >-
      A sliding-window engagement drop query surfaces at-risk users days before
      they cancel, giving the customer success team a lead list to act on before
      the churn becomes voluntary.
  - language: typescript
    title: Stripe smart dunning retry on failed payment
    code: >-
      import Stripe from 'stripe';


      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion:
      '2024-04-10' });


      // Delay strategy keyed by Stripe decline codes

      const RETRY_DELAY_DAYS: Record<string, number[]> = {
        insufficient_funds:     [3, 5, 7],     // likely temporary cash flow issue
        do_not_honor:           [1, 3],        // bank blocking; retry sooner
        card_velocity_exceeded: [1],           // daily limit; retry next day
        default:                [3, 5, 10],    // unknown reason
      };


      function nextRetryDate(declineCode: string | null, attemptCount: number):
      Date | null {
        const schedule = RETRY_DELAY_DAYS[declineCode ?? 'default'] ?? RETRY_DELAY_DAYS.default;
        if (attemptCount > schedule.length) return null; // exhausted retries
        const delayDays = schedule[attemptCount - 1];
        const date = new Date();
        date.setDate(date.getDate() + delayDays);
        return date;
      }


      async function handleFailedInvoice(invoiceId: string, attemptCount:
      number) {
        const invoice = await stripe.invoices.retrieve(invoiceId, {
          expand: ['payment_intent.last_payment_error'],
        });
        const declineCode =
          (invoice.payment_intent as Stripe.PaymentIntent)
            ?.last_payment_error?.decline_code ?? null;

        const retryAt = nextRetryDate(declineCode, attemptCount);
        if (!retryAt) {
          // Max retries exceeded — mark subscription as canceled, email customer
          console.log(`Invoice ${invoiceId} uncollectable after ${attemptCount} attempts`);
          return;
        }

        console.log(`Will retry invoice ${invoiceId} on ${retryAt.toISOString()} (code: ${declineCode})`);
        // Schedule the retry in your job queue at retryAt
      }
    reasoning: >-
      Intelligent retry timing based on the specific decline code recovers more
      involuntary churn than uniform retries — insufficient_funds resolves
      differently than a blocked card, and treating them identically wastes
      retries.
difficulty: intermediate
estimatedHours: 6
tldr: >-
  Stop customers from leaving. Catch payment failures early, fix them, and reach
  out to disengaged users before they cancel.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.867Z'
---
<!-- user notes -->
