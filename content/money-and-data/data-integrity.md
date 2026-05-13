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
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
