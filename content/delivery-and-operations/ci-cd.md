---
slug: ci-cd
title: CI / CD
phase: delivery-and-operations
order: 1
summary: >-
  Automate the build, test, and deployment pipeline so that every merged change
  can reach production safely with minimal manual intervention.
definition: >-
  CI/CD (Continuous Integration and Continuous Delivery) automates the software
  development lifecycle from code commit through production deployment.
  Continuous Integration involves developers merging changes into a shared
  repository multiple times per day, with automated builds and tests verifying
  each integration to catch problems early. Continuous Delivery extends this by
  ensuring the software can be released to production at any time through
  automated testing, staging environments, and deployment pipelines. Together,
  CI/CD practices enable teams to deliver features safely and rapidly, reducing
  manual handoffs, catching regressions early, and maintaining system stability
  while enabling high deployment frequency. Key metrics for measuring CI/CD
  effectiveness include deployment frequency, lead time for changes, change
  failure rate, and time to restore service—the Four Keys defined by DORA
  research.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=AmBJ6ZnSkZA'
      title: 'Continuous Delivery: The Movie'
      author: Thoughtworks
      durationMinutes: 8
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: Quick overview of continuous delivery principles and benefits
    long:
      url: 'https://www.youtube.com/watch?v=X9WHKX-21oxA'
      title: Continuous Delivery Practices & Patterns
      author: Jez Humble
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into deployment pipelines, testing strategies, and operational
        practices for safe continuous delivery
  articles:
    - url: 'https://martinfowler.com/articles/continuousIntegration.html'
      title: Continuous Integration
      kind: tutorial
      reasoning: >-
        Canonical Martin Fowler article on CI practices, principles, and
        implementation approaches
    - url: 'https://martinfowler.com/bliki/ContinuousDelivery.html'
      title: Continuous Delivery
      kind: tutorial
      reasoning: >-
        Martin Fowler's bliki entry explaining the core concepts and distinction
        between CI and CD
    - url: 'https://martinfowler.com/articles/cd4ml.html'
      title: Continuous Delivery for Machine Learning
      kind: tutorial
      reasoning: >-
        How to apply CD principles to ML systems, addressing challenges unique
        to data and model deployments
    - url: 'https://dora.dev/'
      title: DevOps Research and Assessment (DORA)
      kind: canonical-doc
      reasoning: >-
        Official DORA site with Four Keys metrics framework for measuring CI/CD
        and DevOps performance
    - url: 'https://docs.github.com/en/actions'
      title: GitHub Actions Documentation
      kind: canonical-doc
      reasoning: >-
        Complete reference for GitHub's native CI/CD platform with workflow
        automation and deployment examples
  services:
    - name: GitHub Actions
      url: 'https://github.com/features/actions'
      category: ci-cd-platform
      reasoning: >-
        Native GitHub CI/CD with integrated repository, no extra infrastructure;
        ideal for GitHub-hosted projects
    - name: CircleCI
      url: 'https://circleci.com'
      category: ci-cd-platform
      reasoning: >-
        Cloud-native CI/CD platform with free tier, fast builds, and strong
        container/Docker support
    - name: Buildkite
      url: 'https://buildkite.com'
      category: ci-cd-platform
      reasoning: >-
        Flexible CI/CD platform supporting on-premise or cloud agents, great for
        teams needing control over build infrastructure
    - name: GitLab CI/CD
      url: 'https://gitlab.com'
      category: ci-cd-platform
      reasoning: >-
        Integrated CI/CD within GitLab with container registry, monitoring, and
        full DevOps platform capabilities
    - name: Jenkins
      url: 'https://www.jenkins.io'
      category: ci-cd-platform
      reasoning: >-
        Open-source CI/CD automation server with extensive plugin ecosystem and
        on-premise deployment flexibility
  courses:
    - url: 'https://www.coursera.org/learn/devops-continuous-integration'
      title: Continuous Integration with Jenkins
      provider: Coursera
      paid: false
      reasoning: >-
        Foundational course on CI practices using Jenkins, available on audit
        basis
    - url: 'https://www.pluralsight.com/courses/continuous-delivery-pipeline'
      title: 'Continuous Delivery: Pipeline Automation'
      provider: Pluralsight
      paid: true
      reasoning: >-
        Advanced course covering deployment pipelines, testing strategies, and
        production-ready practices
    - url: 'https://www.linux-foundation.org/training/cd-and-devops/'
      title: CD and DevOps Training
      provider: Linux Foundation
      paid: true
      reasoning: >-
        Industry-standard certification training covering CI/CD fundamentals
        through advanced practices
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The absence of CI/CD doesn't announce itself with a crash. It accumulates
  quietly: the developer who deploys from their laptop on a Friday, the hotfix
  that skipped tests because there was no time, the staging environment that
  nobody has updated in three weeks. When the system finally breaks in
  production, everyone is surprised, and nobody should be. Manual deployment is
  not a process — it is an accumulation of optimism.


  The core value of continuous integration is not speed. It is feedback latency.
  When a developer merges a change and a test suite runs in five minutes, they
  still remember what they changed. When they find out three weeks later in a
  code review or a production incident, the context is gone and the fix costs
  ten times as much. The discipline of merging small changes frequently into a
  shared branch — and having automation validate each one immediately — changes
  how bugs are discovered. They stop being incidents and start being test
  failures.


  The 80/20 here is stark. Most teams get 80 percent of the value from three
  things: a pipeline that runs on every pull request, a test suite that actually
  catches regressions, and a deployment process that is automated enough that
  any engineer can trigger it without special access or tribal knowledge.
  Everything else — multi-stage canary deployments, progressive delivery flags,
  deployment frequency dashboards — matters, but not until those three are
  solid. Many teams reach for GitOps and Argo CD before they have reliable
  tests, which is like buying racing tires before you know how to drive.


  The dominant failure mode is a pipeline that is technically automated but
  practically ignored. Tests that flake intermittently get disabled. Deployments
  that require manual steps before and after the automation get called automated
  anyway. The pipeline becomes a checkbox rather than a gate. The signal
  degrades. Teams learn to merge in spite of red builds rather than because of
  green ones. At that point you have the cost of automation without the benefit.
  Rebuilding trust in a pipeline is harder than building it from scratch.


  In the broader ecosystem, CI/CD sits at the intersection of almost everything
  else in delivery and operations. It is the mechanism by which dependency
  updates, security patches, database migrations, and feature flags actually
  reach users. A good pipeline enforces linting, runs security scans, validates
  infrastructure-as-code, and gates on test coverage — not because each check is
  critical in isolation, but because the pipeline is the one moment every change
  passes through. That centrality is the point. DORA research has consistently
  shown that high-performing teams deploy frequently and recover quickly not
  because they are less careful, but because their automation lets them be
  careful systematically rather than heroically.
