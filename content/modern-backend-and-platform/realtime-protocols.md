---
slug: realtime-protocols
title: Realtime Protocols
phase: modern-backend-and-platform
order: 5
summary: >-
  Websockets vs SSE vs long-polling — when to choose each, scaling pub/sub, and
  when NOT to go realtime.
tldr: >-
  Long-polling, Server-Sent Events, and WebSockets enable server-to-client
  updates. Choose based on latency needs and scalability constraints.
definition: >-
  Realtime communication between browser and server can be achieved via three
  main mechanisms, each with different tradeoffs. Long-polling has the client
  make an HTTP request and the server hold it open until data is
  available—simple but inefficient due to repeated TCP setup overhead.
  Server-Sent Events (SSE) use a single persistent HTTP connection where the
  server pushes a stream of text events; the browser has a built-in
  `EventSource` API, and HTTP/2 means many SSE streams can multiplex over one
  connection. WebSockets provide a bidirectional full-duplex channel after a
  one-time HTTP upgrade handshake, enabling low-latency message exchange in both
  directions.


  Choosing between them: use SSE when you only need server-to-client push
  (dashboards, live feeds, AI streaming responses), since it has automatic
  reconnection, works through HTTP proxies, and is far simpler to implement and
  scale. Use WebSockets when you need low-latency bidirectional communication
  (chat, collaborative editing, multiplayer games). Long-polling should be a
  last resort for environments where SSE and WebSockets are blocked.


  Scaling is where both protocols get interesting. WebSockets maintain stateful
  connections on specific server instances, so horizontal scaling requires a
  pub/sub layer (Redis, Ably, Supabase Realtime) to fan messages out across
  nodes. SSE connections are cheaper but still stateful. Serverless and edge
  platforms (Vercel, Cloudflare Workers) cannot host persistent connections at
  all without workarounds—this is a critical architectural constraint to
  understand before committing to a realtime design.
shortExplainerVideo: null
narrative: >-
  Most applications that developers reach for WebSockets to build do not
  actually need WebSockets. The instinct is understandable — "realtime" evokes
  bidirectional communication, and WebSockets are bidirectional — but the
  majority of realtime product features push data in one direction only: the
  server emits updates and the client displays them. Live dashboards,
  notification feeds, order status updates, AI streaming responses,
  collaborative presence indicators — all of these are server-to-client only.
  For every one of these use cases, Server-Sent Events are strictly simpler,
  work through HTTP proxies and load balancers that choke on WebSocket upgrades,
  have built-in reconnection in the browser's `EventSource` API, and multiplex
  cleanly over HTTP/2. The correct rule of thumb is: use SSE unless you have a
  concrete requirement for low-latency client-to-server messages.


  When bidirectional communication genuinely matters — chat applications,
  collaborative text editing, multiplayer games, live cursor sharing —
  WebSockets are the right tool. The bidirectional channel eliminates the
  polling overhead of the client sending messages over a separate HTTP
  connection, and the latency difference (measured in tens of milliseconds in
  the common case) is meaningful for interactive experiences. The Socket.io
  library historically dominated this space by providing fallback to
  long-polling and room-based pub/sub abstractions on top of raw WebSockets, but
  its overhead and the complexity of its protocol mean most new projects are
  better served by raw WebSockets with a thin wrapper, or by Partykit and Ably
  for managed infrastructure.


  The failure mode that catches teams by surprise is the scaling gap between a
  prototype and a production deployment. A single server handles WebSocket
  connections fine; the problem appears when you add a second server. WebSocket
  connections are stateful — a specific connection is tied to a specific server
  instance — so a message published on server A will not reach a client
  connected to server B unless you have a pub/sub layer in between. Redis
  Pub/Sub is the conventional solution: every server subscribes to relevant
  channels, and publishing to Redis fans the message out. But Redis Pub/Sub is
  fire-and-forget with no delivery guarantees, and the fan-out cost scales with
  your connection count. Managed services like Ably and Supabase Realtime handle
  this routing layer for you and are worth the cost at any scale where the
  engineering time to maintain Redis correctly exceeds the service fee.


  The deeper architectural constraint is that serverless and edge platforms
  cannot host persistent connections at all in their standard execution models.
  Vercel functions, Cloudflare Workers, and AWS Lambda terminate after a request
  completes — there is no persistent process to maintain a WebSocket frame for
  minutes or hours. Cloudflare Durable Objects are specifically designed to
  solve this problem by providing a long-lived, geographically pinned execution
  context, but they are a Cloudflare-specific primitive and require
  restructuring your mental model of where state lives. Teams that choose
  serverless infrastructure and then design realtime features need to account
  for this from the start, not retrofit it after.


  In the ecosystem, the realtime problem is increasingly solved by higher-level
  platform primitives rather than raw protocol choices. Supabase Realtime
  broadcasts Postgres change events over WebSocket connections managed by the
  platform. Liveblocks provides a complete collaborative presence and shared
  state layer. These abstractions are worth taking seriously: they eliminate the
  pub/sub plumbing, the connection lifecycle management, and the scaling
  infrastructure that you would otherwise build and operate yourself. The
  protocol question — WebSocket versus SSE — matters most when you are building
  the plumbing directly; when you are buying the plumbing as a service, your
  primary decision is which service's data model and pricing fit your
  application.
