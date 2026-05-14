---
slug: web-vitals
title: Web Vitals
phase: modern-frontend
order: 7
summary: >-
  LCP, INP, CLS — the metrics Google ranks on, how to measure them in the field
  vs lab, and the highest-leverage fixes.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Core Web Vitals are a set of user-centric performance metrics defined by
  Google that measure real experiences rather than synthetic load times. The
  three current vitals are Largest Contentful Paint (LCP), Interaction to Next
  Paint (INP), and Cumulative Layout Shift (CLS). LCP measures how long it takes
  for the largest image or text block in the viewport to become visible—the
  metric most correlated with perceived load speed. INP (which replaced First
  Input Delay in 2024) measures responsiveness by capturing the longest
  interaction delay across the entire page session, making it the most sensitive
  signal for slow JavaScript. CLS measures visual stability by summing
  unexpected layout shifts, penalizing pages that jump content as fonts load or
  ads insert.


  Google uses Core Web Vitals as a ranking signal under the Page Experience
  update, which means poor scores have direct SEO consequences. Measurement
  happens in two modes: lab (controlled, reproducible, using tools like
  Lighthouse or PageSpeed Insights) and field (real user data collected by
  Chrome's User Experience Report, surfaced in Search Console). Lab and field
  scores frequently diverge because lab tools use a simulated network and device
  while field data captures the diversity of real devices and connections.
  Optimizing for field data—not just a 100 Lighthouse score in the lab—is the
  goal.


  The highest-leverage fixes differ by metric. For LCP: preload the hero image,
  choose a fast hosting origin, use a CDN, avoid lazy-loading the LCP element.
  For INP: break up long JavaScript tasks, defer non-critical work with
  `scheduler.yield()`, and reduce the size of event handlers. For CLS: set
  explicit width and height on images and iframes, avoid inserting content above
  existing content, and use `font-display: optional` for web fonts. Tools like
  PageSpeed Insights, web-vitals.js, and Vercel's built-in analytics surface
  field data at different levels of granularity, making it possible to
  prioritize which pages and interactions need the most attention.
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
lastUpdatedAt: '2026-05-14T12:26:04.536Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=AQqFZ5t8uNc'
      title: Core Web Vitals — What They Are and How to Improve Them
      author: Google Search Central
      durationMinutes: 8
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Google's own explainer of LCP, INP, and CLS from the Search Central team
        is the most authoritative short introduction to what the metrics measure
        and why they matter for SEO.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=XvZ7-Uh0R4Q'
      title: Improving Core Web Vitals — Google I/O 2023
      author: Google Chrome Developers
      durationMinutes: 40
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Google I/O session from the Chrome speed team covering practical
        optimizations for LCP, INP, and CLS with before/after case studies from
        real production sites.
      source: ai-researcher
  articles:
    - url: 'https://web.dev/vitals/'
      title: Web Vitals — web.dev
      kind: canonical-doc
      reasoning: >-
        The canonical Google reference for all three Core Web Vitals; defines
        thresholds, explains measurement methodology, and links to per-metric
        deep-dives.
      publisher: Google
      source: ai-researcher
    - url: 'https://web.dev/articles/lcp'
      title: Largest Contentful Paint (LCP) — web.dev
      kind: canonical-doc
      reasoning: >-
        The authoritative per-metric reference for LCP including what qualifies
        as an LCP element, how to measure it, and the highest-leverage
        optimizations.
      publisher: Google
      source: ai-researcher
    - url: 'https://web.dev/articles/inp'
      title: Interaction to Next Paint (INP) — web.dev
      kind: canonical-doc
      reasoning: >-
        The definitive reference for INP—the newest and least-understood
        vital—explaining how it differs from FID, what causes poor scores, and
        how to measure and fix interaction latency.
      publisher: Google
      source: ai-researcher
  services:
    - name: PageSpeed Insights
      url: 'https://pagespeed.web.dev'
      category: performance-measurement
      reasoning: >-
        Google's free tool that combines Lighthouse lab analysis with Chrome UX
        Report field data; the starting point for diagnosing and prioritizing
        Web Vitals issues on any URL.
      vendor: Google
      source: ai-researcher
    - name: web-vitals (npm library)
      url: 'https://github.com/GoogleChrome/web-vitals'
      category: performance-measurement
      reasoning: >-
        Google's official JavaScript library for measuring real user Web Vitals
        in the browser; the building block for sending field metric data to your
        own analytics pipeline.
      vendor: Google
      source: ai-researcher
    - name: Calibre
      url: 'https://calibreapp.com'
      category: performance-monitoring
      reasoning: >-
        Continuous performance monitoring platform that tracks Web Vitals over
        time with per-commit and per-deploy comparisons—prevents performance
        regressions in CI.
      vendor: Calibre
      source: ai-researcher
    - name: Vercel Speed Insights
      url: 'https://vercel.com/docs/speed-insights'
      category: performance-monitoring
      reasoning: >-
        Built-in real user monitoring for Core Web Vitals on Vercel-deployed
        apps; zero configuration for teams already on Vercel, surfaces field
        data per route.
      vendor: Vercel
      source: ai-researcher
    - name: Treo
      url: 'https://treo.sh'
      category: performance-monitoring
      reasoning: >-
        Lightweight Chrome UX Report dashboard that surfaces field Web Vitals
        data for any domain; useful for benchmarking against competitors and
        tracking trends.
      vendor: Treo
      source: ai-researcher
  courses:
    - url: 'https://web.dev/learn/performance'
      title: Learn Performance — web.dev
      provider: Google / web.dev
      paid: false
      reasoning: >-
        Google's structured performance curriculum covers all three Core Web
        Vitals with practical optimization techniques and measurement
        exercises—the most complete free course on the topic.
      instructor: Google web.dev team
      source: ai-researcher
    - url: 'https://frontendmasters.com/courses/web-performance-v3/'
      title: 'Web Performance Fundamentals, v3'
      provider: Frontend Masters
      paid: true
      reasoning: >-
        Todd Gardner's course teaches performance measurement methodology—lab vs
        field, RUM vs synthetic—alongside Core Web Vitals optimization, giving
        the full picture for production monitoring.
      instructor: Todd Gardner
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.536Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
