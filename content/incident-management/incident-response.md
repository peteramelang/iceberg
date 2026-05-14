---
slug: incident-response
title: Incident Response
phase: incident-management
order: 1
summary: >-
  Execute a repeatable process for detecting, communicating, mitigating, and
  resolving production incidents with defined roles and runbooks.
definition: >-
  Incident response is a structured, repeatable process for managing the full
  lifecycle of production incidents—from detection through resolution and
  post-incident analysis. It establishes clear roles (Incident Commander,
  Operations Lead, Communications Lead), communication protocols, and decision
  frameworks to minimize disruption and restore service quickly. Effective
  incident response prioritizes mitigation over root-cause analysis, ensures
  coordinated action across teams, and maintains live documentation of decisions
  and status updates throughout the incident.


  The foundation of successful incident response is preparation: defining
  severity levels, training personnel in advance, establishing communication
  channels before incidents occur, and practicing through drills and
  simulations. The process encompasses four key phases: detecting anomalies and
  declaring incidents early; coordinating response efforts while communicating
  transparently to stakeholders; executing mitigation to restore service; and
  conducting post-mortems to extract learnings and improve future response.
  Organizations adopting structured incident response frameworks (such as the
  Incident Command System adapted from emergency responders) see measurable
  improvements in mean time to acknowledge, mean time to resolve, and team
  confidence during crises.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - title: Incident Response Response – PagerDuty
      url: 'https://response.pagerduty.com'
      kind: engineering-blog
      reasoning: ''
    - title: Incident Response – Google SRE Workbook
      url: 'https://sre.google/workbook/incident-response/'
      kind: canonical-doc
      reasoning: ''
    - title: Managing Incidents – Google SRE Book
      url: 'https://sre.google/sre-book/managing-incidents/'
      kind: canonical-doc
      reasoning: ''
    - title: 'Incident Response: Best Practices for Quick Resolution – Atlassian'
      url: 'https://www.atlassian.com/incident-management/incident-response'
      kind: engineering-blog
      reasoning: ''
  services:
    - name: PagerDuty
      url: 'https://www.pagerduty.com'
      category: platform
      reasoning: ''
    - name: Incident.io
      url: 'https://incident.io'
      category: platform
      reasoning: ''
    - name: FireHydrant
      url: 'https://firehydrant.com'
      category: platform
      reasoning: ''
    - name: Rootly
      url: 'https://www.rootly.com'
      category: platform
      reasoning: ''
    - name: Atlassian Incident Management
      url: 'https://www.atlassian.com/incident-management'
      category: platform
      reasoning: ''
  courses:
    - title: Incident Response Training Course
      provider: PagerDuty
      url: 'https://response.pagerduty.com'
      paid: false
      reasoning: ''
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The first time your production system goes down hard, everything that seemed
  clear in theory becomes muddy in practice. Who's in charge? Who's talking to
  customers? Is someone investigating the root cause while someone else is
  trying a mitigation? Are you actually coordinating, or are three people all
  pulling levers at the same time while a fourth writes a postmortem? Without a
  pre-agreed structure, incidents become chaotic, and chaos costs time. Every
  minute of uncoordinated response is a minute the service stays down. Incident
  response isn't about having the answer — it's about having a process that lets
  you find the answer fast without people getting in each other's way.


  The single most important concept in incident response is the separation
  between mitigation and root cause analysis. These two goals are in tension
  during an incident: finding out exactly why something broke often requires
  careful investigation and time, but restoring service usually just requires
  finding the fastest lever to pull. Many incidents extend far longer than
  necessary because engineers spend the critical first hour debugging rather
  than mitigating. Rollback the last deploy. Reroute traffic. Scale up the
  affected service. Disable the feature flag. These actions take minutes,
  restore service, and give you breathing room to understand what actually
  happened — which you can do much more clearly once the bleeding has stopped.
  The rule is: always ask "what can we do right now to reduce user impact"
  before diving into investigation.


  Structured roles make a dramatic difference. In a chaotic incident, everyone
  watches the dashboards and offers suggestions. In a well-run one, the Incident
  Commander owns the timeline and decisions, the technical leads own their
  domains, and one person owns communication to stakeholders so that information
  flows out without pulling the technical team out of focus. These don't need to
  be formal titles — what matters is that someone is explicitly holding each
  role, not that multiple people assumed someone else was. The communication
  lead job is especially underrated: updating the status page, writing internal
  Slack messages, and managing executive questions are each individually small
  but collectively they'll eat a senior engineer's entire bandwidth if
  unassigned.


  The dominant failure modes look like this. Alert fatigue causes the team to be
  slow to declare an incident, because the alert has fired before and been a
  false positive. Nobody declares an incident at all because the scope seems
  small, then the small problem expands while nobody is coordinating. The
  technical investigation gets derailed chasing a plausible but wrong hypothesis
  for forty-five minutes. Two engineers start applying conflicting changes
  simultaneously. The incident commander disappears to write the postmortem
  while the incident is still active. Any of these can add an hour to resolution
  time. The antidote is practiced muscle memory: clear severity definitions so
  the team knows when to declare, a single coordination channel everyone joins,
  and an explicit handoff moment when mitigation hands off to investigation.


  Postmortems are where incidents pay dividends beyond the immediate crisis. The
  goal of a postmortem isn't blame — it's extracting the organizational
  knowledge that the incident surfaced. Good postmortems focus on the
  contributing factors (systems conditions, tooling gaps, process failures)
  rather than individual mistakes, and they produce concrete action items that
  actually get prioritized. The ones that actually improve reliability are
  specific: "add an alert for X condition" or "add a runbook for Y scenario"
  rather than "improve our monitoring." Run enough postmortems well, and your
  incident response gets faster over time because you're building up a library
  of known failure modes and tested mitigations. That compounding effect is the
  real value of the process.
