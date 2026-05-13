---
slug: ab-testing
title: A/B Testing
phase: delivery-and-operations
order: 6
summary: >-
  Run controlled experiments by exposing different product variants to user
  segments and measuring statistically significant differences in behavior.
definition: >-
  A/B testing (controlled experiments) is a method for evaluating the impact of
  changes to a product by randomly assigning users to test variants and
  measuring statistically significant differences in user behavior. A/B tests
  involve segmenting users into control and treatment groups, exposing them to
  different product variants, and comparing outcomes using statistical
  hypothesis testing. This approach enables data-driven decision-making by
  quantifying the causal effect of changes before broad rollout, accounting for
  natural variation and ensuring results are not due to chance.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: >-
        https://www.microsoft.com/en-us/research/publication/online-controlled-experiments-at-scale/
      title: 'Microsoft: Experimentation Platform and A/B Testing'
      kind: tutorial
      reasoning: (no reasoning captured)
      publisher: Microsoft
      source: ai-researcher
  services:
    - name: 'Optimizely: A/B Testing Platform'
      url: 'https://www.optimizely.com/ab-testing/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Optimizely
      source: ai-researcher
    - name: 'GrowthBook: Open Source A/B Testing'
      url: 'https://www.growthbook.io/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: GrowthBook
      source: ai-researcher
    - name: 'Statsig: Feature Experimentation Platform'
      url: 'https://statsig.com/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Statsig
      source: ai-researcher
    - name: 'PostHog: Product Analytics & Experimentation'
      url: 'https://posthog.com/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: PostHog
      source: ai-researcher
    - name: 'Split.io: Feature Flagging and Experimentation'
      url: 'https://www.split.io/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Split
      source: ai-researcher
    - name: 'VWO: A/B Testing and Conversion Optimization'
      url: 'https://vwo.com/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: VWO
      source: ai-researcher
    - name: 'Booking.ai: A/B Testing at Scale'
      url: 'https://booking.ai/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Booking
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  A/B testing is how you stop guessing. Without it, every product decision is a
  bet you can't settle — you ship a change, traffic shifts, and you have no idea
  if the new onboarding copy caused the uptick or if it was just the seasonal
  effect from that marketing campaign. The failure mode of skipping
  experimentation isn't that you make obviously bad decisions. It's that you
  make confidently wrong ones, and you never find out. Teams that skip A/B
  testing tend to attribute causality to whatever feature shipped most recently,
  which is a great way to build an intuition that doesn't match reality.


  The 80/20 of A/B testing is this: get your randomization right, pick one
  primary metric per experiment, and run the test long enough. Almost everything
  else is refinement. Randomization needs to be stable — the same user should
  always land in the same bucket, or your results will be polluted by users who
  see both variants. A consistent hash on a user ID or device ID is the standard
  approach. The primary metric is the one you're moving the needle on; if you're
  testing a checkout flow change, that metric is probably conversion, not
  session length. Running too short is the classic mistake — teams see an early
  positive signal and call it, not realizing they've caught a fluke in the
  noise. Two weeks is a common minimum to capture weekly seasonality.


  The dominant failure modes are: (1) peeking — stopping the experiment early
  because the numbers look good, which inflates false positive rates
  dramatically; (2) running too many simultaneous experiments with overlapping
  user segments so you can't untangle which change caused which effect; (3)
  novelty effect — users engage more with anything new, so a short test on a UI
  change will almost always look positive. The novelty effect decays. Your
  p-value doesn't care. The other common trap is cargo-culting statistical
  significance — a p-value of 0.04 on a small experiment doesn't mean much.
  Effect size and practical significance matter just as much as the threshold.


  The mental model that makes this click is thinking of A/B testing as
  controlled causation. Observational data tells you what correlates with what.
  An experiment tells you what causes what. That distinction is the entire value
  of the practice. You're not measuring whether users who see variant B convert
  more — you're measuring whether seeing variant B *makes* users convert more.
  The randomization is what enables that causal claim, which is why flawed
  randomization isn't just a methodological annoyance; it makes the whole
  exercise meaningless.


  This topic sits squarely in the delivery-and-operations phase because it's
  part of how you deploy changes responsibly. It pairs tightly with feature
  flags, since flags are often the mechanism for bucketing users into variants,
  and with analytics infrastructure, since you need reliable event tracking to
  measure outcomes. It also connects upstream to product decisions — teams that
  experiment well tend to have clearer hypotheses before they build, because
  they know they'll need to define success before they ship. That discipline
  alone makes experimentation worth investing in.
pitfalls:
  - title: Peeking and stopping experiments early
    explanation: >-
      Checking results before the planned sample size is reached and stopping
      when numbers look promising dramatically inflates false positive rates —
      you're likely acting on noise, not signal. The fix is to pre-commit to a
      minimum runtime and sample size before launching the experiment.
  - title: Unstable randomization pollutes variant assignment
    explanation: >-
      If the bucketing function doesn't produce a stable mapping — the same user
      lands in different variants across sessions or devices — your treatment
      and control groups overlap and your results are meaningless. Always derive
      bucket assignment from a consistent user identifier using a deterministic
      hash.
  - title: Running too many overlapping experiments simultaneously
    explanation: >-
      When multiple experiments share the same user population without proper
      segmentation, the effects of each experiment contaminate the others,
      making it impossible to attribute causality to any single change. Use
      mutual exclusion layers or holdout groups to isolate concurrent tests.
  - title: Mistaking novelty effect for real lift
    explanation: >-
      Users reliably engage more with anything that looks new, so a
      short-running UI experiment will almost always show a positive result that
      decays once the novelty wears off. Running experiments long enough — at
      minimum two full weeks to capture weekly seasonality — is the only
      protection.
  - title: Cargo-culting p-value significance without effect size
    explanation: >-
      A p-value below 0.05 on a small sample tells you the result is unlikely to
      be chance, but it says nothing about whether the effect is large enough to
      matter in practice. Reporting p-value alone without effect size and
      confidence intervals leads teams to ship changes that produce real but
      negligible improvements.
  - title: Tracking too many metrics with no primary metric
    explanation: >-
      Defining no primary metric before launch and then scanning all metrics
      post-hoc for winners is essentially data dredging — the more metrics you
      check, the more likely you are to find a spurious significant result.
      Every experiment must have one primary metric declared before it starts.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 8
---
<!-- user notes -->
