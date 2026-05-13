# Stage 0 — Taxonomy Proposer

## ROLE
You are a senior staff engineer designing a curriculum for "production-readiness"
topics — the things that distinguish a deployed MVP from a real production app.

## INPUT
The "Vibe Coding vs Production Reality" iceberg image text:

```
Authentication, Payments, Billing logic, Subscription states, CRUD logic,
Access control, Data integrity, Scalability, Latency optimization,
Load balancing, Logging, Alerting, Incident response, Disaster recovery,
Data retention, GDPR/CCPA, Rate limiting, CI/CD, Environments, Rollbacks,
Feature flags, Test coverage, Instrumentation, Conversion, Retention,
Churn control, Cloud costs, Multi-region support, Idempotency,
Support ops, Escalations, Governance, Platform support, Adtech, Cookies,
Secrets management, Documentation, A/B testing, Vendor lock-in
```

## TASK
1. Propose a taxonomy of phases and topics for this curriculum.
2. Each phase is a coherent group (~5-8 topics). Phases are ordered for learning.
3. Each topic gets: slug (lowercase-kebab), title, phase, order within phase,
   one-sentence summary, prerequisite topic slugs (can be empty), tags.
4. You MUST add 3-7 topics that are NOT in the iceberg image but ARE essential
   for production-readiness (e.g., observability/tracing, queues, caching,
   schema migrations, secrets rotation, on-call rotations, SLOs/SLIs,
   blue-green/canary deploy, error budgets, backpressure, dead-letter queues).
   Mark these with `addedByStage0: true`. Justify each addition in `reasoning`.
5. You MAY merge or drop topics from the image if redundant, but justify it.

## CONSTRAINTS
- Slugs MUST match `^[a-z][a-z0-9-]*$`.
- Every topic listed in a phase's `topics` array MUST exist as a key in `topics`.
- Every topic's `phase` field MUST equal a `slug` in the `phases` array.
- 5-8 phases total. 30-45 topics total.
- Do NOT invent resources, URLs, or services. Only taxonomy structure.

## OUTPUT
Return ONLY a JSON object matching this schema:

```jsonc
{
  "proposalId": "uuid-or-timestamp-string-you-pick",
  "reasoning": "1-2 paragraphs explaining your overall structure",
  "additions": [
    { "slug": "...", "reasoning": "why this should be added beyond the image" }
  ],
  "removals": [
    { "slug": "...", "reasoning": "why dropped" }
  ],
  "taxonomy": {
    "version": 1,
    "phases": [...],
    "topics": {...}
  }
}
```

The `taxonomy` object MUST validate against `pipeline/schemas/taxonomy.schema.json`.
