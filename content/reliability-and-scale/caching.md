---
slug: caching
title: Caching
phase: reliability-and-scale
order: 3
summary: >-
  Apply in-process, distributed, and CDN caching at the right layer with correct
  invalidation strategies to reduce latency and database load.
definition: >-
  Caching is a critical optimization pattern that reduces latency and database
  load by storing frequently accessed data at multiple layers of your
  application stack. Effective caching strategies span three key domains:
  in-process caching (using libraries like Redis or Memcached for
  application-level data), distributed caching (shared cache layers across
  multiple servers), and CDN caching (edge-level HTTP caching via services like
  Cloudflare or Fastly). The architecture must account for cache invalidation
  strategies—including time-based expiration (TTL), event-driven invalidation,
  and client-side caching protocols—to ensure data consistency while maximizing
  performance gains.


  Implementing caching requires careful consideration of what data to cache, for
  how long, and at which layer. In-process caches are ideal for high-frequency,
  low-volume data within a single service; distributed caches like Redis excel
  at sharing state across services with atomic operations; HTTP caches via CDN
  handle static content and cacheable HTTP responses. Client-side caching and
  HTTP cache headers (Cache-Control, ETag, Last-Modified) form a critical part
  of reducing server load. Modern applications typically employ a multi-layered
  approach: leveraging application-level caches for frequently computed results,
  distributed caches for session data and hot datasets, and CDN caches for
  static assets and API responses, with careful invalidation strategies to
  prevent stale data.
