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
  researchedAt: '2026-05-13T23:57:18.043Z'
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
  - title: Alert fatigue from unactionable or noisy alerts
    explanation: >-
      When most pages require no real action—or require staring at dashboards
      trying to decide if something is wrong—engineers stop treating alerts as
      urgent signals. The fix is to audit alerts regularly: if an alert fired
      and the on-call person did nothing, the alert should be deleted or
      downgraded. Every alert that fires should require a specific human action.
  - title: 'No escalation path, or one that feels like failure'
    explanation: >-
      Engineers left alone at 2 AM without a clear escalation path will either
      heroically debug for hours or make risky changes under pressure.
      Escalation should be normalized and fast—the engineer who escalates a P1
      after 10 minutes is making the right call, and team norms need to say so
      explicitly.
  - title: Putting engineers on-call before they are trained
    explanation: >-
      An on-call rotation that includes engineers who have never seen the system
      under failure conditions is a liability. Shadow rotations—pairing a new
      engineer with an experienced one for one or two full rotations before solo
      shifts—are skipped constantly and regretted just as constantly.
  - title: Treating toil as overhead rather than a bug
    explanation: >-
      Every manual remediation step performed during an incident is a bug in
      your automation. Teams that never allocate sprint capacity to reducing
      on-call burden—scripting runbooks, adding self-healing, pruning
      alerts—accumulate a growing tax on every on-call engineer until people
      start leaving or avoiding the rotation.
  - title: No structured handoff between shifts
    explanation: >-
      When the outgoing on-call engineer leaves no record of what happened
      during their shift, the incoming engineer starts blind. A brief written
      handoff noting open issues, recent changes, and anything to watch means
      the next person is not starting from zero at the worst possible moment.
  - title: Blameful post-incident reviews that fix nothing structurally
    explanation: >-
      Post-mortems that focus on who made the mistake produce defensive behavior
      and hide the real failure modes in the system. Blameless reviews that
      focus on what conditions made the failure possible—and produce concrete
      action items to change those conditions—are the feedback loop that
      actually prevents recurrence.
codeExamples:
  - language: python
    title: Compute Current On-Call From Schedule
    code: |-
      from datetime import datetime, timezone
      from dataclasses import dataclass
      from typing import List

      @dataclass
      class Engineer:
          name: str
          email: str
          phone: str

      # Define the rotation — order determines who is primary each week
      ROTATION: List[Engineer] = [
          Engineer('alice', 'alice@example.com', '+15550001'),
          Engineer('bob',   'bob@example.com',   '+15550002'),
          Engineer('carol', 'carol@example.com', '+15550003'),
          Engineer('dave',  'dave@example.com',  '+15550004'),
      ]

      # Epoch of first on-call week (Monday 00:00 UTC)
      ROTATION_START = datetime(2024, 1, 1, tzinfo=timezone.utc)
      WEEK_SECONDS = 7 * 24 * 3600

      def current_on_call(now: datetime | None = None) -> Engineer:
          now = now or datetime.now(timezone.utc)
          elapsed = (now - ROTATION_START).total_seconds()
          week_index = int(elapsed // WEEK_SECONDS)
          return ROTATION[week_index % len(ROTATION)]

      if __name__ == '__main__':
          oncall = current_on_call()
          print(f'On-call: {oncall.name} ({oncall.email})')
    reasoning: >-
      A simple modular-arithmetic rotation calculator shows the core logic teams
      build before reaching for PagerDuty — understanding this makes any tooling
      choice deliberate rather than accidental.
  - language: bash
    title: Audit Last Week Alert Volume
    code: >-
      #!/usr/bin/env bash

      # Summarize pages from PagerDuty CLI for the last 7 days.

      # Requires: pd (PagerDuty CLI) authenticated.

      set -euo pipefail


      SINCE=$(date -u -v-7d '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null \
           || date -u -d '7 days ago' '+%Y-%m-%dT%H:%M:%SZ')

      echo "=== Alert volume since $SINCE ==="


      pd incident list \
        --since "$SINCE" \
        --output json \
      | jq -r '
          group_by(.service.summary)
          | map({ service: .[0].service.summary, count: length })
          | sort_by(-.count)
          | .[] | "\(.count)\t\(.service)"
        ' \
      | column -t


      echo ""

      echo "Total: $(pd incident list --since "$SINCE" --output json | jq
      length) pages"
    reasoning: >-
      Alert-volume auditing per service is the first step to reducing on-call
      toil — this script makes that review a one-liner so teams actually run it.
difficulty: intermediate
estimatedHours: 3
tldr: >-
  Rotate engineers on production duty and automate fixes so on-call doesn't mean
  staying awake all night—the system should self-heal, not require heroes.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:31:47.569Z'
---
<!-- user notes -->
