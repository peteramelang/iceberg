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
      vendor: Docusaurus (Meta)
      source: ai-researcher
    - name: GitBook
      url: 'https://www.gitbook.com'
      category: service
      reasoning: (no reasoning captured)
      source: ai-researcher
    - name: ReadMe
      url: 'https://readme.com'
      category: service
      reasoning: (no reasoning captured)
      source: ai-researcher
    - name: MkDocs
      url: 'https://www.mkdocs.org'
      category: service
      reasoning: (no reasoning captured)
      source: ai-researcher
    - name: Notion
      url: 'https://www.notion.so'
      category: service
      reasoning: (no reasoning captured)
      source: ai-researcher
    - name: Diátaxis Framework
      url: 'https://diataxis.fr'
      category: article
      reasoning: (no reasoning captured)
      vendor: Diátaxis (Daniele Procida)
      source: ai-researcher
    - name: Architecture Decision Records
      url: 'https://adr.github.io'
      category: article
      reasoning: (no reasoning captured)
      vendor: ADR community
      source: ai-researcher
    - name: Documentation Guide
      url: 'https://documentation.divio.com/'
      category: article
      reasoning: (no reasoning captured)
      vendor: Divio
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
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