needsManualPick: false
resources:
  videos:
    short: null
    long:
      url: 'https://www.youtube.com/watch?v=Hbt56gFaHQs'
      title: Redis Streams and Real-Time Applications
      author: Redis University
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: Deep dive into Redis for caching and real-time data patterns.
  articles:
    - url: 'https://redis.io/docs/manual/client-side-caching/'
      title: Client-Side Caching
      kind: tutorial
      reasoning: >-
        Canonical Redis documentation on implementing client-side caching
        strategies.
    - url: 'https://aws.amazon.com/caching/'
      title: AWS Caching Solutions Overview
      kind: tutorial
      reasoning: >-
        Comprehensive overview of caching strategies and AWS ElastiCache
        offerings.
    - url: 'https://martinfowler.com/bliki/CacheAsidePattern.html'
      title: Cache-Aside Pattern
      kind: canonical-doc
      reasoning: >-
        Martin Fowler's canonical explanation of the cache-aside (lazy loading)
        pattern.
    - url: 'https://martinfowler.com/bliki/WriteThrough.html'
      title: Write-Through Cache Pattern
      kind: canonical-doc
      reasoning: Martin Fowler's explanation of write-through caching strategy.
    - url: 'https://web.dev/articles/http-cache'
      title: HTTP Caching
      kind: tutorial
      reasoning: >-
        Web.dev guide on HTTP caching mechanisms, cache headers, and browser
        caching strategies.
  services:
    - name: Redis
      url: 'https://redis.io'
      category: in-process-and-distributed-cache
      reasoning: >-
        Canonical in-memory data structure store, widely used for distributed
        caching and session management.
    - name: Memcached
      url: 'https://memcached.org'
      category: distributed-cache
      reasoning: >-
        Canonical distributed memory caching system, optimized for
        high-performance caching of simple key-value data.
    - name: Varnish
      url: 'https://varnish-cache.org'
      category: http-cache
      reasoning: >-
        Canonical HTTP accelerator and reverse proxy, ideal for caching dynamic
        content and reducing origin server load.
    - name: AWS ElastiCache
      url: 'https://aws.amazon.com/elasticache/'
      category: managed-distributed-cache
      reasoning: >-
        AWS managed caching service supporting Redis and Memcached for scalable
        distributed caching.
    - name: Cloudflare
      url: 'https://www.cloudflare.com'
      category: cdn-cache
      reasoning: >-
        CDN and edge caching service providing global HTTP caching and
        acceleration at the network edge.
    - name: Fastly
      url: 'https://www.fastly.com'
      category: cdn-cache
      reasoning: >-
        High-performance CDN focused on instant cache purging and real-time
        caching control.
  courses:
    - url: 'https://redis.io/university/'
      title: Redis University
      provider: Redis
      paid: false
      reasoning: >-
        Official Redis training courses covering caching patterns, data
        structures, and real-world applications.
    - url: 'https://www.coursera.org/learn/database-design-web-apps'
      title: Database Design and Web Apps
      provider: Coursera
      paid: true
      reasoning: >-
        Comprehensive course covering database optimization including caching
        strategies at multiple layers.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Caching is the fastest way to make your application feel faster, and also one
  of the most reliable ways to introduce subtle correctness bugs that take weeks
  to diagnose. The performance upside is real — serving from an in-memory cache
  is orders of magnitude faster than a database round-trip — but the tradeoff is
  that you now have two representations of the same data, and keeping them
  consistent is a problem you've taken on for the lifetime of the cache. Phil
  Karlton's oft-cited remark about cache invalidation being one of the two hard
  problems in computer science is funny because it's true.


  The 80/20 of caching is about picking the right layer for the right data. CDN
  caching at the edge is almost always the highest-leverage starting point:
  static assets, cacheable HTML responses, and public API endpoints can be
  served from a CDN with zero database load and latency measured in single-digit
  milliseconds globally. This requires correct HTTP cache headers —
  Cache-Control with appropriate max-age, Vary headers if the response differs
  by request headers, and ETag or Last-Modified for conditional validation — but
  once configured, it scales effortlessly. In-process caching (a local memory
  cache within a single service) is useful for data that is frequently read,
  expensive to compute, and shared across many requests within that process —
  things like configuration data or heavily reused reference lookups.
  Distributed caching with Redis sits in between: it's shared across service
  instances, supports atomic operations, and is the right choice for session
  data, rate limiting counters, and hot datasets that multiple services need to
  read.


  Cache invalidation is where teams struggle most. Time-to-live (TTL) expiration
  is the simplest strategy: cache data for 60 seconds, let it expire, re-fetch.
  Simple, correct, but it means you'll serve stale data for up to 60 seconds
  after a write. For most read-heavy data this is fine. For anything that needs
  to reflect writes immediately — user settings, billing state, permissions —
  TTL alone isn't sufficient. Event-driven invalidation (invalidate cache
  entries when the underlying data changes) is more correct but requires the
  write path to be aware of the cache, which introduces coupling. Write-through
  caching (write to the cache and the database simultaneously) maintains
  consistency at the cost of write latency. There is no invalidation strategy
  that is always right; the choice depends on how stale you can tolerate the
  data being and how often it changes.


  The dominant failure mode for caching in production is the thundering herd.
  When a popular cache entry expires, dozens or hundreds of requests arrive
  simultaneously, all find a cache miss, and all proceed to query the database —
  which may not handle that sudden spike gracefully. The mitigations are:
  probabilistic early expiration (re-compute the cached value slightly before it
  expires, with some probability), request coalescing (use a lock to ensure only
  one request rebuilds a cache entry at a time while others wait), or background
  refresh (a separate process keeps the cache warm before entries expire).
  Another common failure is cache stampede during a cold start: deploying a new
  service instance or clearing the cache under load can trigger a wave of
  database queries that overwhelms the database before the cache warms up.


  Caching belongs in the reliability-and-scale phase because at scale, the
  database is often the constraint, and caching is the primary way to protect
  it. It pairs closely with database query optimization (caching doesn't fix a
  bad query; it just makes it run less often) and with CDN configuration (the
  HTTP caching layer requires correct server-side headers to function). A
  well-layered caching strategy — CDN for public content, Redis for shared
  application state, in-process for frequently read configuration — can extend
  the life of your current infrastructure significantly before you need to think
  about horizontal scaling.
