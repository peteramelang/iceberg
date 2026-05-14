---
slug: documentation
title: Documentation
phase: growth-and-governance
order: 5
summary: >-
  Maintain up-to-date runbooks, API references, architectural decision records,
  and onboarding guides so institutional knowledge survives team changes.
definition: >-
  Maintain up-to-date runbooks, API references, architectural decision records,
  and onboarding guides so institutional knowledge survives team changes.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles: []
  services:
    - name: Docusaurus
      url: 'https://docusaurus.io'
      category: service
      reasoning: (no reasoning captured)
    - name: GitBook
      url: 'https://www.gitbook.com'
      category: service
      reasoning: (no reasoning captured)
    - name: ReadMe
      url: 'https://readme.com'
      category: service
      reasoning: (no reasoning captured)
    - name: MkDocs
      url: 'https://www.mkdocs.org'
      category: service
      reasoning: (no reasoning captured)
    - name: Notion
      url: 'https://www.notion.so'
      category: service
      reasoning: (no reasoning captured)
    - name: Diátaxis Framework
      url: 'https://diataxis.fr'
      category: article
      reasoning: (no reasoning captured)
    - name: Architecture Decision Records
      url: 'https://adr.github.io'
      category: article
      reasoning: (no reasoning captured)
    - name: Documentation Guide
      url: 'https://documentation.divio.com/'
      category: article
      reasoning: (no reasoning captured)
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Documentation has a reputation problem. Most engineers associate it with
  something they're supposed to do after the work is done — a tax on shipping,
  written to satisfy a process requirement rather than help a human being. That
  reputation is earned by bad documentation, not by documentation itself. Good
  documentation is some of the highest-leverage work an engineer can do, because
  it multiplies everyone who comes after them. Bad documentation is worse than
  no documentation, because it takes time to read and still leaves people
  confused.


  In production systems, the cost of missing documentation shows up in a few
  predictable ways. The most acute version is a 3am incident where the on-call
  engineer stares at an unfamiliar service, has no runbook to follow, and has to
  either wake someone up or improvise — both options adding time and risk to the
  outage. A good runbook for a service you rarely touch is worth hours of
  investigation time. The slower, more insidious cost shows up in onboarding: a
  new engineer spends their first two months reconstructing institutional
  knowledge that exists in three people's heads, and those three people spend a
  total of forty hours answering the same questions in Slack. Write that down
  once and you get those hours back every time someone new joins.


  The 80/20 for production documentation is: runbooks first, then architectural
  decision records (ADRs), then onboarding guides, then API references. Runbooks
  matter most because they're consumed under pressure. An ADR explaining why you
  chose Kafka over RabbitMQ doesn't need to be perfect, but a runbook for
  restarting a stateful service needs to be correct, up-to-date, and written for
  someone who has never touched that service before. ADRs matter because
  architectural decisions made without written rationale become tribal knowledge
  — three years later, nobody remembers why the system is built the way it is,
  and the team either reverses decisions that had good reasons or perpetuates
  bad patterns because they're afraid to change something they don't understand.


  The dominant failure modes are staleness and orphanhood. Documentation rots. A
  runbook written for the old Kubernetes deployment process breaks the first
  time someone follows it against the new Helm chart setup. The fix isn't to
  write more documentation — it's to treat documentation updates as part of the
  definition of done for any change that affects a documented system. If you're
  modifying how a service restarts, the PR isn't done until the runbook reflects
  the new procedure. The second failure mode is orphaned documentation: docs
  that exist but nobody can find because they're scattered across three wikis, a
  GitHub repo, a Notion workspace, and a shared Google Drive folder from 2021.
  Consolidation matters more than completeness — a single slightly imperfect
  source of truth beats a comprehensive but fragmented one.


  The mental model is to think of documentation as an interface to institutional
  knowledge. Code is the interface to what the system does now. Documentation is
  the interface to why it does it, how to operate it, and how to change it
  safely. Like any interface, it needs to be maintained, it needs to be
  findable, and it needs to be written for its actual users — not for the person
  who already knows the answer, but for the person who doesn't. A runbook
  written as a memory aid for its author is not a runbook; it's a note to self.


  Documentation sits in the growth-and-governance phase of production maturity
  because it's the mechanism by which an organization stops depending on
  specific individuals to function. Early-stage teams can survive on tribal
  knowledge. Scaling teams cannot. The point at which documentation becomes
  critical is usually visible in retrospect — after the engineer who knew how
  the auth system worked left, and the team spent a month piecing it back
  together. The better strategy is to write the documentation before that person
  leaves, while you can still ask them questions.
