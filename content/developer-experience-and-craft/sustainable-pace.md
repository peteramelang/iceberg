---
slug: sustainable-pace
title: Sustainable Pace
phase: developer-experience-and-craft
order: 7
summary: >-
  Recognizing burnout, on-call recovery, deep-work cycles — the
  engineering-discipline version of mental health.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Sustainable pace is the XP principle that a team should work at a rate it
  could maintain indefinitely — no death marches, no heroics that drain reserves
  for future sprints. In practice, sustainable pace means protecting focused
  work blocks (deep work), designing on-call rotations so engineers get adequate
  recovery after pages, and recognising that cumulative sleep debt and constant
  context-switching produce bugs that cost more to fix than the time saved by
  working late. The concept predates agile: Paul Graham's 2009 essay 'Maker's
  Schedule, Manager's Schedule' articulated the structural conflict between
  interruption-based management schedules and the long focused blocks developers
  need.


  Burnout in software engineering has a distinct pattern: it often presents not
  as exhaustion but as cynicism and depersonalisation — a loss of care about
  work quality. Will Larson's engineering management writing and Alex
  Soojung-Kim Pang's book 'Rest' provide evidence-based frameworks for
  recognising and reversing this trajectory. Key practices include strict
  work-hour boundaries, protected focus time (no meetings before 11am, or
  meeting-free Wednesdays), explicit on-call recovery days, and regular
  retrospectives on workload distribution.


  From a craft perspective, sustainable pace is also an engineering quality
  issue: teams that work unsustainable hours accumulate technical debt faster
  than they can pay it down, because tired engineers skip tests, skip
  documentation, and skip design review. The sustainable pace principle connects
  directly to practices like test-driven development (which requires the
  cognitive clarity to write tests first) and code review craft (which requires
  the patience to give thoughtful feedback rather than rubber-stamping).
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
lastUpdatedAt: '2026-05-14T12:26:04.515Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=mCcBpKbBFZo'
      title: 'Maker''s Schedule, Manager''s Schedule'
      author: Y Combinator
      durationMinutes: 7
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Y Combinator's reading of Paul Graham's canonical essay, the
        foundational short piece on why developers need protected time blocks
        distinct from manager schedules.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=WQPlWmQwMxQ'
      title: >-
        Developer Effectiveness: Reducing Friction in Your Development
        Environment
      author: InfoQ
      durationMinutes: 40
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Tim Cochran's InfoQ talk on developer effectiveness covers the feedback
        loops and environment factors that determine whether engineering work is
        sustainable or draining.
      source: ai-researcher
  articles:
    - url: 'https://paulgraham.com/makersschedule.html'
      title: 'Maker''s Schedule, Manager''s Schedule'
      kind: engineering-blog
      reasoning: >-
        The foundational essay on the structural incompatibility of management
        and maker time blocks — required reading for understanding sustainable
        pace for developers.
      author: Paul Graham
      source: ai-researcher
    - url: 'https://lethain.com/sustainable-on-call/'
      title: Sustainable On-call
      kind: engineering-blog
      reasoning: >-
        Will Larson's (Lethain) practical framework for designing on-call
        rotations that do not burn engineers out — the most cited
        engineering-management reference on the topic.
      author: Will Larson
      source: ai-researcher
    - url: 'https://martinfowler.com/bliki/SustainablePace.html'
      title: Sustainable Pace — Martin Fowler
      kind: engineering-blog
      reasoning: >-
        Martin Fowler's bliki entry defines the XP principle and links it to the
        broader agile context — the canonical concise definition from an
        authoritative source.
      publisher: martinfowler.com
      author: Martin Fowler
      source: ai-researcher
  services:
    - name: PagerDuty
      url: 'https://www.pagerduty.com'
      category: incident-management
      reasoning: >-
        The dominant on-call scheduling and incident-response platform; its
        schedule and escalation policy features directly affect whether on-call
        is sustainable.
      vendor: PagerDuty
      source: ai-researcher
    - name: Rootly
      url: 'https://rootly.com'
      category: incident-management
      reasoning: >-
        Incident management platform with retrospective tooling that helps teams
        measure and improve on-call burden over time.
      vendor: Rootly
      source: ai-researcher
    - name: Reclaim.ai
      url: 'https://reclaim.ai'
      category: calendar-automation
      reasoning: >-
        AI calendar tool that automatically protects focus blocks and schedules
        meetings in windows that do not fragment deep work time.
      vendor: Reclaim
      source: ai-researcher
    - name: Clockwise
      url: 'https://www.getclockwise.com'
      category: calendar-automation
      reasoning: >-
        Team calendar optimiser that coordinates meeting scheduling across a
        team to preserve uninterrupted focus blocks for every member.
      vendor: Clockwise
      source: ai-researcher
  courses:
    - url: 'https://www.coursera.org/learn/the-science-of-well-being'
      title: The Science of Well-Being
      provider: Coursera (Yale University)
      paid: false
      reasoning: >-
        Yale's evidence-based well-being course by Laurie Santos is free to
        audit and provides the psychological foundations for understanding and
        preventing burnout.
      instructor: Laurie Santos
      source: ai-researcher
    - url: 'https://lethain.com/staff-engineer/'
      title: 'Staff Engineer: Leadership Beyond the Management Track'
      provider: Lethain.com
      paid: true
      reasoning: >-
        Will Larson's book and companion site cover sustainable engineering
        leadership including pace, on-call design, and workload management —
        essential for senior engineers.
      instructor: Will Larson
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.515Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