pitfalls:
  - title: Investigating root cause before mitigating impact
    explanation: >-
      Engineers instinctively want to understand why something broke before
      fixing it, but during an active incident this instinct is expensive.
      Spending the first hour debugging the cause while users are experiencing
      errors is the most common way incidents run long. Establish the rule up
      front: first ask 'what can we do right now to reduce user impact' —
      rollback, reroute, disable the feature flag — then investigate once the
      bleeding has stopped.
  - title: No declared roles means everyone watches dashboards
    explanation: >-
      When nobody is explicitly the Incident Commander, every senior engineer
      joins the war room, watches the same graphs, and offers competing
      suggestions. This creates noise rather than coordination. Assign roles
      explicitly at incident declaration — one person owns decisions and
      timeline, one owns external communication — so the technical team can
      focus without being interrupted by status questions.
  - title: Alert fatigue delays incident declaration
    explanation: >-
      An alert that has fired dozens of times without consequence trains
      engineers to ignore it. When it fires during a real incident, the team is
      slow to take it seriously, and the delay compounds. Regularly prune alerts
      that are not actionable, tune thresholds so signals are genuine, and
      define explicit severity criteria so anyone can declare an incident
      without waiting for consensus.
  - title: Multiple engineers applying conflicting changes simultaneously
    explanation: >-
      Without coordination, two engineers can simultaneously roll back different
      services, modify the same config, or apply contradictory mitigations. Each
      individual action is reasonable; together they create a compound failure
      that is harder to debug than the original. The Incident Commander's job is
      to serialize changes — one action at a time, wait for the result, then
      decide the next step.
  - title: Postmortems produce vague action items that never ship
    explanation: >-
      A postmortem that concludes with 'improve our monitoring' or 'better
      communication' generates no real change. Vague actions have no owner, no
      deadline, and no definition of done, so they age in a backlog and the next
      incident finds the same gap. Every action item must name a specific
      change, an owner, and a target date — and must be tracked alongside other
      engineering work, not in a separate postmortem doc.
  - title: Status page and customer communication left unowned
    explanation: >-
      During an incident, updating the status page, writing internal
      communication, and handling executive questions collectively consume a
      full engineer's bandwidth. When nobody is explicitly assigned to this,
      those questions pull the technical responders out of focus repeatedly
      throughout the incident. Assign one non-technical lead or a dedicated
      communications role at declaration, and protect the technical team from
      interrupt-driven status requests.
