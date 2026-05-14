---
slug: git-workflows
title: Git Workflows
phase: developer-experience-and-craft
order: 4
summary: >-
  Branching strategies that survive AI tooling, rebase vs merge, conventional
  commits, and when to squash.
tldr: >-
  Trunk-based development ships fast with continuous integration. GitHub Flow
  scales across teams. Gitflow suits scheduled releases. Pick based on deploy
  frequency.
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
  Git workflows matter more than most teams admit until they have suffered
  without one. The moment you have more than two or three engineers working on
  the same codebase, you need an explicit agreement about how changes flow from
  a developer's machine to production — not because git is complicated, but
  because the absence of agreement creates a local-minimum trap where everyone
  adapts to each other's habits rather than to any coherent system. The workflow
  you choose encodes your assumptions about release frequency, deployment risk
  tolerance, and how much parallel work your team does.


  The 80/20 here is to default to trunk-based development unless you have a
  specific reason not to. Long-lived feature branches are almost always a
  mistake: the longer a branch lives, the more it diverges from main, the more
  painful the merge, and the higher the probability that the integration reveals
  design conflicts that would have been caught earlier if the code had been
  integrated daily. Trunk-based development forces integration conflicts to
  surface immediately, when they are cheap to fix, rather than at the end of a
  sprint, when both branches have accumulated weeks of work on top of the
  divergence. Feature flags handle the problem of shipping incomplete features —
  you integrate to main but the code path is off by default until the feature is
  ready.


  The failure mode that destroys git history is treating it as a scratch pad
  rather than a narrative. When a team has no commit conventions, git log
  becomes noise — a wall of 'fix', 'wip', 'asdf', and 'final final v3' commits
  that conveys nothing about why changes were made. The cost of this is subtle
  but real: bisecting a regression requires reading individual commits to
  understand what changed and why, which is impossible if the commits have no
  semantic structure. Conventional Commits solves this almost entirely. Typing
  `feat(payments): add retry logic for failed Stripe webhooks` instead of `fix
  stuff` takes fifteen seconds and produces a log that can be used to generate
  changelogs automatically, drive semantic versioning, and tell the story of the
  codebase to engineers who join two years later.


  The rebase-versus-merge debate is mostly settled for practical teams once you
  define the goal. Rebase produces clean linear history that is trivially
  bisectable and reads like intentional work; merge preserves branch topology
  that shows how parallel work was integrated but produces merge commits that
  add noise to the main branch history. The pragmatic middle ground that most
  healthy teams land on: rebase locally to clean up your own work-in-progress
  commits before pushing, then use squash-merge to land PRs on main as single
  coherent units. Squash-merge is especially valuable in 2025, when AI-assisted
  coding generates many small 'works now' commits that are meaningful during
  development but add nothing to the main branch narrative.


  With AI tooling becoming a standard part of how code gets written, the git
  workflow has a new pressure point: the granularity of commits. A developer
  pair-programming with an AI assistant might generate fifty commits in a
  morning, none of which are individually meaningful. Without discipline around
  squashing and conventional commits, main branch history becomes unusable as a
  diagnostic tool. This is not hypothetical — teams that have adopted
  AI-assisted coding without updating their git discipline are already
  accumulating this debt. The workflow question for the next few years is not
  just about branch strategy; it is about how to maintain a navigable history
  when the rate of code generation has increased by an order of magnitude.


  Git workflows position interestingly in the broader ecosystem because they are
  the connective tissue between individual developer practice and the CI/CD
  pipeline. Trunk-based development is almost a prerequisite for continuous
  deployment — you cannot deploy continuously if your integration points are
  weeks apart. Conventional commits connect the workflow to automated release
  tooling. Getting the workflow right is foundational work that makes every
  downstream practice — deployment automation, changelog generation, rollback
  strategy — dramatically easier.
pitfalls:
  - title: Long-lived feature branches cause painful merge conflicts
    explanation: >-
      Branches that diverge from main for weeks accumulate conflicts that take
      longer to resolve than the feature took to write. Trunk-based development
      or at minimum daily integration to a shared feature flag branch prevents
      the drift from becoming unmanageable.
  - title: No squash strategy leaves AI-generated commit noise in main
    explanation: >-
      AI coding tools produce many small, often cryptic commits that clutter git
      log and make bisect noisy. Establish a squash-merge or clean-history
      policy for main so the log remains a useful narrative of intent, not a
      record of every agent iteration.
  - title: Force-pushing shared branches overwrites teammates' work
    explanation: >-
      Running `git push --force` on a branch others have pulled or built on top
      of silently discards their commits. Use `--force-with-lease` which only
      force-pushes if no new commits have appeared on the remote since your last
      fetch.
  - title: 'Commit messages as descriptions of what, not why'
    explanation: >-
      A commit that says 'update auth.ts' is useless six months later; one that
      says 'require MFA for admin routes to close CVE-2025-1234' is permanently
      informative. The diff shows what changed; the message must explain why the
      change was necessary.
  - title: No branch protection or CI gate on main
    explanation: >-
      A main branch that anyone can push to directly without review or passing
      CI accumulates broken commits and bypasses the entire review culture.
      Branch protection with required status checks is the technical enforcement
      layer for every other workflow practice.
codeExamples:
  - language: bash
    title: Conventional Commits Hook with Commitlint
    code: >-
      #!/usr/bin/env bash

      # .husky/commit-msg  — enforces Conventional Commits format

      # Install: pnpm add -D @commitlint/cli @commitlint/config-conventional
      husky

      # Init: npx husky init && echo "npx commitlint --edit \$1" >
      .husky/commit-msg


      # commitlint.config.ts (alongside this hook):

      # export default { extends: ['@commitlint/config-conventional'] };


      # Valid examples:

      #   feat(auth): add OAuth2 login

      #   fix(payments): handle card decline on retry

      #   chore: update pnpm lockfile

      #   docs(api): document rate limit headers

      #   BREAKING CHANGE: rename userId to user_id in all responses


      # The hook itself (installed by husky automatically):

      npx --no -- commitlint --edit "$1"


      # Manual squash-merge workflow for clean history:

      # 1. Work on feature branch with any WIP commit messages

      # 2. Before opening PR, squash to one conventional commit:

      git log --oneline main..HEAD

      # 3. Interactive rebase to squash:

      git rebase -i main

      # 4. Merge with squash to keep main linear:

      git switch main && git merge --squash feature/my-feature

      git commit -m "feat(billing): add annual subscription plan"
    reasoning: >-
      Shows commitlint hook setup plus the squash-merge workflow — the two git
      practices that keep history navigable when AI tooling generates many small
      interim commits.
difficulty: beginner
estimatedHours: 4
lastUpdatedAt: '2026-05-14T12:31:47.553Z'
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
