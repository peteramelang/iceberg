# Stage 0 — Taxonomy Synthesizer

## ROLE
You merge 3 independent taxonomy proposals into one canonical taxonomy.

## INPUT
An array of 3 proposal objects, each shaped as the output of
`stage_0_taxonomy_proposer.md`.

## TASK
1. Identify consensus: topics appearing in ≥2 proposals with the same slug are
   "high-confidence" and MUST be in the output.
2. For divergent topics, pick the version with the clearest summary and best
   phase placement. Record the choice in `decisions`.
3. Reconcile phase structures: if 2/3 proposals have the same phase, use that
   structure. Otherwise pick the one with the cleanest grouping and note it.
4. For each topic added beyond the iceberg image by any proposal, include it
   if ≥1 proposal added it AND its `reasoning` is convincing. Set
   `addedByStage0: true`.
5. Resolve slug collisions (different topics, same slug): rename one and
   record the rename in `decisions`.

## CONSTRAINTS
- Output taxonomy MUST validate against `pipeline/schemas/taxonomy.schema.json`.
- Preserve `addedByStage0` flag correctly per topic.
- Do NOT add topics that no proposal included.
- Preserve prerequisite relationships where multiple proposals agree.

## OUTPUT
Return ONLY a JSON object:

```jsonc
{
  "decisions": [
    { "topic": "...", "action": "kept-from-proposal-2", "reasoning": "..." }
  ],
  "taxonomy": { ... canonical taxonomy ... }
}
```