pitfalls:
  - title: WebSockets on a serverless platform with no persistent connections
    explanation: >-
      Serverless and edge functions cannot maintain stateful WebSocket
      connections — they terminate after each request. Architecting a chat or
      collaboration feature with WebSockets on Vercel or Cloudflare Workers
      without a persistent connection service leads to a fundamental deployment
      mismatch.
  - title: Horizontal scaling without a pub/sub fan-out layer
    explanation: >-
      When multiple server instances each hold a subset of WebSocket
      connections, a message sent to one instance is not delivered to users
      connected to another. A shared pub/sub layer (Redis, managed realtime
      service) is required before scaling beyond a single instance.
  - title: Using WebSockets when SSE covers the use case
    explanation: >-
      WebSockets add bidirectional complexity, custom protocol negotiation, and
      proxy/firewall issues for use cases that only require server-to-client
      push. SSE is simpler, HTTP-native, and auto-reconnects; default to it for
      streaming data, AI responses, and live feeds.
  - title: No reconnection logic on the client side
    explanation: >-
      WebSocket and SSE connections drop due to network changes, proxy timeouts,
      and server restarts. Client code without automatic reconnection with
      backoff leaves users silently stuck on a stale connection until they
      reload the page.
  - title: Going realtime when polling would suffice
    explanation: >-
      Maintaining persistent connections for data that changes every few minutes
      costs significantly more in server resources and operational complexity
      than a simple polling interval. Evaluate the actual update frequency
      before adding realtime infrastructure.
codeExamples:
  - language: typescript
    title: Server-Sent Events for AI Streaming Response
    code: |-
      // pages/api/stream.ts (Next.js API route)
      import type { NextRequest } from "next/server";
      import Anthropic from "@anthropic-ai/sdk";

      export const runtime = "nodejs";

      const client = new Anthropic();

      export async function GET(req: NextRequest): Promise<Response> {
        const prompt = req.nextUrl.searchParams.get("q") ?? "Hello";

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          async start(controller) {
            const anthropicStream = await client.messages.stream({
              model: "claude-haiku-4-5",
              max_tokens: 512,
              messages: [{ role: "user", content: prompt }]
            });

            for await (const chunk of anthropicStream) {
              if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
                // SSE format: "data: ...\n\n"
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
              }
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
          }
        });
      }
    reasoning: >-
      A complete SSE endpoint streaming Claude tokens to the browser — the most
      common real-world realtime protocol use case in AI apps, showing correct
      headers and the SSE wire format.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.575Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=Zt2uGx2gsco'
      title: >-
        Server-Sent Events (SSE) vs WebSocket — How it works and Live tutorial
        in Node.js
      author: Hussein Nasser
      durationMinutes: 14
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Hussein Nasser's clear side-by-side comparison with live Node.js code,
        covering the protocol mechanics and when to choose each—exactly the
        right framing for the topic.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=XgFzHXOk8IQ'
      title: The Complete Guide to WebSockets
      author: Hussein Nasser
      durationMinutes: 335
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Comprehensive 5h35m deep dive covering WebSocket internals, scaling with
        Redis and HAProxy, HTTP/2 WebSockets, Wireshark analysis, and a
        multiplayer game build—the definitive long resource.
      source: ai-researcher
  articles:
    - url: 'https://ably.com/blog/websockets-vs-sse'
      title: WebSockets vs Server-Sent Events (SSE)
      kind: engineering-blog
      reasoning: >-
        Ably's authoritative comparison article covering protocol mechanics,
        scaling characteristics, browser support, and when each is the right
        choice—frequently cited as the canonical reference.
      publisher: Ably
      source: ai-researcher
    - url: 'https://www.freecodecamp.org/news/server-sent-events-vs-websockets/'
      title: >-
        Server-Sent Events vs WebSockets — How to Choose a Real-Time Data
        Exchange Protocol
      kind: tutorial
      reasoning: >-
        Clear, well-structured freeCodeCamp article explaining both protocols
        with code examples and a concrete decision framework.
      publisher: freeCodeCamp
      source: ai-researcher
  services:
    - name: Ably
      url: 'https://ably.com/'
      category: managed realtime pub/sub
      reasoning: >-
        Managed realtime messaging platform providing WebSocket infrastructure,
        presence, history, and pub/sub without the scaling complexity of
        self-hosted solutions.
      vendor: Ably
      source: ai-researcher
    - name: Supabase Realtime
      url: 'https://supabase.com/realtime'
      category: managed realtime pub/sub
      reasoning: >-
        Open-source Elixir-based realtime server for WebSocket broadcast and
        Postgres change streaming—deeply integrated with the Supabase platform.
      vendor: Supabase
      source: ai-researcher
    - name: Liveblocks
      url: 'https://liveblocks.io/'
      category: collaborative realtime platform
      reasoning: >-
        Managed platform for collaborative experiences (presence, live cursors,
        shared state) built on WebSockets with CRDT data structures—popular for
        adding collaborative editing.
      vendor: Liveblocks
      source: ai-researcher
    - name: Pusher Channels
      url: 'https://pusher.com/channels/'
      category: managed realtime pub/sub
      reasoning: >-
        Mature hosted WebSocket pub/sub service with SDKs for every platform;
        the reference design many tutorials use and widely adopted in
        production.
      vendor: Pusher
      source: ai-researcher
    - name: Socket.IO
      url: 'https://socket.io/'
      category: self-hosted realtime library
      reasoning: >-
        The most popular open-source WebSocket library for Node.js; includes
        fallback transports, rooms, namespaces, and adapters for Redis-based
        horizontal scaling.
      vendor: open source
      source: ai-researcher
  courses:
    - url: >-
        https://classcentral.com/course/youtube-the-complete-guide-to-websockets-117289
      title: >-
        The Complete Guide to WebSockets — Hussein Nasser (Class Central
        listing)
      provider: YouTube / Class Central
      paid: false
      reasoning: >-
        Free 5h35m Hussein Nasser course listed on Class Central, covering
        WebSockets from fundamentals to production scaling—the most
        comprehensive free course on the topic.
      instructor: Hussein Nasser
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.525Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
