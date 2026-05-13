import { describe, it, expect } from "vitest";
import { validatePaths, ValidationError } from "../lib/validate.js";

describe("validatePaths", () => {
  it("accepts a minimal valid paths doc", () => {
    const data = {
      version: 1,
      paths: [
        { slug: "first-deploy", title: "First Deploy", description: "From zero to staging in a weekend: auth, env, ci-cd, logging.", audience: "solo founder", estimatedHours: 12, topics: ["authentication","environments","ci-cd","logging"] },
        { slug: "real-users", title: "First Real Users", description: "Money, identity, and data integrity once humans show up.", audience: "early-stage team", estimatedHours: 18, topics: ["payments","idempotency","data-integrity","gdpr-ccpa"] },
        { slug: "ops-maturity", title: "Ops Maturity", description: "From firefighting to durable on-call: alerting, incident, rotations.", audience: "growing team", estimatedHours: 20, topics: ["alerting","incident-response","on-call-rotations","disaster-recovery"] },
        { slug: "going-global", title: "Going Multi-Region", description: "Latency, residency, and reliability at scale with load balancing.", audience: "scaling product", estimatedHours: 16, topics: ["scalability","multi-region-support","caching","load-balancing"] },
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
