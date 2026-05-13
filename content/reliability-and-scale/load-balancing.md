---
slug: load-balancing
title: Load Balancing
phase: reliability-and-scale
order: 4
summary: >-
  Distribute traffic across multiple application instances to eliminate single
  points of failure and enable horizontal scaling.
definition: >-
  Load balancing is a foundational reliability pattern that distributes incoming
  traffic across multiple application instances, servers, or geographic regions
  to eliminate single points of failure and enable horizontal scaling. Modern
  load balancers operate at multiple layers—Layer 4 (transport) for
  connection-based routing and Layer 7 (application) for content-aware
  routing—supporting both synchronous request/response patterns and persistent
  connections. Load balancing decisions can be made at the DNS level
  (geo-routing), at the edge (CDN), at infrastructure ingress points (cloud load
  balancers), or embedded within application clusters (service mesh), each
  serving distinct operational goals from failover and capacity management to
  canary deployments and A/B testing.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=galcDo_ZnYk'
      title: Load Balancing Explained
      author: Fireship
      durationMinutes: 7
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Concise technical overview of load balancing concepts, algorithms, and
        common architectures
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=zRYZToFg64E'
      title: Mastering Load Balancing at Scale
      author: Linux Academy
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive deep-dive covering Layer 4/7 load balancing, sticky
        sessions, health checks, and scaling strategies
      source: ai-researcher
  articles:
    - url: 'https://www.nginx.com/resources/glossary/load-balancing/'
      title: Load Balancing Glossary
      kind: canonical-doc
      reasoning: >-
        Canonical NGINX reference defining load balancing, algorithms
        (round-robin, least connections, IP hash), and deployment patterns
      publisher: NGINX
      source: ai-researcher
    - url: 'https://aws.amazon.com/elasticloadbalancing/features/'
      title: Elastic Load Balancing Features
      kind: tutorial
      reasoning: >-
        AWS ELB architecture overview covering ALB, NLB, and CLB with use cases,
        routing rules, and scalability characteristics
      publisher: Amazon Web Services
      source: ai-researcher
    - url: >-
        https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/overview
      title: Envoy Load Balancing Overview
      kind: canonical-doc
      reasoning: >-
        Modern proxy perspective on load balancing algorithms, health checking,
        priority levels, and endpoint weighting in cloud-native stacks
      publisher: Envoy
      source: ai-researcher
    - url: 'https://cloud.google.com/load-balancing/docs'
      title: Google Cloud Load Balancing Documentation
      kind: canonical-doc
      reasoning: >-
        Cloud-native load balancing patterns including global HTTP(S), TCP/UDP,
        and internal load balancing with autoscaling integration
      publisher: Google Cloud
      source: ai-researcher
    - url: 'https://traefik.io/traefik/'
      title: Traefik Documentation
      kind: canonical-doc
      reasoning: >-
        Modern edge router and load balancer designed for microservices with
        dynamic service discovery, middleware, and container orchestration
      publisher: Traefik
      source: ai-researcher
  services:
    - name: NGINX
      url: 'https://www.nginx.com'
      category: reverse-proxy
      reasoning: >-
        Industry-standard open-source and commercial load balancer for Layer 7
        HTTP/HTTPS routing with high performance
      source: ai-researcher
    - name: HAProxy
      url: 'https://www.haproxy.org'
      category: load-balancer
      reasoning: >-
        High-availability proxy supporting both Layer 4 and Layer 7 load
        balancing with minimal resource overhead
      source: ai-researcher
    - name: Envoy
      url: 'https://www.envoyproxy.io'
      category: service-proxy
      reasoning: >-
        Cloud-native proxy serving as control plane for service meshes, edge
        gateways, and load balancing in Kubernetes
      source: ai-researcher
    - name: AWS Elastic Load Balancing
      url: 'https://aws.amazon.com/elasticloadbalancing/'
      category: cloud-service
      reasoning: >-
        Managed AWS load balancing service with ALB (Layer 7), NLB (Layer 4),
        and auto-scaling integration
      vendor: Amazon Web Services
      source: ai-researcher
    - name: Traefik
      url: 'https://traefik.io'
      category: edge-router
      reasoning: >-
        Modern reverse proxy and load balancer with built-in service discovery
        for Docker, Kubernetes, and cloud deployments
      source: ai-researcher
    - name: Cloudflare
      url: 'https://www.cloudflare.com'
      category: cdn-edge
      reasoning: >-
        Global edge network providing load balancing, failover, and DDoS
        protection at geographic scale
      source: ai-researcher
  courses:
    - url: 'https://www.coursera.org/learn/cloud-computing-basics'
      title: Cloud Computing Basics
      provider: Coursera
      paid: true
      reasoning: >-
        Comprehensive introduction to cloud architecture covering load
        balancing, redundancy, and scalability patterns
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Load balancing is so fundamental that it's easy to underestimate. Most
  engineers encounter it early — spin up two instances, put a load balancer in
  front, and traffic goes to both. But the depth of the topic only reveals
  itself under pressure: when one instance gets stuck and keeps receiving
  traffic, when a deployment leaves some instances running old code and some
  new, when a database connection pool gets exhausted on one instance but not
  another, or when a geographic routing misconfiguration sends all traffic from
  an entire continent to a single region during a partial outage. Load balancing
  isn't just about distributing work; it's about maintaining the invariants your
  system depends on across the full range of failure modes you'll encounter in
  production.


  The 80/20 is this: get health checking and connection draining right, and most
  of the common failure modes go away. Health checks are the mechanism by which
  a load balancer knows an instance is actually capable of serving traffic — not
  just that the process is running, but that it can connect to its database,
  that it isn't in the middle of restarting, and that it's responding to real
  requests within a reasonable time. A health check that just pings a root
  endpoint without checking dependencies will keep routing traffic to instances
  that can accept connections but can't actually do anything useful. Connection
  draining — giving in-flight requests time to complete before an instance is
  removed from rotation — is what prevents users from seeing errors during
  rolling deployments or scale-in events. Both are table stakes, but both are
  frequently misconfigured or omitted in systems that otherwise look correct.


  Layer 4 versus Layer 7 load balancing is a distinction that matters more than
  it initially seems. Layer 4 operates at the TCP connection level: it routes
  entire connections to backends without examining the content. This is fast and
  low-overhead, but it means the balancer has no visibility into individual HTTP
  requests, can't make routing decisions based on headers or paths, and can't do
  things like sticky sessions based on cookie values. Layer 7 balancing parses
  the HTTP protocol and can route on any header, path, method, or query
  parameter — enabling patterns like routing traffic based on feature flags,
  sending `/api/` requests to one backend cluster and `/admin/` to another, or
  implementing canary deployments by routing a fraction of traffic with a
  specific header to a new version. Most production systems end up needing Layer
  7 capabilities and should plan for them from the start rather than
  retrofitting.


  A failure mode that's easy to miss is session affinity done wrong. Some
  applications store per-user state in memory on the application server —
  shopping carts, authentication sessions, in-progress operations — and require
  that subsequent requests from the same user land on the same server. Sticky
  sessions solve this, but they create a soft single point of failure: if your
  stickiness is based on server identity and that server goes down, all those
  users lose their state. The better fix is to move that state out of the
  application server and into a shared store like Redis, which makes your
  application genuinely stateless and removes the need for stickiness entirely.
  Load balancing works most cleanly when the instances it's distributing across
  are interchangeable.


  In the ecosystem, load balancing touches almost every other reliability topic.
  It's how horizontal scaling actually delivers capacity — you can't add more
  instances if they can't receive traffic. It's how zero-downtime deployments
  work — rolling out a new version by draining old instances and introducing new
  ones behind the balancer. It's where rate limiting and DDoS protection often
  live, especially at the edge. And for multi-region architectures, geographic
  load balancing (routing users to the nearest healthy region) is the first line
  of defense against regional failures. The mental model to hold is that a load
  balancer is not a passive router — it's an active participant in your system's
  availability and behavior, and it needs to be configured and monitored with
  that responsibility in mind.