codeExamples:
  - language: bash
    title: Incident Declaration and Runbook Trigger Script
    code: >-
      #!/usr/bin/env bash

      # declare-incident.sh — creates a timestamped incident channel and posts a
      runbook link

      set -euo pipefail


      SEVERITY="${1:?Usage: declare-incident.sh <sev1|sev2|sev3> <description>}"

      DESCRIPTION="${2:?description required}"

      INCIDENT_ID="inc-$(date -u +%Y%m%d-%H%M%S)"

      CHANNEL="incident-${INCIDENT_ID}"

      RUNBOOK_BASE="https://runbooks.internal/"


      echo "Declaring ${SEVERITY} incident: ${INCIDENT_ID}"

      echo "Description: ${DESCRIPTION}"


      # Create a Slack channel for coordination (requires slack CLI)

      # slack conversations create --name "${CHANNEL}" --private


      # Page the on-call engineer

      if [[ "${SEVERITY}" == "sev1" ]]; then
        echo "[PD] Paging on-call via PagerDuty..."
        # pd trigger --description "${SEVERITY}: ${DESCRIPTION}" --urgency high
      fi


      # Post initial incident message with role assignments

      cat <<EOF

      === INCIDENT DECLARED ===

      ID:          ${INCIDENT_ID}

      Severity:    ${SEVERITY}

      Description: ${DESCRIPTION}

      Channel:     #${CHANNEL}

      Runbook:     ${RUNBOOK_BASE}${SEVERITY}

      IC:          <assign incident commander>

      Comms:       <assign communications lead>

      Started:     $(date -u +"%Y-%m-%dT%H:%M:%SZ")

      EOF


      echo "Incident ${INCIDENT_ID} declared. Join #${CHANNEL} to coordinate."
    reasoning: >-
      Codifies the critical first step of incident response — fast, repeatable
      declaration with role placeholders and runbook link — so no time is lost
      to process confusion when a real incident hits.
  - language: python
    title: Structured Incident Timeline Logger
    code: >-
      """incident_log.py — append timestamped entries to an incident timeline
      file."""

      import json

      import sys

      from datetime import datetime, timezone

      from pathlib import Path


      LOG_DIR = Path("/var/log/incidents")


      def log_event(incident_id: str, author: str, kind: str, message: str) ->
      None:
          LOG_DIR.mkdir(parents=True, exist_ok=True)
          log_file = LOG_DIR / f"{incident_id}.jsonl"
          entry = {
              "ts": datetime.now(timezone.utc).isoformat(),
              "incident": incident_id,
              "author": author,
              "kind": kind,   # e.g. update | mitigation | escalation | resolved
              "message": message,
          }
          with log_file.open("a") as f:
              f.write(json.dumps(entry) + "\n")
          print(f"[{entry['ts']}] ({kind}) {message}")

      def replay_timeline(incident_id: str) -> None:
          log_file = LOG_DIR / f"{incident_id}.jsonl"
          if not log_file.exists():
              print("No timeline found for", incident_id)
              return
          for line in log_file.read_text().splitlines():
              e = json.loads(line)
              print(f"{e['ts']}  {e['author']:15s}  [{e['kind']:12s}]  {e['message']}")

      if __name__ == "__main__":
          inc = "inc-20260514-143000"
          log_event(inc, "alice", "update",     "High error rate on payments-api, investigating")
          log_event(inc, "bob",   "mitigation", "Rolled back to v2.3.1; error rate dropping")
          log_event(inc, "alice", "resolved",   "Error rate back to baseline, incident closed")
          print()
          replay_timeline(inc)
    reasoning: >-
      Provides an append-only, structured incident timeline that feeds directly
      into postmortems, ensuring the chronology of decisions and mitigations is
      captured in real time rather than reconstructed from memory.
difficulty: intermediate
estimatedHours: 5
tldr: >-
  When the system goes down, follow a practiced process with clear roles so you
  fix it fast without confusion—and learn from each incident to prevent the next
  one.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:44:38.108Z'
---
<!-- user notes -->
