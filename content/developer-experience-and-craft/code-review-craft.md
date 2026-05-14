---
slug: code-review-craft
title: Code Review Craft
phase: developer-experience-and-craft
order: 3
summary: >-
  The human side of PR review — what good feedback looks like, how to push back
  kindly, what to nitpick vs let go.
tldr: >-
  Give specific, respectful feedback that improves code and relationships.
  Separate style preferences from bugs from design issues.
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
  Code review is where the theory of software engineering meets the friction of
  actual human beings working together. In production teams, the quality of
  review culture is a leading indicator of defect rates, onboarding speed, and
  whether senior engineers can take vacation without the codebase regressing.
  That makes it a leverage point that most teams underinvest in — they think
  they need better tooling, when what they actually need is a shared vocabulary
  for feedback.


  The 80/20 of review craft is this: automate everything mechanical so humans
  never spend review cycles on it. Linting, formatting, import ordering, type
  errors — all of this should fail in CI before a reviewer ever opens the PR.
  Once that floor is in place, human review can focus on the three things
  machines cannot judge well: whether the change solves the right problem,
  whether the design will still make sense in two years, and whether the logic
  holds under edge cases the author may not have considered. If your review
  comments are mostly about naming and whitespace, your automation layer is not
  pulling its weight.


  The failure modes in review culture are almost always social rather than
  technical. The most common is feedback that sounds like verdict rather than
  conversation — comments phrased as commands ('change this to X') that leave
  the author no room to push back or ask why. This creates a dynamic where
  authors stop thinking critically about their own code and just implement
  whatever reviewers say, which means reviewers are now doing the cognitive work
  for the whole team. The opposite failure is just as bad: reviewers who approve
  anything to avoid conflict, turning review into a bureaucratic checkbox rather
  than a quality gate. Both patterns tend to self-reinforce.


  The mental model that fixes most of this is to think of a PR as a proposal,
  not a submission for judgment. The author is presenting a solution to a
  problem and inviting a conversation about whether it is the right one. From
  the reviewer's side, this means asking 'have you considered X?' instead of
  asserting 'you should do X' — the question form signals that you might be
  missing context the author has. From the author's side, it means treating a
  blocker comment as information rather than criticism: the reviewer saw
  something you did not, and understanding why is more valuable than knowing
  that you need to change it.


  Graduated signal strength matters enormously once a team grows past five or
  six engineers. Labeling a comment as a nit (optional, style preference, low
  stakes) versus a blocker (cannot merge as-is) versus a question (genuinely
  uncertain, author may have more context) gives authors the information they
  need to prioritize their response and reduces the anxiety that every comment
  is equally urgent. Chelsea Troy's framing of 'load-bearing' versus
  'decorative' code is useful here: the intensity of review should be
  proportional to how structural the code is. A utility function deep in a test
  helper deserves a lighter touch than an authentication middleware that every
  request flows through.


  In the broader ecosystem, code review craft sits downstream of all the other
  quality practices — testing, observability, CI — and upstream of team culture
  and knowledge distribution. Teams that review well accumulate shared
  understanding faster than their codebase grows, which is how you avoid the
  situation where only one person knows how the payment system works. That
  bus-factor reduction is not a side effect of good review culture; it is one of
  the primary reasons to build it.
pitfalls:
  - title: Mixing nits with blockers in the same review
    explanation: >-
      When a reviewer flags a missing semicolon and a security vulnerability
      with equal urgency, the author cannot distinguish what must change from
      what is optional. Label every comment with its severity — nit, suggestion,
      or blocker — so the author can triage correctly.
  - title: Reviewing style that automated tools should catch
    explanation: >-
      Spending review cycles on formatting, import order, and naming conventions
      that a linter or formatter would enforce wastes human attention on
      machine-solvable problems. Automate everything the machine can check
      before the PR opens a human review round.
  - title: Large PRs reviewed superficially due to size
    explanation: >-
      A 2,000-line PR gets less effective review than four 500-line PRs because
      reviewers lose the thread and fatigue sets in. PR size limits and a norm
      of splitting large changes into reviewable increments produce better
      outcomes than reviewing everything at once.
  - title: Defensive author reactions slow down future reviews
    explanation: >-
      Authors who argue every comment or treat suggestions as personal criticism
      make reviewers hedge their feedback, producing less direct and less useful
      review. Separating yourself from your code — and modeling that separation
      visibly — is a craft skill that improves the whole team's review culture.
  - title: No follow-up on review comments that were 'addressed'
    explanation: >-
      Reviewers who approve without checking whether their comments were
      actually addressed — versus just marked resolved — allow architectural
      concerns to be dismissed rather than resolved. Re-read the diff after the
      author's revision, don't just accept their self-report.
codeExamples:
  - language: yaml
    title: PR Template Encoding Review Norms
    code: |-
      # .github/pull_request_template.md equivalent as structured YAML
      # Used by tooling to validate PR quality gates before review is requested.

      pr_checklist:
        author_tasks:
          - label: Self-reviewed the diff before requesting review
            required: true
          - label: Added or updated tests for changed logic
            required: true
          - label: Updated relevant docs or CLAUDE.md
            required: false
          - label: Linked to the issue or design doc this addresses
            required: true

        review_labels:
          nit:
            description: Style or naming preference. Author may ignore.
            blocks_merge: false
          suggestion:
            description: Better approach exists but current code works.
            blocks_merge: false
          warning:
            description: May cause bugs in edge cases. Should fix.
            blocks_merge: false
          blocker:
            description: Will cause a bug or regression. Must fix before merge.
            blocks_merge: true

        review_guidance:
          - Separate style nits from correctness issues.
          - Phrase blockers as observations, not commands: 'This will fail when X is null' not 'Fix this'.
          - Approve with outstanding nits to unblock author — don't hold merge for nits.
          - One approval required for logic changes; two for auth or billing changes.
    reasoning: >-
      A YAML review policy that encodes label semantics and merge gates — the
      artifact teams use to align on what 'good review' means before the
      disagreements start.
difficulty: beginner
estimatedHours: 3
lastUpdatedAt: '2026-05-14T12:31:47.550Z'
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
