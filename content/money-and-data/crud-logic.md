---
slug: crud-logic
title: CRUD Logic
phase: money-and-data
order: 7
summary: >-
  Designing reliable create, read, update, and delete operations: soft deletes,
  optimistic locking, bulk-operation safety, and audit trails.
definition: >-
  CRUD operations form the foundation of data management in modern applications.
  Reliable CRUD logic extends beyond simple database queries to encompass
  patterns like soft deletes (preserving audit history), optimistic locking
  (preventing race conditions), and idempotent operations (ensuring bulk
  operations are safely retryable). This involves careful consideration of
  transaction semantics, conflict resolution strategies, and comprehensive audit
  trails that enable compliance, debugging, and temporal data recovery.


  Designing robust CRUD operations requires understanding HTTP semantics (RFC
  7231 for idempotent operations), database constraints and transactions, and
  application-level concerns like eventual consistency. Key patterns include
  write-ahead logging for durability, conflict-free replicated data types
  (CRDTs) for distributed systems, and structured audit logging that captures
  who changed what and when. ORM frameworks like Prisma, Drizzle, and TypeORM
  provide abstraction layers, while services like Hasura and PostgREST generate
  automatic CRUD APIs with built-in safety features.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=DTXgZJkymx0'
      title: ACID Transactions & Optimistic Locking
      author: Tom Scott (Tom's Tech Talks)
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Canonical introduction to optimistic locking patterns and transaction
        guarantees essential for safe concurrent CRUD operations.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=B-IthlwEiJw'
      title: 'Database Design Patterns: CRUD Operations and Data Integrity'
      author: Hussein Nasser
      durationMinutes: 48
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into CRUD patterns including soft deletes, audit trails, and
        handling concurrent modifications with real-world examples.
      source: ai-researcher
  articles:
    - url: 'https://datatracker.ietf.org/doc/html/rfc7231#section-4.2.2'
      title: 'RFC 7231: HTTP/1.1 Semantics and Content (Idempotent Methods)'
      kind: canonical-doc
      reasoning: >-
        Authoritative specification of idempotent HTTP methods (GET, HEAD, PUT,
        DELETE) essential for designing safe CRUD APIs.
      publisher: IETF
      source: ai-researcher
    - url: 'https://blog.hasura.io/audit-logging-patterns/'
      title: Audit Logging Patterns
      kind: tutorial
      reasoning: >-
        Hasura's comprehensive guide to audit trail implementations, including
        temporal tables, change data capture, and compliance requirements.
      publisher: Hasura
      source: ai-researcher
    - url: 'https://www.postgresql.org/docs/current/ddl-system-columns.html'
      title: 'PostgreSQL System Columns (xmin, xmax for versioning)'
      kind: canonical-doc
      reasoning: >-
        PostgreSQL's built-in row versioning system used internally for MVCC;
        foundational for understanding update/delete safety.
      publisher: PostgreSQL
      source: ai-researcher
  services:
    - name: Prisma
      url: 'https://www.prisma.io'
      category: ORM
      reasoning: >-
        Production-grade ORM with built-in soft delete support, advanced
        filtering, and transaction management for safe CRUD operations.
      source: ai-researcher
    - name: Drizzle ORM
      url: 'https://orm.drizzle.team'
      category: ORM
      reasoning: >-
        Lightweight, type-safe ORM with explicit transaction APIs and support
        for optimistic locking patterns through version columns.
      source: ai-researcher
    - name: Hasura
      url: 'https://hasura.io'
      category: API Platform
      reasoning: >-
        Auto-generates GraphQL APIs with built-in audit logging, conflict
        resolution, and fine-grained permissions for CRUD operations.
      source: ai-researcher
    - name: PostgREST
      url: 'https://postgrest.org'
      category: API Platform
      reasoning: >-
        Automatically exposes PostgreSQL tables as REST APIs with support for
        filters, pagination, and idempotent bulk operations.
      source: ai-researcher
    - name: Supabase
      url: 'https://supabase.com'
      category: Backend-as-a-Service
      reasoning: >-
        Postgres-based platform providing CRUD APIs with Row Level Security
        (RLS) for fine-grained authorization on data mutations.
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The trouble with CRUD is that it looks solved. Create, read, update, delete —
  four verbs, elementary SQL, a tutorial you can finish in an afternoon. The
  illusion holds until you hit production, where two users update the same
  record simultaneously, a delete operation turns out to be permanent in a
  system that needed audit history, or a bulk import fails halfway through and
  leaves the database in a state that nobody anticipated. The verbs are simple.
  The correctness requirements are not.


  Optimistic locking is the first thing most teams discover they needed after
  they did not implement it. The pattern is straightforward: include a version
  number or updated_at timestamp in every update query, and reject the update if
  the value has changed since the record was read. Without it, two concurrent
  edits to the same record result in the second write silently overwriting the
  first. Users do not get an error; they get a discrepancy they do not
  understand and a support ticket. Optimistic locking is cheap to implement and
  the failure mode without it is invisible until it causes a real problem.


  Soft deletes are the other pattern that teams reach for after losing data they
  did not realize they needed. Hard deletes are permanent and they are fast,
  which is why they are the default. But production systems accumulate
  regulatory requirements, customer disputes, audit obligations, and debugging
  needs that all require answering the question: what did this record look like
  before it was deleted? A deleted_at timestamp costs almost nothing. Restoring
  data from backups when a user accidentally deletes their account, or proving
  to a regulator that a record existed at a specific point in time, costs
  considerably more. The mistake is treating delete as a simple operation rather
  than a state transition.


  Idempotency matters most in bulk operations and integrations. If a batch job
  that processes 10,000 records fails at record 7,843, the correct behavior is
  to resume from where it stopped, not to reprocess from the beginning.
  Achieving that requires each operation to be safe to run twice: the second run
  should produce the same result as the first without creating duplicates or
  double-applying changes. The implementation usually involves a natural key or
  a client-generated idempotency token that lets you detect whether an operation
  has already been applied. Without this, retries are destructive, and every
  failure requires manual cleanup.


  The 80/20 in CRUD logic: implement soft deletes for any entity that represents
  user-created content or business records, add optimistic locking to any entity
  that multiple users can edit, and make bulk write operations idempotent. An
  audit log — recording who changed what and when — rounds out the baseline.
  These four patterns cover the overwhelming majority of production incidents
  that trace back to data mutation logic. ORMs like Prisma and TypeORM can
  handle some of this automatically, but only if you configure them to — the
  defaults are rarely the right choice for a production system.


  CRUD logic pairs closely with data integrity (constraints enforced at the
  database level catch what application code misses), data retention (deciding
  how long soft-deleted records stick around before permanent removal), and API
  design (HTTP semantics for idempotency are well-defined in RFC 7231 and worth
  following rather than reinventing). It is foundational enough that almost
  every other data-layer topic assumes it is handled correctly.
pitfalls:
  - title: Skipping optimistic locking on shared records
    explanation: >-
      Without optimistic locking, two concurrent writes to the same record
      result in the second silently overwriting the first. Users don't get an
      error — they get unexplained data loss. The fix (a version field or
      updated_at check in the update query) is cheap; discovering the problem in
      production from a support ticket is not.
  - title: Using hard deletes for business records
    explanation: >-
      Permanent deletes are irreversible, and production systems inevitably
      accumulate reasons they needed to see deleted data: regulatory audits,
      customer disputes, debugging, account recovery. Adding a deleted_at column
      costs almost nothing upfront; restoring deleted data from backups costs
      significant time and money — and sometimes it's impossible.
  - title: Writing non-idempotent bulk operations
    explanation: >-
      A batch job that fails midway and restarts from the beginning will
      double-apply every operation it already completed. Making bulk writes
      idempotent — using a natural key or idempotency token to detect
      already-processed records — means failures are safe to retry. Without it,
      every failure requires manual cleanup of partially-applied changes.
  - title: Enforcing uniqueness only in application code
    explanation: >-
      Application-level uniqueness checks have a race condition: two concurrent
      requests can both read 'no duplicate found' before either writes. Without
      a UNIQUE constraint at the database level, duplicates will appear in
      production under load. The database constraint is the only reliable
      enforcement point.
  - title: No audit trail for who changed what and when
    explanation: >-
      Without structured audit logging, debugging a data discrepancy requires
      reconstructing history from logs and memory. Compliance requirements
      (HIPAA, SOC 2, GDPR) often mandate demonstrating who modified sensitive
      records, and the absence of an audit log turns a routine question into a
      multi-day forensics project.
codeExamples:
  - language: sql
    title: Optimistic locking update with version check
    code: >-
      -- Schema: version column on every mutable table

      ALTER TABLE articles ADD COLUMN version INTEGER NOT NULL DEFAULT 1;


      -- Application performs: SELECT, user edits, then UPDATE with version
      guard

      WITH updated AS (
        UPDATE articles
        SET
          title   = $1,
          body    = $2,
          version = version + 1,
          updated_at = NOW()
        WHERE id = $3
          AND version = $4   -- must match what was read
        RETURNING id, version
      )

      SELECT
        CASE
          WHEN EXISTS (SELECT 1 FROM updated) THEN 'ok'
          ELSE 'conflict'   -- row was modified by another writer since we read it
        END AS result;
    reasoning: >-
      A raw SQL optimistic lock is the clearest way to show the pattern — the
      version guard in the WHERE clause is the entire mechanism, and seeing it
      directly removes the ORM abstraction that obscures what is actually
      happening.
  - language: typescript
    title: Soft delete with audit trail in Postgres
    code: |-
      import { Pool } from 'pg';

      const db = new Pool({ connectionString: process.env.DATABASE_URL });

      async function softDelete(
        table: string,
        id: number,
        deletedBy: number
      ): Promise<void> {
        await db.query('BEGIN');
        try {
          // Mark deleted
          await db.query(
            `UPDATE ${table} SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
            [id]
          );
          // Append audit record
          await db.query(
            `INSERT INTO audit_log (table_name, record_id, action, actor_id, occurred_at)
             VALUES ($1, $2, 'DELETE', $3, NOW())`,
            [table, id, deletedBy]
          );
          await db.query('COMMIT');
        } catch (err) {
          await db.query('ROLLBACK');
          throw err;
        }
      }

      // Queries exclude soft-deleted rows by convention
      const { rows } = await db.query(
        'SELECT * FROM articles WHERE deleted_at IS NULL AND id = $1',
        [articleId]
      );
    reasoning: >-
      Combining soft delete with a transactional audit log insert shows that
      both operations must succeed together — the transaction is the point, and
      the audit trail is what makes deletion recoverable and auditable.
difficulty: intermediate
estimatedHours: 5
---
<!-- user notes -->
