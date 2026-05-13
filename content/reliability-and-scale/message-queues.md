---
slug: message-queues
title: Message Queues & Job Processing
phase: reliability-and-scale
order: 5
summary: >-
  Offload slow or failure-prone work to asynchronous job queues to improve
  response times, decouple services, and absorb traffic spikes.
definition: >-
  Message queues are asynchronous communication systems that decouple producers
  from consumers, enabling services to operate independently and reliably. They
  absorb traffic spikes, enable horizontal scaling by distributing work across
  multiple consumers, and provide fault tolerance through message persistence
  and retry mechanisms. Modern architectures use message queues to offload slow
  or failure-prone operations like sending emails, processing videos, or
  updating indexes—freeing request handlers to respond quickly while background
  workers process jobs at their own pace.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=DYFocSiPOl8'
      title: Message Queues in System Design
      author: System Design Basics
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Concise explanation of message queue fundamentals, producer-consumer
        patterns, and use cases in system architecture
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=1ISRd0bS714'
      title: Message Queues in System Design Interviews w/ Meta Staff Engineer
      author: System Design Primer
      durationMinutes: 28
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive with real-world perspective from senior engineer covering
        design patterns, trade-offs, and production considerations
      source: ai-researcher
  articles:
    - url: 'https://aws.amazon.com/builders-library/avoiding-overload/'
      title: Avoiding Overload
      kind: canonical-doc
      reasoning: >-
        AWS best practice guide on using message queues to prevent system
        overload and handle traffic spikes through asynchronous processing
      publisher: Amazon Web Services
      source: ai-researcher
    - url: 'https://brandur.org/articles'
      title: 'River: a Fast, Robust Job Queue for Go + Postgres'
      kind: canonical-doc
      reasoning: >-
        Explores transactional job queues and failure handling patterns in
        Postgres-backed systems for reliable background job processing
      publisher: Brandur Leach
      source: ai-researcher
    - url: 'https://www.rabbitmq.com/getstarted.html'
      title: RabbitMQ Getting Started Guide
      kind: tutorial
      reasoning: >-
        Official RabbitMQ tutorials covering AMQP patterns, work distribution,
        request/reply, and streams with multiple language examples
      publisher: RabbitMQ
      source: ai-researcher
    - url: 'https://www.confluent.io/learn/'
      title: Confluent Learning Resources
      kind: tutorial
      reasoning: >-
        Comprehensive learning platform for Apache Kafka fundamentals, stream
        processing, event-driven architecture, and real-time data patterns
      publisher: Confluent
      source: ai-researcher
    - url: >-
        https://redis.io/tutorials/redis-backed-job-queue-for-background-workers/
      title: Build a Redis-backed Job Queue with Streams
      kind: tutorial
      reasoning: >-
        Production guide for building job queues with Redis Streams including
        consumer groups, retries, dead-letter handling, and failure recovery
      publisher: Redis
      source: ai-researcher
  services:
    - name: Apache Kafka
      url: 'https://kafka.apache.org'
      category: distributed-streaming
      reasoning: >-
        High-throughput, distributed event streaming platform for building
        real-time data pipelines; handles millions of events/sec with strong
        durability and replay capabilities
      source: ai-researcher
    - name: RabbitMQ
      url: 'https://www.rabbitmq.com'
      category: message-broker
      reasoning: >-
        AMQP-based message broker with flexible routing, multiple messaging
        patterns (point-to-point, pub/sub, RPC), and broad language support
      source: ai-researcher
    - name: AWS SQS
      url: 'https://aws.amazon.com/sqs/'
      category: managed-queue
      reasoning: >-
        Fully managed queue service for decoupling microservices; simple API,
        automatic scaling, and built-in reliability across AZs
      vendor: Amazon Web Services
      source: ai-researcher
    - name: Redis
      url: 'https://redis.io'
      category: in-memory-store
      reasoning: >-
        Fast in-memory data store with native Streams and Pub/Sub for
        lightweight job queues, real-time messaging, and high-performance
        caching
      source: ai-researcher
    - name: Google Cloud Pub/Sub
      url: 'https://cloud.google.com/pubsub'
      category: managed-pubsub
      reasoning: >-
        Fully managed pub/sub messaging service for decoupling applications;
        handles millions of messages/sec with flexible subscription models
      vendor: Google Cloud
      source: ai-researcher
    - name: Sidekiq
      url: 'https://sidekiq.org'
      category: background-jobs
      reasoning: >-
        Popular Ruby background job framework using Redis; supports millions of
        jobs with threading, retries, scheduled jobs, and simple integration
        with Rails
      source: ai-researcher
    - name: Temporal
      url: 'https://temporal.io'
      category: workflow-orchestration
      reasoning: >-
        Durable execution platform for long-running, multi-step workflows;
        handles state persistence, retries, and timeout handling across service
        restarts
      source: ai-researcher
    - name: Inngest
      url: 'https://www.inngest.com'
      category: serverless-workflows
      reasoning: >-
        Event-driven workflow platform designed for serverless; runs on
        Lambda/Workers, manages durable execution without stateful backend
        infrastructure
      source: ai-researcher
  courses:
    - url: 'https://www.confluent.io/training/'
      title: Confluent Apache Kafka Training & Certification
      provider: Confluent
      paid: true
      reasoning: >-
        Official Confluent instructor-led and self-paced training for CCDAK and
        CCAAK certifications; covers fundamentals through advanced Kafka topics
      source: ai-researcher
    - url: 'https://developer.confluent.io'
      title: Confluent Developer Learning Pathways
      provider: Confluent
      paid: false
      reasoning: >-
        Free learning platform with 25+ pathways covering Kafka, Flink,
        event-driven architecture, and real-time processing across multiple
        languages
      source: ai-researcher
    - url: 'https://www.coursera.org/learn/using-kafka-on-confluent'
      title: Using Kafka on Confluent
      provider: Coursera
      paid: true
      reasoning: >-
        Structured course on Confluent Cloud and Kafka fundamentals; includes
        hands-on labs and practical deployment patterns
      source: ai-researcher
    - url: 'https://docs.cloud.google.com/run/docs/tutorials/pubsub'
      title: Google Cloud Pub/Sub with Cloud Run Tutorial
      provider: Google Cloud
      paid: false
      reasoning: >-
        Free hands-on tutorial demonstrating integration of Pub/Sub with Cloud
        Run for event-driven serverless architectures
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
