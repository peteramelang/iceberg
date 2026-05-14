---
slug: disaster-recovery
title: Disaster Recovery
phase: incident-management
order: 3
summary: >-
  Define and regularly test RPO/RTO targets, backup procedures, and recovery
  playbooks to restore service after catastrophic failures.
definition: >-
  Define and regularly test RPO/RTO targets, backup procedures, and recovery
  playbooks to restore service after catastrophic failures.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://learn.microsoft.com/en-us/azure/site-recovery/'
      title: Azure Site Recovery
      kind: tutorial
      reasoning: (no reasoning captured)
    - url: >-
        https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/
      title: 'AWS Whitepaper: Disaster Recovery of Workloads on AWS'
      kind: tutorial
      reasoning: (no reasoning captured)
    - url: >-
        https://learn.microsoft.com/en-us/azure/architecture/framework/resiliency/
      title: 'Azure Architecture: Resiliency'
      kind: tutorial
      reasoning: (no reasoning captured)
  services:
    - name: AWS Disaster Recovery
      url: 'https://aws.amazon.com/disaster-recovery/'
      category: core
      reasoning: (no reasoning captured)
    - name: Google Cloud DR Scenarios Planning Guide
      url: 'https://cloud.google.com/architecture/dr-scenarios-planning-guide'
      category: core
      reasoning: (no reasoning captured)
    - name: Veeam Disaster Recovery Solutions
      url: 'https://www.veeam.com'
      category: core
      reasoning: (no reasoning captured)
    - name: 'Google SRE Book: Managing Load'
      url: 'https://sre.google/sre-book/managing-load/'
      category: deep-dive
      reasoning: (no reasoning captured)
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Disaster recovery is one of those topics every team thinks they have covered
  until the moment they actually need it. The backup jobs show green. The
  runbook exists in Confluence somewhere. But when a region goes dark or a
  botched migration corrupts the primary database, you find out fast whether
  your recovery plan is real or just a checkbox. The gap between "we have
  backups" and "we can restore service in two hours" is where most teams get
  hurt.


  The two numbers that matter most are RPO and RTO — Recovery Point Objective
  and Recovery Time Objective. RPO tells you how much data you can afford to
  lose (if your Postgres logical replication lag is 15 minutes and your RPO is 5
  minutes, you have a problem). RTO tells you how long the business can tolerate
  an outage before the damage becomes unacceptable. Every other decision in your
  DR strategy — backup frequency, replication topology, standby provisioning,
  failover automation — flows from these two numbers. Get them wrong or leave
  them undefined and you'll spend an outage negotiating with stakeholders
  instead of restoring service.


  The 80/20 here is ruthless: most DR programs fail not from missing technology
  but from untested procedures. Tools like AWS RDS automated backups,
  point-in-time recovery, or Postgres pg_basebackup are mature and reliable —
  but they only tell you the data is safe. They don't tell you whether your team
  can actually execute a restore under pressure, in the middle of the night,
  with half the on-call rotation unavailable. The single highest-leverage
  investment is a regular, realistic restore drill. Run it in a staging
  environment that mirrors production topology. Time yourself. Document what
  broke. Fix it. The teams that sleep well during incidents are the ones who
  have done this enough times that it's boring.


  The dominant failure modes cluster around three patterns. First, backups exist
  but restores have never been tested, so the first restore attempt happens
  during the actual disaster — revealing corrupted snapshots, missing
  credentials, or a recovery procedure written for infrastructure that no longer
  exists. Second, RTO targets are set aspirationally rather than empirically, so
  the recovery plan says "two hours" but nobody has ever measured how long it
  actually takes to reprovision a database cluster, replay WAL logs, warm
  caches, and run smoke tests. Third, recovery runbooks live in the system that
  just went down — your wiki on the database server that isn't responding is not
  a usable runbook.


  A solid mental model is to treat DR like a fire drill, not a fire
  extinguisher. The extinguisher is passive; it sits there waiting. The drill is
  active — it proves that people know where the exits are, that the exits
  actually open, and that the building doesn't fill with smoke faster than
  people can evacuate. Your backup infrastructure is the extinguisher. The
  quarterly restore drill is the fire drill. Both are necessary. Only one of
  them actually tells you if you'll survive.


  Within the broader incident-management ecosystem, disaster recovery sits at
  the far end of the severity spectrum. Most incidents are handled by alerting,
  runbooks, and on-call rotations without ever touching your DR infrastructure.
  But when an incident exceeds what those mechanisms can handle — a cascading
  failure, data loss, a multi-AZ outage — DR is what determines whether the
  company survives it. That's why DR planning has to be owned by engineering
  leadership, not delegated to a junior engineer as a quarterly checkbox. The
  teams that treat it seriously tend to find that the discipline bleeds into
  better architecture decisions overall: more isolation between failure domains,
  cleaner data flows, less implicit state. That's not a coincidence.
