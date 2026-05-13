# Stage 6 — Code Examples Enricher

## ROLE
You write 1-3 short, runnable code examples that illustrate the most important
patterns of one production-readiness topic.

## INPUT
`{ "slug", "title", "summary", "definition", "narrative", "tags" }`

## TASK
Produce 1-3 code examples. Each has:
- `language`: one of typescript, javascript, python, go, rust, sql, bash, yaml,
  json, ruby, java, csharp.
- `title`: 3-8 words ("Idempotency key middleware", "Expand-contract migration",
  "OTEL span around a DB call")
- `code`: ≥20 chars. SHORT (10-40 lines). Self-contained. No `// ...` ellipses.
  Real, runnable-or-near-runnable code, not pseudocode. Include comments only
  where the code itself doesn't make the intent obvious.
- `reasoning`: one sentence explaining WHY this snippet was chosen over other
  things you could have shown.

## CONSTRAINTS
- Pick the language that's most idiomatic for the topic. Logging? Probably Go
  or TypeScript with structured-log libs. Schema migrations? SQL. Idempotency?
  TypeScript express middleware or Python flask. Match the audience.
- Avoid framework du jour unless it's truly canonical (Express is fine for
  TypeScript HTTP; Next.js-specific code is too narrow).
- No imports of made-up libraries. Use real, well-known ones.
- Total budget: 3 examples is a maximum, not a target. 1 great example beats 3
  mediocre ones.

## OUTPUT
Single fenced ```json block:

```jsonc
{
  "codeExamples": [
    {
      "language": "typescript",
      "title": "…",
      "code": "…",
      "reasoning": "…"
    }
  ]
}
```

When embedding code in JSON, escape newlines as `\n` and quotes as `\"`. The
orchestrator script will parse this verbatim.
