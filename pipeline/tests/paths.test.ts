import { describe, it, expect } from "vitest";
import { validatePaths, ValidationError } from "../lib/validate.js";

const NOW = "2026-05-15T00:00:00Z";
const TLDR = "Plain-language summary of the path for a non-technical reader to skim quickly.";

describe("validatePaths", () => {
  it("accepts a minimal valid paths doc", () => {
    const data = {
      version: 1,
      paths: [
        { slug: "first-deploy", title: "First Deploy", tldr: TLDR, description: "From zero to staging in a weekend: auth, env, ci-cd, logging.", audience: "solo founder", estimatedHours: 12, topics: ["authentication","environments","ci-cd","logging"], lastUpdatedAt: NOW },
        { slug: "real-users", title: "First Real Users", tldr: TLDR, description: "Money, identity, and data integrity once humans show up.", audience: "early-stage team", estimatedHours: 18, topics: ["payments","idempotency","data-integrity","gdpr-ccpa"], lastUpdatedAt: NOW },
        { slug: "ops-maturity", title: "Ops Maturity", tldr: TLDR, description: "From firefighting to durable on-call: alerting, incident, rotations.", audience: "growing team", estimatedHours: 20, topics: ["alerting","incident-response","on-call-rotations","disaster-recovery"], lastUpdatedAt: NOW },
        { slug: "going-global", title: "Going Multi-Region", tldr: TLDR, description: "Latency, residency, and reliability at scale with load balancing.", audience: "scaling product", estimatedHours: 16, topics: ["scalability","multi-region-support","caching","load-balancing"], lastUpdatedAt: NOW },
        { slug: "first-sre", title: "First SRE Hire", tldr: TLDR, description: "SLOs, error budgets, the toolkit you should hand a new SRE.", audience: "platform team", estimatedHours: 14, topics: ["slos-and-slis","instrumentation","alerting","incident-response"], lastUpdatedAt: NOW }
      ]
    };
    expect(() => validatePaths(data)).not.toThrow();
  });

  it("rejects a path with fewer than 4 topics", () => {
    const bad = {
      version: 1,
      paths: [
        { slug: "tiny", title: "T", tldr: TLDR, description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"], lastUpdatedAt: NOW },
        { slug: "tiny2", title: "T2", tldr: TLDR, description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"], lastUpdatedAt: NOW },
        { slug: "tiny3", title: "T3", tldr: TLDR, description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"], lastUpdatedAt: NOW },
        { slug: "tiny4", title: "T4", tldr: TLDR, description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"], lastUpdatedAt: NOW },
        { slug: "tiny5", title: "T5", tldr: TLDR, description: "x".repeat(50), audience: "x", estimatedHours: 1, topics: ["a","b","c"], lastUpdatedAt: NOW }
      ]
    };
    expect(() => validatePaths(bad)).toThrow(ValidationError);
  });
});
