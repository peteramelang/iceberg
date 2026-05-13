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
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=X9WHKX-21oxA'
      title: Continuous Delivery Practices & Patterns
      author: Jez Humble
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into deployment pipelines, testing strategies, and operational
        practices for safe continuous delivery
      source: ai-researcher
  articles:
    - url: 'https://martinfowler.com/articles/continuousIntegration.html'
      title: Continuous Integration
      kind: tutorial
      reasoning: >-
        Canonical Martin Fowler article on CI practices, principles, and
        implementation approaches
      publisher: Martin Fowler
      source: ai-researcher
    - url: 'https://martinfowler.com/bliki/ContinuousDelivery.html'
      title: Continuous Delivery
      kind: tutorial
      reasoning: >-
        Martin Fowler's bliki entry explaining the core concepts and distinction
        between CI and CD
      publisher: Martin Fowler
      source: ai-researcher
    - url: 'https://martinfowler.com/articles/cd4ml.html'
      title: Continuous Delivery for Machine Learning
      kind: tutorial
      reasoning: >-
        How to apply CD principles to ML systems, addressing challenges unique
        to data and model deployments
      publisher: Martin Fowler
      source: ai-researcher
    - url: 'https://dora.dev/'
      title: DevOps Research and Assessment (DORA)
      kind: canonical-doc
      reasoning: >-
        Official DORA site with Four Keys metrics framework for measuring CI/CD
        and DevOps performance
      publisher: DORA (Google)
      source: ai-researcher
    - url: 'https://docs.github.com/en/actions'
      title: GitHub Actions Documentation
      kind: canonical-doc
      reasoning: >-
        Complete reference for GitHub's native CI/CD platform with workflow
        automation and deployment examples
      publisher: GitHub
      source: ai-researcher
  services:
    - name: GitHub Actions
      url: 'https://github.com/features/actions'
      category: ci-cd-platform
      reasoning: >-
        Native GitHub CI/CD with integrated repository, no extra infrastructure;
        ideal for GitHub-hosted projects
      vendor: GitHub
      source: ai-researcher
    - name: CircleCI
      url: 'https://circleci.com'
      category: ci-cd-platform
      reasoning: >-
        Cloud-native CI/CD platform with free tier, fast builds, and strong
        container/Docker support
      source: ai-researcher
    - name: Buildkite
      url: 'https://buildkite.com'
      category: ci-cd-platform
      reasoning: >-
        Flexible CI/CD platform supporting on-premise or cloud agents, great for
        teams needing control over build infrastructure
      source: ai-researcher
    - name: GitLab CI/CD
      url: 'https://gitlab.com'
      category: ci-cd-platform
      reasoning: >-
        Integrated CI/CD within GitLab with container registry, monitoring, and
        full DevOps platform capabilities
      vendor: GitLab
      source: ai-researcher
    - name: Jenkins
      url: 'https://www.jenkins.io'
      category: ci-cd-platform
      reasoning: >-
        Open-source CI/CD automation server with extensive plugin ecosystem and
        on-premise deployment flexibility
      source: ai-researcher
  courses:
    - url: 'https://www.linux-foundation.org/training/cd-and-devops/'
      title: CD and DevOps Training
      provider: Linux Foundation
      paid: true
      reasoning: >-
        Industry-standard certification training covering CI/CD fundamentals
        through advanced practices
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
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
