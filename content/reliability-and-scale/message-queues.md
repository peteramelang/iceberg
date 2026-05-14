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
    long:
      url: 'https://www.youtube.com/watch?v=1ISRd0bS714'
      title: Message Queues in System Design Interviews w/ Meta Staff Engineer
      author: System Design Primer
      durationMinutes: 28
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive with real-world perspective from senior engineer covering
        design patterns, trade-offs, and production considerations
  articles:
    - url: 'https://aws.amazon.com/builders-library/avoiding-overload/'
      title: Avoiding Overload
      kind: canonical-doc
      reasoning: >-
        AWS best practice guide on using message queues to prevent system
        overload and handle traffic spikes through asynchronous processing
    - url: 'https://brandur.org/articles'
      title: 'River: a Fast, Robust Job Queue for Go + Postgres'
      kind: canonical-doc
      reasoning: >-
        Explores transactional job queues and failure handling patterns in
        Postgres-backed systems for reliable background job processing
    - url: 'https://www.rabbitmq.com/getstarted.html'
      title: RabbitMQ Getting Started Guide
      kind: tutorial
      reasoning: >-
        Official RabbitMQ tutorials covering AMQP patterns, work distribution,
        request/reply, and streams with multiple language examples
    - url: 'https://www.confluent.io/learn/'
      title: Confluent Learning Resources
      kind: tutorial
      reasoning: >-
        Comprehensive learning platform for Apache Kafka fundamentals, stream
        processing, event-driven architecture, and real-time data patterns
    - url: >-
        https://redis.io/tutorials/redis-backed-job-queue-for-background-workers/
      title: Build a Redis-backed Job Queue with Streams
      kind: tutorial
      reasoning: >-
        Production guide for building job queues with Redis Streams including
        consumer groups, retries, dead-letter handling, and failure recovery
  services:
    - name: Apache Kafka
      url: 'https://kafka.apache.org'
      category: distributed-streaming
      reasoning: >-
        High-throughput, distributed event streaming platform for building
        real-time data pipelines; handles millions of events/sec with strong
        durability and replay capabilities
    - name: RabbitMQ
      url: 'https://www.rabbitmq.com'
      category: message-broker
      reasoning: >-
        AMQP-based message broker with flexible routing, multiple messaging
        patterns (point-to-point, pub/sub, RPC), and broad language support
    - name: AWS SQS
      url: 'https://aws.amazon.com/sqs/'
      category: managed-queue
      reasoning: >-
        Fully managed queue service for decoupling microservices; simple API,
        automatic scaling, and built-in reliability across AZs
    - name: Redis
      url: 'https://redis.io'
      category: in-memory-store
      reasoning: >-
        Fast in-memory data store with native Streams and Pub/Sub for
        lightweight job queues, real-time messaging, and high-performance
        caching
    - name: Google Cloud Pub/Sub
      url: 'https://cloud.google.com/pubsub'
      category: managed-pubsub
      reasoning: >-
        Fully managed pub/sub messaging service for decoupling applications;
        handles millions of messages/sec with flexible subscription models
    - name: Sidekiq
      url: 'https://sidekiq.org'
      category: background-jobs
      reasoning: >-
        Popular Ruby background job framework using Redis; supports millions of
        jobs with threading, retries, scheduled jobs, and simple integration
        with Rails
    - name: Temporal
      url: 'https://temporal.io'
      category: workflow-orchestration
      reasoning: >-
        Durable execution platform for long-running, multi-step workflows;
        handles state persistence, retries, and timeout handling across service
        restarts
    - name: Inngest
      url: 'https://www.inngest.com'
      category: serverless-workflows
      reasoning: >-
        Event-driven workflow platform designed for serverless; runs on
        Lambda/Workers, manages durable execution without stateful backend
        infrastructure
  courses:
    - url: 'https://www.confluent.io/training/'
      title: Confluent Apache Kafka Training & Certification
      provider: Confluent
      paid: true
      reasoning: >-
        Official Confluent instructor-led and self-paced training for CCDAK and
        CCAAK certifications; covers fundamentals through advanced Kafka topics
    - url: 'https://developer.confluent.io'
      title: Confluent Developer Learning Pathways
      provider: Confluent
      paid: false
      reasoning: >-
        Free learning platform with 25+ pathways covering Kafka, Flink,
        event-driven architecture, and real-time processing across multiple
        languages
    - url: 'https://www.coursera.org/learn/using-kafka-on-confluent'
      title: Using Kafka on Confluent
      provider: Coursera
      paid: true
      reasoning: >-
        Structured course on Confluent Cloud and Kafka fundamentals; includes
        hands-on labs and practical deployment patterns
    - url: 'https://docs.cloud.google.com/run/docs/tutorials/pubsub'
      title: Google Cloud Pub/Sub with Cloud Run Tutorial
      provider: Google Cloud
      paid: false
      reasoning: >-
        Free hands-on tutorial demonstrating integration of Pub/Sub with Cloud
        Run for event-driven serverless architectures
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Message queues solve a specific and important class of problem: you want to do
  some work, but you don't want to make the user wait for it. Sending a welcome
  email after signup doesn't need to happen before you return a success response
  to the user. Processing an uploaded video can take ten minutes and that's
  fine, as long as it eventually happens. Updating a search index after a
  product listing changes can lag a bit behind the write. These are exactly the
  scenarios where queues shine — offload the work from the request handler to a
  background worker, and suddenly your API is fast and your expensive operations
  are handled reliably and asynchronously. The failure mode when you don't do
  this is an API that's slow because it's doing too much, or worse, one that
  fails entirely when a downstream service is slow or unavailable.


  The 80/20 of message queues is understanding the guarantees your queue
  provides and designing your consumers around them. Almost every
  production-grade queue — SQS, RabbitMQ, Kafka, Google Pub/Sub — delivers
  messages at-least-once, not exactly-once. This means your consumer will
  occasionally process the same message twice, and your job handler must be
  idempotent: processing a message twice should produce the same result as
  processing it once. If you design your consumers assuming exactly-once
  delivery, you'll get duplicate sends, duplicate writes, and duplicate charges
  in production, because the edge cases that trigger redelivery (crashes, slow
  acks, network partitions) happen regularly at scale. Build idempotency in from
  the start and treat double-delivery as a normal operating condition, not an
  exceptional one.


  Dead-letter queues are the second most important concept to get right early.
  When a consumer fails to process a message repeatedly — because the payload is
  malformed, because it depends on data that doesn't exist, or because there's a
  bug in the consumer logic — the message needs somewhere to go. Without a
  dead-letter queue, you end up with two bad options: drop the message (losing
  work) or keep retrying forever (blocking the queue and burning compute on a
  message that will never succeed). A DLQ gives you a third option: after N
  failed attempts, park the message somewhere safe, alert on it, and give an
  engineer time to investigate and replay it once the underlying issue is
  resolved. This turns an unrecoverable failure into a recoverable one, which is
  the difference between losing data and debugging a problem.


  Kafka deserves specific mention because it's architecturally different from
  traditional message queues in ways that matter. SQS and RabbitMQ are work
  queues — messages are consumed, acknowledged, and deleted. Kafka is a
  distributed log — messages are written to a topic and retained for a
  configured period, and consumers track their own position (offset) in that
  log. This means multiple independent consumer groups can read the same stream
  at different speeds, you can replay historical messages to rebuild a derived
  dataset, and you can add new consumers without affecting existing ones. The
  tradeoff is operational complexity: Kafka requires careful partition tuning,
  offset management, and consumer group coordination. For simple background job
  processing, SQS or a Redis-backed job queue like Sidekiq or BullMQ is usually
  a better fit. Kafka's power is in event streaming and log-based architectures
  where the replay and fan-out capabilities justify the complexity.


  The mental model that ties everything together is thinking of a message queue
  as a buffer between the rate at which your system produces work and the rate
  at which it can safely consume it. Traffic spikes don't crash your workers —
  they fill the queue, and the workers drain it at their own pace. A slow
  downstream service doesn't block your API — the message waits in the queue
  until the downstream recovers. A consumer deploy causes a brief pause in
  processing, not a user-facing error. Queues are fundamentally about
  decoupling: decoupling producers from consumers, decoupling the timing of work
  from the timing of requests, and decoupling the failure of one component from
  the failure of another. When you understand them that way, you can make clear
  decisions about when they're the right tool and when simpler synchronous
  approaches are good enough.
