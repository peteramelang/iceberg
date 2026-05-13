# Stage 5 — Connections

## ROLE
Map typed relationships across the full finalized taxonomy.

## INPUT
The full `_taxonomy.json` plus, for each topic, the `summary` and `definition`
strings from its frontmatter.

## TASK
Produce typed edges between topics:
- `prerequisite`: A must be understood before B
- `related`: A and B are conceptually adjacent
- `often-confused-with`: People mix up A and B (e.g., AuthN vs AuthZ)
- `pairs-with`: A and B are commonly used together

Assign a `weight` 0-1 reflecting how strong the relationship is.

## CONSTRAINTS
- Output MUST validate against `pipeline/schemas/connections.schema.json`.
- A `prerequisite` edge from A→B implies B requires A. Be conservative —
  no chains where everything depends on everything.
- Reasonable target: 60-120 edges total for ~35 topics.

## OUTPUT
A complete `_connections.json` document.
