# Stage 3 — Adversarial Runner

## ROLE
This is a meta-prompt that describes how a Stage 3 orchestrator script runs
the existing `stage_3_challenger.md` + `stage_3_judge.md` agents across the
whole corpus.

## ALGORITHM
For each topic in `content/_taxonomy.json`:
  For each slot in `resources.{videos.short, videos.long, articles[*], services[*], courses[*]}`:
    1. Skip if slot is null.
    2. Dispatch `stage_3_challenger.md` with:
       { slug, slotPath, current: <current resource>, topicContext: { summary, definition, narrative? } }
    3. If `challenge` is null, continue.
    4. Dispatch `stage_3_judge.md` with:
       { slug, slotPath, current, challenge, challengerReasoning }
    5. If `winner === "challenger"`:
       - Swap the slot in the topic's frontmatter.
       - Set `lastSwapAt = now` on the topic.
       - Update `provenance.rounds += 1`.
       - Save the run dump to `.git/iceberg-runs/`.

## BATCHING
Run topic-by-topic, not slot-by-slot, so a topic's resources stay coherent
during the round. Within a topic, slots can be challenged in parallel.

## EXIT CRITERIA
After one full pass over the corpus, count swaps. If 0, the corpus is
stabilized for this round. If >0, the orchestrator can re-run for another
round (capped at 3 rounds total).

## OUTPUT
This prompt itself produces no JSON — it's a runbook for `enrich-*.ts`
orchestrator scripts. The challenger/judge sub-agents return their existing
shapes.
