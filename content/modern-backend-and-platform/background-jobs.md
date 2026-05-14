---
slug: background-jobs
title: Background Jobs
phase: modern-backend-and-platform
order: 6
summary: >-
  Durable background jobs — BullMQ, pg-boss, Temporal, Inngest — with
  at-least-once semantics, schedules, and retries.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Background jobs are units of work executed outside the synchronous
  request/response cycle, allowing applications to offload slow or failure-prone
  tasks—sending emails, processing uploads, charging cards—without blocking the
  user. A job queue sits between producers (your web servers) and workers
  (dedicated processes), persisting job payloads so nothing is lost if a worker
  crashes. Delivery semantics matter: most queues guarantee at-least-once
  execution, which means workers must be idempotent to handle retries safely.


  The landscape spans simple Redis-backed queues like BullMQ (great for Node.js
  with familiar APIs and cron scheduling), Postgres-backed queues like pg-boss
  (no extra infrastructure beyond your existing DB, with SKIP LOCKED for safe
  concurrent consumers), and full durable-execution engines like Temporal and
  Inngest. Durable execution engines store the entire execution history, making
  it possible to pause a workflow mid-flight, survive process crashes, and
  resume exactly where execution left off without re-running completed steps.


  Choosing between them involves tradeoffs around operational complexity,
  latency, and workflow expressiveness. BullMQ is the lowest-friction starting
  point for typical Node.js apps. pg-boss removes Redis as a dependency. Inngest
  and Trigger.dev offer managed hosted infrastructure with zero worker
  management. Temporal excels when workflows are long-running, multi-step, or
  involve human-in-the-loop pauses—but it comes with the cost of running a
  dedicated server and steeper learning curve.
shortExplainerVideo: null
narrative: >-
  Pending narrative — at least 400 characters of plain-English explanation of
  why this topic matters, what the dominant failure modes are, and how a learner
  should approach it. Replace this placeholder before publishing. Placeholder
  body. Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. 
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
lastUpdatedAt: '2026-05-14T12:26:04.520Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=PCZghg9ySrY'
      title: What is Temporal? Durable Execution Explained
      author: Temporal
      durationMinutes: 15
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Concise, authoritative explainer from the Temporal team covering what
        durable execution is and why it matters—directly relevant to the hardest
        concept in background job systems.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=xs98bmeb-LQ'
      title: 'NestJS + BullMQ | Queue, Workers & Redis for Scalable Background Jobs'
      author: Marius Espejo
      durationMinutes: 45
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Hands-on walkthrough of real-world BullMQ integration covering queues,
        workers, retries, and Redis—the most common production setup for Node.js
        background jobs.
      source: ai-researcher
  articles:
    - url: 'https://brandur.org/job-drain'
      title: Transactionally Staged Job Drains in Postgres
      kind: engineering-blog
      reasoning: >-
        Brandur's canonical article explaining how to atomically enqueue jobs
        inside a database transaction, preventing the dual-write problem that
        causes lost or phantom jobs.
      author: Brandur Leach
      source: ai-researcher
    - url: 'https://www.inngest.com/blog/how-durable-workflow-engines-work'
      title: 'How a durable workflow engine works: you might not need a queue'
      kind: engineering-blog
      reasoning: >-
        Clear explanation of how durable execution engines store and replay step
        results, helping engineers understand the architectural difference
        between a queue and a workflow engine.
      publisher: Inngest
      source: ai-researcher
    - url: >-
        https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
      title: Making retries safe with idempotent APIs
      kind: engineering-blog
      reasoning: >-
        AWS Builders Library article on idempotency—the foundational property
        every background job consumer needs to handle at-least-once delivery
        safely.
      publisher: AWS
      source: ai-researcher
  services:
    - name: BullMQ
      url: 'https://bullmq.io/'
      category: self-hosted queue library
      reasoning: >-
        The de-facto Redis-backed job queue for Node.js; battle-tested, actively
        maintained, with built-in retries, rate limiting, and cron scheduling.
      vendor: Taskforce.sh
      source: ai-researcher
    - name: Inngest
      url: 'https://www.inngest.com/'
      category: managed durable workflow platform
      reasoning: >-
        Serverless-friendly durable execution engine with no worker
        infrastructure to manage; integrates directly into Next.js and other
        frameworks via a simple SDK.
      vendor: Inngest Inc.
      source: ai-researcher
    - name: Trigger.dev
      url: 'https://trigger.dev/'
      category: managed background jobs platform
      reasoning: >-
        Open-source TypeScript-first background jobs platform with long-running
        task support, real-time monitoring, and cloud or self-hosted deployment.
      vendor: Trigger.dev
      source: ai-researcher
    - name: Temporal
      url: 'https://temporal.io/'
      category: durable execution engine
      reasoning: >-
        Production-proven durable workflow platform used at Uber, Stripe, and
        others; the gold standard for complex multi-step long-running workflows.
      vendor: Temporal Technologies
      source: ai-researcher
    - name: pg-boss
      url: 'https://github.com/timgit/pg-boss'
      category: self-hosted queue library
      reasoning: >-
        Postgres-backed job queue that eliminates Redis as a dependency, using
        SKIP LOCKED for safe concurrent workers and transactional job
        enqueueing.
      vendor: open source
      source: ai-researcher
  courses:
    - url: 'https://temporal.io/blog/what-is-durable-execution'
      title: The definitive guide to Durable Execution
      provider: Temporal blog
      paid: false
      reasoning: >-
        Deep written guide from Temporal on how durable execution works
        conceptually—essential reading before adopting Temporal or Inngest.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.520Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