pitfalls:
  - title: Thundering herd on cache expiry under load
    explanation: >-
      When a popular cache entry expires simultaneously, dozens or hundreds of
      requests miss the cache at once and all hit the database, potentially
      overwhelming it before the cache can be repopulated. Mitigations include
      probabilistic early expiration, request coalescing with a lock, or
      background refresh before entries expire.
  - title: Caching data that must reflect writes immediately
    explanation: >-
      Applying a 60-second TTL to user permissions, billing state, or account
      settings means a user who was just downgraded or suspended continues to
      see stale data for up to a minute. Time-based expiration alone is not
      sufficient for data whose staleness has security or correctness
      consequences; event-driven invalidation is required.
  - title: Missing or incorrect HTTP cache headers for CDN caching
    explanation: >-
      Failing to set Cache-Control, Vary, and ETag headers correctly means your
      CDN either caches nothing (wasting the edge layer entirely) or serves the
      same response to users who should get different content — for example,
      serving one user's personalized page to another. Every public endpoint
      needs deliberate cache header configuration.
  - title: No cache warming strategy on cold start
    explanation: >-
      Deploying a new service instance or clearing the cache under live traffic
      sends a sudden wave of cache misses to the database, which may not handle
      the spike gracefully before the cache warms up. Pre-warming critical cache
      entries before traffic is routed to a new instance protects the database
      during the vulnerable window.
  - title: Caching without a cache-aside fallback on miss
    explanation: >-
      Code that reads from the cache but has no tested path for handling a cache
      miss — because the cache is assumed to always be populated — fails
      silently or errors when the cache is cleared, restarted, or evicts entries
      under memory pressure. The cache miss path must be explicitly coded and
      exercised in tests.
  - title: Using the same cache namespace across environments or tenants
    explanation: >-
      Sharing a Redis instance across staging and production, or failing to
      namespace cache keys per tenant in a multi-tenant system, causes
      cross-environment data bleed or one tenant's cache entries overwriting
      another's. Cache keys must be namespaced by environment and, where
      relevant, by tenant or user scope.
codeExamples:
  - language: typescript
    title: Redis cache-aside with stampede protection
    code: >-
      import { createClient } from 'redis';


      const redis = createClient({ url: process.env.REDIS_URL });

      await redis.connect();


      async function getOrSet<T>(
        key: string,
        ttlSeconds: number,
        fetch: () => Promise<T>
      ): Promise<T> {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as T;

        // Distributed lock prevents thundering herd on cache miss
        const lockKey = `lock:${key}`;
        const acquired = await redis.set(lockKey, '1', { NX: true, EX: 5 });

        if (!acquired) {
          // Another process is rebuilding — wait briefly and retry from cache
          await new Promise((r) => setTimeout(r, 200));
          const retried = await redis.get(key);
          if (retried) return JSON.parse(retried) as T;
        }

        try {
          const value = await fetch();
          await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
          return value;
        } finally {
          await redis.del(lockKey);
        }
      }


      // Usage

      const user = await getOrSet(`user:${userId}`, 60, () =>
      db.users.findUnique({ where: { id: userId } }));
    reasoning: >-
      The cache-aside pattern with a distributed lock prevents the thundering
      herd problem where a popular cache expiry triggers dozens of simultaneous
      database queries — the most common production caching failure mode.
  - language: typescript
    title: HTTP cache headers for CDN edge caching
    code: |-
      import type { Request, Response } from 'express';

      // Public API endpoint cacheable at the CDN edge
      function getPublicFeed(req: Request, res: Response) {
        const feed = [{ id: 1, title: 'Hello' }]; // fetched from DB

        // Cache at CDN for 60s; allow stale for 10s while revalidating in background
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=10');

        // ETag enables conditional requests: client sends If-None-Match,
        // server returns 304 Not Modified if content unchanged
        const etag = `"${hashContent(feed)}"`;
        res.set('ETag', etag);

        if (req.headers['if-none-match'] === etag) {
          res.status(304).end();
          return;
        }

        res.json(feed);
      }

      // Private endpoint: never cache at shared (CDN) layer
      function getUserProfile(_req: Request, res: Response) {
        res.set('Cache-Control', 'private, no-store');
        res.json({ id: 'me', email: 'user@example.com' });
      }

      function hashContent(data: unknown): string {
        const { createHash } = require('crypto');
        return createHash('sha1').update(JSON.stringify(data)).digest('hex').slice(0, 16);
      }
    reasoning: >-
      Correctly setting Cache-Control and ETag headers on public endpoints lets
      a CDN absorb read traffic without any application code changes — the
      highest-leverage caching layer for most web APIs.
difficulty: intermediate
estimatedHours: 8
tldr: >-
  Pending tldr — short, plain-language summary for a non-technical reader or
  quick skim. Replace before publishing.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:08:53.920Z'
---
<!-- user notes -->
