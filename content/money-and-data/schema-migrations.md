---
slug: schema-migrations
title: Schema Migrations
phase: money-and-data
order: 6
summary: >-
  Apply database schema changes safely in production using expand-contract
  patterns and zero-downtime migration strategies.
definition: >-
  Schema migrations are controlled, versioned changes to database structure that
  enable teams to evolve databases safely in production environments. The core
  challenge is applying structural changes without downtime, data loss, or
  breaking application compatibility—especially in systems where multiple
  service versions may coexist. The expand-contract pattern (add new
  column/constraint, migrate data, remove old structure) is the
  industry-standard approach, implemented by tools like Flyway, Liquibase,
  Prisma Migrate, and pgroll.


  Zero-downtime migrations require coordinating schema changes across
  application deployments. Modern strategies include: expanding the schema first
  (new columns/tables), running data migrations asynchronously, keeping old and
  new structures in parallel while code adapts, then contracting (removing old
  structures) once all services are updated. Services like PlanetScale provide
  infrastructure support with online DDL and reverse migrations; specialized
  tools like pgroll automate the expand-contract pattern for PostgreSQL. The
  goal is decoupling schema evolution from deployment risk, allowing databases
  to grow with applications.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://martinfowler.com/articles/evodb.html'
      title: Evolutionary Database Design
      kind: tutorial
      reasoning: >-
        Canonical reference by Martin Fowler on versioning and evolutionary
        database patterns; foundational for expand-contract strategies
    - url: 'https://planetscale.com/blog/safe-schema-changes-for-mysql'
      title: Safe Schema Changes for MySQL
      kind: engineering-blog
      reasoning: >-
        PlanetScale's definitive guide on expand-contract and zero-downtime
        migrations; practical MySQL focus
    - url: >-
        https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern
      title: Expand and Contract Pattern
      kind: tutorial
      reasoning: >-
        Prisma's detailed explanation of the expand-contract pattern with code
        examples and deployment workflow
    - url: 'https://github.com/xataio/pgroll'
      title: 'pgroll: Postgres Roll Migrations'
      kind: canonical-doc
      reasoning: >-
        Xata's open-source tool automating expand-contract migrations for
        PostgreSQL; demonstrates modern zero-downtime practices
  services:
    - name: Flyway
      url: 'https://www.flywaydb.org'
      category: migration-tool
      reasoning: >-
        Industry-standard versioned migration framework; supports multiple
        databases and enforces repeatable/repeatable patterns
    - name: Liquibase
      url: 'https://www.liquibase.org'
      category: migration-tool
      reasoning: >-
        Comprehensive database change management; supports complex rollback and
        multi-database deployments
    - name: Prisma Migrate
      url: 'https://www.prisma.io'
      category: orm-migration
      reasoning: >-
        Schema-first ORM with integrated migrations; handles expand-contract and
        relation updates; schema inheritance from code
    - name: PlanetScale
      url: 'https://planetscale.com'
      category: managed-db
      reasoning: >-
        MySQL service with native zero-downtime DDL, reverse migrations, and
        schema automation; production-grade zero-downtime built-in
    - name: Atlas
      url: 'https://atlasgo.io'
      category: migration-tool
      reasoning: >-
        Modern declarative migration tool with drift detection and
        expand-contract automation; supports multiple databases
    - name: Sqitch
      url: 'https://sqitch.org'
      category: migration-tool
      reasoning: >-
        SQL-based change management with native PostgreSQL/MySQL support and
        dependency resolution
    - name: pgroll
      url: 'https://github.com/xataio/pgroll'
      category: postgres-migration
      reasoning: >-
        Purpose-built for PostgreSQL zero-downtime migrations; automates
        expand-contract and provides reversible migrations
  courses:
    - url: 'https://www.prisma.io/dataguide'
      title: 'Prisma Data Guide: Schema Design & Migrations'
      provider: Prisma
      paid: false
      reasoning: >-
        Free comprehensive guide covering schema design, relationships, and
        migration patterns with modern examples
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Schema migrations are the problem that sits quietly in the background until
  the day you need to add a column to a 50-million-row table and discover that a
  naive ALTER TABLE will lock that table for 20 minutes while your production
  service returns errors. At that point you have a crash course in why schema
  migration strategy matters. The core tension is simple: your database schema
  and your application code need to be in sync, but deploying them together as
  an atomic unit becomes impossible at any meaningful scale. You have rolling
  deployments, you have multiple service instances, you have background jobs—the
  idea that you can atomically swap schema and code everywhere simultaneously is
  a fiction. Accepting that reality is the beginning of doing schema migrations
  safely.


  The 80/20 of schema migrations is the expand-contract pattern, and it solves
  the majority of the hard cases. The pattern has three phases. First, expand:
  add the new column, table, or index in a way that doesn't break the existing
  code. New columns should be nullable or have defaults that the current code
  can live with. New indexes should be created concurrently (CONCURRENTLY in
  Postgres) so they don't lock the table. At this point, the schema has the new
  thing but the code isn't using it yet. Second, migrate: if you need to
  backfill data into the new column or restructure existing records, do it in
  small batches during off-peak hours—never a single UPDATE that touches every
  row. Third, contract: once all running instances of the application are on the
  new code that uses the new structure, remove the old columns or indexes. Each
  phase is a separate deployment, often a separate migration file, potentially
  separated by days or weeks. This is slower than making a single sweeping
  change, but it's the price of zero-downtime deployments.


  The dominant failure mode in schema migrations is coupling schema changes too
  tightly to code changes. A migration that renames a column and application
  code that uses the new name are deployed together. For a split second—or
  longer, if you're doing rolling deployments—some instances are running old
  code that references the old column name against a schema that has already
  been migrated to the new name. The result is errors. The fix is a
  two-deployment process: add the new column and start writing to both old and
  new, then deploy the code change, then drop the old column. It feels
  redundant, but it's the pattern that survives rolling deployments and allows
  safe rollbacks.


  Tooling matters here because manual tracking of migration files across
  environments is error-prone. Flyway and Liquibase are the established options
  for JVM stacks; Prisma Migrate has strong adoption in the JavaScript
  ecosystem; Alembic for Python. All of them give you versioned migration files,
  a migration history table in the database, and a command to bring any
  environment up to the current schema. The convention of one migration per
  logical change, kept in version control alongside the application code that
  requires it, makes it possible to understand the history of your schema and to
  reason about what code versions are compatible with what schema states. For
  Postgres specifically, pgroll is a newer tool that automates the
  expand-contract pattern with support for online DDL and rollback of
  migrations—it's worth knowing about even if you don't use it immediately.


  Large table migrations—backfills, index creation, column type changes on
  tables with tens or hundreds of millions of rows—need special handling that
  most teams don't think about until they're already in trouble. Creating an
  index concurrently avoids table locks but still takes time and I/O, so it
  should be done during low-traffic windows with monitoring on replication lag.
  Backfilling a column should be done in batches with a sleep between batches to
  avoid overwhelming the database. Adding a NOT NULL constraint to an existing
  column that has nulls requires backfilling first; in Postgres 12+, NOT NULL
  constraints with a DEFAULT can be added without a full table rewrite, but only
  for values that don't require reading existing rows. These are the kinds of
  details that separate teams who migrate safely at scale from teams who cause
  incidents.


  In the broader money-and-data phase, schema migrations connect directly to
  deployment strategy, rollbacks, and data integrity. A schema migration that
  can't be reversed limits your ability to roll back a bad deployment—which is
  why the expand-contract pattern's reversibility is so valuable. It also
  connects to your testing strategy: your CI environment needs to run migrations
  against a copy of production schema state, not just a blank database, to catch
  the class of bugs where a migration works on an empty table but fails on real
  data. Teams that build migration testing into their CI pipeline catch these
  failures before they reach production.
