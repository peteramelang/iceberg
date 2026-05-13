---
slug: on-call-rotations
title: On-Call Rotations
phase: incident-management
order: 2
summary: >-
  Establish sustainable on-call schedules, escalation policies, and
  toil-reduction practices so that production issues always reach a human
  quickly without burning out the team.
definition: >-
  Establish sustainable on-call schedules, escalation policies, and
  toil-reduction practices.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles: []
  services: []
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  On-call rotations are one of those things that look like a process problem but
  are actually a system design problem. The surface symptom is that engineers
  get paged too much and burn out. The root cause is usually that the system
  produces too many alerts, too many of which are either noise or require manual
  intervention that could be automated. A team that hasn't thought carefully
  about on-call will end up with a rotation that nobody wants to be on, high
  turnover on the team, and eventually a culture where production is someone
  else's problem. That's a trajectory that kills products.


  The 80/20 of on-call is: most of the suffering comes from alert quality, not
  rotation structure. Before you worry about whether to do weekly rotations or
  biweekly, ask how many alerts fired last week and how many required human
  action. If the answer is "dozens" and "not many," your rotation schedule is
  not your problem. Alerts should be actionable—meaning if you can't do
  something in response to an alert, it shouldn't wake anyone up. A high error
  rate is actionable. A metric that "looks a little elevated" is not. Most teams
  that struggle with on-call have let their alert set grow organically without
  ever pruning it, which means engineers spend 3 AM staring at dashboards trying
  to figure out if something is actually wrong. Fix that first.


  Escalation policies are where you see the second major failure mode: either
  there's no escalation path, so when the on-call person can't solve something
  they're just stuck alone at 2 AM, or the escalation path exists on paper but
  nobody actually uses it because escalating feels like admitting failure. The
  fix is cultural as much as technical—escalation should be normalized and fast,
  not a last resort. PagerDuty and Opsgenie both give you the mechanics; the
  harder work is making it psychologically safe to call someone. The engineer
  who escalates a P1 after 10 minutes rather than heroically debugging alone for
  two hours is doing the right thing, and that needs to be explicit in your team
  norms.


  The mental model that makes on-call sustainable is thinking of toil reduction
  as a first-class engineering project. Every time an alert fires and requires
  manual steps to resolve, you have a bug in your automation. Either the system
  should have self-healed, or the alert shouldn't have fired, or the remediation
  should be scripted so the on-call person is pressing a button rather than
  running commands from memory at midnight. Teams that track their on-call
  burden as a metric—how many pages per week, how many hours spent in incident
  response—and allocate actual sprint capacity to reducing it tend to have
  healthy rotations. Teams that treat on-call as overhead and never invest in
  reducing it end up with unmaintainable systems and exhausted people.


  Rotation structure matters, but it's secondary. The main things to get right
  are: rotations should be fair and predictable (people need to be able to plan
  their lives around them), nobody should be on-call without adequate training
  on the system they're responsible for, and there should be a real handoff
  process so the incoming on-call person knows what happened during the previous
  shift. Shadow rotations—where a new engineer pairs with an experienced one
  before taking solo shifts—are a low-tech, high-value practice that most teams
  skip and then regret. Post-incident reviews (blameless, focused on system
  improvement) are the feedback loop that keeps the rotation from repeating the
  same incidents.


  In the broader context of incident management, on-call is the human side of a
  system that also includes alerting, runbooks, observability, and your incident
  communication process. It doesn't work well in isolation from those things. If
  your runbooks are out of date, your on-call rotation will be full of engineers
  improvising. If your observability is weak, they'll be flying blind. The
  rotation itself is just the scheduling layer on top of all the other
  work—which is why improving on-call almost always leads you back to improving
  the system itself.
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
