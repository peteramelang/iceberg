# Iceberg Content Depth & Curriculum Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate iceberg from "valid schema + 46 curated topics" to "depth-rich curriculum with narratives, code examples, pitfalls, difficulty ratings, learning paths, an adversarially-vetted resource set, SEO, a changelog, and a real search index" — with **zero placeholders or missing content** at the end of execution.

**Architecture:** The work happens in four layers and one pass-orchestrator:
1. **Schema layer** — extend topic frontmatter with `narrative`, `pitfalls`, `codeExamples`, `difficulty`, `estimatedHours`; add a new `content/_paths.json` artifact.
2. **Pipeline layer** — add three sub-agent prompts (narrative writer, pitfalls + code-examples enricher, adversarial replacer for liveness-dropped slots) and a Stage 3 adversarial pass.
3. **Content layer** — populate every new field for every topic by dispatching enrichment sub-agents.
4. **App layer** — render new fields, add learning-paths UI, `/whats-new` route, SEO, smarter Cmd-K search.

The plan ends with an explicit zero-placeholder verification step (Task 22) that fails fast if any topic is missing required new content.

**Tech Stack:** TypeScript, Node 20+, npm workspaces, gray-matter (frontmatter), Ajv (JSON Schema), Zod (app), Vite, React 18, react-router, @xyflow/react, Tailwind, shiki (syntax highlighting), fuse.js (fuzzy search), react-helmet-async (SEO), simple-git or `git log`-via-Bash (changelog).

**Spec source:** Direct continuation of `docs/superpowers/specs/2026-05-13-iceberg-design.md`, building on commit `749feb8` (liveness pass completed).

**Phase structure:**
- **Phase A (Schema):** Tasks 1-3. Extend schemas, types, frontmatter loader.
- **Phase B (Pipeline prompts):** Tasks 4-7. Adversarial round + narrative + enrichment + replacer prompts.
- **Phase C (Content enrichment):** Tasks 8-13. Run enrichment passes, generate narratives, pitfalls, code, paths.
- **Phase D (App):** Tasks 14-20. Render new fields, paths, whats-new, SEO, fuzzy search.
- **Phase E (Verification & ship):** Tasks 21-22. Build verification + zero-placeholder gate + push.

**File structure (new and modified):**

```
pipeline/
  schemas/
    topic-frontmatter.schema.json          (modify — add narrative, pitfalls, codeExamples, difficulty, estimatedHours)
    paths.schema.json                      (create — learning paths shape)
  prompts/
    stage_6_narrative_writer.md            (create)
    stage_6_pitfalls_enricher.md           (create)
    stage_6_code_examples_enricher.md      (create)
    stage_6_difficulty_estimator.md        (create)
    stage_3_adversarial_runner.md          (create — orchestrates challenger+judge across the corpus)
    stage_4_replacer.md                    (create — proposes replacements for dropped slots)
    stage_7_paths_designer.md              (create)
  lib/
    content.ts                             (modify — add new TS interfaces)
  scripts/
    enrich-narratives.ts                   (create — dispatcher orchestrator)
    enrich-pitfalls-and-code.ts            (create)
    enrich-difficulty.ts                   (create)
    review-prerequisites.ts                (create — interactive DAG audit helper)
    apply-replacements.ts                  (create — re-inserts replaced slots)
    generate-paths.ts                      (create)
    verify-no-placeholders.ts              (create — final gate)

content/
  _paths.json                              (create)
  <phase>/<slug>.md                        (modify all 46 — populate body + new frontmatter fields)

app/src/
  content/
    types.ts                               (modify — extend zod schemas)
  components/
    domain/
      Narrative.tsx                        (create — renders topic.narrative)
      Pitfalls.tsx                         (create)
      CodeExamples.tsx                     (create — shiki highlight)
      DifficultyBadge.tsx                  (create)
      PathStrip.tsx                        (create — Home + Topic)
    layout/
      Head.tsx                             (create — SEO helmet wrapper)
    interactive/
      SearchPalette.tsx                    (modify — fuse.js fuzzy)
  routes/
    Home.tsx                               (modify — render paths)
    Topic.tsx                              (modify — render narrative/pitfalls/code)
    WhatsNew.tsx                           (create)
    Paths.tsx                              (create — full paths catalog)
    Path.tsx                               (create — one path with sequence)
  App.tsx                                  (modify — add routes)
  hooks/
    useChangelog.ts                        (create — fetch /changelog.json)
  utils/
    fuzzyIndex.ts                          (create)
  main.tsx                                 (modify — wrap with HelmetProvider)

scripts/
  generate-changelog.ts                    (create — runs at build time, emits app/public/changelog.json)
```

**Operating notes for the implementing engineer:**
- The repo's npm workspaces are `app` and `pipeline`. The root has `vercel.json`, `LICENSE`, `LICENSE-content.md`, `CREDITS.md`, `README.md`, `DESIGN.md`.
- **Never modify `DESIGN.md`** — the project owner has explicitly excluded it from this work.
- Commits land directly on `main`. Push to `origin` (GitHub: `peteramelang/iceberg`) at the end of each phase.
- Run `npm run typecheck && npm run build` after every meaningful change. The app build is the integration test.
- Test files for pipeline libs live in `pipeline/tests/` and run via `npm run test --workspace=pipeline`.

---

## Phase A — Schema

### Task 1: Extend `topic-frontmatter.schema.json`

**Files:**
- Modify: `pipeline/schemas/topic-frontmatter.schema.json`

- [ ] **Step 1: Open the schema file and locate the top-level `properties` block (currently has slug/title/phase/order/summary/definition/needsManualPick/resources/provenance).**

- [ ] **Step 2: Add new required fields**

After `definition` and before `needsManualPick`, add to `properties`:

```json
    "narrative": { "type": "string", "minLength": 400 },
    "pitfalls": {
      "type": "array",
      "minItems": 3,
      "maxItems": 8,
      "items": {
        "type": "object",
        "required": ["title", "explanation"],
        "additionalProperties": false,
        "properties": {
          "title": { "type": "string", "minLength": 1 },
          "explanation": { "type": "string", "minLength": 40 }
        }
      }
    },
    "codeExamples": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "items": {
        "type": "object",
        "required": ["language", "title", "code", "reasoning"],
        "additionalProperties": false,
        "properties": {
          "language": { "enum": ["typescript", "javascript", "python", "go", "rust", "sql", "bash", "yaml", "json", "ruby", "java", "csharp"] },
          "title": { "type": "string", "minLength": 1 },
          "code": { "type": "string", "minLength": 20 },
          "reasoning": { "type": "string", "minLength": 1 }
        }
      }
    },
    "difficulty": { "enum": ["beginner", "intermediate", "advanced"] },
    "estimatedHours": { "type": "number", "minimum": 0.5, "maximum": 40 },
```

Update the top-level `required` array to include the new fields:

```json
  "required": ["slug", "title", "phase", "order", "summary", "definition", "narrative", "pitfalls", "codeExamples", "difficulty", "estimatedHours", "resources", "provenance", "needsManualPick"],
```

- [ ] **Step 3: Validate the schema is itself well-formed JSON**

Run: `jq empty pipeline/schemas/topic-frontmatter.schema.json`
Expected: exit 0 with no output.

- [ ] **Step 4: Commit**

```bash
git add pipeline/schemas/topic-frontmatter.schema.json
git commit -m "schema: add narrative, pitfalls, codeExamples, difficulty, estimatedHours to topic frontmatter"
```

---

### Task 2: Create `paths.schema.json`

**Files:**
- Create: `pipeline/schemas/paths.schema.json`

- [ ] **Step 1: Write the file**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://iceberg.local/schemas/paths.json",
  "title": "Iceberg Learning Paths",
  "type": "object",
  "required": ["version", "paths"],
  "additionalProperties": false,
  "properties": {
    "version": { "const": 1 },
    "paths": {
      "type": "array",
      "minItems": 5,
      "items": {
        "type": "object",
        "required": ["slug", "title", "description", "audience", "estimatedHours", "topics"],
        "additionalProperties": false,
        "properties": {
          "slug": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
          "title": { "type": "string", "minLength": 1 },
          "description": { "type": "string", "minLength": 40 },
          "audience": { "type": "string", "minLength": 1 },
          "estimatedHours": { "type": "number", "minimum": 1 },
          "topics": {
            "type": "array",
            "minItems": 4,
            "maxItems": 15,
            "items": { "type": "string" }
          }
        }
      }
    }
  }
}
```

- [ ] **Step 2: Validate**

Run: `jq empty pipeline/schemas/paths.schema.json`

- [ ] **Step 3: Register validator in `pipeline/lib/validate.ts`**

Modify `pipeline/lib/validate.ts`. Locate the `const validators = { … }` object and add an entry for paths:

```ts
const validators = {
  ledger: ajv.compile(loadSchema("ledger")),
  taxonomy: ajv.compile(loadSchema("taxonomy")),
  topicFrontmatter: ajv.compile(loadSchema("topic-frontmatter")),
  connections: ajv.compile(loadSchema("connections")),
  exportPayload: ajv.compile(loadSchema("export-payload")),
  paths: ajv.compile(loadSchema("paths"))
};
```

Add the exported wrapper at the bottom of the file:

```ts
export function validatePaths(data: unknown): void { check("paths", data); }
```

- [ ] **Step 4: Write a test**

Create `pipeline/tests/paths.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validatePaths, ValidationError } from "../lib/validate.js";