pitfalls:
  - title: Never Testing Restores Before a Real Disaster
    explanation: >-
      Teams confirm backups run successfully but never verify that a restore
      actually produces a working database. The first restore attempt then
      happens under incident pressure, revealing corrupted snapshots, missing
      credentials, or procedures written for infrastructure that no longer
      exists. Schedule quarterly restore drills in a staging environment that
      mirrors production topology, time them, and treat failures as bugs to fix.
  - title: Setting RTO and RPO Aspirationally Instead of Empirically
    explanation: >-
      Recovery targets written in a planning document without ever measuring
      real recovery time create false confidence. A plan that says 'two hours'
      is worthless if nobody has timed how long it actually takes to reprovision
      a database cluster, replay WAL logs, warm caches, and run smoke tests.
      Baseline your actual recovery time in drills, then set targets from
      measured reality.
  - title: Storing Recovery Runbooks in the System That Just Failed
    explanation: >-
      A wiki hosted on the database server that is not responding is not a
      usable runbook. Recovery documentation must live somewhere accessible when
      production is completely down — a static site, printed binder, or a
      separate SaaS wiki not connected to your primary infrastructure. Test this
      assumption explicitly: if your primary systems were all down right now,
      where would on-call engineers find recovery steps?
  - title: Undefined or Mismatched RPO and RTO Across Stakeholders
    explanation: >-
      Engineering teams often set technical recovery targets without aligning
      them to business tolerances, or different parts of the org hold different
      implicit assumptions. A 15-minute replication lag on a database with a
      5-minute RPO is a compliance failure hiding in plain sight. Run an
      explicit stakeholder conversation, document the numbers, and surface any
      gaps between business expectations and technical capability before an
      incident forces the conversation.
  - title: Treating DR as a Yearly Checkbox Exercise
    explanation: >-
      Disaster recovery programs that surface only during annual audits atrophy:
      infrastructure changes, credentials rotate, teams turn over, and the
      runbook quietly becomes wrong. Infrastructure is not static, so neither is
      your recovery plan. Integrate DR validation into regular engineering work
      — a quarterly drill minimum, with runbook updates as part of the
      definition of done for any change that affects recoverable systems.
  - title: Assuming Cloud Provider Backups Are Sufficient
    explanation: >-
      Managed backups such as RDS automated snapshots confirm that data is
      stored safely, but they do not confirm that your team can execute a
      restore, in the correct sequence, at the required speed, under incident
      conditions. Provider backups are the extinguisher; you still need the fire
      drill. Verify that your team has documented steps for every layer of the
      recovery process, not just the database snapshot retrieval.
codeExamples:
  - language: bash
    title: Timed Postgres Restore Drill Script
    code: |-
      #!/usr/bin/env bash
      set -euo pipefail

      BACKUP_FILE="${1:?Usage: $0 <backup.dump>}"
      RESTORE_DB="restore_drill_$(date +%Y%m%d_%H%M%S)"
      START=$(date +%s)

      echo "[DR DRILL] Starting restore into: $RESTORE_DB"
      createdb "$RESTORE_DB"

      pg_restore \
        --dbname="$RESTORE_DB" \
        --jobs=4 \
        --no-owner \
        --no-privileges \
        "$BACKUP_FILE"

      END=$(date +%s)
      ELAPSED=$(( END - START ))

      ROW_COUNT=$(psql "$RESTORE_DB" -At -c "SELECT count(*) FROM users;")

      echo "[DR DRILL] Restore complete in ${ELAPSED}s"
      echo "[DR DRILL] Users row count: $ROW_COUNT"
      echo "[DR DRILL] RTO target check: elapsed=${ELAPSED}s, target=7200s"

      if [ "$ELAPSED" -gt 7200 ]; then
        echo "[DR DRILL] WARN: RTO target exceeded!"
        exit 1
      fi

      dropdb "$RESTORE_DB"
      echo "[DR DRILL] Drill DB cleaned up. All good."
    reasoning: >-
      A timed, scripted restore drill is the single highest-leverage DR
      investment — it proves the backup is usable, measures actual RTO, and
      surfaces credential or topology problems before a real disaster does.
  - language: yaml
    title: DR Runbook Frontmatter with RPO/RTO
    code: |-
      # runbooks/disaster-recovery.yaml
      ---
      service: payments-api
      owner: platform-eng@example.com
      last_tested: 2026-04-01

      rpo_minutes: 5      # max acceptable data loss
      rto_minutes: 120    # max acceptable downtime

      backup:
        type: postgres-logical
        frequency: every 5 minutes (WAL streaming)
        location: s3://backups-prod/payments-api/
        retention_days: 30
        restore_command: |
          aws s3 cp s3://backups-prod/payments-api/latest.dump /tmp/latest.dump
          bash runbooks/scripts/restore-drill.sh /tmp/latest.dump

      failover_steps:
        - Confirm primary is unreachable (3 consecutive health-check failures)
        - Promote RDS read replica: aws rds promote-read-replica --db-instance-identifier payments-replica
        - Update DNS CNAME payments-db.internal -> replica endpoint
        - Notify #incidents and update status page
        - Verify application connectivity with smoke test
        - Page DBA lead if replica lag was > rpo_minutes at time of failure

      contacts:
        primary_oncall: PagerDuty rotation "payments-oncall"
        dba_escalation: dba-lead@example.com
        exec_notify_after_minutes: 30
    reasoning: >-
      Encoding RPO, RTO, backup location, and ordered failover steps in a
      machine-readable YAML runbook co-located with the service keeps DR
      procedures findable and auditable, and the explicit targets make drill
      outcomes measurable.
difficulty: advanced
estimatedHours: 14
tldr: >-
  Set realistic recovery targets (data loss tolerance and downtime tolerance),
  run regular restore drills, and maintain accessible runbooks so you can
  actually recover when disaster strikes.
shortExplainerVideo:
  url: 'https://www.youtube.com/watch?v=07EHsPuKXc0'
  title: 'Disaster Recovery vs. Backup: What''s the difference?'
  author: IBM Technology
  durationSeconds: 572
  reasoning: >-
    IBM Technology's 9:32 video draws a clear distinction between backup and
    disaster recovery, covering replication topologies, region failure
    scenarios, streaming vs. snapshot approaches, and recovery trade-offs.
    Directly matches the topic's focus on RPO/RTO targets, backup procedures,
    and recovery strategy. Strong preferred source, authoritative and
    non-tutorial. Within the 600-second limit.
  source: ai-researcher
lastUpdatedAt: '2026-05-14T12:27:20.546Z'
---
<!-- user notes -->
