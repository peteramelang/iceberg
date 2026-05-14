---
slug: data-integrity
title: Data Integrity
phase: money-and-data
order: 5
summary: >-
  Use database constraints, transactions, and application-level validation to
  guarantee that stored data is always valid and consistent.
definition: >-
  Data integrity ensures that stored information remains accurate, consistent,
  and valid throughout its lifecycle. This involves enforcing constraints at the
  database level—such as PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, and CHECK
  constraints—as well as using transaction mechanisms like ACID properties and
  appropriate isolation levels to prevent corruption during concurrent access.
  Application-level validation complements database constraints by checking
  business logic invariants, ensuring data conforms to domain rules before
  persistence.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://www.postgresql.org/docs/current/ddl-constraints.html'
      title: PostgreSQL Constraints Documentation
      kind: canonical-doc
      reasoning: >-
        Canonical documentation for database constraints including PRIMARY KEY,
        FOREIGN KEY, UNIQUE, NOT NULL, CHECK, and EXCLUSION
        constraints—foundational for database-level data integrity.
    - url: 'https://www.postgresql.org/docs/current/transaction-iso.html'
      title: PostgreSQL Transaction Isolation Documentation
      kind: canonical-doc
      reasoning: >-
        Official documentation on isolation levels (Read Committed, Repeatable
        Read, Serializable) and their role in maintaining data consistency under
        concurrent access.
    - url: 'https://jepsen.io/'
      title: 'Jepsen: Distributed Systems Safety Research'
      kind: engineering-blog
      reasoning: >-
        Industry standard framework for testing distributed database consistency
        claims through fault injection and black-box verification. Critical for
        understanding real-world data integrity guarantees.
    - url: 'https://aphyr.com/posts/313-strong-consistency-models'
      title: Strong Consistency Models
      kind: engineering-blog
      reasoning: >-
        Deep exploration of consistency models and their role in data integrity,
        explaining trade-offs between safety and availability.
    - url: 'https://aphyr.com/posts/333-serializability-linearizability-and-locality'
      title: 'Serializability, Linearizability, and Locality'
      kind: engineering-blog
      reasoning: >-
        Technical analysis of consistency guarantees needed for data integrity,
        distinguishing between serializability and linearizability.
  services:
    - name: PostgreSQL
      url: 'https://www.postgresql.org'
      category: relational-database
      reasoning: >-
        Industry-standard relational database with comprehensive constraint
        support (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK), ACID
        transactions, and multiple isolation levels.
    - name: CockroachDB
      url: 'https://www.cockroachlabs.com'
      category: distributed-database
      reasoning: >-
        Distributed SQL database providing ACID transactions, strong
        consistency, and Jepsen-verified data integrity guarantees with replica
        verification.
    - name: MySQL
      url: 'https://www.mysql.com'
      category: relational-database
      reasoning: >-
        Relational database with support for constraints and transactions (with
        InnoDB), enabling database-level enforcement of data integrity rules.
    - name: MongoDB
      url: 'https://www.mongodb.com'
      category: document-database
      reasoning: >-
        Document database with schema validation, multi-document transactions,
        and consistency guarantees for maintaining application-defined data
        integrity.
    - name: Prisma
      url: 'https://www.prisma.io'
      category: orm
      reasoning: >-
        Object-relational mapping tool providing schema modeling with
        constraints, validation, and referential actions—bridging application
        and database integrity.
  courses:
    - url: 'https://www.distributedsystemscourse.com/'
      title: Distributed Systems Course
      provider: Martin Kleppmann / University of Cambridge
      paid: false
      reasoning: >-
        Free course covering distributed systems fundamentals including
        consistency, replication, and fault tolerance—essential for
        understanding data integrity in distributed contexts.
    - url: 'https://dataintensive.net/'
      title: Designing Data-Intensive Applications
      provider: O'Reilly / Martin Kleppmann
      paid: true
      reasoning: >-
        Comprehensive book (also available as course) covering transactions
        (Chapter 7), consistency and consensus (Chapter 9), and constraint
        design for data integrity.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Data integrity is the discipline of making invalid states unrepresentable. It
  is the opposite of trusting that application code will always do the right
  thing — which it will not, because application code is written by humans,
  deployed with bugs, upgraded in place, and bypassed by one-off scripts run in
  production at 2 a.m. The database is the last line of defense, and a database
  with weak constraints is a database that will accumulate garbage over time,
  silently and in ways that are expensive to clean up later.


  The most important constraint most teams underuse is the foreign key. It seems
  obvious — if you have an orders table that references a users table, the
  database should prevent you from creating an order for a user that does not
  exist, and it should prevent you from deleting a user who has orders, or
  cascade the deletion if that is intentional. In practice, many applications
  enforce referential integrity entirely in application code and omit the
  database constraint. This works fine until it does not: a background job with
  a bug, a direct database operation during an incident, a migration that runs
  out of order. Foreign keys do not slow down reads; they prevent corruption.
  The tradeoff is almost always worth it.


  Transactions and isolation levels are the other major piece that teams get
  wrong by relying on defaults. The default isolation level in most databases
  (READ COMMITTED in Postgres, MySQL, and SQL Server) prevents dirty reads but
  does not prevent non-repeatable reads or phantom reads. For operations that
  read a value, make a decision based on it, and write back a result, READ
  COMMITTED is insufficient — another transaction can modify the data between
  the read and the write. REPEATABLE READ or SERIALIZABLE prevents this, at the
  cost of more lock contention and occasional serialization failures that the
  application must retry. Understanding which isolation level a given operation
  needs is not optional for systems that handle financial data, inventory, or
  anything where double-processing has real consequences.


  Application-level validation and database constraints are not substitutes for
  each other; they serve different purposes. Application validation provides
  user-facing error messages, enforces business logic that changes over time,
  and catches errors before they reach the database. Database constraints
  provide guarantees that hold regardless of which code path or tool touches the
  data. Both layers are necessary. The failure mode of relying only on
  application validation is that any path that bypasses the application — direct
  SQL, migrations, data imports, background workers running older code — can
  violate invariants that the application assumes are always true.


  The 80/20: define NOT NULL on every column that must have a value, define
  UNIQUE constraints on every column that must be unique (the application should
  not be responsible for catching duplicates), define foreign keys for every
  relationship that should be referential, and use CHECK constraints for domain
  rules that can be expressed as a predicate. Then wrap multi-step write
  operations in transactions and choose isolation levels deliberately rather
  than accepting whatever the ORM defaults to. These five habits catch a
  category of bugs that are very hard to find any other way. Data integrity
  pairs directly with CRUD logic — constraints enforce the invariants that CRUD
  operations are supposed to maintain — and with data retention, since
  constraints affect what can be deleted and in what order.
