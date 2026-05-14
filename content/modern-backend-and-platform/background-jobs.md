---
slug: background-jobs
title: Background Jobs
phase: modern-backend-and-platform
order: 6
summary: >-
  Durable background jobs — BullMQ, pg-boss, Temporal, Inngest — with
  at-least-once semantics, schedules, and retries.
tldr: >-
  Queue work outside the request cycle to keep endpoints fast. Use durable
  queues, ensure idempotent workers, and implement retry logic.
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
  The moment you route a credit card charge, a transactional email, or a video
  encoding job through your synchronous request handler, you've made a mistake
  that will bite you in production. Slow third-party calls time out, users stare
  at spinners, and a single upstream hiccup causes your entire request pool to
  drain. Background job queues exist to isolate that work from the HTTP cycle —
  producers enqueue a payload and return immediately, while workers pick it up
  independently. This is not a premature optimization; it is table stakes for
  any application that touches external services.


  The 80/20 of picking a queue is simpler than the ecosystem makes it look. If
  your app already runs Postgres and your job volume is measured in thousands
  per day rather than millions, pg-boss is the correct starting point — you add
  zero infrastructure and get durable persistence, SKIP LOCKED-based
  concurrency, and a reasonable scheduling API. If you are on Node.js and
  already running Redis for sessions or caching, BullMQ gives you excellent
  developer ergonomics and cron scheduling. Resist the urge to reach for
  Temporal on day one; its operational overhead and learning curve are real
  costs you only justify when workflows are genuinely long-running, multi-step,
  or involve external approval gates.


  The failure modes in background job systems cluster around two themes:
  exactly-once assumptions and silent queue growth. At-least-once delivery is
  the default, which means your workers will occasionally process the same job
  twice — after a worker crash, after a timeout, after a retry storm. Workers
  that are not idempotent will double-charge cards, send duplicate welcome
  emails, and generate phantom records. This is not a hypothetical; it happens
  in production, and building idempotency into handlers from the start is far
  cheaper than discovering the problem after the fact. The second failure mode
  is the job queue silently filling up because workers are overwhelmed or broken
  — jobs are enqueued faster than they are consumed, latency climbs, and nothing
  alerts you until a user complains. Queue depth and processing latency are the
  two metrics you must monitor.


  The useful mental model is to think of a job queue as a durable buffer with a
  contract: the producer promises the work will happen eventually, the worker
  promises to acknowledge completion or signal failure so the queue can retry.
  What makes this contract meaningful is persistence — Redis-backed queues
  survive worker crashes but not Redis crashes without AOF persistence enabled,
  while Postgres-backed queues survive both. Managed durable-execution platforms
  like Inngest and Trigger.dev push the contract further: they store execution
  history, make function steps individually retriable, and let you view the
  state of any workflow at any point in time from a dashboard without deploying
  a sidecar server.


  In the broader ecosystem, background jobs sit between your API layer and every
  external dependency with unpredictable latency or failure rates. That includes
  payment processors, email providers, third-party APIs, AI model calls, and
  your own internal services that have separate deployment lifecycles. Getting
  comfortable with job queues early means you can expose new capabilities —
  scheduled reports, bulk exports, async onboarding flows — without any risk of
  degrading your core request path. The teams that treat background jobs as an
  afterthought spend enormous time debugging production incidents that would
  have been impossible if the work had been queued in the first place.
pitfalls:
  - title: Non-idempotent job handlers break under retries
    explanation: >-
      At-least-once delivery guarantees the job will run again if a worker
      crashes or the queue doesn't receive an acknowledgment. A handler that
      charges a card, sends an email, or increments a counter without
      idempotency guards will duplicate those effects on retry.
  - title: No dead-letter queue means silent job loss
    explanation: >-
      Jobs that exceed their retry budget are discarded unless a dead-letter
      queue is configured to capture them. Without DLQ inspection, failed jobs
      disappear and the underlying problem often goes unnoticed until a user
      reports missing data.
  - title: Blocking the HTTP response while waiting for job completion
    explanation: >-
      Enqueuing a job and then polling for its result inside the request handler
      defeats the purpose of async processing and causes timeouts under load.
      Fire-and-forget with a status-polling endpoint or webhook callback is the
      correct pattern.
  - title: Unbounded concurrency causes downstream service overload
    explanation: >-
      Spinning up workers without concurrency limits means a queue backlog gets
      processed in a burst that overwhelms the database or third-party API it
      depends on. Configure per-worker and per-queue concurrency limits before
      going to production.
  - title: Cron jobs without overlap protection run concurrently
    explanation: >-
      A scheduled job that takes longer than its interval will overlap with the
      next invocation unless the queue enforces single-concurrency or uses a
      distributed lock. Overlapping cron instances routinely cause
      double-processing of records and corrupted aggregations.
codeExamples:
  - language: typescript
    title: BullMQ Worker with Idempotent Handler
    code: |-
      import { Queue, Worker } from "bullmq";
      import { Redis } from "ioredis";

      const connection = new Redis({ maxRetriesPerRequest: null });

      // Producer: enqueue a job (idempotency key prevents duplicates)
      export const emailQueue = new Queue("email", { connection });

      export async function enqueueWelcomeEmail(userId: string) {
        await emailQueue.add(
          "welcome",
          { userId },
          {
            jobId: `welcome:${userId}`, // idempotent — duplicate enqueues are no-ops
            attempts: 5,
            backoff: { type: "exponential", delay: 2000 }
          }
        );
      }

      // Worker: consumes jobs, safe to call multiple times
      const worker = new Worker(
        "email",
        async (job) => {
          const { userId } = job.data as { userId: string };
          console.log(`[${job.id}] Sending welcome email to user ${userId}`);

          // Actual send — must be idempotent (check DB if already sent)
          await sendEmail(userId);
        },
        { connection, concurrency: 5 }
      );

      worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed:`, err.message);
      });

      async function sendEmail(userId: string) {
        // Placeholder: call your email provider SDK here
        console.log(`Email sent to ${userId}`);
      }
    reasoning: >-
      Shows BullMQ with a stable jobId for idempotent enqueuing and exponential
      backoff retries — the two patterns that prevent duplicate emails and
      handle transient failures.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.570Z'
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
