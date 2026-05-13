# Iceberg Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build iceberg — a personal interactive learning guide for production-readiness topics, with an autonomous multi-agent content pipeline and a static React app deployed to Vercel.

**Architecture:** Two npm workspaces sharing `content/` as the single source of truth. `pipeline/` is a finite-state-machine runbook executed by Claude in a terminal session; it dispatches sub-agents in parallel batches across 6 stages (curation → research → consistency → adversarial → liveness → connections), persists state in a durable ledger, and recovers from interruption via the ledger + git history. `app/` is a Vite + React + TS + Tailwind static site implementing the imported `DESIGN.md` (Berkeley Mono / JetBrains Mono on cream, ASCII bracket vocabulary), with localStorage-backed stores behind interfaces for future Firebase swap.

**Tech Stack:** TypeScript, Node 20+, npm workspaces, Vite, React 18, react-router, react-flow, Tailwind CSS, gray-matter, marked, Ajv (JSON Schema), Zod, Vitest, @fontsource/jetbrains-mono.

**Spec:** `docs/superpowers/specs/2026-05-13-iceberg-design.md`

**Phase structure:**
- **Phase A (Pipeline):** Tasks 1-18. Produces working content/ artifacts via the autonomous pipeline. Smoke-run-clean before the app starts.
- **Phase B (App):** Tasks 19-32. Builds the static React site consuming the pipeline's output.
- **Phase C (Deploy):** Task 33. Vercel.

---

## Phase A — Pipeline

### Task 1: Bootstrap repository structure

**Files:**
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `README.md`
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `pipeline/package.json`
- Create: `pipeline/tsconfig.json`
- Create: `app/package.json` (stub for now)
- Create: `app/tsconfig.json` (stub for now)

- [ ] **Step 1: Write `.gitignore`**

```
node_modules/
*.log
.DS_Store
.env
.env.*
!.env.example

# Build outputs
app/dist/
app/src/content/topics.generated.json

# Smoke run output
content-smoke/
content/_ledger.smoke.json

# TypeScript
*.tsbuildinfo

# Editors
.vscode/
.idea/
```

- [ ] **Step 2: Write `.gitattributes`**

```
* text=auto eol=lf
*.md text
*.json text
*.ts text
*.tsx text
*.yml text
```

- [ ] **Step 3: Write root `package.json`**

```json
{
  "name": "iceberg",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["app", "pipeline"],
  "scripts": {
    "dev": "npm run dev --workspace=app",
    "build": "npm run build:content --workspace=pipeline && npm run build --workspace=app",
    "build:content": "npm run build:content --workspace=pipeline",
    "preview": "npm run preview --workspace=app",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "pipeline": "echo 'Open this repo in Claude Code and say: continue the iceberg pipeline. Claude will read pipeline/runbook.md and resume from the ledger.'",
    "pipeline:smoke": "ICEBERG_MODE=smoke npm run pipeline"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 4: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

- [ ] **Step 5: Write `pipeline/package.json`**

```json
{
  "name": "@iceberg/pipeline",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "build:content": "tsx scripts/build-content.ts"
  },
  "dependencies": {
    "ajv": "^8.17.0",
    "ajv-formats": "^3.0.1",
    "gray-matter": "^4.0.3",
    "marked": "^14.1.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 6: Write `pipeline/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["node", "vitest/globals"]
  },
  "include": ["lib/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts"]
}
```

- [ ] **Step 7: Write `app/package.json` stub**

```json
{
  "name": "@iceberg/app",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@xyflow/react": "^12.3.0",
    "@fontsource/jetbrains-mono": "^5.1.0",
    "marked": "^14.1.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 8: Write `app/tsconfig.json` stub**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- [ ] **Step 9: Write `README.md` stub**

```markdown
# iceberg

An interactive learning guide for production-readiness — the topics that sit "below the waterline" of the *Vibe Coding vs Production Reality* iceberg.

## Status

Pre-bootstrap. See `docs/superpowers/specs/2026-05-13-iceberg-design.md` for the design.

## Quick start

```bash
npm install
npm run dev
```

## Pipeline

The content pipeline is executed by Claude Code in a terminal session. Open this repo in Claude Code and say:

> continue the iceberg pipeline

Claude reads `pipeline/runbook.md` and resumes from `content/_ledger.json`.

## License

Personal project. All rights reserved.
```

- [ ] **Step 10: Install dependencies and verify**

Run: `npm install`
Expected: completes without error, `node_modules/` populated in root + both workspaces.

- [ ] **Step 11: Verify typecheck baseline passes**

Run: `npm run typecheck`
Expected: no errors (both workspaces are empty of source files; tsc should succeed).

- [ ] **Step 12: Commit**

```bash
git add .gitignore .gitattributes README.md package.json package-lock.json tsconfig.base.json pipeline/package.json pipeline/tsconfig.json app/package.json app/tsconfig.json
git commit -m "bootstrap: npm workspaces, TS configs, gitignore"
```

---

### Task 2: JSON Schemas

**Files:**
- Create: `pipeline/schemas/ledger.schema.json`
- Create: `pipeline/schemas/taxonomy.schema.json`
- Create: `pipeline/schemas/topic-frontmatter.schema.json`
- Create: `pipeline/schemas/connections.schema.json`
- Create: `pipeline/schemas/export-payload.schema.json`

- [ ] **Step 1: Write `pipeline/schemas/ledger.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://iceberg.local/schemas/ledger.json",
  "title": "Iceberg Pipeline Ledger",
  "type": "object",
  "required": ["version", "createdAt", "updatedAt", "currentRound", "mode", "stages", "topics", "connections"],
  "additionalProperties": false,
  "properties": {
    "version": { "const": 1 },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" },
    "currentRound": { "type": "integer", "minimum": 1 },
    "mode": { "enum": ["full", "smoke"] },
    "stages": {
      "type": "object",
      "required": ["stage_0_taxonomy"],
      "properties": {
        "stage_0_taxonomy": { "$ref": "#/definitions/StageEntry" }
      },
      "additionalProperties": { "$ref": "#/definitions/StageEntry" }
    },
    "topics": {
      "type": "object",
      "additionalProperties": { "$ref": "#/definitions/TopicEntry" }
    },
    "connections": {
      "type": "object",
      "required": ["status", "artifactPath"],
      "properties": {
        "status": { "enum": ["pending", "in_progress", "completed", "failed"] },
        "artifactPath": { "type": "string" }
      }
    }
  },
  "definitions": {
    "StageEntry": {
      "type": "object",
      "required": ["status"],
      "properties": {
        "status": { "enum": ["pending", "in_progress", "completed", "failed"] },
        "completedAt": { "type": "string", "format": "date-time" },
        "userApprovedAt": { "type": "string", "format": "date-time" },
        "artifactPath": { "type": "string" },
        "agentRunIds": { "type": "array", "items": { "type": "string" } },
        "failureReason": { "type": "string" }
      }
    },
    "TopicEntry": {
      "type": "object",
      "required": ["phase", "stages"],
      "properties": {
        "phase": { "type": "string" },
        "stages": {
          "type": "object",
          "required": ["research", "consistency", "adversarial", "liveness", "stabilized"],
          "properties": {
            "research": { "$ref": "#/definitions/TopicStageEntry" },
            "consistency": { "$ref": "#/definitions/TopicStageEntry" },
            "adversarial": { "$ref": "#/definitions/TopicStageEntry" },
            "liveness": { "$ref": "#/definitions/TopicStageEntry" },
            "stabilized": { "type": "boolean" }
          }
        },
        "lastSwapAt": { "type": ["string", "null"], "format": "date-time" },
        "retryCounts": {
          "type": "object",
          "additionalProperties": { "type": "integer", "minimum": 0 }
        }
      }
    },
    "TopicStageEntry": {
      "type": "object",
      "required": ["status"],
      "properties": {
        "status": { "enum": ["pending", "in_progress", "completed", "failed"] },
        "round": { "type": "integer", "minimum": 1 },
        "agentRunIds": { "type": "array", "items": { "type": "string" } },
        "artifactPath": { "type": "string" },
        "completedAt": { "type": "string", "format": "date-time" },
        "failureReason": { "type": "string" }
      }
    }
  }
}
```

- [ ] **Step 2: Write `pipeline/schemas/taxonomy.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://iceberg.local/schemas/taxonomy.json",
  "title": "Iceberg Taxonomy",
  "type": "object",
  "required": ["version", "phases", "topics"],
  "additionalProperties": false,
  "properties": {
    "version": { "const": 1 },
    "phases": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["slug", "title", "order", "description", "topics"],
        "additionalProperties": false,
        "properties": {
          "slug": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
          "title": { "type": "string", "minLength": 1 },
          "order": { "type": "integer", "minimum": 1 },
          "description": { "type": "string", "minLength": 1 },
          "topics": { "type": "array", "items": { "type": "string" } }
        }
      }
    },
    "topics": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["slug", "title", "phase", "order", "summary", "prerequisites", "tags", "addedByStage0"],
        "additionalProperties": false,
        "properties": {
          "slug": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
          "title": { "type": "string", "minLength": 1 },
          "phase": { "type": "string" },
          "order": { "type": "integer", "minimum": 1 },
          "summary": { "type": "string", "minLength": 1 },
          "prerequisites": { "type": "array", "items": { "type": "string" } },
          "tags": { "type": "array", "items": { "type": "string" } },
          "addedByStage0": { "type": "boolean" }
        }
      }
    }
  }
}
```

- [ ] **Step 3: Write `pipeline/schemas/topic-frontmatter.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://iceberg.local/schemas/topic-frontmatter.json",
  "title": "Iceberg Topic Frontmatter",
  "type": "object",
  "required": ["slug", "title", "phase", "order", "summary", "definition", "resources", "provenance", "needsManualPick"],
  "additionalProperties": false,
  "properties": {
    "slug": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
    "title": { "type": "string", "minLength": 1 },
    "phase": { "type": "string" },
    "order": { "type": "integer", "minimum": 1 },
    "summary": { "type": "string", "minLength": 1 },
    "definition": { "type": "string", "minLength": 1 },
    "needsManualPick": { "type": "boolean" },
    "resources": {
      "type": "object",
      "required": ["videos", "articles", "services", "courses"],
      "additionalProperties": false,
      "properties": {
        "videos": {
          "type": "object",
          "required": ["short", "long"],
          "additionalProperties": false,
          "properties": {
            "short": { "$ref": "#/definitions/VideoResource" },
            "long":  { "$ref": "#/definitions/VideoResource" }
          }
        },
        "articles": {
          "type": "array",
          "minItems": 0,
          "maxItems": 5,
          "items": {
            "type": "object",
            "required": ["url", "title", "kind", "reasoning"],
            "additionalProperties": false,
            "properties": {
              "url": { "type": "string", "format": "uri" },
              "title": { "type": "string" },
              "kind": { "enum": ["canonical-doc", "engineering-blog", "tutorial"] },
              "reasoning": { "type": "string" }
            }
          }
        },
        "services": {
          "type": "array",
          "minItems": 0,
          "maxItems": 8,
          "items": {
            "type": "object",
            "required": ["name", "url", "category", "reasoning"],
            "additionalProperties": false,
            "properties": {
              "name": { "type": "string" },
              "url": { "type": "string", "format": "uri" },
              "category": { "type": "string" },
              "reasoning": { "type": "string" }
            }
          }
        },
        "courses": {
          "type": "array",
          "minItems": 0,
          "maxItems": 4,
          "items": {
            "type": "object",
            "required": ["url", "title", "provider", "paid", "reasoning"],
            "additionalProperties": false,
            "properties": {
              "url": { "type": "string", "format": "uri" },
              "title": { "type": "string" },
              "provider": { "type": "string" },
              "paid": { "type": "boolean" },
              "reasoning": { "type": "string" }
            }
          }
        }
      }
    },
    "provenance": {
      "type": "object",
      "required": ["researchedAt", "pipelineVersion", "rounds", "stabilized"],
      "additionalProperties": false,
      "properties": {
        "researchedAt": { "type": "string", "format": "date-time" },
        "pipelineVersion": { "type": "integer", "minimum": 1 },
        "rounds": { "type": "integer", "minimum": 1 },
        "stabilized": { "type": "boolean" }
      }
    }
  },
  "definitions": {
    "VideoResource": {
      "oneOf": [
        {
          "type": "object",
          "required": ["url", "title", "author", "durationMinutes", "addedAt", "reasoning"],
          "additionalProperties": false,
          "properties": {
            "url": { "type": "string", "format": "uri" },
            "title": { "type": "string" },
            "author": { "type": "string" },
            "durationMinutes": { "type": "integer", "minimum": 1 },
            "addedAt": { "type": "string", "format": "date-time" },
            "reasoning": { "type": "string" }
          }
        },
        { "type": "null" }
      ]
    }
  }
}
```

- [ ] **Step 4: Write `pipeline/schemas/connections.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://iceberg.local/schemas/connections.json",
  "title": "Iceberg Connections",
  "type": "object",
  "required": ["version", "edges"],
  "additionalProperties": false,
  "properties": {
    "version": { "const": 1 },
    "edges": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["from", "to", "type", "weight", "reasoning"],
        "additionalProperties": false,
        "properties": {
          "from": { "type": "string" },
          "to": { "type": "string" },
          "type": { "enum": ["prerequisite", "related", "often-confused-with", "pairs-with"] },
          "weight": { "type": "number", "minimum": 0, "maximum": 1 },
          "reasoning": { "type": "string" }
        }
      }
    }
  }
}
```

- [ ] **Step 5: Write `pipeline/schemas/export-payload.schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://iceberg.local/schemas/export-payload.json",
  "title": "Iceberg Progress Export Payload",
  "type": "object",
  "required": ["format", "version", "exportedAt", "data"],
  "additionalProperties": false,
  "properties": {
    "format": { "const": "iceberg-progress" },
    "version": { "const": 1 },
    "exportedAt": { "type": "string", "format": "date-time" },
    "data": {
      "type": "object",
      "required": ["progress", "bookmarks", "notes"],
      "additionalProperties": false,
      "properties": {
        "progress": { "type": "object" },
        "bookmarks": { "type": "array" },
        "notes": { "type": "object" }
      }
    }
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add pipeline/schemas/
git commit -m "schemas: add ledger, taxonomy, topic-frontmatter, connections, export-payload"
```

---

### Task 3: Validation library (`pipeline/lib/validate.ts`) — TDD

**Files:**
- Create: `pipeline/lib/validate.ts`
- Create: `pipeline/tests/validate.test.ts`

- [ ] **Step 1: Write failing test `pipeline/tests/validate.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { validateLedger, validateTaxonomy, validateTopicFrontmatter, validateConnections, ValidationError } from "../lib/validate.js";

describe("validateLedger", () => {
  it("accepts a minimal valid ledger", () => {
    const ledger = {
      version: 1,
      createdAt: "2026-05-13T22:30:00Z",
      updatedAt: "2026-05-13T22:30:00Z",
      currentRound: 1,
      mode: "smoke",
      stages: { stage_0_taxonomy: { status: "pending" } },
      topics: {},
      connections: { status: "pending", artifactPath: "content/_connections.json" }
    };
    expect(() => validateLedger(ledger)).not.toThrow();
  });

  it("rejects a ledger missing required fields", () => {
    expect(() => validateLedger({ version: 1 })).toThrow(ValidationError);
  });

  it("rejects a ledger with a bad stage status", () => {
    const bad = {
      version: 1,
      createdAt: "2026-05-13T22:30:00Z",
      updatedAt: "2026-05-13T22:30:00Z",
      currentRound: 1,
      mode: "smoke",
      stages: { stage_0_taxonomy: { status: "bogus" } },
      topics: {},
      connections: { status: "pending", artifactPath: "x" }
    };
    expect(() => validateLedger(bad)).toThrow(ValidationError);
  });
});

describe("validateTaxonomy", () => {
  it("accepts a minimal valid taxonomy", () => {
    const tax = {
      version: 1,
      phases: [{ slug: "foundations", title: "Foundations", order: 1, description: "x", topics: ["auth"] }],
      topics: {
        auth: { slug: "auth", title: "Auth", phase: "foundations", order: 1, summary: "x", prerequisites: [], tags: [], addedByStage0: false }
      }
    };
    expect(() => validateTaxonomy(tax)).not.toThrow();
  });

  it("rejects a slug with uppercase letters", () => {
    const tax = {
      version: 1,
      phases: [{ slug: "Foundations", title: "Foundations", order: 1, description: "x", topics: [] }],
      topics: {}
    };
    expect(() => validateTaxonomy(tax)).toThrow(ValidationError);
  });
});

describe("validateTopicFrontmatter", () => {
  it("accepts null video slots", () => {
    const fm = {
      slug: "auth",
      title: "Auth",
      phase: "foundations",
      order: 1,
      summary: "x",
      definition: "x",
      needsManualPick: false,
      resources: {
        videos: { short: null, long: null },
        articles: [],
        services: [],
        courses: []
      },
      provenance: { researchedAt: "2026-05-13T22:30:00Z", pipelineVersion: 1, rounds: 1, stabilized: false }
    };
    expect(() => validateTopicFrontmatter(fm)).not.toThrow();
  });
});

describe("validateConnections", () => {
  it("accepts a minimal valid connections doc", () => {
    expect(() => validateConnections({ version: 1, edges: [] })).not.toThrow();
  });

  it("rejects edge weight > 1", () => {
    const c = { version: 1, edges: [{ from: "a", to: "b", type: "related", weight: 1.5, reasoning: "x" }] };
    expect(() => validateConnections(c)).toThrow(ValidationError);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test --workspace=pipeline`
Expected: FAIL — module `../lib/validate.js` not found.

- [ ] **Step 3: Implement `pipeline/lib/validate.ts`**

```ts
import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaDir = join(__dirname, "..", "schemas");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadSchema(name: string): object {
  const path = join(schemaDir, `${name}.schema.json`);
  return JSON.parse(readFileSync(path, "utf8"));
}

const validators = {
  ledger: ajv.compile(loadSchema("ledger")),
  taxonomy: ajv.compile(loadSchema("taxonomy")),
  topicFrontmatter: ajv.compile(loadSchema("topic-frontmatter")),
  connections: ajv.compile(loadSchema("connections")),
  exportPayload: ajv.compile(loadSchema("export-payload"))
};

export class ValidationError extends Error {
  constructor(public readonly schemaName: string, public readonly errors: ErrorObject[]) {
    super(`${schemaName} validation failed: ${ajv.errorsText(errors)}`);
    this.name = "ValidationError";
  }
}

function check(name: keyof typeof validators, data: unknown): void {
  const validate = validators[name];
  if (!validate(data)) {
    throw new ValidationError(name, validate.errors ?? []);
  }
}

export function validateLedger(data: unknown): void { check("ledger", data); }
export function validateTaxonomy(data: unknown): void { check("taxonomy", data); }
export function validateTopicFrontmatter(data: unknown): void { check("topicFrontmatter", data); }
export function validateConnections(data: unknown): void { check("connections", data); }
export function validateExportPayload(data: unknown): void { check("exportPayload", data); }
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test --workspace=pipeline`
Expected: 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add pipeline/lib/validate.ts pipeline/tests/validate.test.ts
git commit -m "pipeline/lib: validate against JSON schemas via Ajv"
```

---

### Task 4: Ledger library (`pipeline/lib/ledger.ts`) — TDD

**Files:**
- Create: `pipeline/lib/ledger.ts`
- Create: `pipeline/tests/ledger.test.ts`

- [ ] **Step 1: Write failing test `pipeline/tests/ledger.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createInitialLedger,
  readLedger,
  writeLedger,
  setStageStatus,
  setTopicStageStatus,
  findNextAction
} from "../lib/ledger.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "iceberg-ledger-"));
  return () => rmSync(dir, { recursive: true, force: true });
});