pitfalls:
  - title: 'Runbooks Written for the Author, Not the Reader'
    explanation: >-
      A runbook that reads as a memory aid for its author — skipping steps that
      seem obvious, referencing context only the original engineer has — fails
      the person who needs it most: someone unfamiliar with the service, under
      pressure at 3am. Every runbook should be validated by having an engineer
      who did not write it attempt to follow it cold. If they get stuck, that is
      a bug in the runbook.
  - title: Documentation That Is Not Updated as Part of the Change
    explanation: >-
      Runbooks and architectural docs rot the moment the system changes without
      an accompanying doc update. A runbook for the old Kubernetes deployment
      process actively misleads an engineer attempting to use it against the new
      Helm chart setup. Treat doc updates as part of the definition of done: if
      a PR modifies how a service is restarted, deployed, or configured, the
      runbook must change in the same PR.
  - title: Knowledge Scattered Across Multiple Systems With No Canonical Source
    explanation: >-
      Docs spread across an old Confluence instance, a GitHub repo, a Notion
      workspace, and a shared Google Drive folder create a scavenger hunt during
      an incident. A slightly imperfect single source of truth is more useful
      than comprehensive but fragmented documentation. Consolidate, redirect old
      locations, and enforce a single home for each type of document so
      engineers know where to look without thinking.
  - title: No Architecture Decision Records for Why the System Is Built This Way
    explanation: >-
      Without written rationale for architectural choices, decisions made for
      good reasons become tribal knowledge. Three years later the team either
      reverses sound decisions or perpetuates bad patterns out of fear of
      changing something they do not understand. Write an ADR at decision time,
      even a brief one: the decision, the context, and the alternatives
      considered. The investment is low; the compounding value is high.
  - title: Waiting Until After the Work Is Done to Write Documentation
    explanation: >-
      Documentation written as a post-ship afterthought is written by an
      engineer who has already moved on, is under-resourced by definition, and
      reflects memory rather than the live system. Write runbooks alongside
      implementation, not after. The engineer who just built the feature is the
      most qualified person to document it and will never be more available to
      do so than right now.
codeExamples:
  - language: bash
    title: Pre-commit hook enforcing doc updates
    code: |-
      #!/usr/bin/env bash
      # .git/hooks/pre-commit
      # Block commits that touch src/ without also touching docs/

      set -euo pipefail

      CHANGED_SRC=$(git diff --cached --name-only | grep -E '^src/' || true)
      CHANGED_DOCS=$(git diff --cached --name-only | grep -E '^docs/' || true)

      if [[ -n "$CHANGED_SRC" && -z "$CHANGED_DOCS" ]]; then
        echo "ERROR: You modified files under src/ but did not update docs/" >&2
        echo "Changed src files:" >&2
        echo "$CHANGED_SRC" | sed 's/^/  /' >&2
        echo "" >&2
        echo "Update or add a doc in docs/ before committing, or bypass with:" >&2
        echo "  SKIP_DOC_CHECK=1 git commit" >&2
        [[ "${SKIP_DOC_CHECK:-}" == "1" ]] && exit 0
        exit 1
      fi

      exit 0
    reasoning: >-
      A pre-commit hook that fails fast when src/ changes are not accompanied by
      docs/ changes encodes the 'docs as part of definition of done' principle
      directly into the workflow, making staleness a build-time error rather
      than a process aspiration.
  - language: yaml
    title: MkDocs config with enforced doc structure
    code: |-
      # mkdocs.yml — single source of truth for all team docs
      site_name: Iceberg Engineering Docs
      site_url: https://docs.iceberg.internal
      docs_dir: docs
      strict: true

      theme:
        name: material
        features:
          - navigation.sections
          - search.highlight

      nav:
        - Home: index.md
        - Runbooks:
          - Auth Service: runbooks/auth-service.md
          - Database Failover: runbooks/db-failover.md
        - ADRs:
          - "ADR-001: Event bus choice": adrs/001-event-bus.md
          - "ADR-002: Auth strategy": adrs/002-auth-strategy.md
        - Onboarding: onboarding/getting-started.md
        - API Reference: api/reference.md

      plugins:
        - search
        - git-revision-date-localized:
            enable_creation_date: true
        - broken-links

      markdown_extensions:
        - admonition
        - pymdownx.highlight
    reasoning: >-
      An explicit nav structure in the site config forces every doc category
      (runbooks, ADRs, onboarding, API reference) to be a first-class citizen
      with a known location, directly solving the orphaned-documentation problem
      where docs are scattered across multiple wikis and drives.
difficulty: beginner
estimatedHours: 2
tldr: >-
  Write accurate runbooks, decision records, and onboarding guides so knowledge
  survives when people leave and on-call engineers can fix things at 3am without
  guessing.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.870Z'
---
<!-- user notes -->
