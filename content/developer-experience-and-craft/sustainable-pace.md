---
slug: sustainable-pace
title: Sustainable Pace
phase: developer-experience-and-craft
order: 7
summary: >-
  Recognizing burnout, on-call recovery, deep-work cycles — the
  engineering-discipline version of mental health.
tldr: >-
  Protect focused work time, rotate on-call duty, and recognize that sleep debt
  kills productivity. Teams perform best at consistent speed, not sprints.
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
  Sustainable pace is one of those principles that sounds like a soft concession
  to human fragility until you understand it as an engineering quality
  constraint. The argument is not that engineers deserve rest, though they do.
  The argument is that tired engineers write worse code, make worse decisions,
  skip the tests and reviews that prevent future incidents, and accumulate
  technical debt faster than they reduce it. A team grinding through a death
  march is not going faster — it is spending future velocity to fund an illusion
  of current velocity, and the bill comes due in the form of regressions,
  burnout attrition, and a codebase that nobody fully understands anymore.


  The 80/20 is two things: protect the focused work block, and design the
  on-call rotation so it does not drain people. Most of the productivity loss in
  software teams comes not from engineers who are not working hard enough but
  from engineers whose deep work is fragmented by meetings, Slack interruptions,
  and unfocused on-call shifts that eat sleep without providing recovery time.
  Paul Graham's Maker's Schedule observation — that a single meeting in the
  middle of the day effectively destroys the afternoon for a developer — is
  twenty years old and remains as accurate as ever. The fix is structural: move
  meetings to the edges of the day, protect multi-hour blocks in the calendar
  explicitly, and treat interruption of those blocks as a cost that requires
  justification rather than a default.


  On-call deserves its own attention because it is the most predictable source
  of unsustainable pace in production engineering teams. An on-call rotation
  that pages three times a night is not sustainable by definition — sleep
  deprivation at that level produces the same cognitive impairment as alcohol
  intoxication, and the engineers in that rotation are making architectural and
  code decisions in that state. The right response to a noisy on-call rotation
  is not resilience training; it is to treat each page as a defect in the system
  and fix it. Teams that do this consistently drive their alert volume down over
  time. Teams that treat pages as unavoidable background noise accumulate them.


  Burnout in software specifically tends to present differently from the popular
  image of exhaustion. The clinical definition includes cynicism and
  depersonalisation — a flattening of investment in work quality — alongside
  exhaustion, and in engineering these often come before the exhaustion is
  obvious. An engineer who stops caring whether the tests pass, or who approves
  PRs without reading them, or who describes their work as pointless and
  misaligned is showing burnout symptoms that should prompt intervention, not
  more pressure. Will Larson's framing of burnout as a systems problem — created
  by specific structural conditions in the work environment, not primarily by
  individual weakness — is the right level of analysis. The individual cannot
  will their way out of a structurally unsustainable role.


  The connection between sustainable pace and code quality is not incidental —
  it is mechanistic. Test-driven development requires the cognitive clarity to
  think about the problem specification before the implementation. Code review
  craft requires the patience and generosity to give thoughtful feedback rather
  than rubber-stamp a PR to clear the queue. Architecture decisions made under
  time pressure consistently show the characteristic marks of fatigue: narrowed
  consideration of alternatives, underestimation of future maintenance cost, and
  optimisation for short-term shipping over long-term operability. You cannot
  have a high-quality engineering culture and an unsustainable pace
  simultaneously; eventually the pace degrades the culture, and the culture
  stops enforcing the quality practices that might have slowed the pace.


  In the ecosystem of developer craft, sustainable pace is the meta-practice
  that all the others depend on. Documentation-driven development requires the
  patience to write before you build. Systematic debugging requires the
  equanimity to hypothesize before you change. Good code review requires time.
  None of these practices survive a team under sustained deadline pressure
  unless the sustainable pace principle is treated as a non-negotiable
  constraint rather than a nice-to-have aspiration.
pitfalls:
  - title: Celebrating heroics as cultural asset
    explanation: >-
      Teams that celebrate engineers who regularly work nights and weekends
      normalize unsustainable hours as the standard, masking systemic planning
      failures. Heroics indicate that estimation, scope, or staffing is broken —
      the correct response is to fix the process, not to reward the symptom.
  - title: On-call with no recovery time after pages
    explanation: >-
      Engineers who take midnight pages and then attend full days of meetings
      the next day accumulate sleep debt that degrades judgment and increases
      error rates over weeks. Build explicit on-call recovery — a late start,
      reduced meetings, or a comp day — into the on-call policy.
  - title: Burnout misidentified as motivation or attitude problem
    explanation: >-
      Burnout presents as cynicism and detachment rather than visible
      exhaustion, causing managers to diagnose it as a performance or attitude
      issue instead of a workload one. The observable symptom is declining care
      about quality — a signal that requires workload intervention, not
      performance management.
  - title: No protected deep-work blocks in team schedule
    explanation: >-
      Constant meeting fragmentation prevents the sustained focus that complex
      engineering requires, creating a situation where engineers work long hours
      yet accomplish less than they would in shorter, uninterrupted blocks.
      Protect at least two contiguous focus hours daily for the entire
      engineering team.
  - title: Technical debt accumulation accelerates under sustained overwork
    explanation: >-
      Tired engineers skip tests, defer refactoring, and write documentation
      they intend to revisit — compounding the future workload that's already
      overwhelming. The debt accrued during a crunch period often costs more to
      repay than the time saved by the crunch.
codeExamples:
  - language: bash
    title: Deep-Work Block Scheduler with Notification Silencing
    code: |-
      #!/bin/bash
      for day in {1..5}; do
        for start in "09:00" "14:00"; do
          uuid=$(uuidgen)
          event="BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:$uuid\nDTSTART:20260515T${start}00Z\nDTEND:20260515T$(printf '%02d' $((10#${start%:*}+1))):30:00Z\nSUMMARY:Deep Work - No Interrupts\nEND:VEVENT\nEND:VCALENDAR"
          echo -e "$event" | curl -s -X POST https://calendar-api/events -d @- > /dev/null
          defaults write com.Slack.Slack SuppressNotifications -bool true 2>/dev/null
          sleep 5400
          defaults write com.Slack.Slack SuppressNotifications -bool false 2>/dev/null
        done
      done
    reasoning: >-
      Protects deep-work cycles by blocking calendar time and muting
      notifications, preventing context-switching that burns out engineers
      during high-focus periods.
difficulty: beginner
estimatedHours: 2
lastUpdatedAt: '2026-05-14T12:31:47.557Z'
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
