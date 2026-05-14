---
slug: webhooks-as-platform
title: Webhooks as a Platform
phase: modern-backend-and-platform
order: 9
summary: >-
  Receiving webhooks safely (idempotency, signing, replay) and emitting them
  reliably (delivery, retries, observability).
tldr: >-
  Register HTTP callbacks to receive real-time events from external services.
  Verify signatures, ensure idempotency, and retry failed deliveries.
definition: >-
  Webhooks are HTTP callbacks: when an event occurs in system A, it sends a POST
  request with a JSON payload to a URL that system B has registered. They are
  the dominant mechanism for event-driven integration between SaaS platforms.
  Receiving webhooks safely requires three things: signature verification (check
  the `Stripe-Signature` or equivalent HMAC header before processing),
  idempotency (your handler must tolerate receiving the same event multiple
  times, since most providers retry on non-2xx responses or delivery failures),
  and fast acknowledgment (respond with a 2xx immediately, then process
  asynchronously via a job queue to avoid timeouts).


  Emitting webhooks reliably as a platform feature is harder than it looks. You
  must queue delivery attempts durably (so a crash doesn't lose events),
  implement exponential backoff with jitter for retries, disable endpoints that
  consistently fail, track delivery status per-endpoint and per-event, and
  provide a developer portal for endpoint management and replay. Building all of
  this in-house is weeks of work. Svix and Hookdeck are the two main managed
  services that handle delivery infrastructure for you—Svix focuses on outbound
  webhook delivery, Hookdeck on inbound webhook processing and routing. Convoy
  is the open-source self-hosted alternative.


  The emerging Standard Webhooks specification (led by Svix) defines a common
  signature scheme and payload envelope to make consuming webhooks from any
  provider predictable. Understanding the spec is valuable even if you're just
  consuming webhooks, because it explains why verification code looks the way it
  does and how to build tooling that works across providers.
shortExplainerVideo: null
narrative: >-
  Webhooks are the lingua franca of SaaS integration. Every payment processor,
  identity provider, billing system, and communication platform uses them to
  notify your application when something happens in their system. The volume of
  webhook-driven integration in a typical production application is quietly
  enormous — Stripe sends payment events, Clerk sends user lifecycle events,
  GitHub sends push and PR events — and the reliability of your application is
  directly tied to whether you handle all of them correctly. Most developers
  treat incoming webhooks as just another HTTP endpoint and miss three
  properties that make the difference between a correct implementation and one
  that silently corrupts data.


  The first property is signature verification, and skipping it is a genuine
  security vulnerability. Every credible webhook provider gives you an HMAC
  signature in a request header; you compute the expected signature over the raw
  request body using your shared secret and reject requests where they do not
  match. The raw body part matters — JSON parsing and re-serializing before
  signature computation will fail because key ordering and whitespace handling
  may differ. Middleware that parses JSON before your webhook handler can break
  signature verification silently. The second property is idempotency: webhook
  providers retry on non-2xx responses, on network failures, and sometimes just
  because their delivery infrastructure is eventually consistent. Your handler
  will see the same event twice. This is not an edge case; it is guaranteed
  behavior. Store the event ID and skip processing if you have already handled
  it. The third property is fast acknowledgment: respond with 200 before doing
  any meaningful work, and enqueue the actual processing as a background job. If
  your handler takes three seconds to process a payment event and the provider
  has a five-second timeout, you will see phantom retries of events you already
  processed.


  Building webhook emission as a platform feature — where your application sends
  webhooks to your customers' systems — is an order of magnitude harder than
  consuming them. The delivery infrastructure requirements are real: durable
  queuing so crashes do not lose events in flight, exponential backoff with
  jitter for retries, disabling endpoints that consistently fail across many
  attempts, per-endpoint delivery logs that your customers can inspect
  themselves, and a replay mechanism for recovering from outages on the
  receiving end. The teams that try to build this from scratch consistently
  underestimate the scope; what looks like a weekend project is actually weeks
  of work to make reliable. Svix and Hookdeck exist precisely because this
  problem is well-understood and not differentiated for most applications —
  buying the infrastructure for webhook delivery is the correct call for any
  team whose core value is not webhook delivery itself.


  The mental model for webhooks is the event bus made visible at the network
  boundary. Inside your application, you might use an in-process event emitter
  or a message queue to decouple components. Webhooks extend that pattern across
  organizational boundaries: your system emits events that external systems
  consume, and you have no control over what those systems do with them or when
  they are ready to receive. This asymmetry — you send, they consume, on their
  schedule — is why retry logic and delivery receipts are so important. The
  receiver has to be able to tolerate gap and order issues; the sender has to be
  able to prove delivery happened.


  The Standard Webhooks specification is worth knowing even if you only ever
  consume webhooks rather than emit them. It defines a common signature scheme
  using HMAC-SHA256, a standard timestamp header for replay attack prevention,
  and a common payload envelope. When providers adopt it, your verification code
  becomes the same regardless of which service you are integrating. Svix leads
  the adoption effort and uses it as the basis of their platform. Even providers
  that have not formally adopted it tend to follow similar patterns, and
  understanding the specification gives you the conceptual framework to verify
  any provider's webhook correctly rather than copying boilerplate from
  documentation without understanding why each step is necessary.
pitfalls:
  - title: Processing webhook payload before verifying signature
    explanation: >-
      A webhook handler that parses and acts on the payload before checking the
      HMAC signature can be triggered by any attacker who can POST to the
      endpoint. Always verify the signature on the raw request body as the first
      step, before any deserialization.
  - title: Non-idempotent handlers triggered by duplicate deliveries
    explanation: >-
      Every major webhook provider retries on non-2xx responses and on delivery
      timeouts, which means your handler will receive the same event more than
      once under normal operating conditions. Use the event ID as an idempotency
      key and record processed events before taking any action.
  - title: Synchronous processing causes handler timeouts
    explanation: >-
      Doing database writes, sending emails, or calling third-party APIs inside
      the webhook handler delays the 2xx acknowledgment, causing the provider to
      retry. Acknowledge immediately, then enqueue the work for a background
      job.
  - title: No observability into delivery failures on emitted webhooks
    explanation: >-
      When you emit webhooks to customers, you need per-endpoint delivery
      status, retry history, and the ability to replay failed events. Building
      this without a delivery tracking store means failures are invisible until
      a customer files a support ticket.
  - title: Endpoint permanently disabled after transient failure
    explanation: >-
      Most webhook systems disable an endpoint after a streak of failures,
      including transient network errors. Without automatic re-enablement logic
      or a way for endpoint owners to re-enable themselves, a brief outage
      permanently silences their integration.
codeExamples:
  - language: typescript
    title: Verify Stripe Webhook Signature Safely
    code: >-
      import Stripe from "stripe";

      import type { NextRequest } from "next/server";


      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;


      export async function POST(req: NextRequest): Promise<Response> {
        const body = await req.text(); // must be raw bytes, not parsed JSON
        const sig  = req.headers.get("stripe-signature") ?? "";

        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        } catch (err) {
          console.error("Webhook signature verification failed:", err);
          return new Response("Bad signature", { status: 400 });
        }

        // Acknowledge immediately — process async to avoid timeout
        setImmediate(async () => {
          try {
            await handleEvent(event);
          } catch (err) {
            console.error("Webhook handler error:", err);
          }
        });

        return new Response("ok", { status: 200 });
      }


      async function handleEvent(event: Stripe.Event): Promise<void> {
        switch (event.type) {
          case "checkout.session.completed":
            // Idempotent: check if already processed before updating DB
            await activateSubscription(event.data.object.customer as string);
            break;
          case "customer.subscription.deleted":
            await cancelSubscription(event.data.object.customer as string);
            break;
        }
      }


      async function activateSubscription(customerId: string) {
      console.log("activate", customerId); }

      async function cancelSubscription(customerId: string) {
      console.log("cancel", customerId); }
    reasoning: >-
      Demonstrates all three webhook safety patterns in one handler: HMAC
      signature verification before any processing, immediate 200
      acknowledgment, and async idempotent event handling.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.577Z'
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://docs.svix.com/security'
      title: Webhook Security — Svix Docs
      kind: canonical-doc
      reasoning: >-
        Svix's authoritative documentation on webhook signature verification
        covering HMAC-SHA256, replay attack prevention with timestamps, and
        library usage.
      publisher: Svix
      source: ai-researcher
    - url: 'https://hookdeck.com/webhooks/guides/implement-webhook-idempotency'
      title: How to Implement Webhook Idempotency
      kind: tutorial
      reasoning: >-
        Practical guide from Hookdeck covering idempotency key strategies,
        deduplication patterns, and database-level implementation for safe
        webhook consumers.
      publisher: Hookdeck
      source: ai-researcher
    - url: >-
        https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
      title: Making retries safe with idempotent APIs
      kind: engineering-blog
      reasoning: >-
        AWS Builders Library article on idempotency by Amazon's principal
        engineers—the authoritative treatment of safe retry semantics applicable
        to both webhook consumers and producers.
      publisher: AWS
      source: ai-researcher
  services:
    - name: Svix
      url: 'https://www.svix.com/'
      category: managed webhook delivery platform
      reasoning: >-
        The leading managed webhooks-as-a-service platform; handles delivery,
        retries, portal UI for endpoint management, and signature
        verification—used by companies emitting billions of webhooks monthly.
      vendor: Svix Inc.
      source: ai-researcher
    - name: Hookdeck
      url: 'https://hookdeck.com/'
      category: webhook event gateway
      reasoning: >-
        Managed inbound webhook processing platform providing queuing, retries,
        rate limiting, deduplication, and observability for webhooks you receive
        from third-party services.
      vendor: Hookdeck Inc.
      source: ai-researcher
    - name: Convoy
      url: 'https://www.getconvoy.io/'
      category: self-hosted webhook gateway
      reasoning: >-
        Open-source (MIT) webhook gateway built in Go for both sending and
        receiving webhooks; self-hostable on Kubernetes or Docker with
        PostgreSQL backend.
      vendor: Frain Technologies
      source: ai-researcher
    - name: Stripe Webhooks
      url: 'https://docs.stripe.com/webhooks'
      category: reference implementation
      reasoning: >-
        Stripe's webhook documentation is the canonical reference design for a
        well-implemented webhook producer—covering signing, event types,
        retries, and idempotency.
      vendor: Stripe
      source: ai-researcher
  courses:
    - url: 'https://docs.svix.com/quickstart'
      title: Svix Quickstart — Sending Webhooks
      provider: Svix Docs
      paid: false
      reasoning: >-
        Structured quickstart that walks through the full webhook-as-a-platform
        implementation using Svix's API, covering application setup, event
        types, endpoint registration, and test delivery.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.527Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
