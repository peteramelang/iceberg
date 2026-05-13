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
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
