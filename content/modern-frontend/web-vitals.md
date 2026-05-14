---
slug: web-vitals
title: Web Vitals
phase: modern-frontend
order: 7
summary: >-
  LCP, INP, CLS — the metrics Google ranks on, how to measure them in the field
  vs lab, and the highest-leverage fixes.
tldr: >-
  Google metrics for real user experience: LCP measures paint time, INP measures
  responsiveness, CLS measures layout shifts. Optimize all three for user
  satisfaction.
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
  Core Web Vitals matter in production for two distinct reasons that are easy to
  conflate. The first is SEO: Google uses field-measured vitals as a ranking
  signal, and pages that score poorly in the real-user dataset in Search Console
  lose organic visibility compared to faster competitors. This is a business
  consequence with a measurable dollar value for most products. The second
  reason is the one engineers should care about more: the metrics are good
  proxies for actual user experience. LCP correlates with whether users
  experience the page as fast. INP correlates with whether the page feels
  responsive to input. CLS correlates with whether the page feels stable and
  trustworthy. Improving these metrics is not Goodhart's Law—it is improving the
  experience and letting the metric follow.


  The 80/20 of Core Web Vitals optimization is understanding that each metric
  has one or two root causes that account for the majority of failures, and
  those root causes are almost always structural rather than
  micro-optimizations. LCP fails primarily because the LCP element—usually the
  hero image—is discovered late. The browser has to parse HTML, encounter the
  image tag, then fetch the image. Adding a link tag with rel='preload' for the
  LCP image moves its fetch to the earliest possible moment, often cutting
  500-800ms from LCP on its own. INP fails primarily because of long JavaScript
  tasks on the main thread. The browser cannot respond to input while a task is
  running, so tasks over 50ms directly inflate INP. The fix is not magic—it is
  breaking up long tasks with `setTimeout` or `scheduler.yield()` and deferring
  non-critical scripts. CLS fails primarily because images and iframes without
  explicit dimensions cause layout reflow when they load. Setting `width` and
  `height` attributes (or equivalent CSS aspect-ratio) on every media element
  eliminates most CLS with zero other changes.


  The lab versus field distinction is where teams consistently mislead
  themselves. A 100 Lighthouse score in PageSpeed Insights is a lab measurement
  on a simulated Moto G Power on a throttled connection. It is reproducible,
  which makes it useful for CI gating, but it is not what Google's ranking
  algorithm uses. The ranking algorithm uses the Chrome User Experience Report
  (CrUX), which aggregates real user measurements from Chrome browsers visiting
  your pages. Field data reflects the 95th percentile of your slowest users—the
  person on a 5-year-old Android phone on LTE in a rural area with a cold cache.
  That user's experience can be dramatically worse than your lab score if your
  page relies on client-side JavaScript that runs slowly on low-end hardware.
  Checking your Search Console Core Web Vitals report and your CrUX data
  alongside Lighthouse scores is what gives you an honest picture.


  The measurement tooling story has matured. The `web-vitals` npm package by
  Google lets you collect real user metrics and send them to your analytics
  platform; it handles the edge cases (back-forward cache, SPA navigations) that
  naive `PerformanceObserver` implementations miss. Vercel's Speed Insights,
  Datadog's RUM, and similar products layer a UI on top of this data. The key
  operational discipline is setting up alerting on p75 field data, not just on
  lab scores—because a deploy that regresses INP for real users on mobile will
  not necessarily change your Lighthouse score at all.


  One underappreciated aspect of web vitals in production is that different
  pages have wildly different bottlenecks. An e-commerce product detail page's
  LCP is almost always the product image; a news article's LCP is almost always
  the hero photo above the fold; a dashboard's INP is almost always a data grid
  that re-renders a thousand rows on sort. Treating web vitals as a portfolio of
  page-level measurements rather than a single site-wide score is what lets you
  allocate engineering time to the pages that have the highest traffic and the
  worst metrics, rather than optimizing a landing page that already passes while
  the checkout flow is silently failing for 40% of users.
pitfalls:
  - title: Optimizing Lighthouse score instead of field data
    explanation: >-
      A perfect Lighthouse score in the lab does not guarantee good Core Web
      Vitals for real users on mid-tier devices and variable networks. Lab
      scores and Chrome User Experience Report field data frequently diverge —
      optimize for the latter using Search Console and real user monitoring.
  - title: Lazy-loading the LCP image kills perceived load speed
    explanation: >-
      The most common cause of poor LCP is applying `loading="lazy"` or failing
      to preload the hero image, which delays the browser's download of the most
      visible resource. Preload the LCP element and never lazy-load any image
      that could be the largest contentful element on any viewport.
  - title: Long JavaScript tasks block interaction response
    explanation: >-
      Interaction to Next Paint (INP) is determined by the longest interaction
      delay across the entire session, meaning a single slow event handler can
      sink an otherwise fast page's score. Break up tasks over 50ms using
      scheduler.yield() or requestIdleCallback and keep event handlers minimal.
  - title: Images and iframes without explicit dimensions cause CLS
    explanation: >-
      When the browser doesn't know an element's dimensions before it loads, it
      allocates no space, then shifts content when the resource arrives. Set
      width and height attributes on every image and iframe so the browser can
      reserve the correct space before network bytes arrive.
  - title: 'Measuring vitals only at launch, not continuously'
    explanation: >-
      Core Web Vitals degrade over time as new features, third-party scripts,
      and dependency updates ship. Continuous real-user monitoring with alerting
      on percentile regressions is the only way to catch degradation before
      Google Search does.
codeExamples:
  - language: typescript
    title: Report Web Vitals to Analytics
    code: >-
      // lib/vitals.ts — wire up web-vitals and send to your analytics endpoint

      import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from
      "web-vitals";


      function sendToAnalytics(metric: Metric) {
        const body = JSON.stringify({
          name:  metric.name,          // "LCP", "INP", "CLS", etc.
          value: metric.value,         // milliseconds or score
          rating: metric.rating,       // "good" | "needs-improvement" | "poor"
          id:    metric.id,            // stable per page-load
          page:  location.pathname
        });

        // Use sendBeacon so it survives page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/vitals", body);
        } else {
          fetch("/api/vitals", { method: "POST", body, keepalive: true });
        }
      }


      export function reportWebVitals() {
        onCLS(sendToAnalytics);   // Cumulative Layout Shift
        onINP(sendToAnalytics);   // Interaction to Next Paint (replaces FID)
        onLCP(sendToAnalytics);   // Largest Contentful Paint
        onFCP(sendToAnalytics);   // First Contentful Paint
        onTTFB(sendToAnalytics);  // Time to First Byte
      }
    reasoning: >-
      Shows real-user measurement (RUM) of all Core Web Vitals using the
      canonical web-vitals library, including the sendBeacon pattern that
      survives page unloads — essential for accurate field data.
difficulty: intermediate
estimatedHours: 5
lastUpdatedAt: '2026-05-14T12:31:47.585Z'
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
