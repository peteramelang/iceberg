---
slug: data-retention
title: Data Retention
phase: incident-management
order: 4
summary: >-
  Define how long different classes of data are stored, archived, and deleted to
  balance compliance obligations, cost, and recovery needs.
definition: >-
  Define how long different classes of data are stored, archived, and deleted to
  balance compliance obligations, cost, and recovery needs.
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
  Data retention is the topic teams think about when they are young and then
  stop thinking about until something forces them to think about it again — a
  regulatory audit, a storage bill that has grown faster than usage, a customer
  exercising their right to erasure under GDPR, or an incident investigation
  that reveals the logs needed for forensics were rotated out three weeks ago.
  The decisions made early about how long data lives and what happens when it
  expires compound over years. Getting them right is mostly about making
  deliberate choices rather than accepting the defaults of whatever storage
  system you happen to be using.


  Different data classes have different retention requirements, and conflating
  them is a mistake. Application logs might need to be queryable for 30 days for
  debugging, but a retention period of 90 days satisfies most security incident
  investigation requirements. Financial transaction records need to be kept for
  seven years in most jurisdictions. Personal data subject to GDPR must be
  deleted — actually deleted, not soft-deleted — when the retention period
  expires or when the user requests erasure. Audit logs for security-sensitive
  actions may need to be immutable and retained for a fixed period regardless of
  what else happens. Treating all of this as a single policy results in either
  keeping everything forever (expensive and legally risky) or deleting things on
  a schedule that violates obligations.


  The failure mode that bites teams hardest is forgetting that deletion is an
  engineering problem, not a policy problem. Writing a retention policy document
  and filing it with legal does not delete any data. The data keeps accumulating
  until automated jobs run — and those jobs need to be built, tested, monitored,
  and maintained. Soft-delete patterns add complexity here: a record with a
  deleted_at timestamp is not gone, it is just flagged, and the policy needs a
  second pass that actually purges flagged records after the retention window.
  Each storage system involved — relational databases, object storage, log
  aggregators, data warehouses, backup archives — needs its own implementation
  of the retention policy.


  For most applications, the 80/20 is straightforward: define retention tiers by
  data class (user activity logs, financial records, audit events, session
  data), implement automated deletion or archival for each tier, and test that
  deletion actually works. The test step is the one most teams skip. Verifying
  that a seven-year financial record is kept for exactly seven years is not just
  a compliance exercise — it confirms that the deletion jobs are actually
  running, that they are scoped correctly, and that they handle edge cases like
  records that reference other records.


  Data retention connects to nearly every other data topic. It depends on CRUD
  logic (soft deletes create the data that retention jobs later purge), data
  integrity (foreign key constraints determine the order in which related
  records can be deleted), and cost management (object storage and database size
  grow proportionally to how long data is retained without a purge strategy). It
  also has direct legal neighbors in cookies and consent, since GDPR's right to
  erasure applies to personal data wherever it lives, not just in the primary
  database. A mature retention system is one where the policy, the
  implementation, and the monitoring are all in sync.
pitfalls:
  - title: Writing a retention policy without implementing deletion jobs
    explanation: >-
      A retention policy document filed with legal does not delete any data. The
      data keeps accumulating until automated jobs are built, deployed, and
      monitored. The gap between policy and implementation is where regulatory
      exposure lives — and many teams discover it only during an audit.
  - title: Treating soft-deleted records as deleted
    explanation: >-
      A record with a deleted_at timestamp is flagged, not gone. GDPR's right to
      erasure and most retention policies require actual removal after the
      retention window. Without a second-pass purge job that permanently removes
      soft-deleted records on schedule, storage grows unbounded and compliance
      obligations accumulate.
  - title: Applying one retention schedule to all data classes
    explanation: >-
      Application logs, financial transaction records, audit events, and
      personal data each have distinct retention requirements — from 30-day
      debug logs to seven-year financial records to personal data that must be
      deleted on user request. A single policy for all data either keeps things
      too long (legal risk) or deletes things too soon (compliance violation).
  - title: Never testing that deletion jobs actually run
    explanation: >-
      Retention jobs fail silently: a misconfigured cron, a permissions error, a
      query that matches zero rows because of a schema change. Without
      monitoring and periodic verification that records are actually being
      removed on schedule, the job appears healthy while data accumulates
      indefinitely.
  - title: Forgetting personal data scattered across secondary systems
    explanation: >-
      GDPR's right to erasure applies to personal data wherever it lives — not
      just the primary users table. Analytics warehouses, email logs, S3-backed
      audit trails, and search indexes often contain personal data that was
      never included in the deletion job. Incomplete erasure is still a
      compliance violation.
  - title: Deleting data needed for active incident investigation
    explanation: >-
      Overly aggressive log rotation removes the forensic evidence needed to
      investigate security incidents and production failures. Discovering that
      the logs needed to reconstruct an attack were rotated out two weeks ago is
      a painful and preventable situation — retention periods should be long
      enough to cover realistic incident detection lag.
codeExamples:
  - language: sql
    title: Purge soft-deleted rows past retention window
    code: |-
      -- Run nightly via pg_cron or an external scheduler
      -- Permanently removes records soft-deleted more than 90 days ago

      BEGIN;

      -- Delete audit logs for the rows we are about to purge (FK order matters)
      DELETE FROM audit_log
      WHERE table_name = 'user_sessions'
        AND record_id IN (
          SELECT id FROM user_sessions
          WHERE deleted_at < NOW() - INTERVAL '90 days'
        );

      -- Now purge the parent rows
      DELETE FROM user_sessions
      WHERE deleted_at < NOW() - INTERVAL '90 days';

      -- Financial records kept 7 years — only purge older
      DELETE FROM payment_events
      WHERE created_at < NOW() - INTERVAL '7 years';

      COMMIT;

      -- Reclaim space
      ANALYZE user_sessions;
      ANALYZE payment_events;
    reasoning: >-
      A concrete purge script with different retention windows per data class
      (90 days for sessions, 7 years for financial records) shows that retention
      is an implementation problem, not just a policy document.
  - language: python
    title: S3 lifecycle rule applied programmatically
    code: |-
      import boto3

      s3 = boto3.client('s3')

      BUCKET = 'my-app-logs'

      s3.put_bucket_lifecycle_configuration(
          Bucket=BUCKET,
          LifecycleConfiguration={
              'Rules': [
                  {
                      'ID': 'app-logs-tiering',
                      'Status': 'Enabled',
                      'Filter': {'Prefix': 'app-logs/'},
                      'Transitions': [
                          # Move to infrequent access after 30 days
                          {'Days': 30, 'StorageClass': 'STANDARD_IA'},
                          # Move to Glacier after 90 days
                          {'Days': 90, 'StorageClass': 'GLACIER'},
                      ],
                      # Hard delete after 2 years
                      'Expiration': {'Days': 730},
                  },
              ]
          }
      )
    reasoning: >-
      An S3 lifecycle rule shows that retention applies to object storage too,
      not just relational databases — tiering to Glacier before expiration is
      the cost-aware pattern for logs that must be retained but are rarely
      accessed.
difficulty: intermediate
estimatedHours: 4
tldr: >-
  Decide how long to keep different types of data (user logs 30 days, financial
  records 7 years) and automate deletion to manage costs and comply with privacy
  laws.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:27:20.545Z'
---
<!-- user notes -->
