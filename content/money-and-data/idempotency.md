---
slug: idempotency
title: Idempotency
phase: money-and-data
order: 4
summary: >-
  Design APIs and background jobs so that retrying an operation never produces
  duplicate side effects such as double-charges or duplicate records.
definition: >-
  Idempotency is a foundational pattern for building reliable distributed
  systems. It ensures that repeating an API request or retrying a background job
  multiple times produces the same result as executing it once, eliminating
  duplicate side effects. This is critical when network failures, timeouts, or
  retries leave clients uncertain whether operations completed.


  Implementing idempotency requires two key components: (1) client-provided
  unique identifiers (idempotency keys) that travel with requests, and (2)
  server-side deduplication logic that stores results indexed by these keys,
  returning cached results on retries rather than re-executing. For mutations to
  external services (payments, notifications, etc.), the server must track which
  external calls succeeded, then replay their results on retry without repeating
  the external call. For internal state changes, atomic transactions ensure all
  mutations are paired with the idempotency key in a single commit.


  IDempotent design is especially important in microservices, event-driven
  systems, and background job processors where failures and network partitions
  are inevitable. It shifts complexity from client retry logic to the server,
  enabling transparent SDK-level retries and greatly simplifying distributed
  systems engineering.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://brandur.org/idempotency-keys'
      title: Implementing Stripe-like Idempotency Keys in Postgres
      kind: canonical-doc
      reasoning: >-
        Canonical deep dive on idempotency key design. Covers atomic phases,
        recovery points, and foreign state mutation handling with a practical
        payment-processing example.
    - url: 'https://stripe.com/blog/idempotency'
      title: Designing robust and predictable APIs with idempotency
      kind: canonical-doc
      reasoning: >-
        Stripe's official idempotency primer. Explains the problem (network
        unreliability), idempotency principles, HTTP semantics, retry
        strategies, and responsible backoff.
    - url: >-
        https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
      title: Making Retries Safe with Idempotent APIs
      kind: canonical-doc
      reasoning: >-
        AWS Builders Library canonical resource. Covers unique request
        identifiers, semantic equivalence, atomic storage, token retention, and
        edge cases like late-arriving requests.
    - url: 'https://thecodeforge.io/system-design/idempotency-api-design/'
      title: 'Idempotency in API Design: Why It Matters and How to Build It Right'
      kind: tutorial
      reasoning: >-
        2026 tutorial with real-world analogies, code examples, and common
        mistakes. Covers Idempotency-Key headers for POST/PATCH operations and
        practical checkout/payment scenarios.
    - url: 'https://blog.bytebytego.com/p/mastering-idempotency-building-reliable'
      title: 'Mastering Idempotency: Building Reliable APIs'
      kind: engineering-blog
      reasoning: >-
        ByteByteGo engineering deep-dive on idempotent API design patterns,
        request deduplication, and production implementation strategies.
  services:
    - name: Stripe
      url: 'https://stripe.com'
      category: payments
      reasoning: >-
        Stripe's Idempotency-Key header standard is widely adopted across
        payment platforms. Enables exactly-once charging semantics via
        client-provided UUIDs.
    - name: AWS SQS
      url: 'https://aws.amazon.com/sqs/'
      category: message-queue
      reasoning: >-
        Message deduplication feature provides idempotency for asynchronous job
        processing. Deduplication IDs and 5-minute windows prevent duplicate
        processing.
    - name: Temporal
      url: 'https://temporal.io'
      category: durable-execution
      reasoning: >-
        Durable execution engine with built-in workflow and activity
        idempotency. Workflow ID acts as idempotency key; activities support
        retry-safe deduplication.
    - name: Inngest
      url: 'https://www.inngest.com'
      category: durable-execution
      reasoning: >-
        Workflow engine with event-level and function-level idempotency
        guarantees. 24-hour deduplication windows and step-level execution
        safety for background jobs.
    - name: Redis
      url: 'https://redis.io'
      category: cache-storage
      reasoning: >-
        Can implement custom idempotency key storage with atomic SET/GET and
        automatic expiration. Suitable for high-throughput deduplication caches.
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The failure mode that idempotency prevents is one of the worst kinds: a user
  gets charged twice, or an email goes out three times, or a record gets created
  in duplicate — and your system has no idea it happened. These aren't
  hypothetical edge cases. Any time a network call can time out, a server can
  restart mid-request, or a client can retry after not hearing back, you're in
  territory where the operation may have succeeded on the server even though the
  client never received confirmation. In payment systems this is catastrophic.
  In notification systems it's embarrassing. In inventory or ledger systems it's
  an audit nightmare. If you're building anything where operations have side
  effects — and almost everything interesting does — skipping idempotency means
  your retry logic is secretly a duplicate-action machine.


  The core of it is simple enough to explain in a sentence: give each operation
  a unique identifier, and let the server use that identifier to decide "I've
  already done this" instead of doing it again. In practice, this means the
  client generates an idempotency key (a UUID, typically) before sending a
  request and includes it in every attempt. The server stores the result of the
  first successful execution keyed on that identifier, and on any subsequent
  request with the same key, it returns the stored result without re-executing.
  That's the whole thing. The complexity is entirely in the implementation
  details: what do you store, where do you store it, how long do you keep it,
  and what happens when a request is still in-flight when the retry arrives.


  The 80/20 is this: get the key generation and deduplication right for your
  mutation endpoints, and you've solved most of the problem. The subtle part is
  external side effects — if your handler charges a card and then sends an
  email, you need to track which of those external calls succeeded in the first
  attempt, because on retry you want to skip the charge (already done) while
  potentially still sending the email (if that failed). This is where naive
  implementations break down. The server-side deduplication table needs to
  record not just "this key has been processed" but which external actions were
  taken, so retry can replay the results rather than repeat the actions.
  Stripe's API is the canonical example to study here — their implementation of
  idempotency keys handles this correctly and their documentation explains the
  reasoning in depth.


  A failure mode that trips up even experienced engineers is the "at-least-once
  vs. exactly-once" confusion. Message queues like SQS or Kafka almost always
  deliver at-least-once, which means your consumers need to be idempotent
  regardless of what you do at the API layer. Background job processors face the
  same problem: a job can be picked up by two workers simultaneously if the
  first takes too long and the lock expires. If the job handler isn't
  idempotent, you get duplicate sends, double-writes, or corrupted state. The
  fix is the same pattern — track a job ID, check before acting, commit the
  result atomically with the deduplication record.


  The mental model to internalize is that idempotency is a server-side
  responsibility, not a client-side one. Clients should retry aggressively, on
  any error they're uncertain about, without worrying about what happens on the
  server. The server's job is to make that safe. When you design with this in
  mind, you get distributed systems where failures are handled transparently —
  the SDK retries, the server deduplicates, and the user sees a successful
  outcome without knowing anything went wrong. That's the goal. It moves
  complexity out of the coordination layer ("how do I know if this succeeded?")
  and into the implementation layer ("how do I store and check deduplication
  state?"), which is a much better place for it to live.
pitfalls:
  - title: Double-charging users on payment retries
    explanation: >-
      A payment request times out, the client retries, and the charge succeeds
      twice because the server has no deduplication logic. This is the most
      painful and visible failure of missing idempotency, and it happens in real
      production systems regularly. Use a client-generated idempotency key on
      every mutation, store the result on first success, and return the stored
      result on any retry with the same key.
  - title: Assuming message queues deliver exactly once
    explanation: >-
      SQS, Kafka, RabbitMQ, and virtually every production queue guarantee
      at-least-once delivery, not exactly-once. Consumer code that assumes each
      message arrives exactly once will silently produce duplicate emails,
      duplicate writes, or duplicate external API calls when the queue
      redelivers a message after a slow ack or worker crash. Treat
      double-delivery as a normal operating condition and make every consumer
      idempotent from the start.
  - title: Not tracking which external side effects completed
    explanation: >-
      A handler that charges a card and then sends an email needs to know, on
      retry, which of those two steps already succeeded. Naively re-running the
      handler on retry charges the card again even if the card step succeeded
      and only the email failed. Store the outcome of each external action
      alongside the idempotency key so retries replay results rather than repeat
      actions.
  - title: Idempotency key generated server-side
    explanation: >-
      If the server generates the idempotency key, a request that never arrives
      cannot be retried safely — the client has no key to send on the second
      attempt. The key must be generated by the client before the first attempt
      and sent with every retry. This is the whole point: the key is the shared
      identifier that lets server and client agree that multiple attempts refer
      to the same operation.
  - title: In-flight collision between original and retry
    explanation: >-
      A retry arrives while the original request is still being processed.
      Without a locking mechanism, both proceed concurrently and you get the
      duplicate side effect you were trying to prevent. The server must detect
      the in-progress state, return a pending response or a 409, and ensure only
      one execution completes — not just check for a completed record.
codeExamples:
  - language: typescript
    title: Idempotency Key Deduplication with Redis
    code: |-
      import { createClient } from "redis";
      import { randomUUID } from "crypto";

      const redis = createClient();
      await redis.connect();

      async function processPayment(
        idempotencyKey: string,
        amount: number,
        customerId: string
      ): Promise<{ status: string; chargeId: string }> {
        const cacheKey = `idem:payment:${idempotencyKey}`;

        // Check for a cached result from a prior attempt
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log("Returning cached result for idempotency key", idempotencyKey);
          return JSON.parse(cached);
        }

        // Acquire a short lock so concurrent retries don't both execute
        const lockKey = `lock:${cacheKey}`;
        const locked = await redis.set(lockKey, "1", { NX: true, EX: 10 });
        if (!locked) {
          throw new Error("Request in progress — retry shortly");
        }

        try {
          // Execute the real side-effectful operation once
          const chargeId = `ch_${randomUUID()}`;
          console.log(`Charging customer ${customerId} $${amount} → ${chargeId}`);
          // await stripe.charges.create({ amount, currency: "usd", customer: customerId });

          const result = { status: "succeeded", chargeId };
          // Store result for 24 h so retries get the same response
          await redis.set(cacheKey, JSON.stringify(result), { EX: 86400 });
          return result;
        } finally {
          await redis.del(lockKey);
        }
      }

      // Client generates key once and reuses it on every retry
      const key = randomUUID();
      console.log(await processPayment(key, 2000, "cus_abc123"));
      console.log(await processPayment(key, 2000, "cus_abc123")); // cache hit
    reasoning: >-
      Demonstrates the complete server-side idempotency pattern — cache lookup,
      in-flight lock, single execution, and 24-hour result storage — so retries
      are safe for payment operations.
  - language: sql
    title: Atomic Upsert for Job Deduplication
    code: |-
      -- Track processed job IDs to prevent duplicate execution.
      -- Workers INSERT OR IGNORE before doing any work; a duplicate
      -- row means the job already ran and the worker should skip it.

      CREATE TABLE processed_jobs (
        job_id       TEXT PRIMARY KEY,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        result       JSONB
      );

      -- Worker claims the job atomically. If another worker already
      -- inserted this job_id the insert is a no-op (0 rows affected).
      INSERT INTO processed_jobs (job_id)
      VALUES ('job_7f3a9c')
      ON CONFLICT (job_id) DO NOTHING;

      -- Check whether THIS worker won the race
      -- (application reads the affected row count; skip if 0)

      -- After completing work, store the result so retries can
      -- return it without re-executing.
      UPDATE processed_jobs
      SET result = '{"emails_sent": 1}'::jsonb
      WHERE job_id = 'job_7f3a9c';
    reasoning: >-
      Shows the minimal SQL pattern for idempotent job processing: an atomic
      INSERT ... ON CONFLICT that lets any database enforce exactly-once
      execution without application-level locking.
difficulty: intermediate
estimatedHours: 4
tldr: >-
  Design operations to handle retries safely by tracking each request with a
  unique ID—so retrying a failed payment or email never creates duplicates.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.887Z'
---
<!-- user notes -->
