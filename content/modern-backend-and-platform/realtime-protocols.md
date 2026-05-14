---
slug: realtime-protocols
title: Realtime Protocols
phase: modern-backend-and-platform
order: 5
summary: >-
  Websockets vs SSE vs long-polling — when to choose each, scaling pub/sub, and
  when NOT to go realtime.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
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
lastUpdatedAt: '2026-05-14T12:26:04.525Z'
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