pitfalls:
  - title: Omitting foreign key constraints in the database
    explanation: >-
      Enforcing referential integrity only in application code leaves the
      database unprotected against background jobs, direct SQL operations, and
      migrations that bypass the application layer. A foreign key constraint
      costs almost nothing on reads and prevents an entire class of
      orphaned-record bugs that are expensive to detect and clean up.
  - title: Accepting ORM isolation level defaults uncritically
    explanation: >-
      READ COMMITTED — the default in Postgres and MySQL — allows a second
      transaction to modify data between a read and a write in the same
      operation. For read-modify-write patterns (incrementing a counter,
      reserving inventory, applying a discount), this creates a race condition
      that produces incorrect results under concurrent load.
  - title: Relying solely on application validation for invariants
    explanation: >-
      Application validation is bypassed by scripts, migrations, bulk imports,
      and any code path that writes directly to the database. NOT NULL, UNIQUE,
      and CHECK constraints at the database level enforce invariants regardless
      of which code path touches the data. Both layers are necessary; neither is
      a substitute for the other.
  - title: Wrapping multi-step writes without a transaction
    explanation: >-
      A sequence of writes that succeeds partially — because of an exception, a
      timeout, or a crash between steps — leaves the database in an inconsistent
      state. Wrapping multi-step writes in a transaction guarantees they all
      commit or all roll back together, which is the only way to maintain
      consistency reliably.
  - title: Skipping CHECK constraints for domain rules
    explanation: >-
      Business rules like 'quantity must be positive' or 'status must be one of
      a fixed set' are often enforced only in application code, where they can
      be bypassed. CHECK constraints express these rules at the database level
      and fire regardless of how data enters the system, preventing invalid
      states from persisting.
codeExamples:
  - language: sql
    title: Schema constraints enforcing domain invariants
    code: |-
      CREATE TABLE users (
        id         BIGSERIAL PRIMARY KEY,
        email      TEXT        NOT NULL UNIQUE,
        status     TEXT        NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'suspended', 'deleted')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE orders (
        id          BIGSERIAL PRIMARY KEY,
        user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        total_cents INTEGER     NOT NULL CHECK (total_cents > 0),
        currency    CHAR(3)     NOT NULL CHECK (currency = UPPER(currency)),
        placed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Partial unique index: one active subscription per user
      CREATE UNIQUE INDEX one_active_sub_per_user
        ON subscriptions (user_id)
        WHERE cancelled_at IS NULL;
    reasoning: >-
      Showing NOT NULL, UNIQUE, CHECK, FOREIGN KEY with ON DELETE RESTRICT, and
      a partial unique index together demonstrates how database constraints form
      a layered defense that application code alone cannot replicate.
  - language: sql
    title: Serializable transaction preventing double-spend
    code: >-
      -- Wallet debit that cannot race: read balance, check, debit — all atomic

      BEGIN ISOLATION LEVEL SERIALIZABLE;


      -- Lock the wallet row for the duration of the transaction

      SELECT balance_cents

      FROM wallets

      WHERE user_id = $1

      FOR UPDATE;


      -- Application checks balance here; if insufficient, ROLLBACK

      -- Otherwise proceed:


      INSERT INTO ledger_entries (user_id, amount_cents, description,
      created_at)

      VALUES ($1, -$2, $3, NOW());


      UPDATE wallets

      SET balance_cents = balance_cents - $2

      WHERE user_id = $1
        AND balance_cents >= $2;  -- double-guard in case of concurrent update

      -- Verify exactly one row was updated

      -- If 0 rows: balance changed concurrently, ROLLBACK


      COMMIT;
    reasoning: >-
      A wallet debit using SELECT FOR UPDATE inside a SERIALIZABLE transaction
      concretely shows why isolation level choice matters for financial
      operations where READ COMMITTED would allow a double-spend race.
difficulty: intermediate
estimatedHours: 5
tldr: >-
  Prevent bad data from entering your system by enforcing rules at the database
  level (like preventing orphaned records) and wrapping critical operations in
  transactions.
shortExplainerVideo:
  url: 'https://www.youtube.com/watch?v=GAe5oB742dw'
  title: ACID Properties in Databases With Examples
  author: ByteByteGo
  durationSeconds: 297
  reasoning: >-
    ByteByteGo's 4:57 explainer covers all four ACID properties (Atomicity,
    Consistency, Isolation, Durability) with banking examples, directly
    illustrating the transaction and isolation-level mechanics that underpin
    data integrity. It explains how isolation levels prevent concurrent-access
    anomalies, which maps directly to the topic's core concern about READ
    COMMITTED vs REPEATABLE READ. Strong source, correct duration, high view
    count.
  source: ai-researcher
lastUpdatedAt: '2026-05-14T12:27:20.559Z'
---
<!-- user notes -->
