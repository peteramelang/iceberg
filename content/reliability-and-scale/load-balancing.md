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
    long:
      url: 'https://www.youtube.com/watch?v=zRYZToFg64E'
      title: Mastering Load Balancing at Scale
      author: Linux Academy
      durationMinutes: 45
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive deep-dive covering Layer 4/7 load balancing, sticky
        sessions, health checks, and scaling strategies
  articles:
    - url: 'https://www.nginx.com/resources/glossary/load-balancing/'
      title: Load Balancing Glossary
      kind: canonical-doc
      reasoning: >-
        Canonical NGINX reference defining load balancing, algorithms
        (round-robin, least connections, IP hash), and deployment patterns
    - url: 'https://aws.amazon.com/elasticloadbalancing/features/'
      title: Elastic Load Balancing Features
      kind: tutorial
      reasoning: >-
        AWS ELB architecture overview covering ALB, NLB, and CLB with use cases,
        routing rules, and scalability characteristics
    - url: >-
        https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/overview
      title: Envoy Load Balancing Overview
      kind: canonical-doc
      reasoning: >-
        Modern proxy perspective on load balancing algorithms, health checking,
        priority levels, and endpoint weighting in cloud-native stacks
    - url: 'https://cloud.google.com/load-balancing/docs'
      title: Google Cloud Load Balancing Documentation
      kind: canonical-doc
      reasoning: >-
        Cloud-native load balancing patterns including global HTTP(S), TCP/UDP,
        and internal load balancing with autoscaling integration
    - url: 'https://traefik.io/traefik/'
      title: Traefik Documentation
      kind: canonical-doc
      reasoning: >-
        Modern edge router and load balancer designed for microservices with
        dynamic service discovery, middleware, and container orchestration
  services:
    - name: NGINX
      url: 'https://www.nginx.com'
      category: reverse-proxy
      reasoning: >-
        Industry-standard open-source and commercial load balancer for Layer 7
        HTTP/HTTPS routing with high performance
    - name: HAProxy
      url: 'https://www.haproxy.org'
      category: load-balancer
      reasoning: >-
        High-availability proxy supporting both Layer 4 and Layer 7 load
        balancing with minimal resource overhead
    - name: Envoy
      url: 'https://www.envoyproxy.io'
      category: service-proxy
      reasoning: >-
        Cloud-native proxy serving as control plane for service meshes, edge
        gateways, and load balancing in Kubernetes
    - name: AWS Elastic Load Balancing
      url: 'https://aws.amazon.com/elasticloadbalancing/'
      category: cloud-service
      reasoning: >-
        Managed AWS load balancing service with ALB (Layer 7), NLB (Layer 4),
        and auto-scaling integration
    - name: Traefik
      url: 'https://traefik.io'
      category: edge-router
      reasoning: >-
        Modern reverse proxy and load balancer with built-in service discovery
        for Docker, Kubernetes, and cloud deployments
    - name: Cloudflare
      url: 'https://www.cloudflare.com'
      category: cdn-edge
      reasoning: >-
        Global edge network providing load balancing, failover, and DDoS
        protection at geographic scale
  courses:
    - url: 'https://www.edx.org/course/cloud-infrastructure-technologies'
      title: Cloud Infrastructure Technologies
      provider: edX
      paid: false
      reasoning: >-
        Foundational cloud concepts including load balancing patterns,
        auto-scaling, and fault tolerance
    - url: 'https://www.coursera.org/learn/cloud-computing-basics'
      title: Cloud Computing Basics
      provider: Coursera
      paid: true
      reasoning: >-
        Comprehensive introduction to cloud architecture covering load
        balancing, redundancy, and scalability patterns
    - url: 'https://www.linux.com/training/'
      title: Linux Foundation Training Paths
      provider: Linux Foundation
      paid: true
      reasoning: >-
        Professional certification paths including Kubernetes and container
        orchestration with service load balancing
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
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
  - language: go
    title: Round-Robin Load Balancer with Health Checks
    code: "package main\n\nimport (\n\t\"fmt\"\n\t\"net/http\"\n\t\"net/http/httputil\"\n\t\"net/url\"\n\t\"sync\"\n\t\"sync/atomic\"\n)\n\ntype Backend struct {\n\tURL     *url.URL\n\tHealthy atomic.Bool\n}\n\ntype LoadBalancer struct {\n\tbackends []*Backend\n\tcurrent  atomic.Uint64\n\tmu       sync.RWMutex\n}\n\nfunc (lb *LoadBalancer) next() *Backend {\n\ttotal := uint64(len(lb.backends))\n\tfor range lb.backends {\n\t\tidx := lb.current.Add(1) % total\n\t\tb := lb.backends[idx]\n\t\tif b.Healthy.Load() {\n\t\t\treturn b\n\t\t}\n\t}\n\treturn nil\n}\n\nfunc (lb *LoadBalancer) ServeHTTP(w http.ResponseWriter, r *http.Request) {\n\tb := lb.next()\n\tif b == nil {\n\t\thttp.Error(w, \"no healthy backends\", http.StatusServiceUnavailable)\n\t\treturn\n\t}\n\thttputil.NewSingleHostReverseProxy(b.URL).ServeHTTP(w, r)\n}\n\nfunc (lb *LoadBalancer) healthCheck(b *Backend) {\n\tresp, err := http.Get(b.URL.String() + \"/healthz\")\n\tb.Healthy.Store(err == nil && resp.StatusCode == http.StatusOK)\n\tif err != nil {\n\t\tfmt.Printf(\"backend %s unhealthy: %v\\n\", b.URL, err)\n\t}\n}\n\nfunc main() {\n\turls := []string{\"http://app1:8080\", \"http://app2:8080\", \"http://app3:8080\"}\n\tlb := &LoadBalancer{}\n\tfor _, u := range urls {\n\t\tparsed, _ := url.Parse(u)\n\t\tb := &Backend{URL: parsed}\n\t\tb.Healthy.Store(true)\n\t\tlb.backends = append(lb.backends, b)\n\t}\n\tfmt.Println(\"Load balancer listening on :8000\")\n\thttp.ListenAndServe(\":8000\", lb)\n}"
    reasoning: >-
      Implements a minimal but complete round-robin load balancer with
      health-aware routing in idiomatic Go, showing the core mechanics — atomic
      counter, healthy-only dispatch, reverse proxy — without framework magic.
  - language: yaml
    title: Nginx Upstream with Health Checks and Draining
    code: |-
      # nginx.conf — Layer 7 load balancing with active health checks
      # and slow_start for graceful instance introduction.
      http:
        upstream app_servers {
          # Least-connections distributes load more fairly than round-robin
          # when requests have variable duration.
          least_conn;

          server app1:8080 weight=1 max_fails=3 fail_timeout=30s;
          server app2:8080 weight=1 max_fails=3 fail_timeout=30s;
          # slow_start ramps new instance to full weight over 60 s,
          # avoiding thundering-herd on fresh deployments.
          server app3:8080 weight=1 slow_start=60s;
        }

        server {
          listen 80;

          location / {
            proxy_pass         http://app_servers;
            proxy_next_upstream error timeout http_502 http_503;
            proxy_connect_timeout 2s;
            proxy_read_timeout    30s;

            # Propagate real client IP to application
            proxy_set_header X-Real-IP        $remote_addr;
            proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
          }

          # Passive health: nginx marks a backend down after max_fails
          # within fail_timeout and retries the next upstream automatically.
        }
    reasoning: >-
      Covers the production-critical Nginx settings — least-conn algorithm,
      passive health checks, slow_start for rolling deploys, and automatic retry
      on failure — that prevent user-visible errors during instance churn.
difficulty: intermediate
estimatedHours: 5
tldr: >-
  Route incoming traffic across multiple servers so no single one becomes a
  failure point, and you can scale up or deploy without downtime.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.905Z'
---
<!-- user notes -->