pitfalls:
  - title: Deploying schema change and code change simultaneously
    explanation: >-
      Rolling deployments mean some instances run old code against the new
      schema and some run new code against the old schema at the same time. A
      column rename or removal deployed together with code that expects it will
      produce errors during that overlap window. Schema changes must be
      backward-compatible with the previous code version, deployed first, and
      contracted only after all instances are on the new code.
  - title: Running ALTER TABLE on large tables without CONCURRENTLY
    explanation: >-
      A standard ALTER TABLE on a table with tens of millions of rows takes an
      exclusive lock for the duration of the operation, blocking all reads and
      writes. In Postgres, CREATE INDEX CONCURRENTLY builds the index without a
      long lock and should be the default for any non-trivial table. Test
      migration run time against production-scale data, not an empty staging
      table.
  - title: Backfilling a column with a single UPDATE across all rows
    explanation: >-
      A single UPDATE that touches every row in a large table holds locks,
      generates a massive write-ahead log, and can overwhelm the database for
      minutes or longer. Backfills should be executed in small batches with a
      pause between each batch during off-peak hours, often as a separate step
      from the schema change itself.
  - title: Adding NOT NULL constraints without backfilling existing nulls first
    explanation: >-
      Adding a NOT NULL constraint to a column that already contains null values
      will fail unless the data is cleaned up first or a safe default is
      provided. Attempting this in a single migration on production data
      produces an error mid-migration, leaving the schema in a partially applied
      state that can be difficult to recover from.
  - title: Testing migrations against an empty database
    explanation: >-
      Many migration failures only appear against real data: a constraint that
      passes on a blank table fails when existing rows violate it, or a backfill
      runs in seconds on staging but takes 40 minutes on the production row
      count. CI should run migrations against a recent anonymized production
      snapshot, not a freshly initialized schema.
  - title: Skipping the contract phase and leaving dead columns forever
    explanation: >-
      Teams that apply the expand phase of expand-contract—adding new columns
      and migrating data—frequently never complete the contract phase and remove
      the old structures. Dead columns accumulate, bloat rows, confuse future
      engineers, and keep old indexes alive. The contract step should be treated
      as a required deployment, not an optional cleanup.