pitfalls:
  - title: Consumers that are not idempotent produce duplicates
    explanation: >-
      Every production queue delivers messages at-least-once, meaning the same
      message can arrive twice during a worker crash, a slow ack, or a network
      partition. Consumer logic that is not idempotent will send duplicate
      emails, double-write records, or charge users twice under these normal
      operating conditions. Design every consumer to be safe to run multiple
      times on the same message before writing any processing logic.
  - title: No dead-letter queue means poison messages block the queue
    explanation: >-
      A malformed message, a missing dependency, or a bug in consumer logic can
      cause a message to fail every processing attempt indefinitely. Without a
      dead-letter queue, you must choose between dropping the message (losing
      work) or retrying forever (burning compute and potentially starving
      healthy messages). Configure a DLQ from the start so poison messages are
      quarantined after N attempts, alerting on anything that lands there.
  - title: Unbounded retry loops amplify downstream failures
    explanation: >-
      When a downstream service goes down, a consumer that retries failed
      messages immediately and indefinitely turns a temporary dependency outage
      into a thundering-herd attack on recovery: the queue drains its backlog of
      failed messages at full speed the moment the service comes back up. Use
      exponential backoff with jitter on retries so consumers back off under
      failure conditions and give the downstream service time to recover.
  - title: Using Kafka where a simple job queue is sufficient
    explanation: >-
      Kafka is operationally complex — partition tuning, offset management,
      consumer group coordination, and schema management all require expertise
      to run well. Teams that adopt it for basic background job processing
      inherit that complexity without gaining the distributed-log capabilities
      (replay, fan-out, ordered event streams) that justify it. For tasks like
      sending emails or processing uploads, a Redis-backed job queue or SQS is
      simpler to operate and reason about.
  - title: 'Queue depth not monitored, so backlogs go undetected'
    explanation: >-
      A queue that is accumulating messages faster than consumers drain it will
      eventually reach a depth where processing lag is hours or days behind
      real-time. Without monitoring queue depth and consumer throughput, this
      backlog builds silently until a user complains that their background job
      has not completed. Alert when queue depth exceeds a threshold or when the
      processing rate falls below the ingestion rate.
  - title: Large message payloads embedded directly in the queue
    explanation: >-
      Message queues impose size limits — SQS caps at 256KB per message, for
      instance — and embedding large payloads directly in messages hits those
      limits, causes serialization overhead, and makes queue inspection
      difficult. Store large payloads (images, documents, large JSON blobs) in
      object storage and put only the reference key in the message. This keeps
      messages small, decouples payload lifecycle from queue lifecycle, and
      sidesteps size limits entirely.
