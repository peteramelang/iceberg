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
    - title: Homegrown Feature Flag Systems vs. Enterprise Solutions
      url: 'https://launchdarkly.com/blog'
      kind: canonical-doc
      reasoning: ''
  services:
    - name: LaunchDarkly
      url: 'https://launchdarkly.com'
      category: platform
      reasoning: ''
    - name: GrowthBook
      url: 'https://www.growthbook.io'
      category: platform
      reasoning: ''
    - name: PostHog
      url: 'https://posthog.com/docs/feature-flags'
      category: platform
      reasoning: ''
    - name: Flagsmith
      url: 'https://flagsmith.com'
      category: platform
      reasoning: ''
    - name: Unleash
      url: 'https://www.getunleash.io'
      category: platform
      reasoning: ''
    - name: Statsig
      url: 'https://statsig.com'
      category: platform
      reasoning: ''
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
