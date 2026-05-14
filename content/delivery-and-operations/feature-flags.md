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
  researchedAt: '2026-05-13T23:57:18.043Z'
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
  - title: Release Flags That Never Get Cleaned Up
    explanation: >-
      Once a feature is fully rolled out, the flag stops feeling urgent and
      cleanup gets deferred indefinitely. A codebase with 150 abandoned flags
      contains code paths nobody can reason about, silent behavior changes when
      an evaluation service hiccups, and conditional branches that have been
      dead for two years. Treat flag cleanup as a first-class engineering task:
      assign an owner at flag creation time and set an expiration date so
      cleanup is scheduled, not aspirational.
  - title: Flag Evaluation Logic Scattered Throughout the Codebase
    explanation: >-
      When flag checks are sprinkled across controllers, services, and database
      queries rather than evaluated at a single decision boundary, a single flag
      controls multiple divergent code paths in ways that become impossible to
      audit. Centralize flag evaluation at the boundary of each feature — one
      flag check, one branch — so the surface area of a flag's effect is visible
      and removing the flag is a single, safe operation.
  - title: Wrapping Every Small Change in a Feature Flag
    explanation: >-
      Flags used indiscriminately as a habit rather than a risk management tool
      create deeply nested conditionals that are harder to reason about than a
      straightforward deploy. Not every change warrants a flag — a flag should
      reflect genuine deployment risk or deliberate rollout control. Reserve
      flags for changes with meaningful blast radius: new user-facing
      functionality, risky database migrations, or ops controls for high-traffic
      paths.
  - title: No Progressive Rollout — Shipping to 100% Immediately
    explanation: >-
      The primary value of a release flag is the ability to ramp gradually,
      watching error rates and latency at 1%, 10%, and 50% before full exposure.
      Shipping to 100% on day one provides no advantage over a deploy without a
      flag, and misses the opportunity to catch regressions before they affect
      all users. Build progressive rollout into the standard release process and
      automate rollback triggers when error rates exceed a threshold.
  - title: Flag Evaluation Service as an Unmonitored Single Point of Failure
    explanation: >-
      Application code that blocks on a remote flag evaluation call with no
      timeout or fallback will hang when the evaluation service is slow or
      unavailable, potentially taking down features that have nothing to do with
      any in-flight flag change. Flags must have default values that are safe to
      serve if the evaluation service is unreachable, and flag SDK calls must
      have timeouts. Treat the flag service as a dependency that can fail and
      design accordingly.
codeExamples:
  - language: typescript
    title: Feature Flag Evaluation with Progressive Rollout
    code: >-
      import crypto from 'crypto';


      interface FlagConfig {
        enabled: boolean;
        rolloutPercent: number;        // 0-100
        allowlist?: string[];          // user IDs always on
        denylist?: string[];           // user IDs always off
      }


      // In production, load from a remote config store; here we use a local
      map.

      const flags: Record<string, FlagConfig> = {
        'new-checkout-flow': { enabled: true, rolloutPercent: 10, allowlist: ['internal-user-1'] },
        'recommendation-engine': { enabled: false, rolloutPercent: 0 },
      };


      function isEnabled(flagKey: string, userId: string): boolean {
        const flag = flags[flagKey];
        if (!flag || !flag.enabled) return false;
        if (flag.denylist?.includes(userId)) return false;
        if (flag.allowlist?.includes(userId)) return true;

        // Deterministic, sticky hash: same user always gets same bucket
        const hash = crypto.createHash('sha256').update(`${flagKey}:${userId}`).digest('hex');
        const bucket = parseInt(hash.slice(0, 8), 16) % 100;
        return bucket < flag.rolloutPercent;
      }


      // Usage at a service boundary (not scattered throughout business logic)

      async function getCheckoutHandler(userId: string) {
        if (isEnabled('new-checkout-flow', userId)) {
          return newCheckout(userId);
        }
        return legacyCheckout(userId);
      }


      async function newCheckout(userId: string) { return { flow: 'new', userId
      }; }

      async function legacyCheckout(userId: string) { return { flow: 'legacy',
      userId }; }
    reasoning: >-
      A sticky hash-based rollout ensures the same user always sees the same
      experience (preventing flickering) and allows gradual percentage increases
      — this is the core mechanism behind safe progressive rollouts without a
      full flag platform.
  - language: typescript
    title: Ops Kill-Switch Flag for Graceful Degradation
    code: >-
      // ops-flags.ts — operational toggles for graceful degradation under load


      interface OpsFlag {
        key: string;
        enabled: boolean;
        fallback: () => unknown;
      }


      const opsFlags: Record<string, OpsFlag> = {
        'enable-recommendations': {
          key: 'enable-recommendations',
          enabled: true,
          fallback: () => [],   // return empty list when disabled
        },
        'enable-search-suggest': {
          key: 'enable-search-suggest',
          enabled: true,
          fallback: () => null,
        },
      };


      async function withOpsFlag<T>(
        flagKey: string,
        fn: () => Promise<T>
      ): Promise<T | ReturnType<OpsFlag['fallback']>> {
        const flag = opsFlags[flagKey];
        if (!flag || !flag.enabled) {
          console.warn({ flagKey }, 'Ops flag disabled — returning fallback');
          return flag?.fallback() as T;
        }
        return fn();
      }


      // In request handler:

      async function getProductPage(productId: string) {
        const [product, recommendations] = await Promise.all([
          fetchProduct(productId),
          withOpsFlag('enable-recommendations', () => fetchRecommendations(productId)),
        ]);
        return { product, recommendations };
      }


      async function fetchProduct(id: string) { return { id, name: 'Widget' }; }

      async function fetchRecommendations(id: string) { return [{ id: 'rec-1'
      }]; }
    reasoning: >-
      Ops-toggle flags that return safe fallbacks when disabled are the
      mechanism for turning off non-critical features during high load or
      incidents in seconds — a deploy-free kill-switch that contains blast
      radius without a rollback.
difficulty: intermediate
estimatedHours: 5
tldr: >-
  Launch incomplete features safely by leaving them off by default, gradually
  roll out to users, and instantly disable broken features without deploying new
  code.
shortExplainerVideo:
  url: 'https://www.youtube.com/watch?v=AJa2B-twtG4'
  title: What are Feature Flags?
  author: IBM Technology
  durationSeconds: 400
  reasoning: >-
    IBM Technology's 6:40 explainer covers what feature flags are, how they
    decouple deployment from release, and shows a code example. Directly maps to
    the topic's core use cases: release toggles, trunk-based development, and
    runtime behavior control. Strong preferred source, concise, no tutorial
    bloat, 69k+ views.
  source: ai-researcher
lastUpdatedAt: '2026-05-14T12:27:20.529Z'
---
<!-- user notes -->
