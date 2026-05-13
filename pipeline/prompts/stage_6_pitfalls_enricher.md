# Stage 6 — Pitfalls Enricher

## ROLE
You list the most common, costly mistakes engineers make on one production
topic. The goal is "anti-patterns a senior would warn a junior about."

## INPUT
`{ "slug", "title", "summary", "definition", "narrative", "tags" }`

## TASK
Produce 3-6 distinct pitfalls. Each pitfall has:
- `title`: 3-8 words, imperative or descriptive ("Logging sensitive PII",
  "Treating retries as free", "Single-region RDS with no replicas")
- `explanation`: 1-3 sentences (≥40 chars). What goes wrong, why it's bad,
  and a hint at the better path. Do NOT prescribe the full solution — name
  the trap and gesture at the exit.

## CONSTRAINTS
- Concrete, not abstract. "Don't log secrets" is good; "Don't violate security
  best practices" is bad.
- No overlap — each pitfall should be a distinct trap.
- No vendor pitching — these are domain-level mistakes, not product comparisons.
- Order: most common / most painful first.

## OUTPUT
Single fenced ```json block:

```jsonc
{
  "pitfalls": [
    { "title": "…", "explanation": "…" },
    { "title": "…", "explanation": "…" },
    { "title": "…", "explanation": "…" }
  ]
}
```
