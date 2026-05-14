---
slug: rate-limiting
title: Rate Limiting
phase: security-and-identity
order: 4
summary: >-
  Protect your APIs and infrastructure from abuse, scraping, and
  denial-of-service attacks by capping request rates per client.
definition: >-
  Rate limiting is a technique for controlling the amount of traffic a service
  receives by restricting the number of requests from a client within a defined
  time window. It serves as a critical defense mechanism against DDoS attacks,
  API abuse, and resource exhaustion, while also ensuring fair resource
  allocation across multiple users.


  The core concept involves algorithms like token bucket (which allows burst
  traffic up to a limit), leaky bucket (which enforces steady-state
  consumption), and sliding window (which counts requests in moving time
  intervals). Rate limiting operates at multiple layers — from API gateways and
  edge networks to application logic and load balancers — enabling operators to
  protect backend services, maintain service quality, and monetize APIs based on
  usage tiers.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=m0uZWtUsdAQ'
      title: Good API Design leads to better Rate Limiting
      author: ByteByteGo
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: Concise explanation linking API design and rate limiting strategies.
    long:
      url: 'https://www.youtube.com/watch?v=FU4WlwfS3G0'
      title: 'System Design: Rate Limiting (Token Bucket Algorithm)'
      author: Tech Dummies
      durationMinutes: 35
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into rate-limiting algorithms with practical implementation
        details.
  articles:
    - url: 'https://stripe.com/blog/rate-limiters'
      title: Scaling your API with rate limiting
      kind: engineering-blog
      reasoning: Stripe's production-hardened approach to rate limiting at scale.
    - url: 'https://developers.cloudflare.com/waf/rate-limiting-rules/'
      title: 'Cloudflare WAF: Rate Limiting Rules'
      kind: canonical-doc
      reasoning: Authoritative Cloudflare documentation on edge-network rate limiting.
  services:
    - name: Cloudflare WAF
      url: 'https://www.cloudflare.com/waf/'
      category: edge-rate-limiter
      reasoning: Edge-first rate limiting with DDoS protection and managed rules.
    - name: AWS WAF
      url: 'https://aws.amazon.com/waf/'
      category: managed-waf
      reasoning: AWS-native rate limiting integrated with CloudFront and ALB.
    - name: Kong API Gateway
      url: 'https://konghq.com'
      category: api-gateway
      reasoning: >-
        Open-source and commercial gateway with first-class rate-limiting
        plugins.
    - name: NGINX
      url: 'https://www.nginx.com'
      category: reverse-proxy
      reasoning: Industry-standard reverse proxy with ngx_http_limit_req_module.
    - name: Envoy Proxy
      url: 'https://www.envoyproxy.io'
      category: service-proxy
      reasoning: Modern service proxy with local and distributed rate-limiting filters.
  courses:
    - url: 'https://bytebytego.com'
      title: ByteByteGo System Design Course
      provider: ByteByteGo
      paid: true
      reasoning: >-
        Comprehensive system design course covering rate-limiting algorithms and
        tradeoffs.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Rate limiting is the first line of defense between your API and everyone who
  wants to abuse it, intentionally or not. Without it, a single badly-behaved
  client—a misconfigured retry loop, a competitor scraping your catalog, a
  script kiddie running a tool they downloaded—can saturate your infrastructure
  and take down service for legitimate users. The failure mode is usually
  gradual: your database connections spike, your API response times climb, your
  on-call engineer gets paged, and you spend 30 minutes figuring out which IP is
  hammering you before you manually block it. With rate limiting in place, the
  same scenario results in a 429 response to the bad actor while everyone else
  gets normal service. That's the whole value proposition.


  The 80/20 of rate limiting is: implement it at the edge first, make it
  per-client (not global), and use a simple algorithm you understand rather than
  a sophisticated one you don't. A token bucket per authenticated user or per IP
  address, enforced at your API gateway or load balancer, handles the vast
  majority of real abuse patterns. The token bucket gives you burst tolerance—a
  user can make 20 rapid requests and then gets throttled—which is important
  because legitimate clients often have bursty patterns (page load fires 5 API
  calls at once, then nothing for a minute). Leaky bucket enforces strict
  steady-state rates, which is sometimes what you want for background jobs but
  feels punishing for interactive users. Sliding window counters are more
  accurate but slightly more complex to implement; fixed window counters are
  simple but can be gamed by a client that fires requests right at the window
  boundary. For most teams, token bucket with a Redis backing store is the right
  starting point.


  The dominant failure mode in rate limiting is inconsistent enforcement across
  your stack. Teams implement rate limiting on their public API but forget their
  webhook delivery endpoint, their file upload endpoint, or their internal
  service-to-service calls. An attacker or a broken client that can't get
  through the public API will probe every other surface. Another common failure
  is rate limiting by IP address when clients are behind NAT or proxies—you end
  up rate limiting an entire corporate office because they all share one
  outbound IP. Keying limits by authenticated user ID is almost always better
  than by IP for signed-in traffic; reserve IP-based limits for unauthenticated
  endpoints where you have no other identifier.


  A nuance that matters in production: rate limit responses need to include
  useful headers. RFC 6585 standardized the 429 status code, and RFC 7231
  specifies Retry-After, but the de facto standard now includes
  X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset. Well-behaved
  clients (and SDKs you publish) can use these to back off gracefully rather
  than hammering you and getting blocked repeatedly. If you're publishing a
  developer API, these headers are part of your developer experience—skip them
  and you'll get bug reports from developers who can't figure out why they're
  getting 429s intermittently.


  Rate limiting also has a second life as a monetization lever. Tiered rate
  limits are one of the cleanest ways to differentiate API plans: free tier gets
  100 requests per minute, paid tier gets 1000, enterprise gets custom limits.
  This requires your rate limiting layer to be aware of the user's plan, which
  means integrating with your billing and entitlements system. The architecture
  that makes this clean is the same one that makes rate limiting robust
  generally: a centralized store (Redis is the standard choice) that holds
  counters and can be queried by any instance, rather than in-memory limits that
  don't survive restarts and can't be shared across replicas.


  In the ecosystem, rate limiting sits alongside authentication and
  authorization as foundational API security. It belongs in your API gateway
  layer (Kong, AWS API Gateway, Cloudflare Workers) rather than deep in your
  application logic, because gateway enforcement is faster and protects your
  application servers from even having to process abusive traffic. For services
  that see genuine DDoS-level traffic, rate limiting at the application layer
  won't save you—you need network-level mitigation from a provider like
  Cloudflare or AWS Shield. But for the 99% of cases that aren't true DDoS
  events, well-implemented rate limiting at the gateway layer is more than
  enough.
