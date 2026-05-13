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
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