pitfalls:
  - title: Treating a broken build as optional
    explanation: >-
      When flaky tests get disabled and red builds get merged anyway, the
      pipeline becomes a checkbox rather than a gate. Engineers learn to ship in
      spite of failures, the signal degrades, and trust in the pipeline
      collapses — making it nearly impossible to distinguish real regressions
      from noise.
  - title: Automating deployment but not the steps around it
    explanation: >-
      A deployment that requires manual pre-steps (updating a config file,
      notifying a Slack channel, toggling a feature flag by hand) is not
      automated — it is a partially-automated process that will fail silently
      when someone skips a step. Every manual requirement outside the pipeline
      is a gap where human error lives.
  - title: Running tests only after merging to main
    explanation: >-
      Feedback on broken code should arrive while the developer still remembers
      what they changed. A pipeline that runs only post-merge means failures
      surface late, block everyone on the branch, and require context
      reconstruction that costs far more than catching the same failure
      pre-merge.
  - title: Deploying from a local machine
    explanation: >-
      Laptops are not reproducible environments. A deploy from a developer's
      machine includes their local config, their installed tooling versions, and
      bypasses every pipeline check. One 'works on my machine' deploy that
      corrupts production data is enough to understand why this practice needs
      to be eliminated.
  - title: Skipping staging because it's never in sync
    explanation: >-
      A staging environment that diverges from production — different versions,
      different configs, stale data — stops being useful for catching problems
      before they reach users. Teams then skip it entirely, and production
      becomes the first real validation environment, which inverts the entire
      purpose of the pipeline.
  - title: Reaching for GitOps before tests are reliable
    explanation: >-
      Progressive delivery tooling and multi-stage canary pipelines add
      complexity that only pays off if the underlying test suite actually
      catches regressions. Building sophisticated deployment infrastructure on
      top of an unreliable test suite means faster delivery of undetected bugs,
      not safer deployments.
codeExamples:
  - language: yaml
    title: GitHub Actions CI pipeline with test gate
    code: |-
      name: CI

      on:
        pull_request:
          branches: [main]
        push:
          branches: [main]

      jobs:
        test:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                node-version: '20'
                cache: 'npm'

            - run: npm ci

            - run: npm run lint

            - run: npm test -- --ci --coverage

            - name: Upload coverage
              uses: actions/upload-artifact@v4
              with:
                name: coverage
                path: coverage/

        deploy:
          needs: test
          if: github.ref == 'refs/heads/main' && github.event_name == 'push'
          runs-on: ubuntu-latest
          environment: production
          steps:
            - uses: actions/checkout@v4
            - run: npm ci
            - run: npm run build
            - run: ./scripts/deploy.sh
              env:
                DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
    reasoning: >-
      A minimal but complete GitHub Actions workflow shows the two-job pattern —
      test gate on every PR, deploy only on main — which is the 80/20 of CI/CD
      for most teams.
difficulty: intermediate
estimatedHours: 6
tldr: >-
  Automate shipping code so tests run and deployment happens without manual
  steps. Catches bugs fast and makes changes safer.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.855Z'
---
<!-- user notes -->