codeExamples:
  - language: python
    title: Idempotent SQS Consumer with Dead-Letter Queue
    code: >-
      """Consume SQS messages exactly once using a processed-IDs set,

      and move unprocessable messages to a dead-letter queue after max
      retries."""

      import boto3

      import json


      SQUEUE_URL = "https://sqs.us-east-1.amazonaws.com/123456789/orders"

      # DLQ is configured on the SQS queue itself (maxReceiveCount=3 in queue
      attrs);

      # messages that fail 3 times are automatically moved there by AWS.


      sqs = boto3.client("sqs", region_name="us-east-1")

      # In production use Redis or a DB table; a set works for the illustration

      processed_ids: set = set()


      def send_welcome_email(order_id: str, email: str) -> None:
          print(f"Sending welcome email for order {order_id} to {email}")

      def process_message(body: dict, receipt_handle: str) -> None:
          order_id = body["order_id"]

          # Idempotency guard — SQS delivers at-least-once
          if order_id in processed_ids:
              print(f"Duplicate delivery for {order_id}, skipping")
              sqs.delete_message(QueueUrl=SQUEUE_URL, ReceiptHandle=receipt_handle)
              return

          send_welcome_email(order_id, body["email"])
          processed_ids.add(order_id)
          sqs.delete_message(QueueUrl=SQUEUE_URL, ReceiptHandle=receipt_handle)
          print(f"Processed and deleted {order_id}")

      def poll_forever() -> None:
          while True:
              resp = sqs.receive_message(
                  QueueUrl=SQUEUE_URL,
                  MaxNumberOfMessages=10,
                  WaitTimeSeconds=20,  # long-poll to reduce empty receives
              )
              for msg in resp.get("Messages", []):
                  try:
                      process_message(json.loads(msg["Body"]), msg["ReceiptHandle"])
                  except Exception as exc:
                      # Do NOT delete — SQS will redeliver and eventually DLQ it
                      print(f"Failed to process {msg['MessageId']}: {exc}")

      poll_forever()
    reasoning: >-
      Shows the two most important SQS consumer patterns together — idempotency
      guard against duplicate delivery and deliberate non-deletion on failure so
      the DLQ can catch unprocessable messages.
  - language: typescript
    title: Enqueue Background Job from HTTP Handler
    code: >-
      import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

      import { randomUUID } from "crypto";


      const sqs = new SQSClient({ region: "us-east-1" });

      const QUEUE_URL = process.env.JOB_QUEUE_URL!;


      interface OrderCreatedPayload {
        orderId: string;
        userId: string;
        email: string;
        amountCents: number;
      }


      async function enqueueOrderCreated(payload: OrderCreatedPayload):
      Promise<void> {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(payload),
            // MessageDeduplicationId makes FIFO queues idempotent on the send side
            MessageDeduplicationId: payload.orderId,
            MessageGroupId: payload.userId, // FIFO per user preserves order
          })
        );
      }


      // Simulated HTTP POST /orders handler

      async function handleCreateOrder(req: { body: Omit<OrderCreatedPayload,
      "orderId"> }) {
        const orderId = randomUUID();
        // 1. Write to DB (synchronous — user waits for this)
        console.log(`Order ${orderId} saved to database`);

        // 2. Enqueue slow work (async — user does NOT wait for this)
        await enqueueOrderCreated({ orderId, ...req.body });

        // Return immediately; worker sends email, charges card, updates index, etc.
        return { orderId, status: "created" };
      }


      handleCreateOrder({ body: { userId: "usr_1", email: "alice@example.com",
      amountCents: 4999 } })
        .then(console.log);
    reasoning: >-
      Demonstrates the HTTP handler pattern that keeps APIs fast: write to the
      DB synchronously for the user-facing response, then enqueue all slow
      downstream work so the response returns in milliseconds.
difficulty: intermediate
estimatedHours: 6
tldr: >-
  Offload slow work to a background queue so your API stays fast—emails, video
  processing, and indexes don't make users wait.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.907Z'
---
<!-- user notes -->
