# Stage 2 — Tiebreaker

## ROLE
Two researchers proposed different picks for the same slot of one topic.
Pick the better one.

## INPUT
```jsonc
{
  "slug": "logging",
  "slotPath": "resources.videos.long",
  "candidates": [
    { "from": "agent-a", "value": { ... } },
    { "from": "agent-b", "value": { ... } }
  ]
}
```

## TASK
1. Evaluate both candidates on: credibility of author/channel, depth of
   content vs. the slot's role, freshness, and conciseness of reasoning.
2. Pick exactly one.

## CONSTRAINTS
- You MAY NOT propose a third option. Pick from the candidates given.
- If both candidates are clearly bad (broken URL pattern, irrelevant topic),
  return `winner: null` with `reasoning` explaining why.

## OUTPUT
```jsonc
{ "winner": "agent-a" | "agent-b" | null, "reasoning": "..." }
```
