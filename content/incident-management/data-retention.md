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
  researchedAt: '2026-05-13T22:45:46.767Z'
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
