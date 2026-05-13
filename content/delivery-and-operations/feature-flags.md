---
slug: feature-flags
title: Feature Flags
phase: delivery-and-operations
order: 4
summary: >-
  Decouple feature deployment from feature release using runtime flags that
  allow gradual rollouts, instant kill-switches, and targeted user targeting.
definition: >-
  Feature flags (also called feature toggles) enable teams to modify system
  behavior at runtime without code changes or redeployment. By decoupling
  feature code from feature activation, teams can deploy incomplete or
  unfinished features to production while keeping them disabled, then gradually
  roll out to users through progressive rollouts, A/B tests, or targeted
  segments. This approach reduces deployment risk, enables trunk-based
  development, and provides instant kill-switches for disabling broken features
  without reverting code.


  Feature flags serve four primary use cases: release toggles enable trunk-based
  development by masking incomplete features during development; experiment
  toggles support A/B testing and multivariate analysis by routing different
  users to different variations; ops toggles provide operational control to
  degrade or disable features during outages or high load; and permissioning
  toggles manage feature access by user group (beta testers, premium users,
  internal staff). Enterprise solutions like LaunchDarkly, GrowthBook, PostHog,
  Flagsmith, Unleash, and Statsig extend basic flag evaluation with
  observability, experimentation integration, progressive rollout strategies,
  and compliance features.


  Effective feature flag implementation requires treating toggles as inventory
  with lifecycle management—removing retired flags to reduce complexity,
  centralizing flag decision logic rather than scattering conditionals
  throughout code, and injecting flag evaluations at construction time using
  patterns like inversion of control. At scale, flag platforms can process
  billions of evaluations daily with sub-200ms updates, integrate with 80+
  third-party tools, and provide governance, audit logging, and automated
  rollback capabilities for production safety.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - title: Feature Toggles (aka Feature Flags)
      url: 'https://martinfowler.com/articles/feature-toggles.html'
      kind: canonical-doc
      reasoning: ''
      publisher: Martin Fowler
      source: ai-researcher
    - title: Homegrown Feature Flag Systems vs. Enterprise Solutions
      url: 'https://launchdarkly.com/blog'
      kind: canonical-doc
      reasoning: ''
      publisher: LaunchDarkly
      source: ai-researcher
  services:
    - name: LaunchDarkly
      url: 'https://launchdarkly.com'
      category: platform
      reasoning: ''
      source: ai-researcher
    - name: GrowthBook
      url: 'https://www.growthbook.io'
      category: platform
      reasoning: ''
      source: ai-researcher
    - name: PostHog
      url: 'https://posthog.com/docs/feature-flags'
      category: platform
      reasoning: ''
      source: ai-researcher
    - name: Flagsmith
      url: 'https://flagsmith.com'
      category: platform
      reasoning: ''
      source: ai-researcher
    - name: Unleash
      url: 'https://www.getunleash.io'
      category: platform
      reasoning: ''
      source: ai-researcher
    - name: Statsig
      url: 'https://statsig.com'
      category: platform
      reasoning: ''
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Feature flags solve a problem that most teams don't recognize as a problem
  until they've shipped a bad deploy and spent two hours waiting for a rollback
  to complete: the coupling between deploying code and activating features. When
  deploy equals release, every deploy is a high-stakes event. You can't ship
  half a feature to see how it behaves under production load. You can't turn off
  a broken feature without reverting code. You can't let five beta users try
  something before everyone else. Feature flags break that coupling, and once
  you've worked in a system that uses them well, going back feels like losing a
  safety net you didn't know you had.


  The four use cases for feature flags are meaningfully different, and treating
  them as a single tool misses the nuance. Release toggles let you merge
  in-progress features to the main branch without shipping them to users — this
  is the foundation of trunk-based development, which eliminates the long-lived
  feature branches that cause painful merges. Ops toggles let you degrade or
  disable features under load — if your recommendation engine is causing
  database contention during peak traffic, an ops flag lets you turn it off in
  30 seconds without a deploy. Experiment toggles route different user segments
  to different variations and measure outcomes — this is A/B testing at the
  infrastructure level. Permission toggles gate features by user group — beta
  testers, premium users, internal staff. Understanding which type of flag
  you're creating matters for how you manage its lifecycle: experiment flags
  should be removed after the test concludes; permission flags may live for
  years; release flags should be removed as soon as the feature is fully rolled
  out.


  The 80/20 here is: get a flag evaluation service running (LaunchDarkly,
  Unleash, PostHog Flags, or even a simple database table for small teams),
  establish a naming convention and ownership model from the start, and treat
  flag cleanup as a first-class engineering task. The temptation to defer
  cleanup is enormous — once a feature is shipped, the flag feels irrelevant —
  but flag accumulation is real technical debt. A codebase with 200 abandoned
  feature flags is one where engineers can't reason about which code paths
  actually execute in production. Flags that have been around long enough that
  nobody knows what they do become the things that break silently when the
  evaluation service has a hiccup.


  The dominant failure mode is the flag that becomes permanent. A release flag
  gets shipped, the feature is successful, and nobody removes the flag because
  there's always something more urgent to do. A year later, you have 150 flags
  in your system and half of them are dead code that nobody cleaned up. The
  second failure mode is over-flagging: wrapping every small change in a flag
  because it's become the team habit, resulting in deeply nested conditionals
  throughout the codebase that are harder to reason about than a straightforward
  deploy. Flags should be used for things with real deployment risk, not as a
  general-purpose mechanism for every change.


  A useful mental model for feature flags is a power switch on a dimmer. A
  regular deploy is a light switch: on or off, immediate, affecting everyone. A
  feature flag is a dimmer: you can bring the feature up gradually, hold it at
  10% while you watch error rates, push it to 50% when things look good, and
  kill it instantly if something goes wrong. The dimmer also has zones — you can
  have it on in one room (internal users) and off in another (everyone else).
  The sophistication of the control is the value. Progressive rollouts — 1% to
  5% to 25% to 100%, with automated rollback triggers when error rates exceed a
  threshold — are the most robust way to ship risky changes, and they're only
  possible because of the flag infrastructure underneath them.


  Feature flags sit at the intersection of delivery and operations, which is why
  they show up in both engineering and product discussions. On the engineering
  side, they're a reliability tool. On the product side, they're a release
  control mechanism. The teams that use them most effectively tend to have
  alignment between engineering and product on flag ownership — product decides
  when a feature reaches 100% rollout and when an experiment flag gets resolved,
  engineering decides when the cleanup happens and maintains the flag inventory.
  That shared ownership is what keeps the flag count manageable over time.
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
