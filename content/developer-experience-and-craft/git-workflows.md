---
slug: git-workflows
title: Git Workflows
phase: developer-experience-and-craft
order: 4
summary: >-
  Branching strategies that survive AI tooling, rebase vs merge, conventional
  commits, and when to squash.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  A Git workflow is the agreed set of rules for how a team branches, commits,
  reviews, and integrates code changes. The three dominant models — trunk-based
  development, GitHub Flow, and Gitflow — represent trade-offs between release
  frequency, parallel feature isolation, and merge complexity. Trunk-based
  development, advocated by the Continuous Delivery community (Dave Farley,
  Martin Fowler), asks every developer to integrate to a single branch at least
  once a day; this keeps the codebase in a releasable state and prevents
  long-lived divergence. GitHub Flow is a simplified single-main-branch model
  that fits teams releasing continuously from main. Gitflow adds release and
  hotfix branches for teams with scheduled releases or multiple supported
  versions.


  Conventional Commits is a lightweight commit-message specification that
  structures the first line as `type(scope): description` — for example
  `feat(auth): add OAuth2 login`. This convention makes changelogs automatable,
  enables semantic versioning tooling, and makes git log useful as a narrative
  of intent rather than noise. Tools like commitlint and lefthook enforce the
  convention in CI or as a pre-commit hook.


  The rebase-versus-merge decision is one of the most debated in Git workflows.
  Rebasing rewrites history to produce a linear log that is easier to bisect and
  read; merging preserves the full branch topology but produces noise commits on
  main. Most teams land on a middle ground: rebase locally to clean up
  work-in-progress commits, then merge (or squash-merge) to main. With
  AI-assisted coding generating many small commits, squash merging is
  increasingly important to keep history navigable.
shortExplainerVideo: null
narrative: >-
  Pending narrative — at least 400 characters of plain-English explanation of
  why this topic matters, what the dominant failure modes are, and how a learner
  should approach it. Replace this placeholder before publishing. Placeholder
  body. Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. 
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
lastUpdatedAt: '2026-05-14T12:26:04.511Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=aJnFGMclhU8'
      title: Git Flow vs GitHub Flow
      author: DevOps Directive
      durationMinutes: 11
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Clear comparison of the two most common branching models with visual
        diagrams — accessible to developers new to workflow decisions.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=f1wnYdLEpgI'
      title: 'Trunk Based Development — the What, Why, and How'
      author: Dave Farley
      durationMinutes: 30
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Dave Farley is the pre-eminent advocate of trunk-based development and
        continuous delivery; this talk makes the case with real-world evidence.
      source: ai-researcher
  articles:
    - url: 'https://trunkbaseddevelopment.com'
      title: Trunk Based Development
      kind: canonical-doc
      reasoning: >-
        The canonical reference site for trunk-based development maintained by
        Paul Hammant — comprehensive coverage of the branching model and
        tooling.
      publisher: trunkbaseddevelopment.com
      author: Paul Hammant
      source: ai-researcher
    - url: 'https://www.conventionalcommits.org/en/v1.0.0/'
      title: Conventional Commits 1.0.0
      kind: canonical-doc
      reasoning: >-
        The specification document for Conventional Commits — the standard that
        most commit-linting and changelog tooling is built against.
      publisher: Conventional Commits
      source: ai-researcher
    - url: 'https://www.atlassian.com/git/tutorials/comparing-workflows'
      title: Comparing Git Workflows — Atlassian
      kind: tutorial
      reasoning: >-
        Atlassian's comprehensive comparison of Gitflow, GitHub Flow, forking,
        and trunk-based workflows with annotated diagrams — widely used as a
        team reference.
      publisher: Atlassian
      source: ai-researcher
  services:
    - name: GitHub
      url: 'https://github.com'
      category: git-hosting
      reasoning: >-
        Dominant Git hosting platform with pull request workflows, branch
        protection rules, and required status checks that enforce workflow
        discipline.
      vendor: GitHub (Microsoft)
      source: ai-researcher
    - name: GitLab
      url: 'https://gitlab.com'
      category: git-hosting
      reasoning: >-
        Self-hostable Git platform with built-in CI/CD, merge request approvals,
        and protected branch rules — popular in enterprises needing on-prem.
      vendor: GitLab
      source: ai-researcher
    - name: commitlint
      url: 'https://commitlint.js.org'
      category: commit-quality
      reasoning: >-
        Enforces Conventional Commits format in CI and pre-commit hooks, keeping
        commit history consistent across teams.
      vendor: open-source
      source: ai-researcher
    - name: lefthook
      url: 'https://github.com/evilmartians/lefthook'
      category: git-hooks
      reasoning: >-
        Fast, polyglot Git hooks manager from Evil Martians — simpler than husky
        for running commitlint, linters, and tests before commits.
      vendor: Evil Martians (open-source)
      source: ai-researcher
    - name: GitButler
      url: 'https://gitbutler.com'
      category: git-client
      reasoning: >-
        Virtual-branch Git client that lets developers manage multiple
        in-progress features simultaneously without context-switching overhead.
      vendor: GitButler
      source: ai-researcher
  courses:
    - url: 'https://www.atlassian.com/git'
      title: Learn Git — Atlassian Git Tutorials
      provider: Atlassian
      paid: false
      reasoning: >-
        Free, comprehensive Git tutorial series covering branching, merging,
        rebasing, and workflow strategies — the most complete free written
        reference.
      source: ai-researcher
    - url: 'https://frontendmasters.com/courses/git-in-depth/'
      title: Git In-depth
      provider: Frontend Masters
      paid: true
      reasoning: >-
        Nina Zakharenko's deep-dive course covers the Git object model,
        rebasing, cherry-picking, and advanced workflows with hands-on
        exercises.
      instructor: Nina Zakharenko
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.511Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
