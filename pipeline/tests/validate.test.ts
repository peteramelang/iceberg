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
      tldr: "Plain language summary for non-tech readers about authentication basics.",
      definition: "x",
      shortExplainerVideo: null,
      narrative: "x".repeat(500),
      pitfalls: [
        { title: "p1", explanation: "x".repeat(50) },
        { title: "p2", explanation: "x".repeat(50) },
        { title: "p3", explanation: "x".repeat(50) }
      ],
      codeExamples: [{ language: "typescript", title: "ex", code: "const x = 'hello world';", reasoning: "demo" }],
      difficulty: "intermediate",
      estimatedHours: 4,
      lastUpdatedAt: "2026-05-15T00:00:00Z",
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
