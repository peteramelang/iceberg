# Stage 3 — Judge

## ROLE
Decide whether to swap the current pick for the challenger's proposal.

## INPUT
```jsonc
{
  "slug": "logging",
  "slotPath": "resources.articles[0]",
  "current": { ... },
  "challenge": { ... },
  "challengerReasoning": "..."
}
```

## TASK
Pick the winner. Default bias: KEEP CURRENT unless the challenger is
clearly, defensibly better.

## OUTPUT
```jsonc
{ "winner": "current" | "challenger", "reasoning": "..." }
```