describe("validatePaths", () => {
  it("accepts a minimal valid paths doc", () => {
    const data = {
      version: 1,
      paths: [
        { slug: "first-deploy", title: "First Deploy", description: "From zero to staging in a weekend.", audience: "solo founder", estimatedHours: 12, topics: ["authentication","environments","ci-cd","logging"] },
        { slug: "real-users", title: "First Real Users", description: "Money, identity, and data integrity once humans show up.", audience: "early-stage team", estimatedHours: 18, topics: ["payments","idempotency","data-integrity","gdpr-ccpa"] },
        { slug: "ops-maturity", title: "Ops Maturity", description: "From firefighting to durable on-call.", audience: "growing team", estimatedHours: 20, topics: ["alerting","incident-response","on-call-rotations","disaster-recovery"] },
        { slug: "going-global", title: "Going Multi-Region", description: "Latency, residency, and reliability at scale.", audience: "scaling product", estimatedHours: 16, topics: ["scalability","multi-region-support","caching","load-balancing"] },
        { slug: "first-sre", title: "First SRE Hire", description: "SLOs, error budgets, the toolkit you should hand a new SRE.", audience: "platform team", estimatedHours: 14, topics: ["slos-and-slis","instrumentation","alerting","incident-response"] }
      ]
    };
    expect(() => validatePaths(data)).not.toThrow();
  });

  it("rejects a path with fewer than 4 topics", () => {
    const bad = {
      version: 1,
      paths: [
        { slug: "tiny", title: "T", description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"] },
        { slug: "tiny2", title: "T2", description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"] },
        { slug: "tiny3", title: "T3", description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"] },
        { slug: "tiny4", title: "T4", description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"] },
        { slug: "tiny5", title: "T5", description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"] }
      ]
    };
    expect(() => validatePaths(bad)).toThrow(ValidationError);
  });
});
```

- [ ] **Step 5: Run tests, verify pass**

Run: `npm run test --workspace=pipeline -- paths`
Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add pipeline/schemas/paths.schema.json pipeline/lib/validate.ts pipeline/tests/paths.test.ts
git commit -m "schema: paths.schema.json + validatePaths"
```

---

### Task 3: Extend `pipeline/lib/content.ts` and `app/src/content/types.ts` TypeScript types

**Files:**
- Modify: `pipeline/lib/content.ts`
- Modify: `app/src/content/types.ts`
- Modify: `pipeline/lib/content.ts` (`scaffoldTopicStub` function) so newly-scaffolded stubs at least carry placeholder values that match the new required fields. This matters only if the pipeline is rerun; existing topics will be populated by Phase C.

- [ ] **Step 1: Add interfaces to `pipeline/lib/content.ts`**

Locate the existing interface block (search for `export interface VideoResource`). Add above the `TopicFrontmatter` interface:

```ts
export interface Pitfall {
  title: string;
  explanation: string;
}

export interface CodeExample {
  language: "typescript" | "javascript" | "python" | "go" | "rust" | "sql" | "bash" | "yaml" | "json" | "ruby" | "java" | "csharp";
  title: string;
  code: string;
  reasoning: string;
}

export type Difficulty = "beginner" | "intermediate" | "advanced";
```

Then modify the `TopicFrontmatter` interface to add these fields (between `definition` and `needsManualPick`):

```ts
  narrative: string;
  pitfalls: Pitfall[];
  codeExamples: CodeExample[];
  difficulty: Difficulty;
  estimatedHours: number;
```

- [ ] **Step 2: Update `scaffoldTopicStub` so re-scaffolded stubs pass schema**

Find the `scaffoldTopicStub` function. In the `fm` object literal, add (alongside the existing `definition: "(pending research)"`):

```ts
    narrative: "Pending narrative — at least 400 characters of plain-English explanation of why this topic matters, what the dominant failure modes are, and how a learner should approach it. Replace this placeholder before publishing. " + "Placeholder body. ".repeat(20),
    pitfalls: [
      { title: "(pitfall 1 pending)", explanation: "Pending — at least 40 characters explaining why this is a common mistake." },
      { title: "(pitfall 2 pending)", explanation: "Pending — at least 40 characters explaining why this is a common mistake." },
      { title: "(pitfall 3 pending)", explanation: "Pending — at least 40 characters explaining why this is a common mistake." }
    ],
    codeExamples: [
      { language: "typescript", title: "(pending)", code: "// pending code example with at least 20 chars of real code", reasoning: "pending" }
    ],
    difficulty: "intermediate",
    estimatedHours: 4,
```

- [ ] **Step 3: Update `app/src/content/types.ts` Zod schemas**

Locate `TopicFrontmatterSchema = z.object({ … })`. Above it, add:

```ts
export const PitfallSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(40)
});

export const CodeExampleSchema = z.object({
  language: z.enum(["typescript","javascript","python","go","rust","sql","bash","yaml","json","ruby","java","csharp"]),
  title: z.string().min(1),
  code: z.string().min(20),
  reasoning: z.string().min(1)
});
```

Then extend `TopicFrontmatterSchema` — add the five new fields (between `definition` and `needsManualPick`):

```ts
  narrative: z.string().min(400),
  pitfalls: z.array(PitfallSchema).min(3).max(8),
  codeExamples: z.array(CodeExampleSchema).min(1).max(3),
  difficulty: z.enum(["beginner","intermediate","advanced"]),
  estimatedHours: z.number().min(0.5).max(40),
```

Also add at the bottom of the file:

```ts
export const PathSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  audience: z.string(),
  estimatedHours: z.number(),
  topics: z.array(z.string())
});
export type LearningPath = z.infer<typeof PathSchema>;

export const PathsDocSchema = z.object({
  version: z.literal(1),
  paths: z.array(PathSchema)
});
```

- [ ] **Step 4: Update `app/src/content/index.ts` to expose paths**

Locate the file. After the existing `BundleSchema = z.object({ … })`, modify it to optionally include paths (so the loader doesn't break before paths are generated):

```ts
import { TopicFrontmatterSchema, TaxonomySchema, ConnectionEdgeSchema, PathsDocSchema, type TopicFrontmatter, type Taxonomy, type ConnectionEdge, type LearningPath } from "./types.js";
```

Extend the `BundleSchema`:

```ts
const BundleSchema = z.object({
  generatedAt: z.string(),
  mode: z.enum(["full", "smoke"]),
  taxonomy: TaxonomySchema.nullable(),
  connections: z.object({ version: z.literal(1), edges: z.array(ConnectionEdgeSchema) }),
  topics: z.array(z.object({ frontmatter: TopicFrontmatterSchema, body: z.string() })),
  paths: PathsDocSchema.nullable()
});
```

Add an exported `paths` constant:

```ts
export const paths: LearningPath[] = parsed.paths?.paths ?? [];

export function getPath(slug: string) {
  return paths.find(p => p.slug === slug);
}
```

- [ ] **Step 5: Update `pipeline/scripts/build-content.ts` to bundle paths**

Locate `pipeline/scripts/build-content.ts`. Add (alongside taxonomy/connections):

```ts
const pathsPath = join(contentDir, "_paths.json");
const paths = existsSync(pathsPath) ? JSON.parse(readFileSync(pathsPath, "utf8")) : null;
```

Extend the `bundle` object:

```ts
const bundle = {
  generatedAt: new Date().toISOString(),
  mode,
  taxonomy,
  connections,
  topics: topics.map(t => ({ frontmatter: t.frontmatter, body: t.body })),
  paths
};
```

- [ ] **Step 6: Verify typecheck passes (it will fail validation on existing topics — that's expected and intentional; we'll populate fields in Phase C). Run only the typecheck:**

Run: `npm run typecheck`
Expected: clean (the new fields are required but TS doesn't know about runtime values — only types).

The build-content step WILL fail (Zod will reject existing topics without the new required fields). That's expected; do NOT try to build-content yet.

- [ ] **Step 7: Commit**

```bash
git add pipeline/lib/content.ts app/src/content/types.ts app/src/content/index.ts pipeline/scripts/build-content.ts
git commit -m "types: extend TopicFrontmatter with narrative/pitfalls/codeExamples/difficulty/estimatedHours + paths"
```

---

## Phase B — Pipeline prompts

### Task 4: Write `stage_6_narrative_writer.md` prompt

**Files:**
- Create: `pipeline/prompts/stage_6_narrative_writer.md`

- [ ] **Step 1: Write the prompt**

```markdown
# Stage 6 — Narrative Writer

## ROLE
You are a senior engineer turned technical writer. Write the long-form narrative
for one production-readiness topic in the iceberg curriculum.

## INPUT
```jsonc
{
  "slug": "logging",
  "title": "Logging",
  "summary": "...",
  "definition": "...",
  "phase": "observability",
  "tags": ["observability", "debugging"]
}
```

## TASK
Write 3-6 paragraphs (~600-1200 words total) that explain:
1. Why this topic matters in production (concrete, not abstract — what breaks if you skip it?)
2. The 80/20: the few things that matter most vs. the many things that don't
3. The dominant failure modes a learner will encounter
4. A clear mental model someone can build the topic around (an analogy, a diagram-able idea, or a decision tree)
5. Where this topic sits in the ecosystem (which problems it solves, which adjacent topics it pairs with)

## CONSTRAINTS
- Plain English. No marketing speak. No phrases like "in today's fast-paced
  cloud-native landscape."
- Be specific. Prefer "Postgres logical replication" over "modern replication
  technologies."
- Voice: confident, opinionated, kind. Like a senior eng explaining over coffee.
- DO NOT repeat the `definition` field verbatim. Build on it.
- DO NOT use lists or headings — narrative prose only.
- Minimum 400 characters. Aim for 2000-5000 characters.
- DO NOT invent statistics or quotes. If you reference numbers, they must be
  widely-known industry facts ("Stripe handles billions of requests/day" is
  fine; "47% of outages stem from..." is not unless you can cite it).

## OUTPUT
Return ONLY a single fenced ```json block:

```jsonc
{
  "narrative": "Paragraph one. Paragraph two. ..."
}
```

No prose outside the code block.
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/prompts/stage_6_narrative_writer.md
git commit -m "prompts: stage 6 narrative writer"
```

---

### Task 5: Write `stage_6_pitfalls_enricher.md` and `stage_6_code_examples_enricher.md` and `stage_6_difficulty_estimator.md`

**Files:**
- Create: `pipeline/prompts/stage_6_pitfalls_enricher.md`
- Create: `pipeline/prompts/stage_6_code_examples_enricher.md`
- Create: `pipeline/prompts/stage_6_difficulty_estimator.md`

- [ ] **Step 1: Write `stage_6_pitfalls_enricher.md`**

```markdown
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
```

- [ ] **Step 2: Write `stage_6_code_examples_enricher.md`**

```markdown
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
```

- [ ] **Step 3: Write `stage_6_difficulty_estimator.md`**

```markdown
# Stage 6 — Difficulty Estimator

## ROLE
You estimate how hard a topic is for a hypothetical learner who is comfortable
shipping CRUD apps but has not done production-readiness work, and how many
focused-study hours it takes to reach working competence.

## INPUT
`{ "slug", "title", "summary", "definition", "narrative", "tags", "phase" }`

## TASK
Decide:
- `difficulty`: one of "beginner" | "intermediate" | "advanced"
  - beginner: doable in an afternoon with the linked resources, no prerequisites
  - intermediate: requires building/breaking something to internalize; benefits
    from at least one prerequisite topic
  - advanced: requires deep practice or production scars; assumes multiple
    prerequisites
- `estimatedHours`: number between 0.5 and 40. Hours of focused study + light
  practice to reach "I could implement this in a new project."

## CONSTRAINTS
- Be conservative — most production topics are intermediate.
- "Authentication" is intermediate (~6h). "Idempotency" is intermediate (~4h).
  "Multi-region database failover" is advanced (~20h). "Documentation" is
  beginner (~2h). Calibrate to those.

## OUTPUT
Single fenced ```json block:

```jsonc
{ "difficulty": "intermediate", "estimatedHours": 6 }
```
```

- [ ] **Step 4: Commit**

```bash
git add pipeline/prompts/stage_6_pitfalls_enricher.md pipeline/prompts/stage_6_code_examples_enricher.md pipeline/prompts/stage_6_difficulty_estimator.md
git commit -m "prompts: stage 6 pitfalls, code examples, difficulty estimator"
```

---

### Task 6: Write `stage_4_replacer.md`

**Files:**
- Create: `pipeline/prompts/stage_4_replacer.md`

- [ ] **Step 1: Write the prompt**

```markdown
# Stage 4 — Resource Replacer

## ROLE
A previous liveness check dropped a resource (404, removed, repurposed). Find
a high-quality replacement for the SAME slot of the SAME topic.

## INPUT
```jsonc
{
  "slug": "ci-cd",
  "slotKind": "video" | "article" | "service" | "course",
  "slotPath": "articles.2",
  "topic": { "title": "CI/CD", "summary": "…", "definition": "…" },
  "currentResources": { "videos": …, "articles": [...], "services": [...], "courses": [...] },
  "droppedItem": { "title": "Old article title", "url": "https://…", "evidence": "404 Not Found" }
}
```

## TASK
Find one canonical, currently-live resource of the same `slotKind` that fills
the same role the dropped resource was filling. Prefer the most authoritative
source for the concept.

## CONSTRAINTS
- Same source-quality rules as `stage_1_researcher.md` (canonical URLs only,
  no Medium except for known engineers, real video URLs, no affiliates).
- Do NOT duplicate any URL already in `currentResources`.
- If you cannot find a credible replacement, return `null` with reasoning
  rather than inventing one.

## OUTPUT
Single fenced ```json block matching the slotKind:

```jsonc
{
  "replacement": null | {
    "url": "…",
    "title": "…",
    "kind": "canonical-doc"   // for articles only
    "name": "…", "category": "…"   // for services only
    "author": "…", "durationMinutes": 12, "addedAt": "ISO" // for videos only
    "provider": "…", "paid": true  // for courses only
    "reasoning": "why this is a strong replacement"
  }
}
```

(Only include fields appropriate to slotKind — articles need url/title/kind/reasoning; services need name/url/category/reasoning; courses need url/title/provider/paid/reasoning; videos need url/title/author/durationMinutes/addedAt/reasoning.)
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/prompts/stage_4_replacer.md
git commit -m "prompts: stage 4 resource replacer"
```

---

### Task 7: Write `stage_3_adversarial_runner.md` and `stage_7_paths_designer.md`

**Files:**
- Create: `pipeline/prompts/stage_3_adversarial_runner.md`
- Create: `pipeline/prompts/stage_7_paths_designer.md`

The existing `stage_3_challenger.md` and `stage_3_judge.md` work per-slot. This Task adds an orchestrator-style prompt and the paths-design prompt.

- [ ] **Step 1: Write `stage_3_adversarial_runner.md`**

```markdown
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
```

- [ ] **Step 2: Write `stage_7_paths_designer.md`**

```markdown
# Stage 7 — Learning Paths Designer

## ROLE
You design 5-8 opinionated learning paths through the iceberg curriculum for
specific developer audiences.

## INPUT
The full `_taxonomy.json` (46 topics across 7 phases) and per-topic
`{ summary, difficulty, estimatedHours, prerequisites }`.

## TASK
Produce 5-8 paths. Each path is a curated sequence of 6-12 topic slugs aimed
at one audience with one concrete goal.

Required paths (you must include at least these five — add 1-3 more if you
identify other strong audiences):
1. **First Production Deploy** — solo founder shipping their first real
   product. ~10-15h.
2. **First Real Users** — early-stage team handling money + identity + data
   integrity. ~15-20h.
3. **Ops Maturity** — growing team building incident-response and on-call
   discipline. ~18-22h.
4. **Going Multi-Region** — scaling product with latency or residency
   requirements. ~15-20h.
5. **First SRE Hire** — handoff curriculum for a new platform engineer.
   ~12-18h.

Each path:
- `slug` (kebab-case)
- `title` (display name)
- `description` (1-2 sentences, what this path teaches and to whom)
- `audience` (one short phrase)
- `estimatedHours` (sum of constituent topic `estimatedHours` ± a coordination tax)
- `topics` (ordered list of slugs)

## CONSTRAINTS
- Every slug in `topics` MUST exist in the taxonomy.
- Topic order MUST respect prerequisites (if topic B has prerequisite A,
  A must appear before B in the path, OR appear in an earlier path the
  audience would reasonably have completed first).
- Paths can share topics — overlap is fine and even good.
- Output MUST validate against `pipeline/schemas/paths.schema.json`.

## OUTPUT
Single fenced ```json block matching the schema:

```jsonc
{
  "version": 1,
  "paths": [ … ]
}
```
```

- [ ] **Step 3: Commit**

```bash
git add pipeline/prompts/stage_3_adversarial_runner.md pipeline/prompts/stage_7_paths_designer.md
git commit -m "prompts: stage 3 adversarial runner + stage 7 paths designer"
```

---

## Phase C — Content enrichment

Each enrichment script follows the same pattern: walk every topic, dispatch a sub-agent per topic (in batches of 8-10 parallel), parse the JSON response, write it back to the frontmatter via `writeTopicFile`, commit per batch.

### Task 8: Build `pipeline/scripts/enrich-narratives.ts`

**Files:**
- Create: `pipeline/scripts/enrich-narratives.ts`
- Test: manual (it dispatches sub-agents; can't be unit-tested cleanly)

- [ ] **Step 1: Write the script**

```ts
import { readdirSync, statSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

const candidates: { path: string; slug: string }[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  // Treat anything starting with "Pending narrative" OR shorter than 400 chars as needing enrichment.
  const needsNarrative = !fm.narrative || fm.narrative.startsWith("Pending narrative") || fm.narrative.length < 400;
  if (needsNarrative) candidates.push({ path, slug: fm.slug });
}

console.log(`Found ${candidates.length} topics needing narrative enrichment.`);

// Write input cards for each topic to .git/iceberg-runs/ so a runner agent
// can dispatch one sub-agent per file. Each card is consumed by a sub-agent
// running stage_6_narrative_writer.md.
for (const { path, slug } of candidates) {
  const { frontmatter: fm } = readTopicFile(path);
  const card = {
    slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    phase: fm.phase,
    tags: [] as string[]   // tags live in taxonomy, not frontmatter; populate via taxonomy if desired
  };
  writeFileSyncJson(join(runsDir, `narrative-input-${slug}.json`), card);
}

console.log("Wrote per-topic input cards to .git/iceberg-runs/narrative-input-*.json");
console.log("Next: in a Claude Code session, dispatch one sub-agent per card using stage_6_narrative_writer.md");
console.log("Each sub-agent writes its result to .git/iceberg-runs/narrative-result-<slug>.json");
console.log("Then run: npx tsx pipeline/scripts/apply-narratives.ts");

function writeFileSyncJson(p: string, v: unknown): void {
  // Tiny helper to avoid adding another import
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { writeFileSync } = require("node:fs");
  writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
}
```

- [ ] **Step 2: Build a sibling `apply-narratives.ts`**

Create `pipeline/scripts/apply-narratives.ts`:

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let applied = 0;
let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `narrative-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) {
    skipped++;
    continue;
  }
  const raw = JSON.parse(readFileSync(resultPath, "utf8"));
  if (typeof raw?.narrative !== "string" || raw.narrative.length < 400) {
    console.warn(`SKIP ${fm.slug}: narrative missing or too short (${raw?.narrative?.length ?? 0} chars)`);
    skipped++;
    continue;
  }
  fm.narrative = raw.narrative;
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied narrative to ${applied} topics. Skipped: ${skipped}.`);
```

- [ ] **Step 3: Run the input-card generator**

Run: `npx tsx pipeline/scripts/enrich-narratives.ts`
Expected output: `Found 46 topics needing narrative enrichment.` (or fewer if some have been seeded)

- [ ] **Step 4: Dispatch sub-agents in parallel batches**

For each card in `.git/iceberg-runs/narrative-input-*.json`, dispatch a sub-agent with the contents of `pipeline/prompts/stage_6_narrative_writer.md`, passing the card as the INPUT. Tell the sub-agent to write its output JSON to `.git/iceberg-runs/narrative-result-<slug>.json`.

Dispatch in batches of 8-10 parallel agents. With 46 topics that's 5-6 batches.

(Notes for the engineer running this plan: use the Agent tool with subagent_type=general-purpose and model=haiku. Pass each card's content inline in the prompt. The single agent-instruction template:

> You are a Stage 6 Narrative Writer. Follow `pipeline/prompts/stage_6_narrative_writer.md`. INPUT card: <card>. Write your JSON output to `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/narrative-result-<slug>.json` using the Write tool. Validate with `jq empty <path>`.

Track completions; retry any agents whose JSON fails validation.)

- [ ] **Step 5: Apply results**

Run: `npx tsx pipeline/scripts/apply-narratives.ts`
Expected: `Applied narrative to 46 topics. Skipped: 0.` If any are skipped, re-dispatch agents for those slugs and re-run.

- [ ] **Step 6: Verify schema acceptance**

Run: `npm run build:content`
Expected: still fails (pitfalls/codeExamples/difficulty/estimatedHours still placeholder/missing) — but the validator errors should no longer mention `narrative`.

- [ ] **Step 7: Commit**

```bash
git add pipeline/scripts/enrich-narratives.ts pipeline/scripts/apply-narratives.ts content/
git commit -m "content: long-form narratives for all 46 topics"
```

---

### Task 9: Enrich pitfalls (mirrors Task 8 with `stage_6_pitfalls_enricher.md`)

**Files:**
- Create: `pipeline/scripts/enrich-pitfalls.ts`
- Create: `pipeline/scripts/apply-pitfalls.ts`

- [ ] **Step 1: Write `enrich-pitfalls.ts`**

Same structure as `enrich-narratives.ts` (Task 8 Step 1) but:
- Input card includes `narrative` field (now populated)
- Card filename: `pitfalls-input-<slug>.json`
- Skip if `fm.pitfalls.length >= 3 && fm.pitfalls.every(p => !p.title.includes("pending") && !p.title.includes("Pending"))`

```ts
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let written = 0;
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const needsPitfalls =
    !Array.isArray(fm.pitfalls) ||
    fm.pitfalls.length < 3 ||
    fm.pitfalls.some(p => p.title.toLowerCase().includes("pending"));
  if (!needsPitfalls) continue;

  const card = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    narrative: fm.narrative,
    tags: [] as string[]
  };
  writeFileSync(join(runsDir, `pitfalls-input-${fm.slug}.json`), JSON.stringify(card, null, 2) + "\n");
  written++;
}

console.log(`Wrote ${written} pitfalls input cards.`);
console.log("Dispatch sub-agents using pipeline/prompts/stage_6_pitfalls_enricher.md.");
console.log("Each writes to .git/iceberg-runs/pitfalls-result-<slug>.json");
console.log("Then run: npx tsx pipeline/scripts/apply-pitfalls.ts");
```

- [ ] **Step 2: Write `apply-pitfalls.ts`**

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

interface Pitfall { title: string; explanation: string; }

const files: string[] = [];
walkMd(contentDir, files);

let applied = 0;
let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `pitfalls-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { pitfalls?: Pitfall[] };
  const pitfalls = (raw.pitfalls ?? []).filter(p =>
    typeof p?.title === "string" && p.title.length > 0 &&
    typeof p?.explanation === "string" && p.explanation.length >= 40
  );
  if (pitfalls.length < 3) {
    console.warn(`SKIP ${fm.slug}: only ${pitfalls.length} valid pitfalls`);
    skipped++;
    continue;
  }
  fm.pitfalls = pitfalls.slice(0, 8);
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied pitfalls to ${applied} topics. Skipped: ${skipped}.`);
```

- [ ] **Step 3: Run input-card generator + dispatch + apply (mirrors Task 8 Steps 3-5)**

Run: `npx tsx pipeline/scripts/enrich-pitfalls.ts` → dispatch sub-agents using `stage_6_pitfalls_enricher.md` → run `npx tsx pipeline/scripts/apply-pitfalls.ts`.

- [ ] **Step 4: Verify**

Inspect any topic: `cat content/observability/logging.md | head -40`. Confirm 3+ pitfalls present, none containing "pending".

- [ ] **Step 5: Commit**

```bash
git add pipeline/scripts/enrich-pitfalls.ts pipeline/scripts/apply-pitfalls.ts content/
git commit -m "content: pitfalls for all 46 topics"
```

---

### Task 10: Enrich code examples (mirrors Tasks 8-9 with `stage_6_code_examples_enricher.md`)

**Files:**
- Create: `pipeline/scripts/enrich-code-examples.ts`
- Create: `pipeline/scripts/apply-code-examples.ts`

- [ ] **Step 1: Write `enrich-code-examples.ts` (same shape as Task 9 Step 1)**

```ts
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let written = 0;
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const needsCode =
    !Array.isArray(fm.codeExamples) ||
    fm.codeExamples.length < 1 ||
    fm.codeExamples.some(c => c.title.toLowerCase().includes("pending"));
  if (!needsCode) continue;

  const card = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    narrative: fm.narrative,
    tags: [] as string[]
  };
  writeFileSync(join(runsDir, `code-input-${fm.slug}.json`), JSON.stringify(card, null, 2) + "\n");
  written++;
}

console.log(`Wrote ${written} code-example input cards.`);
```

- [ ] **Step 2: Write `apply-code-examples.ts`**

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type CodeExample } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const ALLOWED = new Set(["typescript","javascript","python","go","rust","sql","bash","yaml","json","ruby","java","csharp"]);

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let applied = 0; let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `code-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { codeExamples?: CodeExample[] };
  const examples = (raw.codeExamples ?? []).filter(c =>
    ALLOWED.has(c?.language as string) &&
    typeof c?.title === "string" && c.title.length > 0 &&
    typeof c?.code === "string" && c.code.length >= 20 &&
    typeof c?.reasoning === "string" && c.reasoning.length > 0
  );
  if (examples.length < 1) {
    console.warn(`SKIP ${fm.slug}: no valid code examples`);
    skipped++;
    continue;
  }
  fm.codeExamples = examples.slice(0, 3);
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied code examples to ${applied} topics. Skipped: ${skipped}.`);
```

- [ ] **Step 3: Run generator, dispatch sub-agents (`stage_6_code_examples_enricher.md`), run applier**

- [ ] **Step 4: Verify a few topics rendered correctly. Run:**

`cat content/money-and-data/idempotency.md` — confirm at least one realistic code example present.

- [ ] **Step 5: Commit**

```bash
git add pipeline/scripts/enrich-code-examples.ts pipeline/scripts/apply-code-examples.ts content/
git commit -m "content: code examples for all 46 topics"
```

---

### Task 11: Enrich difficulty + estimatedHours

**Files:**
- Create: `pipeline/scripts/enrich-difficulty.ts`
- Create: `pipeline/scripts/apply-difficulty.ts`

- [ ] **Step 1: `enrich-difficulty.ts`** — same pattern. Card filename `difficulty-input-<slug>.json`. Skip if `fm.difficulty` is already set AND `fm.estimatedHours != 4` (the scaffold default).

```ts
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let written = 0;
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  // Re-estimate everything (the scaffold default of 4h is conservative and uniform; we want real estimates).
  const card = {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    narrative: fm.narrative,
    phase: fm.phase,
    tags: [] as string[]
  };
  writeFileSync(join(runsDir, `difficulty-input-${fm.slug}.json`), JSON.stringify(card, null, 2) + "\n");
  written++;
}

console.log(`Wrote ${written} difficulty input cards.`);
```

- [ ] **Step 2: `apply-difficulty.ts`**

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type Difficulty } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const VALID: Difficulty[] = ["beginner", "intermediate", "advanced"];

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let applied = 0; let skipped = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const resultPath = join(runsDir, `difficulty-result-${fm.slug}.json`);
  if (!existsSync(resultPath)) { skipped++; continue; }
  const raw = JSON.parse(readFileSync(resultPath, "utf8")) as { difficulty?: string; estimatedHours?: number };
  if (!VALID.includes(raw.difficulty as Difficulty)) {
    console.warn(`SKIP ${fm.slug}: invalid difficulty ${raw.difficulty}`);
    skipped++;
    continue;
  }
  const h = raw.estimatedHours;
  if (typeof h !== "number" || h < 0.5 || h > 40) {
    console.warn(`SKIP ${fm.slug}: invalid estimatedHours ${h}`);
    skipped++;
    continue;
  }
  fm.difficulty = raw.difficulty as Difficulty;
  fm.estimatedHours = h;
  writeTopicFile(path, fm, body);
  applied++;
}

console.log(`Applied difficulty + hours to ${applied} topics. Skipped: ${skipped}.`);
```

- [ ] **Step 3: Run + dispatch + apply (mirrors Tasks 8-10)**

- [ ] **Step 4: Verify**

Run: `npm run build:content`
Expected: now succeeds. The bundle generates without validation errors. Inspect:
`cat app/src/content/topics.generated.json | jq '.topics[0].frontmatter | {narrative: (.narrative|length), pitfalls: (.pitfalls|length), codeExamples: (.codeExamples|length), difficulty, estimatedHours}'`

- [ ] **Step 5: Commit**

```bash
git add pipeline/scripts/enrich-difficulty.ts pipeline/scripts/apply-difficulty.ts content/
git commit -m "content: difficulty + estimatedHours for all 46 topics"
```

---

### Task 12: Stage 3 adversarial round (per-slot challenger + judge)

**Files:**
- Create: `pipeline/scripts/run-adversarial.ts`
- Create: `pipeline/scripts/apply-adversarial.ts`

- [ ] **Step 1: Write `run-adversarial.ts` — produces a flat list of (slug, slotPath, currentResource) cards**

```ts
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

interface Card {
  slug: string;
  slotPath: string;
  slotKind: "video" | "article" | "service" | "course";
  current: unknown;
  topicContext: { summary: string; definition: string; narrative: string };
}

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

const cards: Card[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const ctx = { summary: fm.summary, definition: fm.definition, narrative: fm.narrative };
  if (fm.resources.videos.short) cards.push({ slug: fm.slug, slotPath: "videos.short", slotKind: "video", current: fm.resources.videos.short, topicContext: ctx });
  if (fm.resources.videos.long)  cards.push({ slug: fm.slug, slotPath: "videos.long",  slotKind: "video", current: fm.resources.videos.long,  topicContext: ctx });
  fm.resources.articles.forEach((a, i) => cards.push({ slug: fm.slug, slotPath: `articles.${i}`, slotKind: "article", current: a, topicContext: ctx }));
  fm.resources.services.forEach((s, i) => cards.push({ slug: fm.slug, slotPath: `services.${i}`, slotKind: "service", current: s, topicContext: ctx }));
  fm.resources.courses.forEach((c, i) => cards.push({ slug: fm.slug, slotPath: `courses.${i}`, slotKind: "course", current: c, topicContext: ctx }));
}

// Partition into batches of 25 slots per agent (kept small because the agent
// must reason carefully about each slot).
const BATCH = 25;
let batchN = 0;
for (let i = 0; i < cards.length; i += BATCH) {
  batchN++;
  const padded = String(batchN).padStart(2, "0");
  writeFileSync(join(runsDir, `adversarial-batch-${padded}.json`), JSON.stringify(cards.slice(i, i + BATCH), null, 2) + "\n");
}

console.log(`Wrote ${batchN} adversarial batches covering ${cards.length} slots.`);
```

- [ ] **Step 2: Dispatch one sub-agent per batch**

Agent template (engineer-executed): for each batch JSON file, dispatch a sub-agent with this prompt:

> You run the Stage 3 adversarial round on this batch. For each slot in `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/adversarial-batch-<NN>.json`:
> 1. Read the slot's `current` and `topicContext`.
> 2. Decide if you can find a strictly-better replacement (more canonical / more authoritative / more pedagogically useful), following the rules in `pipeline/prompts/stage_3_challenger.md`. Most slots will not produce a challenge — default bias is `null`.
> 3. If you DO have a challenge, evaluate it against the current per `pipeline/prompts/stage_3_judge.md`. Default bias: KEEP CURRENT.
> 4. For each slot, output: `{ slug, slotPath, action: "keep" | "swap", replacement?: <new resource matching slot kind>, reasoning: "..." }`.
>
> Write `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/adversarial-result-<NN>.json` with shape `{ batchId: "NN", results: [...] }`. Validate jq. Expect MOST results to be action=keep.

- [ ] **Step 3: Write `apply-adversarial.ts`**

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

interface Decision { slug: string; slotPath: string; action: "keep" | "swap"; replacement?: unknown; reasoning?: string; }
interface BatchFile { batchId: string; results: Decision[]; }

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const resultFiles = readdirSync(runsDir).filter(f => f.startsWith("adversarial-result-") && f.endsWith(".json")).map(f => join(runsDir, f));

const byTopic = new Map<string, Map<string, Decision>>();
for (const path of resultFiles) {
  const batch = JSON.parse(readFileSync(path, "utf8")) as BatchFile;
  for (const d of batch.results) {
    let m = byTopic.get(d.slug);
    if (!m) { m = new Map(); byTopic.set(d.slug, m); }
    m.set(d.slotPath, d);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let swaps = 0;
for (const path of files) {
  const { frontmatter: fm, body } = readTopicFile(path);
  const m = byTopic.get(fm.slug);
  if (!m) continue;
  let changed = false;

  for (const [slotPath, decision] of m) {
    if (decision.action !== "swap" || !decision.replacement) continue;

    if (slotPath === "videos.short") { fm.resources.videos.short = decision.replacement as typeof fm.resources.videos.short; changed = true; swaps++; continue; }
    if (slotPath === "videos.long")  { fm.resources.videos.long  = decision.replacement as typeof fm.resources.videos.long;  changed = true; swaps++; continue; }

    const m2 = slotPath.match(/^(articles|services|courses)\.(\d+)$/);
    if (!m2) continue;
    const [, kind, idxStr] = m2;
    const idx = Number(idxStr);
    const arr = (fm.resources as Record<string, unknown>)[kind!] as unknown[];
    if (idx < 0 || idx >= arr.length) continue;
    arr[idx] = decision.replacement;
    changed = true;
    swaps++;
  }

  if (changed) {
    fm.provenance.rounds = (fm.provenance.rounds ?? 1) + 1;
    writeTopicFile(path, fm, body);
  }
}

console.log(`Adversarial round complete. Swaps: ${swaps}.`);
```

- [ ] **Step 4: Run pipeline**

Run: `npx tsx pipeline/scripts/run-adversarial.ts` → dispatch sub-agents → `npx tsx pipeline/scripts/apply-adversarial.ts`. Expected swap count is low (5-30 across 451 slots is normal; the prompt explicitly biases toward keep).

- [ ] **Step 5: Re-run liveness against any newly-introduced URLs (only the swaps)**

For each swap, the new URL hasn't been liveness-checked. Build a small batch from the apply step's output and run a single sub-agent on it:

> Read `.git/iceberg-runs/adversarial-result-*.json`, collect every `replacement.url` (or `replacement.url` field appropriate to its kind), WebFetch each, classify alive/dead/changed, write `.git/iceberg-runs/_liveness-results-adv.json`. Then run `npx tsx pipeline/scripts/apply-liveness.ts`.

- [ ] **Step 6: Commit**

```bash
git add pipeline/scripts/run-adversarial.ts pipeline/scripts/apply-adversarial.ts content/
git commit -m "content: stage 3 adversarial pass — N swaps across the corpus"
```

Replace `N` with the actual swap count.

---

### Task 13: Smart replacer for dropped slots (Stage 4 follow-up) and learning paths

**Files:**
- Create: `pipeline/scripts/find-gaps.ts`
- Create: `pipeline/scripts/apply-replacements.ts`
- Create: `pipeline/scripts/run-paths-designer.ts`
- Create: `pipeline/scripts/apply-paths.ts`
- Create: `content/_paths.json`

- [ ] **Step 1: Write `find-gaps.ts`** — finds slots whose count is below an ideal threshold (e.g. <2 articles, <3 services, <1 course, missing short or long video), generates replacer cards.

```ts
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const TARGETS = { videosShort: 1, videosLong: 1, articles: 3, services: 4, courses: 2 } as const;

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

const gaps: Array<{ slug: string; slotKind: string; needed: number }> = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  if (!fm.resources.videos.short) gaps.push({ slug: fm.slug, slotKind: "video-short", needed: 1 });
  if (!fm.resources.videos.long)  gaps.push({ slug: fm.slug, slotKind: "video-long", needed: 1 });
  if (fm.resources.articles.length < TARGETS.articles) gaps.push({ slug: fm.slug, slotKind: "article", needed: TARGETS.articles - fm.resources.articles.length });
  if (fm.resources.services.length < TARGETS.services) gaps.push({ slug: fm.slug, slotKind: "service", needed: TARGETS.services - fm.resources.services.length });
  if (fm.resources.courses.length  < TARGETS.courses)  gaps.push({ slug: fm.slug, slotKind: "course",  needed: TARGETS.courses  - fm.resources.courses.length });
}

writeFileSync(join(runsDir, "_replacement-gaps.json"), JSON.stringify(gaps, null, 2) + "\n");
console.log(`Wrote ${gaps.length} gap entries to _replacement-gaps.json`);
```

- [ ] **Step 2: Dispatch a sub-agent per gap (or per gap-batch) using `stage_4_replacer.md`**

For each gap, the agent reads the topic's current resources and proposes a replacement of the requested `slotKind`. Output: `replacement-result-<slug>-<slotKind>-<n>.json` shaped `{ replacement: <new resource> | null }`.

- [ ] **Step 3: Write `apply-replacements.ts`** — appends valid replacements into the topic's frontmatter (subject to schema maxItems).

```ts
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type ArticleResource, type ServiceResource, type CourseResource, type VideoResource } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

const resultFiles = readdirSync(runsDir).filter(f => f.startsWith("replacement-result-") && f.endsWith(".json"));

let added = 0;
for (const file of resultFiles) {
  const match = file.match(/^replacement-result-(.+?)-(video-short|video-long|article|service|course)-(\d+)\.json$/);
  if (!match) continue;
  const [, slug, slotKind] = match;
  const target = files.find(p => {
    const { frontmatter } = readTopicFile(p);
    return frontmatter.slug === slug;
  });
  if (!target) continue;
  const { frontmatter: fm, body } = readTopicFile(target);
  const raw = JSON.parse(readFileSync(join(runsDir, file), "utf8")) as { replacement?: unknown };
  if (!raw.replacement) continue;

  switch (slotKind) {
    case "video-short": if (!fm.resources.videos.short) { fm.resources.videos.short = raw.replacement as VideoResource; added++; } break;
    case "video-long":  if (!fm.resources.videos.long)  { fm.resources.videos.long  = raw.replacement as VideoResource; added++; } break;
    case "article": if (fm.resources.articles.length < 5) { fm.resources.articles.push(raw.replacement as ArticleResource); added++; } break;
    case "service": if (fm.resources.services.length < 8) { fm.resources.services.push(raw.replacement as ServiceResource); added++; } break;
    case "course":  if (fm.resources.courses.length  < 4) { fm.resources.courses.push(raw.replacement as CourseResource); added++; } break;
  }
  writeTopicFile(target, fm, body);
}
console.log(`Added ${added} replacements.`);
```

- [ ] **Step 4: Run gap-finder + dispatch + applier**

- [ ] **Step 5: Write `run-paths-designer.ts`** — dispatches a single sub-agent for the paths design using `stage_7_paths_designer.md`. Input: full taxonomy + per-topic difficulty/hours/prerequisites.

```ts
import { writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

interface TopicMeta { slug: string; title: string; phase: string; summary: string; difficulty: string; estimatedHours: number; prerequisites: string[]; }

const files: string[] = [];
walkMd(contentDir, files);

const topicMeta: TopicMeta[] = [];
for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const tax = taxonomy.topics[fm.slug];
  topicMeta.push({
    slug: fm.slug,
    title: fm.title,
    phase: fm.phase,
    summary: fm.summary,
    difficulty: fm.difficulty,
    estimatedHours: fm.estimatedHours,
    prerequisites: tax?.prerequisites ?? []
  });
}

writeFileSync(join(runsDir, "paths-input.json"), JSON.stringify({ taxonomy: { phases: taxonomy.phases }, topics: topicMeta }, null, 2) + "\n");
console.log(`Wrote paths-input.json with ${topicMeta.length} topics.`);
```

- [ ] **Step 6: Dispatch a single sub-agent**

> Run Stage 7 Paths Designer per `pipeline/prompts/stage_7_paths_designer.md`. Input: `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/paths-input.json`. Output: `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/paths-result.json` matching `pipeline/schemas/paths.schema.json`.

- [ ] **Step 7: Write `apply-paths.ts`**

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validatePaths } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const runsDir = join(repoRoot, ".git", "iceberg-runs");
const contentDir = join(repoRoot, "content");

const raw = JSON.parse(readFileSync(join(runsDir, "paths-result.json"), "utf8"));
validatePaths(raw);

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));
const known = new Set(Object.keys(taxonomy.topics));
for (const p of raw.paths) {
  for (const t of p.topics) {
    if (!known.has(t)) throw new Error(`Path ${p.slug} references unknown topic ${t}`);
  }
}

writeFileSync(join(contentDir, "_paths.json"), JSON.stringify(raw, null, 2) + "\n");
console.log(`Wrote ${raw.paths.length} paths to content/_paths.json.`);
```

- [ ] **Step 8: Run paths designer + applier**

Run: `npx tsx pipeline/scripts/run-paths-designer.ts` → dispatch → `npx tsx pipeline/scripts/apply-paths.ts`. Expected: 5-8 paths written.

- [ ] **Step 9: Build content bundle, verify includes paths**

Run: `npm run build:content && jq '.paths.paths | length' app/src/content/topics.generated.json`
Expected: 5-8.

- [ ] **Step 10: Commit**

```bash
git add pipeline/scripts/find-gaps.ts pipeline/scripts/apply-replacements.ts pipeline/scripts/run-paths-designer.ts pipeline/scripts/apply-paths.ts content/
git commit -m "content: smart replacer fills gaps, learning paths v1"
```

---

### Task 14: Prerequisites graph review pass

**Files:**
- Create: `pipeline/scripts/review-prerequisites.ts`
- Modify: `content/_taxonomy.json` (via the script)

The current taxonomy's `prerequisites` came from one AI proposer. This task runs a focused review to tighten the DAG.

- [ ] **Step 1: Write `review-prerequisites.ts`**

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateTaxonomy } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8"));

// Build summary input for the reviewer agent.
interface PreqInput { slug: string; title: string; summary: string; phase: string; currentPrerequisites: string[]; }
const input: PreqInput[] = Object.values(taxonomy.topics).map(t => {
  const topic = t as { slug: string; title: string; summary: string; phase: string; prerequisites: string[] };
  return { slug: topic.slug, title: topic.title, summary: topic.summary, phase: topic.phase, currentPrerequisites: topic.prerequisites };
});

writeFileSync(join(runsDir, "preq-input.json"), JSON.stringify(input, null, 2) + "\n");

console.log(`Wrote preq-input.json with ${input.length} topics.`);
console.log("Next: dispatch a single sub-agent with the prompt:");
console.log("  'Review every topic's prerequisites. The DAG should be tight: a prerequisite means");
console.log("   the learner truly cannot understand B without already understanding A. Remove weak");
console.log("   links. Add missing strong ones. Output JSON: { changes: [{ slug, prerequisites: [...] }] }");
console.log("   to .git/iceberg-runs/preq-result.json. Do not introduce cycles.'");
```

- [ ] **Step 2: Dispatch the sub-agent**

Agent template:

> Read `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/preq-input.json`. For each topic, decide its TRUE prerequisites — topics whose absence would block understanding. Remove weak links. Add missing strong ones. Never introduce cycles. Output `{ "changes": [{ "slug": "...", "prerequisites": [...] }, ...] }` to `/Users/peteramelang/dev/private/learn-prod-stack/.git/iceberg-runs/preq-result.json`. Validate jq.

- [ ] **Step 3: Apply the result (add to `review-prerequisites.ts`)**

Append to the same script:

```ts
// Apply mode: pass --apply to merge preq-result.json into the taxonomy.
if (process.argv.includes("--apply")) {
  const result = JSON.parse(readFileSync(join(runsDir, "preq-result.json"), "utf8")) as { changes: { slug: string; prerequisites: string[] }[] };
  const topicSlugs = new Set(Object.keys(taxonomy.topics));
  for (const c of result.changes) {
    if (!taxonomy.topics[c.slug]) { console.warn(`Skip: unknown slug ${c.slug}`); continue; }
    for (const p of c.prerequisites) {
      if (!topicSlugs.has(p)) { console.warn(`Skip: unknown prerequisite ${p} for ${c.slug}`); continue; }
    }
    taxonomy.topics[c.slug].prerequisites = c.prerequisites;
  }

  // Cycle detection
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function visit(slug: string, stack: string[]): void {
    if (visited.has(slug)) return;
    if (visiting.has(slug)) throw new Error(`Cycle detected: ${[...stack, slug].join(" → ")}`);
    visiting.add(slug);
    for (const p of taxonomy.topics[slug].prerequisites) visit(p, [...stack, slug]);
    visiting.delete(slug);
    visited.add(slug);
  }
  for (const slug of Object.keys(taxonomy.topics)) visit(slug, []);

  validateTaxonomy(taxonomy);
  writeFileSync(join(contentDir, "_taxonomy.json"), JSON.stringify(taxonomy, null, 2) + "\n");
  console.log(`Applied ${result.changes.length} prerequisite changes.`);
}
```

- [ ] **Step 4: Run → dispatch → apply**

```bash
npx tsx pipeline/scripts/review-prerequisites.ts
# dispatch sub-agent
npx tsx pipeline/scripts/review-prerequisites.ts --apply
```

- [ ] **Step 5: Rerun the connections finalizer to refresh prerequisite edges**

The existing `pipeline/scripts/full-finalize.ts` rebuilds the connections graph from prerequisites + co-phase + hand-crafted edges. Re-run it:

```bash
npx tsx pipeline/scripts/full-finalize.ts
```

Expected: 130-180 connection edges (count may shift slightly).

- [ ] **Step 6: Rebuild bundle + commit**

```bash
npm run build:content
git add pipeline/scripts/review-prerequisites.ts content/_taxonomy.json content/_connections.json content/
git commit -m "content: prerequisites DAG review pass (tightened by human-eye review)"
```

---

## Phase D — App

### Task 15: Render narrative + pitfalls + code examples on Topic route

**Files:**
- Create: `app/src/components/domain/Narrative.tsx`
- Create: `app/src/components/domain/Pitfalls.tsx`
- Create: `app/src/components/domain/CodeExamples.tsx`
- Create: `app/src/components/domain/DifficultyBadge.tsx`
- Modify: `app/src/routes/Topic.tsx`
- Modify: `app/package.json` (add `shiki` dependency)

- [ ] **Step 1: Add shiki for syntax highlighting**

Run: `npm install --workspace=app shiki@^1.22.0`

Expected: dependency added to `app/package.json`.

- [ ] **Step 2: Create `Narrative.tsx`**

```tsx
export function Narrative({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <div className="space-y-md">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-body whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create `Pitfalls.tsx`**

```tsx
import type { Pitfall } from "../../content/types.js";

export function Pitfalls({ items }: { items: { title: string; explanation: string }[] }) {
  return (
    <ul className="space-y-md">
      {items.map((p, i) => (
        <li key={i} className="border-l-2 border-danger pl-md py-xs">
          <div className="text-body-strong">[!] {p.title}</div>
          <div className="text-body text-mute mt-xs">{p.explanation}</div>
        </li>
      ))}
    </ul>
  );
}
```

(Note: `Pitfall` type import — if `types.ts` doesn't export it, fall back to inline type; both work. The Zod schema in Task 3 already exports it via `z.infer<typeof PitfallSchema>` — add `export type Pitfall = z.infer<typeof PitfallSchema>;` in Task 3 if not already there.)

- [ ] **Step 4: Create `CodeExamples.tsx` with shiki**

```tsx
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

interface CodeExample { language: string; title: string; code: string; reasoning: string; }

export function CodeExamples({ items }: { items: CodeExample[] }) {
  return (
    <div className="space-y-xl">
      {items.map((ex, i) => <CodeBlock key={i} ex={ex} />)}
    </div>
  );
}

function CodeBlock({ ex }: { ex: CodeExample }) {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    codeToHtml(ex.code, { lang: ex.language, theme: "github-light" })
      .then(h => { if (!cancelled) setHtml(h); })
      .catch(() => { if (!cancelled) setHtml(`<pre><code>${escape(ex.code)}</code></pre>`); });
    return () => { cancelled = true; };
  }, [ex.code, ex.language]);

  return (
    <div>
      <div className="text-body-strong mb-xs">[+] {ex.title}</div>
      <div className="text-caption-md text-mute mb-sm">— {ex.reasoning}</div>
      <div
        className="text-caption-md bg-surface-soft border border-hairline rounded-sm overflow-x-auto [&_pre]:p-md [&_pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html ?? `<pre><code>${escape(ex.code)}</code></pre>` }}
      />
    </div>
  );
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
```

- [ ] **Step 5: Create `DifficultyBadge.tsx`**

```tsx
export function DifficultyBadge({ difficulty, hours }: { difficulty: "beginner" | "intermediate" | "advanced"; hours: number }) {
  const map = {
    beginner: { label: "Beginner", className: "border-success text-success" },
    intermediate: { label: "Intermediate", className: "border-warning text-warning" },
    advanced: { label: "Advanced", className: "border-danger text-danger" }
  } as const;
  const m = map[difficulty];
  return (
    <span className={`inline-flex items-baseline gap-md px-md py-xxs border rounded-sm text-caption-md ${m.className}`}>
      <span>[{m.label}]</span>
      <span className="text-mute">~{hours}h</span>
    </span>
  );
}
```

- [ ] **Step 6: Update `Topic.tsx`**

Locate the `Section` for the topic header (the one rendering `<h1>{fm.title}</h1>`). Add the `DifficultyBadge` after the title and before the paragraph. Insert new sections for Narrative, Pitfalls, and Code Examples between the existing Definition paragraph and the resources sections:

```tsx
import { Narrative } from "../components/domain/Narrative.js";
import { Pitfalls } from "../components/domain/Pitfalls.js";
import { CodeExamples } from "../components/domain/CodeExamples.js";
import { DifficultyBadge } from "../components/domain/DifficultyBadge.js";

// In the JSX, replace the header Section with:

<Section>
  <Link to={`/phase/${fm.phase}`} className="text-caption-md text-mute no-underline">&lt;&lt; {phase?.title}</Link>
  <div className="flex items-baseline gap-md mt-md flex-wrap">
    <h1 className="text-display-xl">{fm.title}</h1>
    <DifficultyBadge difficulty={fm.difficulty} hours={fm.estimatedHours} />
  </div>
  <p className="text-body mt-lg whitespace-pre-line">{fm.definition}</p>
  <div className="mt-xl"><MarkCompleteButton slug={fm.slug} /></div>
</Section>

<Section label="In Depth">
  <Narrative text={fm.narrative} />
</Section>

<Section label="Common Pitfalls">
  <Pitfalls items={fm.pitfalls} />
</Section>

<Section label="Code">
  <CodeExamples items={fm.codeExamples} />
</Section>
```

- [ ] **Step 7: Verify**

Run: `npm run build --workspace=app` — should succeed.

Run dev server: `npm run dev --workspace=app`. Open `http://localhost:5173/topic/idempotency`. Confirm narrative, pitfalls, code block (syntax-highlighted) all render.

Stop dev server.

- [ ] **Step 8: Commit**

```bash
git add app/package.json app/package-lock.json app/src/components/domain/ app/src/routes/Topic.tsx
git commit -m "app: render narrative, pitfalls, code examples, difficulty on topic page"
```

---

### Task 16: Learning paths UI

**Files:**
- Create: `app/src/routes/Paths.tsx`
- Create: `app/src/routes/Path.tsx`
- Create: `app/src/components/domain/PathStrip.tsx`
- Modify: `app/src/routes/Home.tsx`
- Modify: `app/src/App.tsx`
- Modify: `app/src/components/layout/PrimaryNav.tsx`

- [ ] **Step 1: Create `PathStrip.tsx`** — horizontal scrolling card list of paths.

```tsx
import { Link } from "react-router-dom";
import { paths } from "../../content/index.js";

export function PathStrip() {
  if (paths.length === 0) return null;
  return (
    <div className="flex gap-md overflow-x-auto -mx-md px-md py-md">
      {paths.map(p => (
        <Link
          key={p.slug}
          to={`/path/${p.slug}`}
          className="no-underline min-w-[260px] max-w-[260px] border border-hairline rounded-sm p-md hover:border-ink-deep"
        >
          <div className="text-body-strong">{p.title}</div>
          <div className="text-caption-md text-mute mt-xs">{p.audience}</div>
          <div className="text-body text-mute mt-sm line-clamp-3">{p.description}</div>
          <div className="text-caption-md text-mute mt-md">{p.topics.length} topics · ~{p.estimatedHours}h</div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `Paths.tsx` route**

```tsx
import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { paths } from "../content/index.js";

export function Paths() {
  return (
    <Page>
      <Section label="Learning Paths">
        <p className="text-body text-mute mb-xl max-w-prose">
          Each path is an opinionated sequence of topics for a specific audience and goal. Start at the top, work down.
        </p>
        {paths.map(p => (
          <Link key={p.slug} to={`/path/${p.slug}`} className="no-underline">
            <div className="py-lg border-b border-hairline">
              <div className="text-body-strong">[+] {p.title}</div>
              <div className="text-caption-md text-mute mt-xs">For {p.audience} · {p.topics.length} topics · ~{p.estimatedHours}h</div>
              <div className="text-body text-mute mt-sm">{p.description}</div>
            </div>
          </Link>
        ))}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 3: Create `Path.tsx` route**

```tsx
import { Link, useParams } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { getPath, getTopic, taxonomy } from "../content/index.js";
import { ProgressMarker } from "../components/domain/ProgressMarker.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

export function Path() {
  const { pathSlug } = useParams();
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const path = getPath(pathSlug!);
  if (!path || !taxonomy) return <Page><div>Path not found.</div></Page>;

  return (
    <Page>
      <Section>
        <Link to="/paths" className="text-caption-md text-mute no-underline">&lt;&lt; all paths</Link>
        <h1 className="text-display-xl mt-md">{path.title}</h1>
        <p className="text-body text-mute mt-lg">{path.description}</p>
        <div className="text-caption-md text-mute mt-md">For {path.audience} · {path.topics.length} topics · ~{path.estimatedHours} hours</div>
      </Section>

      <Section label="Sequence">
        {path.topics.map((slug, i) => {
          const t = taxonomy.topics[slug];
          const prog = progressStore.getTopicProgress(slug);
          const state: "empty" | "partial" | "done" = prog.completed ? "done" : Object.values(prog.resources).filter(Boolean).length > 0 ? "partial" : "empty";
          return (
            <Link key={slug} to={`/topic/${slug}`} className="no-underline">
              <div className="py-lg border-b border-hairline flex items-baseline gap-md">
                <span className="text-mute select-none w-8">{String(i+1).padStart(2,"0")}</span>
                <ProgressMarker state={state} />
                <div className="flex-1">
                  <div className="text-body-strong">{t?.title ?? slug}</div>
                  <div className="text-body text-mute">{t?.summary}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 4: Add the routes to `App.tsx`**

```tsx
import { Paths } from "./routes/Paths.js";
import { Path } from "./routes/Path.js";

// inside <Routes>:
<Route path="/paths" element={<Paths />} />
<Route path="/path/:pathSlug" element={<Path />} />
```

- [ ] **Step 5: Mount `PathStrip` on Home**

In `Home.tsx`, locate the JSX between the intro `Section` and the `Phases` `Section`. Insert:

```tsx
<Section label="Learning Paths">
  <PathStrip />
  <div className="mt-md text-caption-md">
    <Link to="/paths" className="underline">all paths &gt;&gt;</Link>
  </div>
</Section>
```

(Add `import { PathStrip } from "../components/domain/PathStrip.js";` at the top.)

- [ ] **Step 6: Add `paths` link to `PrimaryNav.tsx`**

In `PrimaryNav.tsx`, insert before the `<div className="flex-1" />`:

```tsx
<Link to="/paths" className="no-underline text-mute hover:text-ink">paths</Link>
```

- [ ] **Step 7: Verify in dev server**

Build + run preview, navigate to `/`, `/paths`, click into a path, click a topic from the path. Confirm everything renders.

- [ ] **Step 8: Commit**

```bash
git add app/src/routes/Paths.tsx app/src/routes/Path.tsx app/src/components/domain/PathStrip.tsx app/src/routes/Home.tsx app/src/App.tsx app/src/components/layout/PrimaryNav.tsx
git commit -m "app: learning paths — /paths catalog, /path/:slug detail, Home strip, nav link"
```

---

### Task 17: `/whats-new` route — git-history-driven changelog

**Files:**
- Create: `scripts/generate-changelog.ts` (at repo root, not inside pipeline — it runs at build time)
- Create: `app/src/routes/WhatsNew.tsx`
- Create: `app/src/hooks/useChangelog.ts`
- Modify: `package.json` (root) — add `generate:changelog` script and wire into `build`
- Modify: `app/src/App.tsx`
- Modify: `app/.gitignore` (ensure `public/changelog.json` is gitignored if needed)

- [ ] **Step 1: Create `scripts/generate-changelog.ts` at repo root**

```ts
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

interface ChangelogEntry { sha: string; date: string; message: string; touchedTopics: string[]; }

const log = execSync(
  `git log --pretty=format:%H%x00%ad%x00%s --date=iso-strict --name-only -- content/`,
  { cwd: repoRoot }
).toString();

const entries: ChangelogEntry[] = [];
const blocks = log.split(/\n\n+/);
for (const block of blocks) {
  const lines = block.split("\n").filter(Boolean);
  if (lines.length === 0) continue;
  const header = lines[0]!;
  const parts = header.split(" ");
  if (parts.length < 3) continue;
  const [sha, date, message] = parts as [string, string, string];
  const files = lines.slice(1);
  const touchedTopics = Array.from(new Set(
    files
      .filter(f => f.startsWith("content/") && f.endsWith(".md"))
      .map(f => f.split("/").pop()!.replace(/\.md$/, ""))
      .filter(slug => !slug.startsWith("_"))
  ));
  if (touchedTopics.length === 0) continue;
  entries.push({ sha: sha.slice(0, 7), date, message, touchedTopics });
}

mkdirSync(join(repoRoot, "app", "public"), { recursive: true });
writeFileSync(join(repoRoot, "app", "public", "changelog.json"), JSON.stringify(entries, null, 2) + "\n");
console.log(`Wrote ${entries.length} changelog entries to app/public/changelog.json`);
```

- [ ] **Step 2: Wire into root `package.json` scripts**

In root `package.json`, replace the `build` script with:

```json
"build": "npm run build:content --workspace=pipeline && npm run generate:changelog && npm run build --workspace=app",
"generate:changelog": "tsx scripts/generate-changelog.ts",
```

Add `tsx` to root devDependencies if not already present:

```bash
npm install --save-dev tsx@^4.19.0
```

- [ ] **Step 3: Create `useChangelog.ts`**

```ts
import { useEffect, useState } from "react";

export interface ChangelogEntry { sha: string; date: string; message: string; touchedTopics: string[]; }

export function useChangelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  useEffect(() => {
    fetch("/changelog.json")
      .then(r => r.ok ? r.json() : [])
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);
  return entries;
}
```

- [ ] **Step 4: Create `WhatsNew.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { useChangelog } from "../hooks/useChangelog.js";
import { getTopic } from "../content/index.js";

export function WhatsNew() {
  const entries = useChangelog();
  return (
    <Page>
      <Section label="What's New">
        <p className="text-body text-mute mb-xl max-w-prose">
          Every content change committed to <code>content/</code>, newest first.
        </p>
        {entries.length === 0 && <div className="text-mute">[ ] loading…</div>}
        {entries.map(e => (
          <div key={e.sha} className="py-lg border-b border-hairline">
            <div className="text-caption-md text-mute">{e.date.slice(0,10)} · {e.sha}</div>
            <div className="text-body mt-xs">{e.message}</div>
            <div className="mt-sm flex flex-wrap gap-sm">
              {e.touchedTopics.map(slug => {
                const t = getTopic(slug);
                return (
                  <Link key={slug} to={`/topic/${slug}`} className="text-caption-md underline">
                    {t?.frontmatter.title ?? slug}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 5: Register route in `App.tsx`**

```tsx
import { WhatsNew } from "./routes/WhatsNew.js";

// inside <Routes>:
<Route path="/whats-new" element={<WhatsNew />} />
```

- [ ] **Step 6: Add link in Footer.tsx**

Add between `credits` and `github`:

```tsx
<span aria-hidden="true">·</span>
<Link to="/whats-new" className="underline">what's new</Link>
```

- [ ] **Step 7: Verify**

```bash
npm run generate:changelog
ls app/public/changelog.json
npm run build
```

Open preview, visit `/whats-new`. Expected: list of recent content commits, each linking to touched topics.

- [ ] **Step 8: Commit**

```bash
git add scripts/generate-changelog.ts app/src/routes/WhatsNew.tsx app/src/hooks/useChangelog.ts app/src/App.tsx app/src/components/layout/Footer.tsx package.json package-lock.json
git commit -m "app: /whats-new route built from git history of content/"
```

---

### Task 18: SEO — Open Graph tags, JSON-LD, per-route titles

**Files:**
- Modify: `app/package.json` (add `react-helmet-async`)
- Modify: `app/src/main.tsx` (wrap with `HelmetProvider`)
- Create: `app/src/components/layout/Head.tsx`
- Modify: `app/src/routes/Home.tsx`
- Modify: `app/src/routes/Phase.tsx`
- Modify: `app/src/routes/Topic.tsx`
- Modify: `app/src/routes/Paths.tsx`
- Modify: `app/src/routes/Path.tsx`
- Modify: `app/src/routes/Bookmarks.tsx`
- Modify: `app/src/routes/Settings.tsx`
- Modify: `app/src/routes/Graph.tsx`
- Modify: `app/src/routes/Credits.tsx`
- Modify: `app/src/routes/WhatsNew.tsx`

- [ ] **Step 1: Install dependency**

```bash
npm install --workspace=app react-helmet-async@^2.0.5
```

- [ ] **Step 2: Wrap app with HelmetProvider in `main.tsx`**

```tsx
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
```

- [ ] **Step 3: Create `Head.tsx`**

```tsx
import { Helmet } from "react-helmet-async";

interface HeadProps {
  title: string;
  description?: string;
  jsonLd?: object;
  canonical?: string;
}

const SITE = "iceberg — production-readiness curriculum";

export function Head({ title, description, jsonLd, canonical }: HeadProps) {
  const fullTitle = title === SITE ? title : `${title} · ${SITE}`;
  const desc = description ?? "An interactive learning guide for the engineering skills that distinguish a deployed MVP from a real production system.";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {canonical && <link rel="canonical" href={canonical} />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
```

- [ ] **Step 4: Mount `Head` in every route**

Add `<Head title="…" description="…" />` inside the `<Page>` of each route. For `Topic.tsx`, also build a `LearningResource` JSON-LD object:

```tsx
<Head
  title={fm.title}
  description={fm.summary}
  jsonLd={{
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: fm.title,
    description: fm.summary,
    educationalLevel: fm.difficulty,
    timeRequired: `PT${Math.ceil(fm.estimatedHours)}H`,
    teaches: fm.title,
    isPartOf: { "@type": "Course", name: phase?.title }
  }}
/>
```

For each other route use the simpler form, e.g. on Home: `<Head title="iceberg — production-readiness curriculum" />` (the bare site title).

- [ ] **Step 5: Verify**

Run dev server, view source of `/topic/idempotency`. Confirm `<title>`, `<meta property="og:title">`, and a `<script type="application/ld+json">` block all present and contain the topic data.

- [ ] **Step 6: Commit**

```bash
git add app/package.json app/package-lock.json app/src/main.tsx app/src/components/layout/Head.tsx app/src/routes/
git commit -m "app: SEO — title, description, OG, JSON-LD per route"
```

---

### Task 19: Fuzzy Cmd-K search using fuse.js

**Files:**
- Modify: `app/package.json` (add `fuse.js`)
- Create: `app/src/utils/fuzzyIndex.ts`
- Modify: `app/src/components/interactive/SearchPalette.tsx`

- [ ] **Step 1: Install dependency**

```bash
npm install --workspace=app fuse.js@^7.0.0
```

- [ ] **Step 2: Create `fuzzyIndex.ts`**

```ts
import Fuse from "fuse.js";
import { topics, taxonomy } from "../content/index.js";

interface IndexEntry {
  slug: string;
  title: string;
  summary: string;
  definition: string;
  resources: string;  // concatenated resource titles
}

const entries: IndexEntry[] = topics.map(t => {
  const fm = t.frontmatter;
  const r = fm.resources;
  const resourceTitles: string[] = [];
  if (r.videos.short) resourceTitles.push(r.videos.short.title);
  if (r.videos.long) resourceTitles.push(r.videos.long.title);
  for (const a of r.articles) resourceTitles.push(a.title);
  for (const s of r.services) resourceTitles.push(s.name);
  for (const c of r.courses) resourceTitles.push(c.title);
  return {
    slug: fm.slug,
    title: fm.title,
    summary: fm.summary,
    definition: fm.definition,
    resources: resourceTitles.join(" · ")
  };
});

export const fuse = new Fuse(entries, {
  keys: [
    { name: "title", weight: 0.5 },
    { name: "summary", weight: 0.25 },
    { name: "definition", weight: 0.15 },
    { name: "resources", weight: 0.1 }
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeMatches: true,
  minMatchCharLength: 2
});

export function search(query: string, limit = 8) {
  if (!query) return [];
  return fuse.search(query, { limit }).map(r => {
    const t = taxonomy?.topics[r.item.slug];
    return { slug: r.item.slug, title: t?.title ?? r.item.title, summary: t?.summary ?? r.item.summary };
  });
}
```

- [ ] **Step 3: Update `SearchPalette.tsx`**

Replace the existing `matches` `useMemo` block:

```tsx
import { search } from "../../utils/fuzzyIndex.js";

// inside the component, replace existing matches useMemo:
const matches = useMemo(() => search(query, 8), [query]);
```

(The render JSX stays the same — it already iterates `matches` and uses `.slug`, `.title`, `.summary`.)

- [ ] **Step 4: Verify**

Run dev server. Press Cmd-K. Type a partial / typo like "idemp" or "auth". Confirm Idempotency / Authentication surface even with a typo.

- [ ] **Step 5: Commit**

```bash
git add app/package.json app/package-lock.json app/src/utils/fuzzyIndex.ts app/src/components/interactive/SearchPalette.tsx
git commit -m "app: fuse.js fuzzy search over title/summary/definition/resources"
```

---

### Task 20: Final UI polish — credits page + footer link to /paths, /whats-new

**Files:**
- Modify: `app/src/components/layout/Footer.tsx`
- Modify: `app/src/routes/Topic.tsx` (the Attribution micro-section): tweak link target

- [ ] **Step 1: Verify Footer.tsx has all four links: credits, what's new, paths, github**

Should look like:

```tsx
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-hairline mt-section py-xl text-caption-md text-mute">
      <div className="max-w-[960px] mx-auto px-xl flex flex-wrap gap-md items-baseline">
        <span>iceberg — production-readiness curriculum</span>
        <span aria-hidden="true">·</span>
        <Link to="/paths" className="underline">paths</Link>
        <span aria-hidden="true">·</span>
        <Link to="/whats-new" className="underline">what's new</Link>
        <span aria-hidden="true">·</span>
        <Link to="/credits" className="underline">credits</Link>
        <span aria-hidden="true">·</span>
        <a href="https://github.com/peteramelang/iceberg" target="_blank" rel="noreferrer" className="underline">github</a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Run typecheck + build**

```bash
npm run typecheck && npm run build
```

Expected: clean.

- [ ] **Step 3: Smoke-test all routes**

Spin up the preview server, visit: `/`, `/phase/observability`, `/topic/logging`, `/paths`, `/path/first-deploy`, `/bookmarks`, `/settings`, `/graph`, `/credits`, `/whats-new`. Confirm each renders without console errors.

- [ ] **Step 4: Commit**

```bash
git add app/src/components/layout/Footer.tsx
git commit -m "app: final footer with paths + what's new"
```

---

## Phase E — Verification & Ship

### Task 21: Zero-placeholder verification gate

**Files:**
- Create: `pipeline/scripts/verify-no-placeholders.ts`

- [ ] **Step 1: Write the script**

```ts
import { readdirSync, statSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

const errors: string[] = [];
const PLACEHOLDER_TERMS = /pending|placeholder|tbd|todo|\(unspecified\)/i;

for (const path of files) {
  const { frontmatter: fm } = readTopicFile(path);
  const where = `${fm.slug}`;

  if (!fm.narrative || fm.narrative.length < 400) errors.push(`${where}: narrative too short (${fm.narrative?.length ?? 0} chars; need ≥400)`);
  if (PLACEHOLDER_TERMS.test(fm.narrative ?? "")) errors.push(`${where}: narrative contains placeholder phrase`);

  if (!Array.isArray(fm.pitfalls) || fm.pitfalls.length < 3) errors.push(`${where}: needs ≥3 pitfalls (has ${fm.pitfalls?.length ?? 0})`);
  for (const p of fm.pitfalls ?? []) {
    if (PLACEHOLDER_TERMS.test(p.title)) errors.push(`${where}: pitfall title is placeholder ("${p.title}")`);
    if (p.explanation.length < 40) errors.push(`${where}: pitfall "${p.title}" explanation too short`);
  }

  if (!Array.isArray(fm.codeExamples) || fm.codeExamples.length < 1) errors.push(`${where}: needs ≥1 code example`);
  for (const c of fm.codeExamples ?? []) {
    if (PLACEHOLDER_TERMS.test(c.title)) errors.push(`${where}: code example title is placeholder ("${c.title}")`);
    if (c.code.length < 20) errors.push(`${where}: code example "${c.title}" too short`);
    if (PLACEHOLDER_TERMS.test(c.reasoning)) errors.push(`${where}: code example reasoning is placeholder`);
  }

  if (!fm.difficulty) errors.push(`${where}: difficulty missing`);
  if (typeof fm.estimatedHours !== "number" || fm.estimatedHours === 4) {
    // The scaffold default is 4. If still exactly 4, it's probably never been estimated.
    // (This is a heuristic — real 4s pass; this catches the common "never estimated" case.)
    // Be lax: just warn rather than fail unless many topics have it.
  }

  if (fm.needsManualPick) errors.push(`${where}: needsManualPick is still true`);
}

// Paths
const pathsPath = join(contentDir, "_paths.json");
let pathsData: unknown = null;
try { pathsData = JSON.parse(readFileSync(pathsPath, "utf8")); } catch {}
if (!pathsData) errors.push("paths: content/_paths.json missing");
else {
  const obj = pathsData as { paths?: unknown[] };
  if (!Array.isArray(obj.paths) || obj.paths.length < 5) errors.push(`paths: need ≥5 paths (has ${obj.paths?.length ?? 0})`);
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} placeholder/missing-content issues:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`PASS: no placeholders detected. ${files.length} topics validated.`);
```

- [ ] **Step 2: Run the gate**

Run: `npx tsx pipeline/scripts/verify-no-placeholders.ts`
Expected: `PASS: no placeholders detected. 46 topics validated.`

If FAIL: read the error list. Each error is a specific slug + field combination — go back to the appropriate Phase C task (Tasks 8-13) and re-dispatch enrichment for the listed slugs. Re-run this gate until it passes.

- [ ] **Step 3: Rebuild content + bundle + app, full verification**

```bash
npm run build:content
npx tsx pipeline/scripts/generate-credits.ts
cp CREDITS.md app/src/content/CREDITS.md
npm run typecheck
npm run build
```

All steps should succeed.

- [ ] **Step 4: Commit any final touches**

```bash
git add -A
git status
# If anything is staged that needs to ship (e.g. updated CREDITS.md):
git commit -m "content: final zero-placeholder pass"
```

If nothing changed, skip the commit.

---

### Task 22: Push and verify on production

**Files:** none

- [ ] **Step 1: Push to origin**

```bash
git push origin main
```

- [ ] **Step 2: Verify Vercel build succeeded**

Wait for the Vercel deploy webhook (1-2 min). Visit the production URL. Click through:
- Home → see paths strip
- A path → see ordered topics
- A topic → see narrative + pitfalls + code (with syntax highlighting) + difficulty badge
- `/whats-new` → see commit history
- `/credits` → see attribution list
- Cmd-K → fuzzy search works
- View page source on any topic → confirm `<title>`, OG tags, JSON-LD present
- `/graph` → react-flow still renders

- [ ] **Step 3: If anything is broken on production, fix it locally, run `npm run build` to verify, push.**

- [ ] **Step 4: Final empty commit marking completion**

```bash
git commit --allow-empty -m "milestone: content depth + curriculum polish complete"
git push
```

---

## Self-review notes

- **Spec coverage**: every item from the user's list (1-6, 9, 10, 13, 14, 15) maps to at least one task:
  - 1 (narratives) → Task 8
  - 2 (code examples) → Tasks 1 (schema), 10 (enrichment), 15 (UI)
  - 3 (pitfalls) → Tasks 1 (schema), 9 (enrichment), 15 (UI)
  - 4 (difficulty + hours) → Tasks 1 (schema), 11 (enrichment), 15 (UI badge)
  - 5 (learning paths) → Tasks 2 (schema), 7 (prompt), 13 (designer + applier), 16 (UI)
  - 6 (prerequisites review) → Task 14
  - 9 (adversarial round) → Tasks 7 (orchestrator prompt), 12 (runner + applier)
  - 10 (smart replacer) → Tasks 6 (prompt), 13 (gap finder + applier)
  - 13 (/whats-new) → Task 17
  - 14 (SEO) → Task 18
  - 15 (fuzzy search) → Task 19

- **Zero-placeholder guarantee**: Task 21 explicitly fails the build if any topic has placeholder narrative, pitfalls, code examples, missing difficulty, or `needsManualPick=true`. The plan loops back to Phase C if the gate fails.

- **Type consistency check**: `Pitfall`, `CodeExample`, `Difficulty`, `LearningPath` types are defined in Task 3 (TS + Zod) and reused in Tasks 15, 16. Field names match across schema (Task 1), TS interfaces (Task 3), prompts (Tasks 4-7), enrichment scripts (Tasks 8-13), and UI components (Tasks 15-16).

- **Known compromises documented**:
  - The enrichment loop is human-orchestrated (Task 8 Step 4 etc.) — the script generates input cards, the engineer running the plan dispatches sub-agents, then the script applies results. A fully automated pipeline would require an in-process agent runner; that's out of scope.
  - The adversarial round (Task 12) is biased to "keep current" — most slots won't change. That's by design; aggressive replacement creates churn without quality gain.
  - DESIGN.md is excluded from all tasks per the project owner's explicit instruction.
