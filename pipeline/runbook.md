# Iceberg Pipeline Runbook

This file is the finite-state-machine specification for the autonomous content
pipeline. It is executed by Claude in a terminal Claude Code session. Re-entering
the runbook is always safe.

## If you are resuming an interrupted run — DO THESE FIRST

1. Run `cat content/_ledger.json` (or `content/_ledger.smoke.json` for smoke
   mode). This is the truth.
2. Run `git log --oneline -20`. The last commit is the last good state.
3. Determine `mode` from the ledger (`full` or `smoke`).
4. Call `findNextAction()` from `pipeline/lib/ledger.ts` to get the next
   work item. If an entry is `in_progress`, treat as crashed mid-stage —
   re-dispatch the sub-agent(s). If `failed`, read the per-run dump in
   `.git/iceberg-runs/` to diagnose; do NOT blindly retry.
5. Resume from the next action.

## Starting a fresh run

For smoke mode:
- Set `ICEBERG_MODE=smoke`.
- Output dir: `content-smoke/`. Ledger: `content/_ledger.smoke.json`.
- Skip Stage 0 entirely: load taxonomy directly from `pipeline/smoke-taxonomy.json`.
- Mark `stage_0_taxonomy` as `completed` with `userApprovedAt = now`.
- Proceed to Stage 0e (scaffold).

For full mode:
- Output dir: `content/`. Ledger: `content/_ledger.json`.
- Run Stage 0a → 0b → 0c → 0d (user gate) → 0e.

## Stage 0 — Curation & Outline

### 0a. Taxonomy discovery
Dispatch 3 sub-agents in parallel using `pipeline/prompts/stage_0_taxonomy_proposer.md`.
Save each agent's full response to `.git/iceberg-runs/<ts>-stage0a-<agentId>.json`.

### 0b. Synthesis
Dispatch 1 sub-agent with `pipeline/prompts/stage_0_taxonomy_synthesizer.md`,
passing the 3 proposals as input. Validate the result's `taxonomy` against
the schema. Save to disk pending user approval.

### 0c. Phase assignment & prerequisites
The synthesizer's output already includes phase assignments and prerequisites.
Validate that every topic's phase exists, every prerequisite references an
existing topic, and prerequisites form a DAG (no cycles).

### 0d. Human gate
Write the candidate taxonomy to `content/_taxonomy.candidate.json` and STOP.
Print to the user: "Stage 0 candidate taxonomy ready at
`content/_taxonomy.candidate.json`. Review and run `mv` to accept, or edit
in place, then say 'continue'." Mark `stage_0_taxonomy` as `in_progress`
with no `userApprovedAt`.

On resume, if `content/_taxonomy.json` exists and validates, treat as approved:
copy `userApprovedAt = now`, mark stage `completed`, commit
`"stage 0: taxonomy approved"`.

### 0e. Scaffold content/
For every topic in the taxonomy, call `scaffoldTopicStub` to create
`content/<phase-slug>/<topic-slug>.md`. Initialize the topic's ledger entry.
Commit: `"stage 0: scaffold N topic stubs"`.

## Stage 1 — Research

For each topic with `stages.research.status != "completed"`:
- Dispatch 2 sub-agents in parallel using `stage_1_researcher.md`.
- Process topics in batches of 5 (so 5 topics × 2 agents = 10 concurrent calls
  per batch — adjust down if the harness chokes).
- Save each agent's response to `.git/iceberg-runs/`.
- Set `stages.research.status = "in_progress"` before dispatching.
- After both agents return, write a SEPARATE candidate file per agent:
  `.git/iceberg-runs/<ts>-research-<slug>-a.json` and `-b.json`.
- Mark `stages.research.status = "completed"`. Commit:
  `"research: <slug> round 1 complete"`.

## Stage 2 — Self-consistency

For each topic with `research` completed but `consistency` pending:
- For each slot in `resources.videos.short`, `videos.long`, each `articles[i]`,
  `services[i]`, `courses[i]`:
  - If both agents picked the same URL → consensus, accept that pick.
  - If they differ → dispatch `stage_2_tiebreaker.md` with both candidates.
- For the `definition` field: prefer the longer of the two unless one is
  obviously low-quality (incoherent, off-topic). If unclear, run a tiebreaker.
- Write the consensus frontmatter into the topic's `.md` file. Commit:
  `"consistency: <slug> round N complete"`.

## Stage 3 — Adversarial

For each topic with `consistency` completed but `adversarial` pending in
current round:
- For each slot: dispatch `stage_3_challenger.md`. If `challenge != null`,
  dispatch `stage_3_judge.md`. If judge picks `challenger`, swap the slot
  and set `lastSwapAt`.
- After all slots judged, commit: `"adversarial: <slug> round N complete"`.

## Stage 4 — Liveness

Batch all URLs across all topics. Dispatch `stage_4_liveness.md` in batches
of 20 URLs per agent call. For any `dead`/`changed` result:
- Increment `retryCounts[slot]` in the ledger.
- If `retryCounts[slot] >= 3`: mark slot's value as `null` in frontmatter,
  set `needsManualPick = true` on the topic.
- Otherwise: reset that slot's `stages.research.status = "pending"` for next
  round.

Commit per topic affected: `"liveness: <slug> round N"`.

## Stage 5 — Connections

Once every topic has `liveness.status = "completed"`:
- Dispatch `stage_5_connections.md` with the full taxonomy + per-topic
  summaries + definitions.
- Write `content/_connections.json`. Commit: `"connections: round N"`.

## Stage 6 — Stabilization

After Stage 5 completes:
- Count how many topics had `lastSwapAt` updated since the start of this round.
- If zero swaps AND `liveness` had no retries: mark every topic
  `stages.stabilized = true`. Pipeline complete.
- Otherwise: increment `currentRound`, reset `adversarial` and `liveness` status
  for all topics to `pending`, loop back to Stage 3.
- Cap: 5 rounds total. If round 5 still has swaps, commit and halt with a
  message.

## Halting

When `findNextAction()` returns `null`:
- Print a summary: total topics, total resources, total connections, rounds run.
- Final commit: `"pipeline: full run complete"`.
- Exit.

## Per-run dumps

Every sub-agent response is saved verbatim to
`.git/iceberg-runs/<ISO-timestamp>-<stage>-<topic-or-slot>-<agentId>.json`
BEFORE the parent inspects it. This is outside the working tree (not committed)
but persistent for forensic re-inspection.