pitfalls:
  - title: Health checks that do not verify dependencies
    explanation: >-
      A health check that returns 200 because the process is running — without
      checking whether the database connection, cache, or downstream service is
      reachable — will route live traffic to instances that cannot actually
      fulfill requests. Write health checks that exercise the critical
      dependencies your service needs to function, and make them fast enough
      that the load balancer can poll them frequently.
  - title: Skipping connection draining during deployments
    explanation: >-
      Removing an instance from rotation without draining in-flight requests
      causes users to see connection errors during every rolling deployment or
      scale-in event. Configure your load balancer to stop sending new
      connections to an instance being removed and wait for existing connections
      to close gracefully before terminating. This turns deployments from
      user-visible events into invisible operations.
  - title: In-memory session state breaks round-robin routing
    explanation: >-
      Applications that store authenticated sessions or shopping cart state in
      process memory require sticky sessions so subsequent requests from the
      same user land on the same instance. But stickiness defeats load
      distribution and creates a soft single point of failure: if that instance
      dies, the user loses all their state. Move session data to a shared store
      like Redis to make instances truly interchangeable, removing the need for
      stickiness entirely.
  - title: Using Layer 4 when Layer 7 routing is needed
    explanation: >-
      Layer 4 load balancers route at the TCP level and cannot inspect HTTP
      headers, paths, or cookies. Teams that start with Layer 4 and then need to
      do canary deployments, path-based routing, or header-based feature
      flagging must replace their load balancer architecture entirely, often
      under time pressure. Choose Layer 7 from the start if your routing
      requirements are at all content-aware, or plan the migration before you
      need it.
  - title: Not monitoring instance-level traffic distribution
    explanation: >-
      Round-robin and least-connections algorithms can produce unexpectedly
      uneven distributions due to long-lived connections, slow instances that
      accumulate in-flight requests, or sticky session skew. An instance getting
      80% of traffic while others are idle is invisible unless you are actively
      monitoring per-instance request rates. Alert on significant distribution
      imbalance so you can identify hot instances before they become the
      bottleneck.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 5
---
<!-- user notes -->