pitfalls:
  - title: Rate limiting by IP address for authenticated traffic
    explanation: >-
      Many legitimate users share a single outbound IP—corporate offices,
      university networks, mobile carrier NAT. Rate limiting by IP on signed-in
      endpoints means one misbehaving user in an office throttles everyone else
      on that network. Key limits by authenticated user ID for any endpoint
      where you have an identity.
  - title: Enforcing limits in application memory instead of a shared store
    explanation: >-
      In-memory rate limit counters reset on restart and are not shared across
      instances, so a client running against a load-balanced fleet can exceed
      your intended limit by N times (one limit per replica). A centralized
      Redis store ensures every instance enforces the same counter for the same
      client.
  - title: Protecting public API endpoints but leaving others unguarded
    explanation: >-
      Abuse that cannot get through the public API will probe webhook endpoints,
      file upload endpoints, and internal service-to-service paths. Rate
      limiting applied only to the primary API surface leaves these exposed.
      Every externally reachable endpoint needs limits, not just the ones you
      expect to be popular.
  - title: Omitting rate limit headers from 429 responses
    explanation: >-
      Clients that receive a 429 with no retry guidance will hammer the endpoint
      repeatedly, compounding the load. Standard headers—X-RateLimit-Limit,
      X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After—let well-behaved
      clients and published SDKs back off gracefully. Omitting them generates
      support tickets and wasteful retry traffic.
  - title: Using fixed windows that can be gamed at window boundaries
    explanation: >-
      A fixed 60-second window resets at the top of each minute, so a client can
      fire the full allowance at 00:59 and again at 01:00, effectively doubling
      the intended rate in a two-second span. Sliding window or token bucket
      algorithms eliminate this boundary exploit for endpoints where it matters.
codeExamples:
  - language: typescript
    title: Token Bucket Rate Limiter With Redis
    code: >-
      import { createClient } from 'redis';


      const redis = createClient({ url: process.env.REDIS_URL });

      await redis.connect();


      interface RateLimitResult {
        allowed: boolean;
        remaining: number;
        resetAt: number; // unix seconds
      }


      async function checkRateLimit(
        key: string,        // e.g. `rl:user:${userId}`
        limit: number,      // max tokens (requests) per window
        windowSecs: number  // refill period in seconds
      ): Promise<RateLimitResult> {
        const now = Math.floor(Date.now() / 1000);
        const windowKey = `${key}:${Math.floor(now / windowSecs)}`;

        const count = await redis.incr(windowKey);
        if (count === 1) {
          await redis.expire(windowKey, windowSecs * 2);
        }

        const resetAt = (Math.floor(now / windowSecs) + 1) * windowSecs;
        const remaining = Math.max(0, limit - count);
        return { allowed: count <= limit, remaining, resetAt };
      }


      // Middleware usage

      export async function rateLimitMiddleware(req: Request, res: Response,
      next: NextFunction) {
        const userId = req.user?.id ?? req.ip;
        const result = await checkRateLimit(`rl:user:${userId}`, 100, 60);

        res.setHeader('X-RateLimit-Limit', 100);
        res.setHeader('X-RateLimit-Remaining', result.remaining);
        res.setHeader('X-RateLimit-Reset', result.resetAt);

        if (!result.allowed) {
          return res.status(429).json({ error: 'Too Many Requests' });
        }
        next();
      }
    reasoning: >-
      A Redis-backed sliding-window limiter with proper response headers is the
      production-ready pattern learners need — keyed by user ID, includes the
      headers that let clients back off gracefully.
difficulty: intermediate
estimatedHours: 4
tldr: >-
  Pending tldr — short, plain-language summary for a non-technical reader or
  quick skim. Replace before publishing.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:08:53.920Z'
---
<!-- user notes -->