codeExamples:
  - language: sql
    title: Safe Backfill in Batches Without Locking
    code: >-
      -- Backfill a new NOT NULL column in batches to avoid long-running
      transactions.

      -- Run repeatedly until rows_updated = 0.


      DO $$

      DECLARE
        rows_updated INT;
      BEGIN
        LOOP
          UPDATE users
          SET display_name = COALESCE(full_name, email)
          WHERE display_name IS NULL
            AND id IN (
              SELECT id FROM users
              WHERE display_name IS NULL
              ORDER BY id
              LIMIT 1000
              FOR UPDATE SKIP LOCKED
            );

          GET DIAGNOSTICS rows_updated = ROW_COUNT;
          EXIT WHEN rows_updated = 0;

          -- Yield to other transactions between batches
          PERFORM pg_sleep(0.05);
        END LOOP;
      END $$;


      -- Once backfill complete, add the constraint without a full table scan:

      ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;
    reasoning: >-
      Batched backfill with FOR UPDATE SKIP LOCKED and pg_sleep is the
      production-safe pattern for large table migrations — learners need to see
      the exact SQL to avoid the single-UPDATE mistake.
  - language: bash
    title: Flyway Migration File Naming Convention
    code: |-
      #!/usr/bin/env bash
      # Create a new Flyway-style versioned migration file.
      # Output: db/migrations/V20240515_142301__add_display_name_to_users.sql
      set -euo pipefail

      DESCRIPTION=${1:?"Usage: $0 <description_with_underscores>"}
      DIR="db/migrations"
      TIMESTAMP=$(date -u '+%Y%m%d_%H%M%S')
      FILENAME="${DIR}/V${TIMESTAMP}__${DESCRIPTION}.sql"

      mkdir -p "$DIR"
      cat > "$FILENAME" <<SQL
      -- Migration: ${DESCRIPTION//_/ }
      -- Author: $(git config user.name)
      -- Date: $(date -u '+%Y-%m-%d')

      -- Write your SQL here.
      -- Remember: add columns as nullable first (expand phase).
      SQL

      echo "Created: $FILENAME"
      $EDITOR "$FILENAME"
    reasoning: >-
      A script that enforces versioned migration file naming makes the 'one
      migration per logical change' convention automatic, showing learners the
      discipline before they accumulate ad-hoc SQL files.
difficulty: intermediate
estimatedHours: 6
tldr: >-
  Change database structure safely while live. Add new columns, migrate data,
  then remove old ones across separate deployments to avoid downtime.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.890Z'
---
<!-- user notes -->