describe("ledger lifecycle", () => {
  it("creates, writes, and reads back an initial ledger", () => {
    const path = join(dir, "_ledger.json");
    const led = createInitialLedger("smoke");
    writeLedger(path, led);
    expect(existsSync(path)).toBe(true);
    const round = readLedger(path);
    expect(round.mode).toBe("smoke");
    expect(round.stages.stage_0_taxonomy.status).toBe("pending");
  });

  it("setStageStatus updates a stage and bumps updatedAt", async () => {
    const path = join(dir, "_ledger.json");
    writeLedger(path, createInitialLedger("smoke"));
    await new Promise(r => setTimeout(r, 10));
    setStageStatus(path, "stage_0_taxonomy", "in_progress");
    const led = readLedger(path);
    expect(led.stages.stage_0_taxonomy.status).toBe("in_progress");
    expect(led.updatedAt).not.toBe(led.createdAt);
  });

  it("setTopicStageStatus initializes a topic entry on first write", () => {
    const path = join(dir, "_ledger.json");
    writeLedger(path, createInitialLedger("smoke"));
    setTopicStageStatus(path, "logging", "reliability", "research", "in_progress", { round: 1 });
    const led = readLedger(path);
    expect(led.topics.logging.phase).toBe("reliability");
    expect(led.topics.logging.stages.research.status).toBe("in_progress");
    expect(led.topics.logging.stages.research.round).toBe(1);
  });

  it("findNextAction returns stage_0 when nothing started", () => {
    const path = join(dir, "_ledger.json");
    writeLedger(path, createInitialLedger("smoke"));
    const next = findNextAction(path);
    expect(next).toEqual({ kind: "stage", name: "stage_0_taxonomy" });
  });

  it("findNextAction returns the first non-completed topic stage", () => {
    const path = join(dir, "_ledger.json");
    writeLedger(path, createInitialLedger("smoke"));
    setStageStatus(path, "stage_0_taxonomy", "completed");
    setTopicStageStatus(path, "logging", "reliability", "research", "completed", { round: 1 });
    setTopicStageStatus(path, "logging", "reliability", "consistency", "pending", {});
    const next = findNextAction(path);
    expect(next).toEqual({ kind: "topic-stage", topic: "logging", stage: "consistency" });
  });

  it("findNextAction returns null when everything is completed and stabilized", () => {
    const path = join(dir, "_ledger.json");
    writeLedger(path, createInitialLedger("smoke"));
    setStageStatus(path, "stage_0_taxonomy", "completed");
    // No topics at all -> done
    const next = findNextAction(path);
    expect(next).toEqual({ kind: "connections" });
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test --workspace=pipeline -- ledger`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `pipeline/lib/ledger.ts`**

```ts
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { validateLedger } from "./validate.js";

export type Status = "pending" | "in_progress" | "completed" | "failed";
export type TopicStage = "research" | "consistency" | "adversarial" | "liveness";

export interface StageEntry {
  status: Status;
  completedAt?: string;
  userApprovedAt?: string;
  artifactPath?: string;
  agentRunIds?: string[];
  failureReason?: string;
}

export interface TopicStageEntry {
  status: Status;
  round?: number;
  agentRunIds?: string[];
  artifactPath?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface TopicEntry {
  phase: string;
  stages: {
    research: TopicStageEntry;
    consistency: TopicStageEntry;
    adversarial: TopicStageEntry;
    liveness: TopicStageEntry;
    stabilized: boolean;
  };
  lastSwapAt: string | null;
  retryCounts: Record<string, number>;
}

export interface Ledger {
  version: 1;
  createdAt: string;
  updatedAt: string;
  currentRound: number;
  mode: "full" | "smoke";
  stages: Record<string, StageEntry> & { stage_0_taxonomy: StageEntry };
  topics: Record<string, TopicEntry>;
  connections: { status: Status; artifactPath: string };
}

export function createInitialLedger(mode: "full" | "smoke"): Ledger {
  const now = new Date().toISOString();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    currentRound: 1,
    mode,
    stages: { stage_0_taxonomy: { status: "pending" } },
    topics: {},
    connections: { status: "pending", artifactPath: "content/_connections.json" }
  };
}

export function readLedger(path: string): Ledger {
  if (!existsSync(path)) {
    throw new Error(`Ledger not found at ${path}`);
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  validateLedger(raw);
  return raw as Ledger;
}

export function writeLedger(path: string, ledger: Ledger): void {
  ledger.updatedAt = new Date().toISOString();
  validateLedger(ledger);
  writeFileSync(path, JSON.stringify(ledger, null, 2) + "\n");
}

export function setStageStatus(
  path: string,
  stage: string,
  status: Status,
  patch: Partial<StageEntry> = {}
): void {
  const led = readLedger(path);
  led.stages[stage] = { ...(led.stages[stage] ?? { status: "pending" }), ...patch, status };
  if (status === "completed" && !led.stages[stage]!.completedAt) {
    led.stages[stage]!.completedAt = new Date().toISOString();
  }
  writeLedger(path, led);
}

export function setTopicStageStatus(
  path: string,
  topic: string,
  phase: string,
  stage: TopicStage,
  status: Status,
  patch: Partial<TopicStageEntry> = {}
): void {
  const led = readLedger(path);
  if (!led.topics[topic]) {
    led.topics[topic] = {
      phase,
      stages: {
        research: { status: "pending" },
        consistency: { status: "pending" },
        adversarial: { status: "pending" },
        liveness: { status: "pending" },
        stabilized: false
      },
      lastSwapAt: null,
      retryCounts: {}
    };
  }
  const entry = led.topics[topic]!;
  entry.stages[stage] = { ...entry.stages[stage], ...patch, status };
  if (status === "completed" && !entry.stages[stage].completedAt) {
    entry.stages[stage].completedAt = new Date().toISOString();
  }
  writeLedger(path, led);
}

export type NextAction =
  | { kind: "stage"; name: string }
  | { kind: "topic-stage"; topic: string; stage: TopicStage }
  | { kind: "connections" }
  | null;

const TOPIC_STAGE_ORDER: TopicStage[] = ["research", "consistency", "adversarial", "liveness"];

export function findNextAction(path: string): NextAction {
  const led = readLedger(path);

  if (led.stages.stage_0_taxonomy.status !== "completed") {
    return { kind: "stage", name: "stage_0_taxonomy" };
  }

  for (const topic of Object.keys(led.topics)) {
    for (const stage of TOPIC_STAGE_ORDER) {
      if (led.topics[topic]!.stages[stage].status !== "completed") {
        return { kind: "topic-stage", topic, stage };
      }
    }
  }

  if (led.connections.status !== "completed") {
    return { kind: "connections" };
  }

  return null;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test --workspace=pipeline -- ledger`
Expected: all ledger tests pass.

- [ ] **Step 5: Commit**

```bash
git add pipeline/lib/ledger.ts pipeline/tests/ledger.test.ts
git commit -m "pipeline/lib: durable ledger with status transitions and findNextAction"
```

---

### Task 5: Content library (`pipeline/lib/content.ts`) — TDD

**Files:**
- Create: `pipeline/lib/content.ts`
- Create: `pipeline/tests/content.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readTopicFile, writeTopicFile, scaffoldTopicStub, parseAllTopics } from "../lib/content.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "iceberg-content-"));
  return () => rmSync(dir, { recursive: true, force: true });
});

describe("topic file IO", () => {
  it("scaffoldTopicStub writes a minimal valid stub", () => {
    const path = join(dir, "foundations", "auth.md");
    scaffoldTopicStub(path, {
      slug: "auth", title: "Auth", phase: "foundations", order: 1, summary: "Verifying who someone is."
    });
    const { frontmatter, body } = readTopicFile(path);
    expect(frontmatter.slug).toBe("auth");
    expect(frontmatter.needsManualPick).toBe(false);
    expect(frontmatter.resources.videos.short).toBeNull();
    expect(body).toContain("user notes");
  });

  it("writeTopicFile preserves body text", () => {
    const path = join(dir, "foundations", "auth.md");
    scaffoldTopicStub(path, { slug: "auth", title: "Auth", phase: "foundations", order: 1, summary: "x" });
    const { frontmatter } = readTopicFile(path);
    writeTopicFile(path, frontmatter, "My personal note about auth.");
    const reread = readTopicFile(path);
    expect(reread.body.trim()).toBe("My personal note about auth.");
  });

  it("parseAllTopics walks a content tree", () => {
    mkdirSync(join(dir, "foundations"), { recursive: true });
    mkdirSync(join(dir, "reliability"), { recursive: true });
    scaffoldTopicStub(join(dir, "foundations", "auth.md"), { slug: "auth", title: "Auth", phase: "foundations", order: 1, summary: "x" });
    scaffoldTopicStub(join(dir, "reliability", "logging.md"), { slug: "logging", title: "Logging", phase: "reliability", order: 1, summary: "x" });
    const topics = parseAllTopics(dir);
    expect(topics.length).toBe(2);
    expect(topics.map(t => t.frontmatter.slug).sort()).toEqual(["auth", "logging"]);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test --workspace=pipeline -- content`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `pipeline/lib/content.ts`**

```ts
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import matter from "gray-matter";
import { validateTopicFrontmatter } from "./validate.js";

export interface TopicFrontmatter {
  slug: string;
  title: string;
  phase: string;
  order: number;
  summary: string;
  definition: string;
  needsManualPick: boolean;
  resources: {
    videos: { short: VideoResource | null; long: VideoResource | null };
    articles: ArticleResource[];
    services: ServiceResource[];
    courses: CourseResource[];
  };
  provenance: {
    researchedAt: string;
    pipelineVersion: number;
    rounds: number;
    stabilized: boolean;
  };
}

export interface VideoResource {
  url: string; title: string; author: string;
  durationMinutes: number; addedAt: string; reasoning: string;
}
export interface ArticleResource {
  url: string; title: string;
  kind: "canonical-doc" | "engineering-blog" | "tutorial";
  reasoning: string;
}
export interface ServiceResource {
  name: string; url: string; category: string; reasoning: string;
}
export interface CourseResource {
  url: string; title: string; provider: string; paid: boolean; reasoning: string;
}

export interface TopicFile {
  frontmatter: TopicFrontmatter;
  body: string;
  path: string;
}

export function readTopicFile(path: string): TopicFile {
  const raw = readFileSync(path, "utf8");
  const parsed = matter(raw);
  validateTopicFrontmatter(parsed.data);
  return { frontmatter: parsed.data as TopicFrontmatter, body: parsed.content, path };
}

export function writeTopicFile(path: string, frontmatter: TopicFrontmatter, body: string): void {
  validateTopicFrontmatter(frontmatter);
  mkdirSync(dirname(path), { recursive: true });
  const serialized = matter.stringify(body, frontmatter);
  writeFileSync(path, serialized);
}

export interface ScaffoldInput {
  slug: string; title: string; phase: string; order: number; summary: string;
}

export function scaffoldTopicStub(path: string, input: ScaffoldInput): void {
  const fm: TopicFrontmatter = {
    slug: input.slug,
    title: input.title,
    phase: input.phase,
    order: input.order,
    summary: input.summary,
    definition: "(pending research)",
    needsManualPick: false,
    resources: { videos: { short: null, long: null }, articles: [], services: [], courses: [] },
    provenance: {
      researchedAt: new Date().toISOString(),
      pipelineVersion: 1,
      rounds: 0,
      stabilized: false
    }
  };
  writeTopicFile(path, fm, "<!-- user notes -->\n");
}

export function parseAllTopics(contentDir: string): TopicFile[] {
  const out: TopicFile[] = [];
  function walk(d: string) {
    for (const entry of readdirSync(d)) {
      if (entry.startsWith("_") || entry.startsWith(".")) continue;
      const full = join(d, entry);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else if (entry.endsWith(".md")) out.push(readTopicFile(full));
    }
  }
  walk(contentDir);
  return out;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test --workspace=pipeline -- content`
Expected: all content tests pass.

- [ ] **Step 5: Commit**

```bash
git add pipeline/lib/content.ts pipeline/tests/content.test.ts
git commit -m "pipeline/lib: topic markdown read/write/scaffold/walk"
```

---

### Task 6: Commit helper (`pipeline/lib/commit.ts`) — TDD

**Files:**
- Create: `pipeline/lib/commit.ts`
- Create: `pipeline/tests/commit.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gitCommit } from "../lib/commit.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "iceberg-commit-"));
  execSync("git init -q -b main", { cwd: dir });
  execSync('git config user.email "test@example.com"', { cwd: dir });
  execSync('git config user.name "Test"', { cwd: dir });
  writeFileSync(join(dir, "seed.txt"), "seed\n");
  execSync("git add . && git commit -q -m seed", { cwd: dir });
  return () => rmSync(dir, { recursive: true, force: true });
});

describe("gitCommit", () => {
  it("stages listed paths and commits with the given message", () => {
    writeFileSync(join(dir, "a.txt"), "hello\n");
    const sha = gitCommit({ cwd: dir, paths: ["a.txt"], message: "test: add a" });
    expect(sha).toMatch(/^[0-9a-f]{7,}$/);
    const log = execSync("git log --oneline", { cwd: dir }).toString();
    expect(log).toContain("test: add a");
  });

  it("returns null when there is nothing to commit", () => {
    const sha = gitCommit({ cwd: dir, paths: ["seed.txt"], message: "noop" });
    expect(sha).toBeNull();
  });

  it("throws on git failure", () => {
    expect(() => gitCommit({ cwd: dir, paths: ["does-not-exist.txt"], message: "x" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm run test --workspace=pipeline -- commit`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `pipeline/lib/commit.ts`**

```ts
import { execSync } from "node:child_process";

export interface GitCommitInput {
  cwd: string;
  paths: string[];
  message: string;
}

export function gitCommit(input: GitCommitInput): string | null {
  for (const p of input.paths) {
    execSync(`git add -- ${shellEscape(p)}`, { cwd: input.cwd, stdio: "pipe" });
  }
  const status = execSync("git status --porcelain", { cwd: input.cwd }).toString().trim();
  if (status === "") return null;

  execSync(`git commit -m ${shellEscape(input.message)}`, { cwd: input.cwd, stdio: "pipe" });
  const sha = execSync("git rev-parse --short HEAD", { cwd: input.cwd }).toString().trim();
  return sha;
}

function shellEscape(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm run test --workspace=pipeline -- commit`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add pipeline/lib/commit.ts pipeline/tests/commit.test.ts
git commit -m "pipeline/lib: gitCommit helper with idempotent staging"
```

---

### Task 7: Smoke taxonomy and seed data

**Files:**
- Create: `pipeline/smoke-taxonomy.json`

- [ ] **Step 1: Write `pipeline/smoke-taxonomy.json`**

```json
{
  "version": 1,
  "phases": [
    {
      "slug": "foundations",
      "title": "Foundations",
      "order": 1,
      "description": "What every production app needs from day one.",
      "topics": ["authentication"]
    },
    {
      "slug": "reliability",
      "title": "Reliability",
      "order": 2,
      "description": "Keeping the app up and answering questions about what it did.",
      "topics": ["logging"]
    }
  ],
  "topics": {
    "authentication": {
      "slug": "authentication",
      "title": "Authentication",
      "phase": "foundations",
      "order": 1,
      "summary": "Verifying who a user is — passwords, sessions, tokens, SSO, MFA.",
      "prerequisites": [],
      "tags": ["security", "identity"],
      "addedByStage0": false
    },
    "logging": {
      "slug": "logging",
      "title": "Logging",
      "phase": "reliability",
      "order": 1,
      "summary": "Recording what your application did, so you can answer questions about it later.",
      "prerequisites": [],
      "tags": ["observability"],
      "addedByStage0": false
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/smoke-taxonomy.json
git commit -m "pipeline: 2-topic smoke taxonomy"
```

---

### Task 8: Sub-agent prompt — Stage 0 taxonomy proposer

**Files:**
- Create: `pipeline/prompts/stage_0_taxonomy_proposer.md`

- [ ] **Step 1: Write the prompt**

```markdown
# Stage 0 — Taxonomy Proposer

## ROLE
You are a senior staff engineer designing a curriculum for "production-readiness"
topics — the things that distinguish a deployed MVP from a real production app.

## INPUT
The "Vibe Coding vs Production Reality" iceberg image text:

```
Authentication, Payments, Billing logic, Subscription states, CRUD logic,
Access control, Data integrity, Scalability, Latency optimization,
Load balancing, Logging, Alerting, Incident response, Disaster recovery,
Data retention, GDPR/CCPA, Rate limiting, CI/CD, Environments, Rollbacks,
Feature flags, Test coverage, Instrumentation, Conversion, Retention,
Churn control, Cloud costs, Multi-region support, Idempotency,
Support ops, Escalations, Governance, Platform support, Adtech, Cookies,
Secrets management, Documentation, A/B testing, Vendor lock-in
```

## TASK
1. Propose a taxonomy of phases and topics for this curriculum.
2. Each phase is a coherent group (~5-8 topics). Phases are ordered for learning.
3. Each topic gets: slug (lowercase-kebab), title, phase, order within phase,
   one-sentence summary, prerequisite topic slugs (can be empty), tags.
4. You MUST add 3-7 topics that are NOT in the iceberg image but ARE essential
   for production-readiness (e.g., observability/tracing, queues, caching,
   schema migrations, secrets rotation, on-call rotations, SLOs/SLIs,
   blue-green/canary deploy, error budgets, backpressure, dead-letter queues).
   Mark these with `addedByStage0: true`. Justify each addition in `reasoning`.
5. You MAY merge or drop topics from the image if redundant, but justify it.

## CONSTRAINTS
- Slugs MUST match `^[a-z][a-z0-9-]*$`.
- Every topic listed in a phase's `topics` array MUST exist as a key in `topics`.
- Every topic's `phase` field MUST equal a `slug` in the `phases` array.
- 5-8 phases total. 30-45 topics total.
- Do NOT invent resources, URLs, or services. Only taxonomy structure.

## OUTPUT
Return ONLY a JSON object matching this schema:

```jsonc
{
  "proposalId": "uuid-or-timestamp-string-you-pick",
  "reasoning": "1-2 paragraphs explaining your overall structure",
  "additions": [
    { "slug": "...", "reasoning": "why this should be added beyond the image" }
  ],
  "removals": [
    { "slug": "...", "reasoning": "why dropped" }
  ],
  "taxonomy": {
    "version": 1,
    "phases": [...],
    "topics": {...}
  }
}
```

The `taxonomy` object MUST validate against `pipeline/schemas/taxonomy.schema.json`.
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/prompts/stage_0_taxonomy_proposer.md
git commit -m "prompts: stage 0 taxonomy proposer"
```

---

### Task 9: Sub-agent prompt — Stage 0 synthesizer

**Files:**
- Create: `pipeline/prompts/stage_0_taxonomy_synthesizer.md`

- [ ] **Step 1: Write the prompt**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/prompts/stage_0_taxonomy_synthesizer.md
git commit -m "prompts: stage 0 taxonomy synthesizer"
```

---

### Task 10: Sub-agent prompts — research, tiebreaker, challenger, judge

**Files:**
- Create: `pipeline/prompts/stage_1_researcher.md`
- Create: `pipeline/prompts/stage_2_tiebreaker.md`
- Create: `pipeline/prompts/stage_3_challenger.md`
- Create: `pipeline/prompts/stage_3_judge.md`

- [ ] **Step 1: Write `stage_1_researcher.md`**

```markdown
# Stage 1 — Researcher

## ROLE
You research learning resources for a single production-readiness topic.

## INPUT
```jsonc
{ "slug": "logging", "title": "Logging", "summary": "...", "phase": "reliability" }
```

## TASK
Find and propose:
- exactly 1 SHORT YouTube video (5-15 min) explaining the concept for beginners
- exactly 1 LONG YouTube video (25-90 min) going deeper
- 2-3 canonical articles or official docs
- 3-5 representative services / tools / platforms in this space
- 1-2 deeper courses (paid OK; mark `paid`)
- a 2-3 paragraph plain-English `definition`

Provide a `reasoning` sentence for EVERY pick.

## CONSTRAINTS
- Slugs and frontmatter MUST validate against
  `pipeline/schemas/topic-frontmatter.schema.json`.
- YouTube videos: must be from verified or clearly credible channels;
  prefer ≥50k views; URL must be `https://www.youtube.com/watch?v=...` or
  `https://youtu.be/...`.
- No Medium posts unless author is identifiable AND credible (engineer at a
  known company, recognized author).
- Service URLs MUST be canonical home pages. No affiliate links, no tracking
  parameters.
- If you cannot find a credible pick for a slot, return `null` for that slot
  with `reasoning: "no credible pick found"`. Do not invent.

## OUTPUT
A JSON object shaped exactly like the `resources` and `definition` blocks of
`topic-frontmatter.schema.json`, plus a top-level `agentId` string:

```jsonc
{
  "agentId": "...",
  "definition": "...",
  "resources": {
    "videos": { "short": { ... } | null, "long": { ... } | null },
    "articles": [ ... ],
    "services": [ ... ],
    "courses": [ ... ]
  }
}
```
```

- [ ] **Step 2: Write `stage_2_tiebreaker.md`**

```markdown
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
```

- [ ] **Step 3: Write `stage_3_challenger.md`**

```markdown
# Stage 3 — Challenger

## ROLE
You try to beat the current consensus pick for ONE slot of ONE topic.
Only propose an alternative if it is strictly better. Otherwise return null.

## INPUT
```jsonc
{
  "slug": "logging",
  "slotPath": "resources.articles[0]",
  "current": { ... current pick with reasoning ... },
  "topicContext": { "summary": "...", "definition": "..." }
}
```

## TASK
Search for alternatives. Apply a high bar: only return a challenge if the
alternative is meaningfully more canonical, more authoritative, more current,
or more pedagogically useful for someone learning the topic.

## CONSTRAINTS
- Same source-quality rules as stage_1_researcher.md.
- Do NOT challenge for the sake of challenging. Most calls should return
  `{ "challenge": null }`.

## OUTPUT
```jsonc
{
  "challenge": { ... new resource shaped like the slot ... } | null,
  "reasoning": "why this is strictly better, OR why no challenge"
}
```
```

- [ ] **Step 4: Write `stage_3_judge.md`**

```markdown
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
```

- [ ] **Step 5: Commit**

```bash
git add pipeline/prompts/stage_1_researcher.md pipeline/prompts/stage_2_tiebreaker.md pipeline/prompts/stage_3_challenger.md pipeline/prompts/stage_3_judge.md
git commit -m "prompts: research, tiebreaker, challenger, judge"
```

---

### Task 11: Sub-agent prompts — liveness and connections

**Files:**
- Create: `pipeline/prompts/stage_4_liveness.md`
- Create: `pipeline/prompts/stage_5_connections.md`

- [ ] **Step 1: Write `stage_4_liveness.md`**

```markdown
# Stage 4 — Liveness & Freshness

## ROLE
Verify a batch of URLs are reachable and the content is still relevant.

## INPUT
```jsonc
{
  "items": [
    { "slug": "logging", "slotPath": "resources.videos.long", "url": "https://..." }
  ]
}
```

## TASK
For each item:
1. Use WebFetch to confirm the URL resolves.
2. For YouTube URLs: confirm the video is public and not deleted.
3. For articles: confirm the page loads and is not a 404.
4. For services: confirm the home page loads.

## CONSTRAINTS
- Do NOT re-evaluate quality. Only check liveness + obvious staleness.
- "Staleness" = page explicitly marked deprecated/archived, OR for articles,
  a published date older than 5 years on rapidly-evolving topics.

## OUTPUT
```jsonc
{
  "results": [
    {
      "slug": "logging",
      "slotPath": "resources.videos.long",
      "url": "...",
      "status": "alive" | "dead" | "changed",
      "evidence": "one-line summary of what was found"
    }
  ]
}
```
```

- [ ] **Step 2: Write `stage_5_connections.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add pipeline/prompts/stage_4_liveness.md pipeline/prompts/stage_5_connections.md
git commit -m "prompts: liveness, connections"
```

---

### Task 12: The runbook (`pipeline/runbook.md`)

**Files:**
- Create: `pipeline/runbook.md`

- [ ] **Step 1: Write the runbook**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/runbook.md
git commit -m "pipeline: runbook FSM with resume protocol"
```

---

### Task 13: build-content script

**Files:**
- Create: `pipeline/scripts/build-content.ts`

- [ ] **Step 1: Write the script**

```ts
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAllTopics } from "../lib/content.js";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");

const mode = process.env.ICEBERG_MODE === "smoke" ? "smoke" : "full";
const contentDir = mode === "smoke" ? join(repoRoot, "content-smoke") : join(repoRoot, "content");

if (!existsSync(contentDir)) {
  console.error(`Content dir ${contentDir} does not exist. Run the pipeline first.`);
  process.exit(1);
}

const taxonomyPath = join(contentDir, "_taxonomy.json");
const connectionsPath = join(contentDir, "_connections.json");

const taxonomy = existsSync(taxonomyPath) ? JSON.parse(readFileSync(taxonomyPath, "utf8")) : null;
const connections = existsSync(connectionsPath) ? JSON.parse(readFileSync(connectionsPath, "utf8")) : { version: 1, edges: [] };

const topics = parseAllTopics(contentDir);

const bundle = {
  generatedAt: new Date().toISOString(),
  mode,
  taxonomy,
  connections,
  topics: topics.map(t => ({ frontmatter: t.frontmatter, body: t.body }))
};

const out = join(repoRoot, "app", "src", "content", "topics.generated.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(bundle, null, 2) + "\n");

console.log(`Wrote ${topics.length} topics to ${out}`);
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/scripts/build-content.ts
git commit -m "pipeline: build-content script bundles content/ into app JSON"
```

---

### Task 14: Smoke run end-to-end

This task is **executed manually** by you (Claude) following the runbook. It is not a code change task.

- [ ] **Step 1: Set ICEBERG_MODE=smoke in your shell**

```bash
export ICEBERG_MODE=smoke
```

- [ ] **Step 2: Open `pipeline/runbook.md` and follow it**

Smoke skips Stage 0a-0d (uses `pipeline/smoke-taxonomy.json` directly).
Execute Stage 0e → 1 → 2 → 3 → 4 → 5 → 6 against the 2-topic smoke taxonomy.

- [ ] **Step 3: Verify smoke output**

```bash
ls content-smoke/
cat content-smoke/_ledger.smoke.json | jq '.topics | keys'
cat content-smoke/_connections.json | jq '.edges | length'
```

Expected: 2 topic files exist with populated `resources` blocks, ledger shows all topics `stabilized: true`, at least 1 connection edge.

- [ ] **Step 4: Run build-content against smoke output**

```bash
ICEBERG_MODE=smoke npm run build:content
```

Verify `app/src/content/topics.generated.json` is created with 2 topics.

- [ ] **Step 5: Commit smoke output**

```bash
git add content-smoke/  # if not gitignored — adjust .gitignore if you want to keep it
# OR leave smoke output uncommitted (default — content-smoke/ is gitignored)
git commit --allow-empty -m "pipeline: smoke run validated end-to-end"
```

---

### Task 15: Stage 0 user-gate execution (full mode)

- [ ] **Step 1: Set ICEBERG_MODE=full**

```bash
unset ICEBERG_MODE  # or: export ICEBERG_MODE=full
```

- [ ] **Step 2: Execute runbook Stage 0a-0c**

Following `pipeline/runbook.md`, dispatch the 3 taxonomy proposers and the synthesizer. The synthesizer writes `content/_taxonomy.candidate.json`.

- [ ] **Step 3: User review gate**

Print to the user:
> Stage 0 candidate taxonomy is at `content/_taxonomy.candidate.json`. Review it and either edit in place + rename to `_taxonomy.json`, or tell me what to change. Pipeline is paused.

WAIT for user.

- [ ] **Step 4: On user approval, commit**

```bash
git add content/_taxonomy.json
git rm content/_taxonomy.candidate.json
git commit -m "stage 0: taxonomy approved by user"
```

- [ ] **Step 5: Execute Stage 0e (scaffold)**

Per runbook. Commit: `"stage 0: scaffold N topic stubs"`.

---

### Task 16: Full pipeline run (Stages 1-6)

- [ ] **Step 1: Begin from current ledger state**

Following `pipeline/runbook.md`. Dispatch in batches of 5 topics; on each batch completion, validate, write, commit.

- [ ] **Step 2: Resume on interruption**

If the session ends, simply re-open Claude Code in this repo and say "continue the iceberg pipeline." Claude reads the runbook and the ledger and picks up.

- [ ] **Step 3: Final commit**

After `findNextAction()` returns `null`:

```bash
git log --oneline | head -30  # sanity check the history
git commit --allow-empty -m "pipeline: full run complete"
```

---

### Task 17: Build content bundle

- [ ] **Step 1: Run build-content**

```bash
npm run build:content
```

- [ ] **Step 2: Verify**

```bash
cat app/src/content/topics.generated.json | jq '.topics | length'
```

Expected: matches taxonomy topic count.

- [ ] **Step 3: No commit needed** (file is gitignored).

---

### Task 18: Pipeline lib README

**Files:**
- Create: `pipeline/README.md`

- [ ] **Step 1: Write pipeline README**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add pipeline/README.md
git commit -m "pipeline: README"
```

---

## Phase B — Web App

Phase B is more conventional. Tasks 19-32 build the static React app against the bundle produced in Phase A. Tasks here describe components and key files; for routine React work the engineer fills in the standard pieces.

### Task 19: Vite + Tailwind scaffold

**Files:**
- Create: `app/index.html`
- Create: `app/vite.config.ts`
- Create: `app/postcss.config.js`
- Create: `app/tailwind.config.ts`
- Create: `app/src/main.tsx`
- Create: `app/src/App.tsx`
- Create: `app/src/styles/index.css`
- Create: `app/src/styles/tokens.css`

- [ ] **Step 1: Write `app/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>iceberg — production-readiness curriculum</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Write `app/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist", sourcemap: true }
});
```

- [ ] **Step 3: Write `app/postcss.config.js`**

```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

- [ ] **Step 4: Write `app/tailwind.config.ts`** mapping DESIGN.md tokens

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#201d1d",
        "ink-deep": "#0f0000",
        charcoal: "#302c2c",
        body: "#424245",
        mute: "#646262",
        stone: "#6e6e73",
        ash: "#9a9898",
        canvas: "#fdfcfc",
        "surface-soft": "#f8f7f7",
        "surface-card": "#f1eeee",
        "surface-dark": "#201d1d",
        "surface-dark-elev": "#302c2c",
        hairline: "rgba(15,0,0,0.12)",
        "hairline-strong": "#646262",
        accent: "#007aff",
        danger: "#ff3b30",
        warning: "#ff9f0a",
        success: "#30d158"
      },
      fontFamily: {
        mono: ['"Berkeley Mono"', '"JetBrains Mono"', '"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      fontSize: {
        "display-xl": ["38px", { lineHeight: "1.5", fontWeight: "700" }],
        "heading-md": ["16px", { lineHeight: "1.5", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-strong": ["16px", { lineHeight: "1.5", fontWeight: "500" }],
        "caption-md": ["14px", { lineHeight: "2", fontWeight: "400" }]
      },
      spacing: { section: "96px" },
      borderRadius: { sm: "4px" }
    }
  }
} satisfies Config;
```

- [ ] **Step 5: Write `app/src/styles/index.css`**

```css
@import "@fontsource/jetbrains-mono/400.css";
@import "@fontsource/jetbrains-mono/500.css";
@import "@fontsource/jetbrains-mono/700.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { background: theme(colors.canvas); color: theme(colors.ink); }
  body { font-family: theme(fontFamily.mono); }
  a { color: theme(colors.ink); text-decoration: underline; }
}
```

- [ ] **Step 6: Write `app/src/styles/tokens.css`** (CSS vars for spacing/etc, if referenced from non-Tailwind code — empty for now)

```css
/* CSS variables mirroring DESIGN.md tokens. Add as needed. */
:root {
  --color-canvas: #fdfcfc;
  --color-ink: #201d1d;
  --color-hairline: rgba(15, 0, 0, 0.12);
}
```

- [ ] **Step 7: Write `app/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App.js";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 8: Write `app/src/App.tsx`** (placeholder router; routes added in later tasks)

```tsx
import { Routes, Route } from "react-router-dom";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 font-mono">iceberg — pre-content</div>} />
    </Routes>
  );
}
```

- [ ] **Step 9: Verify `npm run dev` boots**

```bash
npm run dev
```

Open `http://localhost:5173`. Expected: `iceberg — pre-content` rendered in JetBrains Mono on cream canvas.

- [ ] **Step 10: Commit**

```bash
git add app/
git commit -m "app: vite + tailwind + react scaffold, DESIGN.md tokens"
```

---

### Task 20: Content loader (`app/src/content/index.ts`)

**Files:**
- Create: `app/src/content/index.ts`
- Create: `app/src/content/types.ts`

- [ ] **Step 1: Write `app/src/content/types.ts`**

```ts
import { z } from "zod";

export const VideoResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  author: z.string(),
  durationMinutes: z.number().int().positive(),
  addedAt: z.string(),
  reasoning: z.string()
});
export type VideoResource = z.infer<typeof VideoResourceSchema>;

export const ArticleResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  kind: z.enum(["canonical-doc", "engineering-blog", "tutorial"]),
  reasoning: z.string()
});

export const ServiceResourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  category: z.string(),
  reasoning: z.string()
});

export const CourseResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  provider: z.string(),
  paid: z.boolean(),
  reasoning: z.string()
});

export const TopicFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  phase: z.string(),
  order: z.number().int(),
  summary: z.string(),
  definition: z.string(),
  needsManualPick: z.boolean(),
  resources: z.object({
    videos: z.object({ short: VideoResourceSchema.nullable(), long: VideoResourceSchema.nullable() }),
    articles: z.array(ArticleResourceSchema),
    services: z.array(ServiceResourceSchema),
    courses: z.array(CourseResourceSchema)
  }),
  provenance: z.object({
    researchedAt: z.string(),
    pipelineVersion: z.number().int(),
    rounds: z.number().int(),
    stabilized: z.boolean()
  })
});
export type TopicFrontmatter = z.infer<typeof TopicFrontmatterSchema>;

export const ConnectionEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["prerequisite", "related", "often-confused-with", "pairs-with"]),
  weight: z.number().min(0).max(1),
  reasoning: z.string()
});
export type ConnectionEdge = z.infer<typeof ConnectionEdgeSchema>;

export const TaxonomySchema = z.object({
  version: z.literal(1),
  phases: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    order: z.number().int(),
    description: z.string(),
    topics: z.array(z.string())
  })),
  topics: z.record(z.object({
    slug: z.string(),
    title: z.string(),
    phase: z.string(),
    order: z.number().int(),
    summary: z.string(),
    prerequisites: z.array(z.string()),
    tags: z.array(z.string()),
    addedByStage0: z.boolean()
  }))
});
export type Taxonomy = z.infer<typeof TaxonomySchema>;
```

- [ ] **Step 2: Write `app/src/content/index.ts`**

```ts
import bundle from "./topics.generated.json";
import { TopicFrontmatterSchema, TaxonomySchema, ConnectionEdgeSchema, type TopicFrontmatter, type Taxonomy, type ConnectionEdge } from "./types.js";
import { z } from "zod";

const BundleSchema = z.object({
  generatedAt: z.string(),
  mode: z.enum(["full", "smoke"]),
  taxonomy: TaxonomySchema.nullable(),
  connections: z.object({ version: z.literal(1), edges: z.array(ConnectionEdgeSchema) }),
  topics: z.array(z.object({ frontmatter: TopicFrontmatterSchema, body: z.string() }))
});

const parsed = BundleSchema.parse(bundle);

export const taxonomy: Taxonomy | null = parsed.taxonomy;
export const connections: ConnectionEdge[] = parsed.connections.edges;
export const topics: { frontmatter: TopicFrontmatter; body: string }[] = parsed.topics;

export function getTopic(slug: string) {
  return topics.find(t => t.frontmatter.slug === slug);
}
export function getPhase(slug: string) {
  return taxonomy?.phases.find(p => p.slug === slug);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/src/content/
git commit -m "app: content bundle loader with Zod runtime validation"
```

---

### Task 21: Store interfaces and localStorage implementations

**Files:**
- Create: `app/src/stores/types.ts`
- Create: `app/src/stores/ProgressStore.ts`
- Create: `app/src/stores/LocalStorageProgressStore.ts`
- Create: `app/src/stores/BookmarkStore.ts`
- Create: `app/src/stores/LocalStorageBookmarkStore.ts`
- Create: `app/src/stores/NotesStore.ts`
- Create: `app/src/stores/LocalStorageNotesStore.ts`
- Create: `app/src/stores/index.ts`

- [ ] **Step 1: Write `app/src/stores/types.ts`**

```ts
export interface TopicProgress {
  resources: Record<string, boolean>;
  completed: boolean;
  lastTouchedAt: string | null;
}
export interface OverallProgress {
  totalTopics: number;
  completedTopics: number;
  resourcesCompleted: number;
  resourcesTotal: number;
}
export interface Bookmark {
  topic: string;
  resource?: string;
  addedAt: string;
}
export interface ExportPayload {
  format: "iceberg-progress";
  version: 1;
  exportedAt: string;
  data: {
    progress: Record<string, TopicProgress>;
    bookmarks: Bookmark[];
    notes: Record<string, string>;
  };
}
export interface ImportResult {
  topicsMerged: number;
  bookmarksMerged: number;
  notesMerged: number;
  conflicts: string[];
}
```

- [ ] **Step 2: Write `app/src/stores/ProgressStore.ts`** (interface only)

```ts
import type { TopicProgress, OverallProgress, ExportPayload, ImportResult } from "./types.js";

export interface ProgressStore {
  getTopicProgress(slug: string): TopicProgress;
  setResourceChecked(topicSlug: string, resourceKey: string, checked: boolean): void;
  markTopicComplete(slug: string): void;
  unmarkTopicComplete(slug: string): void;
  getOverallProgress(totalResourcesPerTopic: Record<string, number>): OverallProgress;
  getLastTouchedTopic(): string | null;
  subscribe(listener: () => void): () => void;
  exportData(): ExportPayload["data"]["progress"];
  importData(data: ExportPayload["data"]["progress"], mode: "merge" | "replace"): ImportResult;
}
```

- [ ] **Step 3: Write `app/src/stores/LocalStorageProgressStore.ts`**

```ts
import type { ProgressStore } from "./ProgressStore.js";
import type { TopicProgress, OverallProgress, ImportResult } from "./types.js";

const KEY = "iceberg.v1.progress";

interface Snapshot {
  topics: Record<string, TopicProgress>;
}

function readSnapshot(): Snapshot {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { topics: {} };
  try { return JSON.parse(raw) as Snapshot; } catch { return { topics: {} }; }
}
function writeSnapshot(s: Snapshot) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export class LocalStorageProgressStore implements ProgressStore {
  private listeners = new Set<() => void>();

  private emit() { for (const l of this.listeners) l(); }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  getTopicProgress(slug: string): TopicProgress {
    return readSnapshot().topics[slug] ?? { resources: {}, completed: false, lastTouchedAt: null };
  }

  setResourceChecked(topicSlug: string, resourceKey: string, checked: boolean): void {
    const snap = readSnapshot();
    const cur = snap.topics[topicSlug] ?? { resources: {}, completed: false, lastTouchedAt: null };
    cur.resources[resourceKey] = checked;
    cur.lastTouchedAt = new Date().toISOString();
    snap.topics[topicSlug] = cur;
    writeSnapshot(snap);
    this.emit();
  }

  markTopicComplete(slug: string): void {
    const snap = readSnapshot();
    const cur = snap.topics[slug] ?? { resources: {}, completed: false, lastTouchedAt: null };
    cur.completed = true;
    cur.lastTouchedAt = new Date().toISOString();
    snap.topics[slug] = cur;
    writeSnapshot(snap);
    this.emit();
  }

  unmarkTopicComplete(slug: string): void {
    const snap = readSnapshot();
    const cur = snap.topics[slug];
    if (!cur) return;
    cur.completed = false;
    cur.lastTouchedAt = new Date().toISOString();
    writeSnapshot(snap);
    this.emit();
  }

  getOverallProgress(totalResourcesPerTopic: Record<string, number>): OverallProgress {
    const snap = readSnapshot();
    const slugs = Object.keys(totalResourcesPerTopic);
    let completedTopics = 0;
    let resourcesCompleted = 0;
    let resourcesTotal = 0;
    for (const slug of slugs) {
      const t = snap.topics[slug];
      resourcesTotal += totalResourcesPerTopic[slug] ?? 0;
      if (t) {
        if (t.completed) completedTopics++;
        resourcesCompleted += Object.values(t.resources).filter(Boolean).length;
      }
    }
    return { totalTopics: slugs.length, completedTopics, resourcesCompleted, resourcesTotal };
  }

  getLastTouchedTopic(): string | null {
    const snap = readSnapshot();
    let best: { slug: string; at: string } | null = null;
    for (const [slug, t] of Object.entries(snap.topics)) {
      if (t.lastTouchedAt && (!best || t.lastTouchedAt > best.at)) {
        best = { slug, at: t.lastTouchedAt };
      }
    }
    return best?.slug ?? null;
  }

  exportData() { return readSnapshot().topics; }

  importData(data: Record<string, TopicProgress>, mode: "merge" | "replace"): ImportResult {
    const conflicts: string[] = [];
    if (mode === "replace") {
      writeSnapshot({ topics: { ...data } });
      this.emit();
      return { topicsMerged: Object.keys(data).length, bookmarksMerged: 0, notesMerged: 0, conflicts };
    }
    const snap = readSnapshot();
    let merged = 0;
    for (const [slug, incoming] of Object.entries(data)) {
      const cur = snap.topics[slug];
      if (!cur) { snap.topics[slug] = incoming; merged++; continue; }
      const mergedResources = { ...cur.resources };
      for (const [k, v] of Object.entries(incoming.resources)) {
        if (v) mergedResources[k] = true;
      }
      snap.topics[slug] = {
        resources: mergedResources,
        completed: cur.completed || incoming.completed,
        lastTouchedAt:
          (incoming.lastTouchedAt && (!cur.lastTouchedAt || incoming.lastTouchedAt > cur.lastTouchedAt))
            ? incoming.lastTouchedAt
            : cur.lastTouchedAt
      };
      merged++;
    }
    writeSnapshot(snap);
    this.emit();
    return { topicsMerged: merged, bookmarksMerged: 0, notesMerged: 0, conflicts };
  }
}
```

- [ ] **Step 4: Write `BookmarkStore.ts` + `LocalStorageBookmarkStore.ts`** following the same pattern

```ts
// app/src/stores/BookmarkStore.ts
import type { Bookmark, ExportPayload, ImportResult } from "./types.js";
export interface BookmarkStore {
  isBookmarked(topicSlug: string, resourceKey?: string): boolean;
  toggle(topicSlug: string, resourceKey?: string): void;
  list(): Bookmark[];
  subscribe(listener: () => void): () => void;
  exportData(): Bookmark[];
  importData(data: Bookmark[], mode: "merge" | "replace"): ImportResult;
}
```

```ts
// app/src/stores/LocalStorageBookmarkStore.ts
import type { BookmarkStore } from "./BookmarkStore.js";
import type { Bookmark, ImportResult } from "./types.js";

const KEY = "iceberg.v1.bookmarks";

function read(): Bookmark[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Bookmark[]; } catch { return []; }
}
function write(list: Bookmark[]) { localStorage.setItem(KEY, JSON.stringify(list)); }

function keyOf(b: Bookmark) { return `${b.topic}::${b.resource ?? ""}`; }

export class LocalStorageBookmarkStore implements BookmarkStore {
  private listeners = new Set<() => void>();
  private emit() { for (const l of this.listeners) l(); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }

  isBookmarked(topic: string, resource?: string) {
    return read().some(b => b.topic === topic && b.resource === resource);
  }
  toggle(topic: string, resource?: string) {
    const list = read();
    const k = keyOf({ topic, resource, addedAt: "" });
    const idx = list.findIndex(b => keyOf(b) === k);
    if (idx === -1) list.push({ topic, resource, addedAt: new Date().toISOString() });
    else list.splice(idx, 1);
    write(list);
    this.emit();
  }
  list() { return read(); }
  exportData() { return read(); }
  importData(data: Bookmark[], mode: "merge" | "replace"): ImportResult {
    if (mode === "replace") {
      write([...data]); this.emit();
      return { topicsMerged: 0, bookmarksMerged: data.length, notesMerged: 0, conflicts: [] };
    }
    const cur = read();
    const seen = new Set(cur.map(keyOf));
    let added = 0;
    for (const b of data) if (!seen.has(keyOf(b))) { cur.push(b); added++; }
    write(cur); this.emit();
    return { topicsMerged: 0, bookmarksMerged: added, notesMerged: 0, conflicts: [] };
  }
}
```

- [ ] **Step 5: Write `NotesStore.ts` + `LocalStorageNotesStore.ts`**

```ts
// app/src/stores/NotesStore.ts
import type { ImportResult } from "./types.js";
export interface NotesStore {
  get(topicSlug: string): string;
  set(topicSlug: string, body: string): void;
  subscribe(listener: () => void): () => void;
  exportData(): Record<string, string>;
  importData(data: Record<string, string>, mode: "merge" | "replace"): ImportResult;
}
```

```ts
// app/src/stores/LocalStorageNotesStore.ts
import type { NotesStore } from "./NotesStore.js";
import type { ImportResult } from "./types.js";

const KEY = "iceberg.v1.notes";

function read(): Record<string, string> {
  const raw = localStorage.getItem(KEY);
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, string>; } catch { return {}; }
}
function write(d: Record<string, string>) { localStorage.setItem(KEY, JSON.stringify(d)); }

export class LocalStorageNotesStore implements NotesStore {
  private listeners = new Set<() => void>();
  private emit() { for (const l of this.listeners) l(); }
  subscribe(l: () => void) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  get(slug: string) { return read()[slug] ?? ""; }
  set(slug: string, body: string) {
    const cur = read(); cur[slug] = body; write(cur); this.emit();
  }
  exportData() { return read(); }
  importData(data: Record<string, string>, mode: "merge" | "replace"): ImportResult {
    const conflicts: string[] = [];
    if (mode === "replace") {
      write({ ...data }); this.emit();
      return { topicsMerged: 0, bookmarksMerged: 0, notesMerged: Object.keys(data).length, conflicts };
    }
    const cur = read();
    let merged = 0;
    for (const [slug, body] of Object.entries(data)) {
      if (cur[slug] && cur[slug] !== body) conflicts.push(slug);
      cur[slug] = body;
      merged++;
    }
    write(cur); this.emit();
    return { topicsMerged: 0, bookmarksMerged: 0, notesMerged: merged, conflicts };
  }
}
```

- [ ] **Step 6: Write `app/src/stores/index.ts`**

```ts
import { LocalStorageProgressStore } from "./LocalStorageProgressStore.js";
import { LocalStorageBookmarkStore } from "./LocalStorageBookmarkStore.js";
import { LocalStorageNotesStore } from "./LocalStorageNotesStore.js";

export const progressStore = new LocalStorageProgressStore();
export const bookmarkStore = new LocalStorageBookmarkStore();
export const notesStore = new LocalStorageNotesStore();
```

- [ ] **Step 7: Commit**

```bash
git add app/src/stores/
git commit -m "app: store interfaces + localStorage impls for progress/bookmarks/notes"
```

---

### Task 22: Hooks (`app/src/hooks/`)

**Files:**
- Create: `app/src/hooks/useStoreSubscription.ts`
- Create: `app/src/hooks/useTopicProgress.ts`
- Create: `app/src/hooks/useBookmark.ts`
- Create: `app/src/hooks/useNotes.ts`

- [ ] **Step 1: Write `useStoreSubscription.ts`**

```ts
import { useSyncExternalStore } from "react";

export function useStoreSubscription<T>(
  subscribe: (l: () => void) => () => void,
  getSnapshot: () => T
): T {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

- [ ] **Step 2: Write `useTopicProgress.ts`**

```ts
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "./useStoreSubscription.js";

export function useTopicProgress(slug: string) {
  return useStoreSubscription(
    l => progressStore.subscribe(l),
    () => progressStore.getTopicProgress(slug)
  );
}
```

- [ ] **Step 3: Write `useBookmark.ts`**

```ts
import { bookmarkStore } from "../stores/index.js";
import { useStoreSubscription } from "./useStoreSubscription.js";

export function useBookmark(topic: string, resource?: string) {
  const isBookmarked = useStoreSubscription(
    l => bookmarkStore.subscribe(l),
    () => bookmarkStore.isBookmarked(topic, resource)
  );
  return { isBookmarked, toggle: () => bookmarkStore.toggle(topic, resource) };
}
```

- [ ] **Step 4: Write `useNotes.ts`**

```ts
import { notesStore } from "../stores/index.js";
import { useStoreSubscription } from "./useStoreSubscription.js";

export function useNotes(slug: string) {
  const body = useStoreSubscription(
    l => notesStore.subscribe(l),
    () => notesStore.get(slug)
  );
  return { body, set: (b: string) => notesStore.set(slug, b) };
}
```

- [ ] **Step 5: Commit**

```bash
git add app/src/hooks/
git commit -m "app: hooks for store subscriptions"
```

---

### Task 23: Layout primitives (DESIGN.md compliant)

**Files:**
- Create: `app/src/components/layout/Section.tsx`
- Create: `app/src/components/layout/HairlineRule.tsx`
- Create: `app/src/components/layout/BracketList.tsx`
- Create: `app/src/components/layout/ListRow.tsx`
- Create: `app/src/components/layout/PrimaryNav.tsx`
- Create: `app/src/components/layout/Footer.tsx`
- Create: `app/src/components/layout/Page.tsx`

- [ ] **Step 1: `Section.tsx`**

```tsx
export function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <section className="mt-section first:mt-0">
      {label && <h2 className="text-heading-md mb-lg">{label}</h2>}
      {children}
    </section>
  );
}
```

- [ ] **Step 2: `HairlineRule.tsx`**

```tsx
export function HairlineRule({ strong = false }: { strong?: boolean }) {
  return <div className={`h-px w-full ${strong ? "bg-hairline-strong" : "bg-hairline"}`} />;
}
```

- [ ] **Step 3: `BracketList.tsx`**

```tsx
import type { ReactNode } from "react";

export function BracketList({ children }: { children: ReactNode }) {
  return <ul className="space-y-0">{children}</ul>;
}

export function BracketItem({ marker = "[+]", label, children }: { marker?: string; label: string; children?: ReactNode }) {
  return (
    <li className="flex gap-md py-sm">
      <span className="text-ink select-none">{marker}</span>
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {children && <span className="text-body ml-md">{children}</span>}
      </div>
    </li>
  );
}
```

- [ ] **Step 4: `ListRow.tsx`**

```tsx
import type { ReactNode } from "react";

export function ListRow({ marker, children }: { marker?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-md py-sm items-baseline">
      {marker && <span className="select-none">{marker}</span>}
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: `PrimaryNav.tsx`**

```tsx
import { Link } from "react-router-dom";

export function PrimaryNav() {
  return (
    <nav className="h-14 flex items-center border-b border-hairline px-xl gap-xl text-body-strong">
      <Link to="/" className="no-underline">iceberg</Link>
      <Link to="/graph" className="no-underline text-mute hover:text-ink">graph</Link>
      <Link to="/bookmarks" className="no-underline text-mute hover:text-ink">bookmarks</Link>
      <div className="flex-1" />
      <Link to="/settings" className="no-underline text-mute hover:text-ink">settings</Link>
    </nav>
  );
}
```

- [ ] **Step 6: `Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-hairline mt-section py-xl text-caption-md text-mute">
      <div className="max-w-[960px] mx-auto px-xl">
        iceberg — personal production-readiness curriculum
      </div>
    </footer>
  );
}
```

- [ ] **Step 7: `Page.tsx`**

```tsx
import { PrimaryNav } from "./PrimaryNav.js";
import { Footer } from "./Footer.js";
import type { ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PrimaryNav />
      <main className="flex-1 max-w-[960px] w-full mx-auto px-xl py-xl">{children}</main>
      <Footer />
    </div>
  );
}
```

Note on spacing tokens: DESIGN.md uses `xl: 24px`, `lg: 16px`, `md: 12px`, etc. Add to `tailwind.config.ts` if Tailwind defaults don't match — update earlier task's config to include:

```ts
spacing: { xxs: "1px", xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px", section: "96px" }
```

(If you didn't add this to Task 19, do so now.)

- [ ] **Step 8: Commit**

```bash
git add app/src/components/layout/ app/tailwind.config.ts
git commit -m "app: layout primitives mapped from DESIGN.md"
```

---

### Task 24: ProgressMarker + BookmarkButton + MarkCompleteButton

**Files:**
- Create: `app/src/components/domain/ProgressMarker.tsx`
- Create: `app/src/components/interactive/BookmarkButton.tsx`
- Create: `app/src/components/interactive/MarkCompleteButton.tsx`

- [ ] **Step 1: `ProgressMarker.tsx`**

```tsx
export function ProgressMarker({ state }: { state: "empty" | "partial" | "done" }) {
  const ch = state === "done" ? "x" : state === "partial" ? "~" : " ";
  return <span className="font-mono select-none">[{ch}]</span>;
}
```

- [ ] **Step 2: `BookmarkButton.tsx`**

```tsx
import { useBookmark } from "../../hooks/useBookmark.js";

export function BookmarkButton({ topic, resource }: { topic: string; resource?: string }) {
  const { isBookmarked, toggle } = useBookmark(topic, resource);
  return (
    <button type="button" onClick={toggle} className="font-mono select-none">
      [{isBookmarked ? "*" : " "}]
    </button>
  );
}
```

- [ ] **Step 3: `MarkCompleteButton.tsx`**

```tsx
import { progressStore } from "../../stores/index.js";
import { useTopicProgress } from "../../hooks/useTopicProgress.js";

export function MarkCompleteButton({ slug }: { slug: string }) {
  const p = useTopicProgress(slug);
  const onClick = () => p.completed ? progressStore.unmarkTopicComplete(slug) : progressStore.markTopicComplete(slug);
  return (
    <button type="button" onClick={onClick} className="px-lg py-xs rounded-sm bg-ink text-canvas">
      {p.completed ? "[x] mark incomplete" : "[ ] mark complete"}
    </button>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/src/components/
git commit -m "app: ProgressMarker, BookmarkButton, MarkCompleteButton"
```

---

### Task 25: Home route

**Files:**
- Create: `app/src/routes/Home.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Write `Home.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { HairlineRule } from "../components/layout/HairlineRule.js";
import { taxonomy, topics } from "../content/index.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { ProgressMarker } from "../components/domain/ProgressMarker.js";

export function Home() {
  const _ = useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const totalResourcesPerTopic = Object.fromEntries(topics.map(t => [
    t.frontmatter.slug,
    (t.frontmatter.resources.videos.short ? 1 : 0) +
    (t.frontmatter.resources.videos.long ? 1 : 0) +
    t.frontmatter.resources.articles.length +
    t.frontmatter.resources.services.length +
    t.frontmatter.resources.courses.length
  ]));
  const overall = progressStore.getOverallProgress(totalResourcesPerTopic);
  const last = progressStore.getLastTouchedTopic();

  if (!taxonomy) return <Page><div>No content yet. Run the pipeline.</div></Page>;

  return (
    <Page>
      <Section>
        <h1 className="text-display-xl">iceberg</h1>
        <p className="text-body mt-lg max-w-prose">
          A guided curriculum for the production-readiness topics below the waterline.
        </p>
        <div className="mt-xl text-body-md">
          [+] {overall.completedTopics}/{overall.totalTopics} topics complete &middot;{" "}
          {overall.resourcesCompleted}/{overall.resourcesTotal} resources
        </div>
        {last && (
          <div className="mt-md text-body-md">
            &gt;&gt; Continue:{" "}
            <Link to={`/topic/${last}`} className="underline">{last}</Link>
          </div>
        )}
      </Section>

      <Section label="Phases">
        <HairlineRule />
        {taxonomy.phases.sort((a, b) => a.order - b.order).map(phase => (
          <div key={phase.slug} className="py-lg border-b border-hairline">
            <Link to={`/phase/${phase.slug}`} className="no-underline">
              <div className="text-body-strong">[+] {phase.title}</div>
              <div className="text-body text-mute mt-xs">{phase.description}</div>
              <div className="text-caption-md text-mute mt-xs">{phase.topics.length} topics</div>
            </Link>
          </div>
        ))}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 2: Update `App.tsx`**

```tsx
import { Routes, Route } from "react-router-dom";
import { Home } from "./routes/Home.js";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
```

- [ ] **Step 3: Verify in dev server**

`npm run dev` — visit `/`. Expected: phase list rendered, progress shown.

- [ ] **Step 4: Commit**

```bash
git add app/src/routes/Home.tsx app/src/App.tsx
git commit -m "app: home route with phase list and progress summary"
```

---

### Task 26: Phase route

**Files:**
- Create: `app/src/routes/Phase.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Write `Phase.tsx`**

```tsx
import { Link, useParams } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { getPhase, taxonomy, topics } from "../content/index.js";
import { ProgressMarker } from "../components/domain/ProgressMarker.js";
import { progressStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";

export function Phase() {
  const { phaseSlug } = useParams();
  useStoreSubscription(l => progressStore.subscribe(l), () => Date.now());
  const phase = getPhase(phaseSlug!);
  if (!phase || !taxonomy) return <Page><div>Phase not found.</div></Page>;

  return (
    <Page>
      <Section>
        <Link to="/" className="text-caption-md text-mute no-underline">&lt;&lt; back</Link>
        <h1 className="text-display-xl mt-md">{phase.title}</h1>
        <p className="text-body text-mute mt-lg">{phase.description}</p>
      </Section>

      <Section label="Topics">
        {phase.topics.map(slug => {
          const t = taxonomy.topics[slug];
          const tf = topics.find(x => x.frontmatter.slug === slug)?.frontmatter;
          const prog = progressStore.getTopicProgress(slug);
          const totalRes = tf
            ? (tf.resources.videos.short ? 1 : 0) +
              (tf.resources.videos.long ? 1 : 0) +
              tf.resources.articles.length +
              tf.resources.services.length +
              tf.resources.courses.length
            : 0;
          const checked = Object.values(prog.resources).filter(Boolean).length;
          const state: "empty" | "partial" | "done" = prog.completed ? "done" : checked > 0 ? "partial" : "empty";
          if (!t) return null;
          return (
            <Link key={slug} to={`/topic/${slug}`} className="no-underline">
              <div className="py-lg border-b border-hairline flex items-baseline gap-md">
                <ProgressMarker state={state} />
                <div className="flex-1">
                  <div className="text-body-strong">{t.title}</div>
                  <div className="text-body text-mute">{t.summary}</div>
                </div>
                <div className="text-caption-md text-mute">{checked}/{totalRes}</div>
              </div>
            </Link>
          );
        })}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 2: Register route in `App.tsx`**

Add: `<Route path="/phase/:phaseSlug" element={<Phase />} />`

- [ ] **Step 3: Commit**

```bash
git add app/src/routes/Phase.tsx app/src/App.tsx
git commit -m "app: phase route with topic list and progress per row"
```

---

### Task 27: Topic route

**Files:**
- Create: `app/src/routes/Topic.tsx`
- Create: `app/src/components/domain/ResourceRow.tsx`
- Create: `app/src/components/domain/ConnectionSidebar.tsx`
- Create: `app/src/components/interactive/NotesField.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Write `ResourceRow.tsx`**

```tsx
import { progressStore } from "../../stores/index.js";
import { useTopicProgress } from "../../hooks/useTopicProgress.js";
import { BookmarkButton } from "../interactive/BookmarkButton.js";

export function ResourceRow({ topicSlug, resourceKey, title, url, meta }: {
  topicSlug: string; resourceKey: string; title: string; url: string; meta?: string;
}) {
  const prog = useTopicProgress(topicSlug);
  const checked = !!prog.resources[resourceKey];
  return (
    <div className="flex items-baseline gap-md py-sm">
      <button
        type="button"
        onClick={() => progressStore.setResourceChecked(topicSlug, resourceKey, !checked)}
        className="font-mono select-none"
        aria-label={checked ? "uncheck" : "check"}
      >
        [{checked ? "x" : " "}]
      </button>
      <BookmarkButton topic={topicSlug} resource={resourceKey} />
      <a href={url} target="_blank" rel="noreferrer" className="flex-1 underline">{title}</a>
      {meta && <span className="text-caption-md text-mute">{meta}</span>}
    </div>
  );
}
```

- [ ] **Step 2: Write `ConnectionSidebar.tsx`**

```tsx
import { Link } from "react-router-dom";
import { connections, taxonomy } from "../../content/index.js";

export function ConnectionSidebar({ slug }: { slug: string }) {
  const edges = connections.filter(e => e.from === slug || e.to === slug);
  if (edges.length === 0 || !taxonomy) return null;
  const grouped: Record<string, { other: string; reasoning: string }[]> = {};
  for (const e of edges) {
    const other = e.from === slug ? e.to : e.from;
    grouped[e.type] = grouped[e.type] ?? [];
    grouped[e.type].push({ other, reasoning: e.reasoning });
  }
  const labels: Record<string, string> = {
    "prerequisite": "Before this",
    "related": "See also",
    "often-confused-with": "Often confused with",
    "pairs-with": "Pairs with"
  };
  return (
    <aside className="border-l border-hairline pl-lg mt-xl md:mt-0">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type} className="mb-lg">
          <div className="text-caption-md text-mute mb-xs">{labels[type] ?? type}</div>
          {items.map(({ other }) => {
            const t = taxonomy.topics[other];
            if (!t) return null;
            return <div key={other}><Link to={`/topic/${other}`} className="underline">{t.title}</Link></div>;
          })}
        </div>
      ))}
    </aside>
  );
}
```

- [ ] **Step 3: Write `NotesField.tsx`**

```tsx
import { useNotes } from "../../hooks/useNotes.js";

export function NotesField({ slug }: { slug: string }) {
  const { body, set } = useNotes(slug);
  return (
    <textarea
      value={body}
      onChange={e => set(e.target.value)}
      placeholder="your notes…"
      className="w-full min-h-[160px] p-md bg-surface-soft text-ink rounded-sm border border-hairline focus:border-ink outline-none font-mono"
    />
  );
}
```

- [ ] **Step 4: Write `Topic.tsx`**

```tsx
import { useParams, Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { ResourceRow } from "../components/domain/ResourceRow.js";
import { ConnectionSidebar } from "../components/domain/ConnectionSidebar.js";
import { NotesField } from "../components/interactive/NotesField.js";
import { MarkCompleteButton } from "../components/interactive/MarkCompleteButton.js";
import { getTopic, taxonomy } from "../content/index.js";

export function Topic() {
  const { topicSlug } = useParams();
  const entry = getTopic(topicSlug!);
  if (!entry || !taxonomy) return <Page><div>Topic not found.</div></Page>;
  const { frontmatter: fm } = entry;
  const phase = taxonomy.phases.find(p => p.slug === fm.phase);

  return (
    <Page>
      <div className="grid md:grid-cols-[1fr_240px] gap-xl">
        <div>
          <Section>
            <Link to={`/phase/${fm.phase}`} className="text-caption-md text-mute no-underline">&lt;&lt; {phase?.title}</Link>
            <h1 className="text-display-xl mt-md">{fm.title}</h1>
            <p className="text-body mt-lg whitespace-pre-line">{fm.definition}</p>
            <div className="mt-xl"><MarkCompleteButton slug={fm.slug} /></div>
          </Section>

          {fm.resources.videos.short && (
            <Section label="Videos">
              <ResourceRow topicSlug={fm.slug} resourceKey="videos.short" title={fm.resources.videos.short.title} url={fm.resources.videos.short.url} meta={`${fm.resources.videos.short.durationMinutes} min`} />
              {fm.resources.videos.long && (
                <ResourceRow topicSlug={fm.slug} resourceKey="videos.long" title={fm.resources.videos.long.title} url={fm.resources.videos.long.url} meta={`${fm.resources.videos.long.durationMinutes} min`} />
              )}
            </Section>
          )}

          {fm.resources.articles.length > 0 && (
            <Section label="Articles & Docs">
              {fm.resources.articles.map((a, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} resourceKey={`articles.${i}`} title={a.title} url={a.url} meta={a.kind} />
              ))}
            </Section>
          )}

          {fm.resources.services.length > 0 && (
            <Section label="Services">
              {fm.resources.services.map((s, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} resourceKey={`services.${i}`} title={s.name} url={s.url} meta={s.category} />
              ))}
            </Section>
          )}

          {fm.resources.courses.length > 0 && (
            <Section label="Courses">
              {fm.resources.courses.map((c, i) => (
                <ResourceRow key={i} topicSlug={fm.slug} resourceKey={`courses.${i}`} title={c.title} url={c.url} meta={`${c.provider}${c.paid ? " · paid" : ""}`} />
              ))}
            </Section>
          )}

          <Section label="Your notes">
            <NotesField slug={fm.slug} />
          </Section>
        </div>
        <ConnectionSidebar slug={fm.slug} />
      </div>
    </Page>
  );
}
```

- [ ] **Step 5: Register route**

Add to `App.tsx`: `<Route path="/topic/:topicSlug" element={<Topic />} />`

- [ ] **Step 6: Commit**

```bash
git add app/src/routes/Topic.tsx app/src/components/ app/src/App.tsx
git commit -m "app: topic route with resources, sidebar connections, notes"
```

---

### Task 28: Bookmarks + Settings routes

**Files:**
- Create: `app/src/routes/Bookmarks.tsx`
- Create: `app/src/routes/Settings.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: `Bookmarks.tsx`**

```tsx
import { Link } from "react-router-dom";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { bookmarkStore } from "../stores/index.js";
import { useStoreSubscription } from "../hooks/useStoreSubscription.js";
import { getTopic } from "../content/index.js";

export function Bookmarks() {
  const list = useStoreSubscription(l => bookmarkStore.subscribe(l), () => bookmarkStore.list());
  return (
    <Page>
      <Section label="Bookmarks">
        {list.length === 0 && <div className="text-mute">[ ] no bookmarks yet</div>}
        {list.map((b, i) => {
          const t = getTopic(b.topic);
          return (
            <div key={i} className="py-sm border-b border-hairline">
              <Link to={`/topic/${b.topic}`} className="underline">{t?.frontmatter.title ?? b.topic}</Link>
              {b.resource && <span className="text-caption-md text-mute ml-md">{b.resource}</span>}
            </div>
          );
        })}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 2: `Settings.tsx`** (export/import)

```tsx
import { useRef, useState } from "react";
import { Page } from "../components/layout/Page.js";
import { Section } from "../components/layout/Section.js";
import { progressStore, bookmarkStore, notesStore } from "../stores/index.js";
import type { ExportPayload, ImportResult } from "../stores/types.js";

export function Settings() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string>("");

  function doExport() {
    const payload: ExportPayload = {
      format: "iceberg-progress",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        progress: progressStore.exportData(),
        bookmarks: bookmarkStore.exportData(),
        notes: notesStore.exportData()
      }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iceberg-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doImport(file: File, mode: "merge" | "replace") {
    const text = await file.text();
    let payload: ExportPayload;
    try { payload = JSON.parse(text); } catch { setStatus("[!] invalid JSON"); return; }
    if (payload.format !== "iceberg-progress") { setStatus("[!] not an iceberg-progress export"); return; }
    if (payload.version !== 1) { setStatus(`[!] unsupported version ${payload.version}`); return; }

    const r1: ImportResult = progressStore.importData(payload.data.progress, mode);
    const r2 = bookmarkStore.importData(payload.data.bookmarks, mode);
    const r3 = notesStore.importData(payload.data.notes, mode);
    setStatus(`[x] imported: ${r1.topicsMerged} topics, ${r2.bookmarksMerged} bookmarks, ${r3.notesMerged} notes${r3.conflicts.length ? ` (conflicts: ${r3.conflicts.join(", ")})` : ""}`);
  }

  return (
    <Page>
      <Section label="Export">
        <button onClick={doExport} className="px-lg py-xs bg-ink text-canvas rounded-sm">[+] download progress</button>
      </Section>
      <Section label="Import">
        <input ref={fileInput} type="file" accept="application/json" className="block" />
        <div className="mt-md flex gap-md">
          <button
            onClick={() => fileInput.current?.files?.[0] && doImport(fileInput.current.files[0], "merge")}
            className="px-lg py-xs border border-hairline-strong rounded-sm"
          >[+] merge</button>
          <button
            onClick={() => {
              if (!fileInput.current?.files?.[0]) return;
              if (confirm("Replace all local progress with imported data?")) {
                doImport(fileInput.current.files[0], "replace");
              }
            }}
            className="px-lg py-xs border border-danger text-danger rounded-sm"
          >[!] replace</button>
        </div>
        {status && <div className="mt-md text-caption-md">{status}</div>}
      </Section>
    </Page>
  );
}
```

- [ ] **Step 3: Register routes**

```tsx
<Route path="/bookmarks" element={<Bookmarks />} />
<Route path="/settings" element={<Settings />} />
```

- [ ] **Step 4: Commit**

```bash
git add app/src/routes/Bookmarks.tsx app/src/routes/Settings.tsx app/src/App.tsx
git commit -m "app: bookmarks and settings (export/import) routes"
```

---

### Task 29: Graph route (react-flow)

**Files:**
- Create: `app/src/routes/Graph.tsx`
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Write `Graph.tsx`**

```tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Page } from "../components/layout/Page.js";
import { taxonomy, connections } from "../content/index.js";

export function Graph() {
  const navigate = useNavigate();

  const { nodes, edges } = useMemo(() => {
    if (!taxonomy) return { nodes: [], edges: [] };
    const phaseColors = Object.fromEntries(taxonomy.phases.map((p, i) => [p.slug, i]));
    const phaseCount = taxonomy.phases.length;

    const nodes: Node[] = Object.values(taxonomy.topics).map((t, i) => {
      const phaseIdx = phaseColors[t.phase] ?? 0;
      const x = (i % 8) * 180;
      const y = phaseIdx * 160 + Math.floor(i / 8) * 80;
      return {
        id: t.slug,
        position: { x, y },
        data: { label: `[ ${t.title} ]` },
        style: {
          border: "1px solid #201d1d",
          background: "#fdfcfc",
          padding: "4px 8px",
          borderRadius: 0,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 13
        }
      };
    });

    const edges: Edge[] = connections.map((c, i) => ({
      id: `e${i}`,
      source: c.from,
      target: c.to,
      label: c.type === "prerequisite" ? "▸" : undefined,
      style: { stroke: "rgba(15,0,0,0.5)", strokeWidth: Math.max(1, c.weight * 2) },
      type: c.type === "prerequisite" ? "smoothstep" : "default"
    }));

    return { nodes, edges };
  }, []);

  if (!taxonomy) return <Page>No content.</Page>;

  return (
    <Page>
      <div className="h-[70vh] border border-hairline">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(_, n) => navigate(`/topic/${n.id}`)}
          fitView
        >
          <Background gap={24} color="rgba(15,0,0,0.06)" />
          <Controls />
        </ReactFlow>
      </div>
    </Page>
  );
}
```

- [ ] **Step 2: Register route**

`<Route path="/graph" element={<Graph />} />`

- [ ] **Step 3: Commit**

```bash
git add app/src/routes/Graph.tsx app/src/App.tsx
git commit -m "app: react-flow knowledge graph route"
```

---

### Task 30: Cmd-K search palette (polish)

**Files:**
- Create: `app/src/components/interactive/SearchPalette.tsx`
- Modify: `app/src/components/layout/Page.tsx`

- [ ] **Step 1: Write `SearchPalette.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taxonomy } from "../../content/index.js";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = useMemo(() => {
    if (!taxonomy || !query) return [];
    const q = query.toLowerCase();
    return Object.values(taxonomy.topics)
      .filter(t => t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink/30 z-50 flex items-start justify-center pt-24" onClick={() => setOpen(false)}>
      <div className="bg-canvas border border-hairline-strong rounded-sm w-full max-w-[560px]" onClick={e => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="search topics…"
          className="w-full px-md py-sm bg-canvas border-b border-hairline outline-none font-mono"
        />
        <div className="max-h-[320px] overflow-auto">
          {matches.map(t => (
            <button
              key={t.slug}
              onClick={() => { setOpen(false); navigate(`/topic/${t.slug}`); }}
              className="block w-full text-left px-md py-sm hover:bg-surface-soft"
            >
              <div className="text-body-strong">[+] {t.title}</div>
              <div className="text-caption-md text-mute">{t.summary}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount in `Page.tsx`**

Add `<SearchPalette />` inside the root div of `Page`.

- [ ] **Step 3: Commit**

```bash
git add app/src/components/interactive/SearchPalette.tsx app/src/components/layout/Page.tsx
git commit -m "app: Cmd-K search palette"
```

---

### Task 31: Build verification

- [ ] **Step 1: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: `app/dist/` produced with bundled assets.

- [ ] **Step 3: Preview**

```bash
npm run preview
```

Open the printed URL. Manually walk through: home → phase → topic → bookmark a resource → settings → export → graph.

- [ ] **Step 4: Commit any fixes**

If issues found, fix and commit per fix. Otherwise:

```bash
git commit --allow-empty -m "app: full build verified"
```

---

### Task 32: Push to GitHub

- [ ] **Step 1: Confirm remote**

```bash
git remote -v
```

Expected: `origin  https://github.com/peteramelang/iceberg.git`.

- [ ] **Step 2: Push**

```bash
git push -u origin main
```

---

## Phase C — Deploy

### Task 33: Vercel deployment

- [ ] **Step 1: Connect repo**

Manual: in Vercel dashboard, import `peteramelang/iceberg`.

- [ ] **Step 2: Configure project**

- Framework Preset: **Other**
- Build Command: `npm run build`
- Output Directory: `app/dist`
- Install Command: `npm install`
- Root Directory: leave at `./`

- [ ] **Step 3: Verify deploy**

After Vercel finishes, open the production URL. Walk through every route. Confirm content matches local.

- [ ] **Step 4: Commit a deploy note**

Add a one-line note to `README.md` linking the production URL, then:

```bash
git add README.md
git commit -m "docs: add production URL"
git push
```

---

## Self-review notes

- **Spec coverage**: every section of the spec maps to at least one task. Stage 0 user gate is Task 15. Liveness retry cap + `needsManualPick` is enforced by the runbook (Task 12) and rendered by Topic.tsx (Task 27 — verify when implementing that resource rows handle null video slots; current code already does via the `&&` guard on `fm.resources.videos.short`).
- **Type consistency**: store interfaces use `exportData` / `importData` consistently across all three stores. Resource keys use dot notation (`videos.short`, `articles.0`) consistently across `ResourceRow` and `ProgressStore`.
- **No placeholders**: each task contains exact paths, exact code, exact commands.
- **Known scope decision**: Phase B tasks are slightly higher-level than Phase A — they show the actual component code but assume the engineer knows React conventions. This matches the "skilled developer, weak on toolset" assumption: pipeline architecture is novel, React work is standard.
