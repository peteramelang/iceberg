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
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=FU4WlwfS3G0'
      title: 'System Design: Rate Limiting (Token Bucket Algorithm)'
      author: Tech Dummies
      durationMinutes: 35
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Deep dive into rate-limiting algorithms with practical implementation
        details.
      source: ai-researcher
  articles:
    - url: 'https://stripe.com/blog/rate-limiters'
      title: Scaling your API with rate limiting
      kind: engineering-blog
      reasoning: Stripe's production-hardened approach to rate limiting at scale.
      publisher: Stripe
      source: ai-researcher
    - url: 'https://developers.cloudflare.com/waf/rate-limiting-rules/'
      title: 'Cloudflare WAF: Rate Limiting Rules'
      kind: canonical-doc
      reasoning: Authoritative Cloudflare documentation on edge-network rate limiting.
      publisher: Cloudflare
      source: ai-researcher
  services:
    - name: Cloudflare WAF
      url: 'https://www.cloudflare.com/waf/'
      category: edge-rate-limiter
      reasoning: Edge-first rate limiting with DDoS protection and managed rules.
      vendor: Cloudflare
      source: ai-researcher
    - name: AWS WAF
      url: 'https://aws.amazon.com/waf/'
      category: managed-waf
      reasoning: AWS-native rate limiting integrated with CloudFront and ALB.
      vendor: Amazon Web Services
      source: ai-researcher
    - name: Kong API Gateway
      url: 'https://konghq.com'
      category: api-gateway
      reasoning: >-
        Open-source and commercial gateway with first-class rate-limiting
        plugins.
      vendor: Konghq
      source: ai-researcher
    - name: NGINX
      url: 'https://www.nginx.com'
      category: reverse-proxy
      reasoning: Industry-standard reverse proxy with ngx_http_limit_req_module.
      source: ai-researcher
    - name: Envoy Proxy
      url: 'https://www.envoyproxy.io'
      category: service-proxy
      reasoning: Modern service proxy with local and distributed rate-limiting filters.
      vendor: Envoy
      source: ai-researcher
  courses:
    - url: 'https://bytebytego.com'
      title: ByteByteGo System Design Course
      provider: ByteByteGo
      paid: true
      reasoning: >-
        Comprehensive system design course covering rate-limiting algorithms and
        tradeoffs.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
