# @iceberg/pipeline

Autonomous content generation pipeline for iceberg.

## Files
- `runbook.md` — finite-state-machine spec Claude executes
- `prompts/` — sub-agent prompt templates (one per stage)
- `schemas/` — JSON Schemas for all on-disk artifacts
- `lib/` — TS helpers: ledger, content, validate, commit
- `scripts/build-content.ts` — bundles content/ into app JSON

## Running

Open this repo in Claude Code and say "continue the iceberg pipeline."

Smoke mode (2-topic test run):
```
ICEBERG_MODE=smoke
```

## Tests

```bash
npm run test --workspace=pipeline
```
