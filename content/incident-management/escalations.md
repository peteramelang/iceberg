---
slug: escalations
title: Escalations
phase: incident-management
order: 5
summary: >-
  Define clear escalation paths for technical incidents and customer-impacting
  issues so the right people are looped in at the right severity threshold.
definition: >-
  Define clear escalation paths for technical incidents and customer-impacting
  issues so the right people are looped in at the right severity threshold.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: >-
        https://www.atlassian.com/incident-management/on-call/escalation-policies
      title: Escalation Policies for Effective Incident Management
      kind: tutorial
      reasoning: (no reasoning captured)
  services:
    - name: PagerDuty Incident Response Documentation
      url: 'https://response.pagerduty.com'
      category: platform
      reasoning: (no reasoning captured)
    - name: incident.io Blog - Escalation Patterns
      url: 'https://incident.io/blog'
      category: platform
      reasoning: (no reasoning captured)
    - name: PagerDuty Platform
      url: 'https://www.pagerduty.com'
      category: platform
      reasoning: (no reasoning captured)
    - name: incident.io Platform
      url: 'https://incident.io'
      category: platform
      reasoning: (no reasoning captured)
    - name: Atlassian Opsgenie (Jira Service Management)
      url: 'https://www.atlassian.com/software/opsgenie'
      category: platform
      reasoning: (no reasoning captured)
    - name: Atlassian Incident Management
      url: 'https://www.atlassian.com/incident-management'
      category: platform
      reasoning: (no reasoning captured)
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  An escalation path is one of those things that feels bureaucratic until you're
  in the middle of a major incident and realize nobody knows who to call. The
  on-call engineer has been debugging a production database issue for 45
  minutes, the outage is customer-visible, and they're not sure whether to wake
  up the database lead, the CTO, or the customer success team. Without a defined
  escalation path, that uncertainty itself becomes part of the incident — it
  adds delay, it creates confusion, and it often means the wrong people are
  looped in late or not at all.


  The value of clear escalation paths isn't that incidents become easier to
  handle; it's that decision-making overhead during an incident drops to near
  zero. When a Sev-1 is declared, everyone already knows what happens next:
  which channel gets notified, who becomes incident commander, which
  stakeholders need an update within 15 minutes, and at what point leadership
  gets pulled in. That pre-defined clarity lets engineers focus on fixing the
  problem rather than coordinating the response. The coordination is handled by
  the process.


  The 80/20 of escalations: define severity levels (two to four tiers is enough
  — don't over-engineer a five-level matrix), map each severity level to
  concrete response expectations (who gets paged, response time SLA,
  communication cadence), and write it all down somewhere the on-call engineer
  can find it in 30 seconds. The most common mistake is making escalation paths
  too complicated. A four-page document that defines 12 severity tiers with
  different stakeholder matrices and notification channels will not be read
  under pressure. A simple one-page reference card that fits in a runbook
  sidebar actually gets used.


  The failure modes cluster around two extremes: over-escalation and
  under-escalation. Over-escalation — waking up the CTO for a non-critical
  background job failure — erodes trust in the escalation process and burns out
  senior people on false alarms. Under-escalation — an engineer trying to handle
  a Sev-1 alone because they don't want to bother anyone — is more dangerous.
  Critical incidents get worse the longer a single person tries to manage them
  solo. The right behavior is to escalate earlier than feels comfortable; the
  cost of an unnecessary escalation is much lower than the cost of a delayed
  one. Most good escalation cultures actively reinforce this: nobody gets
  criticized for escalating too soon, but you do get a debrief if something blew
  up because escalation was delayed.


  Customer-facing escalations are a separate but connected path. When a
  production incident is impacting customers, the engineering escalation (fix
  the thing) and the customer escalation (communicate what's happening) need to
  run in parallel. These are different skills and different roles — an engineer
  debugging a database issue should not also be the person fielding customer
  support tickets and drafting a status page update. Having a clear handoff
  between technical incident response and customer communication prevents the
  scenario where the technical team is heads-down fixing an issue while
  customers have no information and are filing support tickets that pile up and
  compound the post-incident workload.


  The mental model that makes escalations work is to think of them as a decision
  tree, not a chain of command. When you hit a decision node in an incident —
  this is beyond my expertise, this requires infrastructure access I don't have,
  this is moving faster than I can handle alone — the escalation path tells you
  exactly which branch to take. It removes judgment calls from moments when
  judgment is impaired by stress and time pressure. Build the tree when
  everything is calm, test it occasionally in incident drills, and trust it when
  things go sideways.
pitfalls:
  - title: Engineers Trying to Handle Sev-1 Incidents Alone
    explanation: >-
      An on-call engineer who hesitates to escalate because they do not want to
      bother anyone is the most dangerous failure mode in an escalation process.
      Critical incidents get worse the longer a single person manages them solo
      — they miss things, lose track of time, and make worse decisions under
      compounding pressure. Build a culture where escalating earlier than feels
      comfortable is explicitly praised, not questioned, and where the cost of
      an unnecessary escalation is treated as near zero.
  - title: Escalation Paths Too Complex to Use Under Pressure
    explanation: >-
      A four-page document defining twelve severity tiers with different
      stakeholder matrices and notification channels will not be read by an
      engineer who is already debugging a production failure. Escalation
      procedures need to fit in a single sidebar of a runbook: severity
      definitions in plain language, the action for each level, and who to
      contact. Complexity that cannot be recalled under stress might as well not
      exist.
  - title: Technical Incident Response and Customer Communication Running as One Role
    explanation: >-
      An engineer debugging a database failure cannot simultaneously be the
      person drafting status page updates and fielding customer support tickets
      — each task degrades the other. Customer-facing communication and
      technical remediation require different skills and must run as parallel
      tracks with a clean handoff defined in the escalation process. Assign a
      separate incident communications owner as soon as a customer-visible Sev-1
      is declared.
  - title: Severity Levels Not Tied to Concrete Business Impact
    explanation: >-
      Severity tiers that are defined vaguely — 'high', 'medium', 'low' — lead
      to disagreement in the moment about which level applies and therefore what
      response is required. Severity should be defined in terms of observable,
      concrete impact: how many users are affected, which revenue-generating
      flows are broken, and whether data integrity is at risk. Concrete criteria
      remove the judgment call from an already stressful moment.
  - title: Escalation Process Never Tested Until a Real Incident
    explanation: >-
      Pager integrations that are configured but never tested, on-call rotations
      with incorrect contact information, and stakeholder notification lists
      that have not been updated in months will all fail simultaneously during
      your first major incident. Run escalation process drills — not just
      technical incident drills. Verify that pages reach the right people, that
      contacts are current, and that the on-call rotation reflects who is
      actually available.
codeExamples:
  - language: yaml
    title: Severity Levels and Escalation Paths Runbook
    code: |-
      # runbooks/escalation-policy.yaml
      ---
      description: >
        Escalation policy for production incidents. Read this before you need it.
        When in doubt, escalate earlier. The cost of an unnecessary page is
        lower than the cost of a delayed escalation.

      severity_levels:
        sev1:
          definition: Full service outage or data loss affecting all users
          examples:
            - Payments API returning 5xx for all requests
            - Production database unreachable
            - Data corruption confirmed
          response_time: 15 minutes
          immediate_actions:
            - Page on-call engineer (PagerDuty: "sev1-oncall")
            - Open incident channel: #inc-YYYYMMDD-<service>
            - Assign incident commander from on-call rotation
            - Post initial status page update within 10 minutes
          stakeholder_notify_after: 15 minutes (exec, customer-success, support)
          update_cadence: every 15 minutes until resolved

        sev2:
          definition: Partial outage or degraded performance affecting subset of users
          examples:
            - Checkout failing for 10% of users
            - Search returning stale results (>5 min lag)
          response_time: 30 minutes
          immediate_actions:
            - Page on-call engineer
            - Open thread in #incidents
          stakeholder_notify_after: 30 minutes if not resolved
          update_cadence: every 30 minutes

        sev3:
          definition: Minor degradation, workaround available, no data loss
          examples:
            - Slow background job (email delivery delayed ~30 min)
            - Non-critical dashboard widget broken
          response_time: next business day
          immediate_actions:
            - File a ticket in Linear, label sev3
            - No after-hours page required

      escalation_contacts:
        oncall: PagerDuty rotation "engineering-oncall"
        dba_lead: dba-lead@example.com / PagerDuty "dba-oncall"
        security: security@example.com (for data breach or unauthorized access)
        exec: cto@example.com (Sev-1 only, after 15 min)
        customer_success: cs-lead@example.com (Sev-1 or Sev-2 customer-visible)
    reasoning: >-
      A concrete severity matrix with response times, escalation contacts, and
      update cadences eliminates decision-making overhead during incidents —
      when everything is defined in advance, engineers focus on fixing rather
      than coordinating.
difficulty: beginner
estimatedHours: 2
tldr: >-
  Define who to contact at each crisis level so on-call engineers know
  immediately—no guessing, no delays during a 3am outage, just predetermined
  decisions.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:44:38.107Z'
---
<!-- user notes -->
