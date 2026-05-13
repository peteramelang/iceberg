---
slug: vendor-lock-in
title: Vendor Lock-In
phase: delivery-and-operations
order: 7
summary: >-
  Assess and mitigate dependency on specific cloud providers or SaaS vendors
  through abstraction layers, open standards, and portability planning.
definition: >-
  Assess and mitigate dependency on specific cloud providers or SaaS vendors
  through abstraction layers, open standards, and portability planning.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles: []
  services: []
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Vendor lock-in is the cost you don't pay until you try to leave, and by then
  the bill is enormous. The company that built its entire data pipeline on a
  proprietary AWS service discovers this when they get a pricing change that
  doubles their infrastructure costs and the migration estimate comes back at
  six months of engineering time. The startup that chose a SaaS vendor for a
  critical function finds out the hard way when that vendor raises prices, gets
  acquired, or simply discontinues the product. None of this is hypothetical and
  none of it is rare. The question is never "will we ever want to switch
  vendors?" — the question is whether you'll have any leverage when that moment
  comes.


  The 80/20 for managing lock-in is: be deliberate about where you accept it and
  where you don't, and make sure your data can leave. Data portability is the
  most important thing. If you can export your data in a format that another
  vendor can ingest, you have options. If your data is in a proprietary format
  that only one vendor can read, you don't. Beyond data portability, the
  highest-leverage investments are thin abstraction layers over the services
  you're most likely to want to swap: your email provider, your payment
  processor, your object storage. You don't need to abstract AWS from Azure —
  the probability of migrating cloud providers is low and the cost of
  abstracting the entire cloud is enormous. But abstracting Sendgrid from
  Postmark in your email service interface is an afternoon of work and buys you
  real optionality.


  The failure modes are mostly about false economies. The first: teams accept
  deep lock-in on the reasoning that migration will never be necessary, then
  find themselves negotiating from a position of zero leverage at contract
  renewal time. The vendor knows you can't leave without six months of work, and
  prices accordingly. The second: over-engineering abstraction layers for things
  that genuinely don't need them. Building a database abstraction layer that
  supports both Postgres and MySQL when you've never run anything but Postgres
  is wasted engineering effort; the migration cost you avoided with that
  abstraction layer would have been lower than the cost of maintaining it over
  years. The key judgment call is estimating switching costs honestly and
  spending abstraction budget proportionally.


  The mental model that works here is thinking about your dependencies as a
  spectrum from commodity to proprietary. Commodity services — S3-compatible
  object storage, SMTP email delivery, standard Postgres — are easy to swap
  because multiple vendors implement the same interface. Proprietary services —
  a vendor's unique ML API, a platform-specific orchestration tool, a managed
  service with no open-source equivalent — are hard to swap because you're tied
  to their specific implementation. The further toward proprietary a dependency
  sits, the more intentional you should be about taking it on. That doesn't mean
  avoiding proprietary services; it means going in eyes open about the cost of
  future migration and either accepting that cost or reducing it with
  abstraction.


  In the delivery and operations ecosystem, vendor lock-in decisions compound
  over time in a way that makes them genuinely architectural. A decision to use
  AWS Lambda's event source mappings deeply couples your compute layer to AWS. A
  decision to store all your search indexes in Algolia makes Algolia's pricing
  your pricing. These aren't necessarily wrong choices, but they're choices that
  should be made consciously, documented, and revisited periodically as your
  scale and requirements change. The companies that navigate this best treat
  their vendor portfolio the way they treat their technical debt portfolio: not
  with the goal of eliminating it, but with explicit awareness of what they owe
  and to whom, and a plan for managing the most expensive obligations.
pitfalls:
  - title: (pitfall 1 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 2 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 3 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 4
---
<!-- user notes -->
