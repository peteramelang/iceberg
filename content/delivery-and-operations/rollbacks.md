---
slug: rollbacks
title: Rollbacks
phase: delivery-and-operations
order: 3
summary: >-
  Design deployments so that a bad release can be quickly reverted without data
  loss using strategies like blue-green deployments and database migration
  reversibility.
definition: >-
  Rollbacks are the critical safety mechanism enabling teams to quickly revert a
  bad release without data loss. Effective rollback design requires blue-green
  deployments that maintain two identical production environments (blue and
  green), allowing instant traffic switching when issues are detected. Beyond
  environment switching, rollbacks must account for database migrations and
  state changes through migration reversibility—ensuring schema changes can be
  safely undone. Modern deployment systems like Kubernetes provide native
  rollback capabilities through revision history, while specialized tools like
  Argo Rollouts and Flagger add sophisticated strategies including canary
  rollouts with automated metric-based rollbacks, weighted traffic shifting, and
  integration with observability platforms. The goal is to achieve zero-downtime
  deployments where failures trigger automatic rollbacks based on monitoring
  signals, combining rapid detection (through health checks and metrics) with
  instant execution (through environment switching or replica management).
  Successful rollback strategies require: (1) maintaining stable previous
  versions, (2) monitoring for failure signals in real-time, (3) automating the
  decision to rollback, and (4) ensuring data consistency across state changes.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=amWC9eIL0YU'
      title: Blue-Green Deployments in 5 Minutes
      author: Docker
      durationMinutes: 5
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Quick visual explanation of blue-green deployment pattern for safe
        rollbacks and zero-downtime deployments.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=Nz4J5YVl1Wc'
      title: 'Advanced Kubernetes Deployments: Blue-Green, Canary, and Rolling Updates'
      author: Linux Academy
      durationMinutes: 52
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive guide covering deployment strategies, rollback mechanisms,
        and when to use each approach for safe release management.
      source: ai-researcher
  articles:
    - url: 'https://martinfowler.com/bliki/BlueGreenDeployment.html'
      title: Blue-Green Deployment
      kind: canonical-doc
      reasoning: >-
        Martin Fowler's canonical reference on blue-green deployment pattern,
        explaining the mechanics and tradeoffs for safe rollbacks.
      publisher: Martin Fowler
      source: ai-researcher
    - url: 'https://martinfowler.com/bliki/CanaryRelease.html'
      title: Canary Release
      kind: canonical-doc
      reasoning: >-
        Martin Fowler's explanation of canary deployment strategy for gradual
        rollout with built-in rollback capability.
      publisher: Martin Fowler
      source: ai-researcher
    - url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/'
      title: 'Kubernetes Deployments: Rolling Updates and Rollback'
      kind: canonical-doc
      reasoning: >-
        Official Kubernetes documentation on native rollout and rollback
        mechanisms, revision history, and health monitoring.
      publisher: Kubernetes (CNCF)
      source: ai-researcher
    - url: >-
        https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/
      title: 'Automating Safe, Hands-Off Deployments'
      kind: engineering-blog
      reasoning: >-
        Amazon's engineering approach to safe deployments with automatic
        rollback, staggered wave deployment, and continuous monitoring.
      publisher: Amazon Web Services
      source: ai-researcher
    - url: 'https://argoproj.github.io/argo-rollouts/'
      title: 'Argo Rollouts: Advanced Deployment Strategies'
      kind: canonical-doc
      reasoning: >-
        Official Argo Rollouts documentation covering blue-green, canary, and
        progressive delivery with automated analysis and rollback.
      publisher: Argo (CNCF)
      source: ai-researcher
  services:
    - name: Kubernetes
      url: 'https://kubernetes.io'
      category: orchestration-platform
      reasoning: >-
        Native Kubernetes Deployment controller with built-in rolling updates,
        rollout history, and kubectl rollback commands.
      vendor: Kubernetes (CNCF)
      source: ai-researcher
    - name: Argo Rollouts
      url: 'https://argoproj.github.io/argo-rollouts/'
      category: progressive-delivery
      reasoning: >-
        Advanced Kubernetes-native controller enabling blue-green and canary
        deployments with automated metric-based rollbacks.
      vendor: Argo (CNCF)
      source: ai-researcher
    - name: Flagger
      url: 'https://flagger.app'
      category: progressive-delivery
      reasoning: >-
        Cloud-native operator for automated progressive delivery with canary
        analysis, service mesh integration, and automatic rollback.
      source: ai-researcher
    - name: Spinnaker
      url: 'https://spinnaker.io'
      category: multi-cloud-cd-platform
      reasoning: >-
        Netflix's multi-cloud continuous delivery platform supporting blue-green
        deployments, canary analysis, and traffic management across cloud
        providers.
      source: ai-researcher
    - name: Heroku
      url: 'https://www.heroku.com'
      category: paas-deployment-platform
      reasoning: >-
        PaaS with instant code and database rollback capabilities, simplifying
        safe deployments without infrastructure management.
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The ability to roll back a bad deployment is the closest thing software
  engineering has to an undo button, and its absence is responsible for a
  category of incidents that are uniquely painful: you know exactly what caused
  the problem (the release you just shipped), but you can't quickly revert it,
  so the incident drags on while you try to forward-fix or selectively revert
  changes. Meanwhile users are experiencing an outage or data corruption. Teams
  that invest in rollback capability tend to have shorter, calmer incidents.
  Teams that don't tend to have longer, more chaotic ones—and they tend to be
  more conservative about shipping, which has its own costs.


  The 80/20 of rollbacks is: most rollbacks are code-only rollbacks, and those
  are mechanical if you have immutable artifacts and a clean deployment
  pipeline. Build your Docker image once, tag it with the git SHA, push it to a
  registry, deploy by tag. Rolling back means deploying the previous tag.
  Kubernetes makes this explicit with rollout history and kubectl rollout undo.
  The complexity multiplies the moment a database migration is involved. Adding
  a column is easy to roll back (drop the column). Dropping a column is not (the
  data is gone). Renaming a column is not (every running instance of the old
  code will try to use the old name). This is why the expand-contract pattern
  exists and why schema migrations deserve their own careful treatment. If your
  deployment strategy doesn't address database changes, your rollback plan is
  incomplete.


  Blue-green deployments are the cleanest model for rollback because the old
  environment stays live until you're confident the new one is good. You flip
  traffic to green, watch your error rates and latency for five or ten minutes,
  and if something looks wrong you flip back to blue. Total recovery time:
  seconds. The cost is running two full production environments simultaneously,
  which isn't free, but for most teams the cost of a prolonged incident is
  higher than the infrastructure cost of a second environment. Canary
  deployments are a lighter-weight alternative: route a small percentage of
  traffic to the new version, compare metrics between old and new, and only
  proceed if the canary looks healthy. Argo Rollouts and Flagger automate this
  comparison using Prometheus metrics, which removes the human judgment call
  during a high-stress deployment window.


  The failure mode that catches teams most often is the rollback that can't be
  executed because of state. You ship a new version that starts writing data in
  a new format. You discover a bug. You try to roll back to the old code. The
  old code doesn't understand the new data format, so now you have a different
  problem than you started with. The solution is to design backward
  compatibility into your data model during the deployment—new code should write
  data in a format that old code can either read or safely ignore, until you're
  confident enough to remove the old code path. This is the same discipline as
  API versioning, applied to your internal data layer. It's extra work up front,
  but it's what makes rollback a real option rather than a theoretical one.


  Monitoring is the prerequisite that makes automated rollbacks work. You can't
  automate a rollback decision without metrics to base it on. Error rate SLOs
  and latency thresholds give you the signal: if error rate exceeds X% or p99
  latency exceeds Y ms within Z minutes of a deployment, trigger the rollback.
  Tools like Flagger integrate directly with Prometheus and Datadog to evaluate
  these conditions automatically. But you need to have defined what "healthy"
  means before a deployment starts—if you're trying to figure out your baseline
  error rate during an active incident, you've already lost the advantage of
  automation. Health checks, readiness probes, and pre-deployment metric
  snapshots are the groundwork.


  In the delivery and operations ecosystem, rollbacks sit at the intersection of
  CI/CD, observability, and database management. They're most effective when
  your deployment pipeline is fast (so there's minimal recovery delay), your
  observability is good (so you know immediately when something is wrong), and
  your database migration strategy is disciplined (so code and schema can be
  versioned independently). Teams that invest in all three find that rollbacks
  become boring and mechanical. That's exactly what you want—the ability to undo
  a mistake should be routine, not heroic.
pitfalls:
  - title: Rolling back code after a destructive schema migration
    explanation: >-
      If the new code ran a migration that dropped a column or changed a data
      format, rolling back the code points old application instances at a schema
      they cannot read. The result is a second failure layered on top of the
      original. Schema changes must be backward-compatible so old code can
      safely run against the new schema during a rollback window.
  - title: No immutable artifact tagging in the deploy pipeline
    explanation: >-
      Without tagging Docker images by git SHA and deploying by tag, 'rolling
      back' requires rebuilding or retagging, which is error-prone under
      pressure. An immutable registry of every artifact ever deployed reduces
      rollback to a single command pointing at a previous tag.
  - title: Skipping pre-deployment metric baselines
    explanation: >-
      Automated rollback tools that compare post-deploy metrics to a baseline
      cannot work if you have not captured that baseline before deploying. If
      you are trying to determine your normal error rate during an active
      incident, the automation that should be protecting you has already failed.
      Capture and store the baseline before the release starts.
  - title: New code writing data in formats old code cannot read
    explanation: >-
      A release that starts persisting records in a new schema or serialization
      format prevents rollback to the version that produced them. Design new
      code to write data that old code can either read or safely ignore until
      all instances are confirmed healthy on the new version—the same discipline
      as API versioning, applied internally.
  - title: Rollback plan exists on paper but has never been tested
    explanation: >-
      Rollback procedures that are not exercised in practice become unreliable
      under the stress of a real incident. Periodic drills—actually executing a
      rollback in staging or production during a low-risk window—reveal gaps in
      documentation, permissions, and tooling before they matter.
codeExamples:
  - language: bash
    title: Kubernetes Image Rollback by Git SHA
    code: |-
      #!/usr/bin/env bash
      # Roll back a Kubernetes deployment to a specific git SHA.
      # Usage: ./rollback.sh api a3f1b2c
      set -euo pipefail

      DEPLOYMENT=${1:?"Usage: $0 <deployment> <git-sha>"}
      SHA=${2:?"Usage: $0 <deployment> <git-sha>"}
      IMAGE="registry.example.com/app:${SHA}"

      echo "Rolling back ${DEPLOYMENT} to ${IMAGE}..."

      kubectl set image "deployment/${DEPLOYMENT}" \
        "app=${IMAGE}" \
        --record

      kubectl rollout status "deployment/${DEPLOYMENT}" --timeout=120s

      if [ $? -eq 0 ]; then
        echo "Rollback complete. Current image: ${IMAGE}"
      else
        echo "ERROR: rollout did not complete. Check kubectl describe deployment/${DEPLOYMENT}"
        exit 1
      fi
    reasoning: >-
      Tagging images by git SHA and rolling back by SHA makes rollbacks
      deterministic and auditable — this script is the ops-primitive every team
      should have before they need it.
  - language: sql
    title: Expand-Contract Column Rename Migration
    code: |-
      -- PHASE 1: Expand — add new column, keep old one
      -- Safe to deploy with either version of the application code.
      ALTER TABLE orders ADD COLUMN total_cents INTEGER;

      UPDATE orders
      SET total_cents = total_amount_cents
      WHERE total_cents IS NULL
        AND id BETWEEN 0 AND 100000; -- batch; repeat until done

      -- PHASE 2: After all app instances use total_cents,
      --           drop the old column (separate deployment / migration).
      -- ALTER TABLE orders DROP COLUMN total_amount_cents;

      -- Index creation is non-blocking with CONCURRENTLY:
      CREATE INDEX CONCURRENTLY idx_orders_total_cents ON orders (total_cents);
    reasoning: >-
      The expand-contract pattern is the single most important schema migration
      concept — showing both the safe backfill batching and the CONCURRENTLY
      index in one snippet gives learners everything they need to avoid table
      locks.
difficulty: intermediate
estimatedHours: 6
---
<!-- user notes -->
