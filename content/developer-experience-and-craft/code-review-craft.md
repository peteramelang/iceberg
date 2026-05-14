---
slug: code-review-craft
title: Code Review Craft
phase: developer-experience-and-craft
order: 3
summary: >-
  The human side of PR review — what good feedback looks like, how to push back
  kindly, what to nitpick vs let go.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Code review craft is the discipline of giving and receiving pull-request
  feedback in a way that improves both the code and the working relationship. A
  good reviewer separates style preferences from correctness bugs from design
  concerns, applies graduated intensity (nit vs. blocker vs. must-discuss), and
  phrases feedback as observations or questions rather than commands. The goal
  is shared understanding of the change — not gatekeeping — so the author
  finishes knowing exactly why each suggestion was made.


  On the receiving side, craft means distinguishing suggestions from
  requirements, asking clarifying questions rather than defending reflexively,
  and recognising that the author does not equal the code. When both roles
  practise this discipline simultaneously, review rounds shrink, regressions
  drop, and junior engineers level up faster because the feedback loop is
  legible.


  Organisations encode these norms in review guidelines, PR templates, and
  automated checks that handle the mechanical issues (formatting, linting) so
  humans can focus on logic, intent, and architecture. The Google Engineering
  Practices guide and Chelsea Troy's work on load-bearing code review are the
  most cited canonical references for teams building a shared vocabulary.
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
lastUpdatedAt: '2026-05-14T12:26:04.508Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=rR4n-0KYeKQ'
      title: Code Review Best Practices
      author: Google Tech Talks
      durationMinutes: 9
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Concise Google-internal talk from Trisha Gee covering the core habits of
        effective reviewers — widely cited and under 10 minutes.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=PJjmw9TRB7s'
      title: How to Do Code Reviews Like a Human
      author: PyCon US
      durationMinutes: 30
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Michael Lynch's PyCon talk is the canonical long-form treatment of
        humane, actionable code review feedback — frequently recommended across
        engineering blogs.
      source: ai-researcher
  articles:
    - url: 'https://google.github.io/eng-practices/review/reviewer/'
      title: The Reviewer's Guide — Google Engineering Practices
      kind: canonical-doc
      reasoning: >-
        Google's publicly released internal reviewer standards are the most
        widely adopted reference document for code review norms.
      publisher: Google
      source: ai-researcher
    - url: 'https://google.github.io/eng-practices/review/developer/'
      title: The Author's Guide — Google Engineering Practices
      kind: canonical-doc
      reasoning: >-
        Complements the reviewer guide by setting expectations for how authors
        should prepare and respond to reviews.
      publisher: Google
      source: ai-researcher
    - url: 'https://chelseatroy.com/2019/12/18/reviewing-pull-requests/'
      title: Reviewing Pull Requests
      kind: engineering-blog
      reasoning: >-
        Chelsea Troy's nuanced post on load-bearing feedback — what reviewers
        owe authors — is frequently cited by senior engineers as a mindset
        shift.
      author: Chelsea Troy
      source: ai-researcher
  services:
    - name: GitHub Pull Requests
      url: 'https://github.com'
      category: code-review-platform
      reasoning: >-
        The dominant platform for pull-request-based code review, with inline
        comments, suggestion blocks, and review request workflows.
      vendor: GitHub (Microsoft)
      source: ai-researcher
    - name: GitLab Merge Requests
      url: 'https://gitlab.com'
      category: code-review-platform
      reasoning: >-
        GitLab's merge request UI offers threaded discussions, approval rules,
        and code quality gates in a self-hostable platform.
      vendor: GitLab
      source: ai-researcher
    - name: Reviewable
      url: 'https://reviewable.io'
      category: code-review-tool
      reasoning: >-
        Purpose-built code review interface on top of GitHub that tracks
        discussion completion state and supports more granular review workflows.
      vendor: Reviewable
      source: ai-researcher
    - name: Graphite
      url: 'https://graphite.dev'
      category: code-review-tool
      reasoning: >-
        Stacked-diff review tool that speeds up feedback loops by letting
        reviewers merge partial changes; popular with teams doing frequent small
        PRs.
      vendor: Graphite
      source: ai-researcher
    - name: commitlint
      url: 'https://commitlint.js.org'
      category: commit-quality
      reasoning: >-
        Automates enforcement of Conventional Commits format so reviewers do not
        spend cycles on commit message style during code review.
      vendor: open-source
      source: ai-researcher
  courses:
    - url: 'https://www.pluralsight.com/courses/code-review'
      title: Code Review Best Practices
      provider: Pluralsight
      paid: true
      reasoning: >-
        Structured video course covering reviewer psychology, checklist-driven
        review, and team workflow — useful for teams standardising their
        process.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.508Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
