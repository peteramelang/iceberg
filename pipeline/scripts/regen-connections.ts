// Regenerate content/_connections.json from the current taxonomy WITHOUT touching topic markdown.
// Used after taxonomy edits or prerequisite updates.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateConnections } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");
const taxonomy = JSON.parse(readFileSync(join(contentDir, "_taxonomy.json"), "utf8")) as {
  topics: Record<string, { slug: string; phase: string; prerequisites: string[] }>;
};

interface Edge {
  from: string;
  to: string;
  type: "prerequisite" | "related" | "often-confused-with" | "pairs-with";
  weight: number;
  reasoning: string;
}

const edges: Edge[] = [];

for (const [slug, t] of Object.entries(taxonomy.topics)) {
  for (const pre of t.prerequisites) {
    edges.push({
      from: pre,
      to: slug,
      type: "prerequisite",
      weight: 0.9,
      reasoning: `${pre} should be understood before ${slug}, per taxonomy prerequisite chain.`
    });
  }
}

const byPhase: Record<string, string[]> = {};
for (const [slug, t] of Object.entries(taxonomy.topics)) {
  (byPhase[t.phase] ??= []).push(slug);
}

for (const phaseSlugs of Object.values(byPhase)) {
  for (let i = 0; i < phaseSlugs.length; i++) {
    for (let j = i + 1; j < phaseSlugs.length; j++) {
      const a = phaseSlugs[i]!;
      const b = phaseSlugs[j]!;
      const exists = edges.some(e => (e.from === a && e.to === b) || (e.from === b && e.to === a));
      if (!exists) {
        edges.push({
          from: a,
          to: b,
          type: "related",
          weight: 0.4,
          reasoning: "Both topics belong to the same learning phase and are commonly studied together."
        });
      }
    }
  }
}

const handCrafted: Array<[string, string, Edge["type"], number, string]> = [
  ["authentication", "access-control", "pairs-with", 0.95, "AuthN identifies who you are; AuthZ decides what you can do — almost always implemented together."],
  ["authentication", "access-control", "often-confused-with", 0.8, "Beginners frequently use the term 'authentication' when they mean 'authorization' and vice versa."],
  ["idempotency", "payments", "prerequisite", 0.9, "Idempotency keys are foundational to safe payment retries."],
  ["alerting", "incident-response", "pairs-with", 0.85, "Alerts trigger incident response; incident response feeds back into alert tuning."],
  ["distributed-tracing", "latency-optimization", "pairs-with", 0.8, "Traces are the primary tool for identifying latency hotspots."],
  ["feature-flags", "ab-testing", "prerequisite", 0.85, "A/B testing relies on feature-flag-style targeting infrastructure."],
  ["schema-migrations", "rollbacks", "pairs-with", 0.7, "Migration reversibility is a precondition for safe rollbacks."],
  ["message-queues", "dead-letter-queues", "prerequisite", 0.95, "DLQs are a feature of the queue infrastructure they protect."],
  ["caching", "scalability", "pairs-with", 0.7, "Caching is one of the most leveraged techniques for scaling read paths."],
  // Extension hand-crafted edges
  ["prompting-for-code", "context-engineering", "pairs-with", 0.85, "Prompting and context-curation are two halves of the same skill."],
  ["context-engineering", "hallucination-mitigation", "pairs-with", 0.85, "Good context is the strongest hallucination defense."],
  ["agent-loops", "ai-code-review", "pairs-with", 0.8, "Agent loops produce output that needs review; review IS the loop's safety net."],
  ["ai-evals", "hallucination-mitigation", "pairs-with", 0.8, "Evals are how you measure whether mitigation is working."],
  ["mcp-and-tooling", "agent-loops", "pairs-with", 0.75, "MCP gives agents the tools they need to act in their loop."],
  ["ai-security-and-pii", "secrets-management", "related", 0.7, "Both topics concern what you must not let leave the perimeter."],
  ["module-bundlers", "server-rendering", "related", 0.6, "Bundling and rendering modes interact at build time."],
  ["server-rendering", "hydration-and-islands", "prerequisite", 0.9, "Hydration only makes sense once you understand server rendering."],
  ["web-vitals", "image-and-media-pipelines", "pairs-with", 0.85, "Images and media are typically the biggest LCP lever."],
  ["web-vitals", "latency-optimization", "related", 0.7, "Web Vitals measure end-user latency outcomes."],
  ["state-management-modern", "type-safe-api-calls", "pairs-with", 0.65, "Less client state usually means more reliance on the API contract."],
  ["design-systems", "documentation-driven-development", "related", 0.6, "Design systems are documentation in code form."],
  ["dev-containers", "local-dev-environment", "pairs-with", 0.85, "Dev containers are one canonical implementation of a reproducible local environment."],
  ["type-safe-orms", "schema-migrations", "pairs-with", 0.9, "Migrations and the ORM model define the same shape from two sides."],
  ["background-jobs", "message-queues", "related", 0.75, "Background jobs usually run on top of a queue."],
  ["background-jobs", "dead-letter-queues", "related", 0.7, "Job failures land in DLQs."],
  ["webhooks-as-platform", "idempotency", "prerequisite", 0.9, "Webhook receivers must be idempotent — they will see duplicates."],
  ["webhooks-as-platform", "background-jobs", "pairs-with", 0.75, "Webhook delivery is usually a background-job concern."],
  ["realtime-protocols", "scalability", "related", 0.6, "Realtime is where scaling assumptions break first."],
  ["search-and-vector-store", "context-engineering", "pairs-with", 0.7, "Vector stores are the core retrieval primitive for context engineering."],
  ["edge-runtimes", "latency-optimization", "related", 0.65, "Edge placement is one of the most impactful latency wins."],
  ["file-uploads-and-streaming", "image-and-media-pipelines", "related", 0.7, "Uploads feed pipelines; pipelines serve uploads."],
  ["monorepos", "ci-cd", "related", 0.7, "Monorepo CI requires special pipeline ergonomics."],
  ["code-review-craft", "ai-code-review", "pairs-with", 0.7, "AI review is an extension of human review craft."],
  ["debugging-mindset", "instrumentation", "pairs-with", 0.75, "Good instrumentation makes the debugging mindset effective."],
  ["git-workflows", "ci-cd", "pairs-with", 0.7, "CI workflows are shaped by your branching strategy."],
  ["sustainable-pace", "on-call-rotations", "pairs-with", 0.8, "On-call rotation design is a primary lever for sustainable pace."],
  ["pair-and-mob-programming", "code-review-craft", "related", 0.6, "Pairing changes the review surface."],
  ["documentation-driven-development", "documentation", "pairs-with", 0.85, "Documentation-driven development is one application of the broader documentation discipline."]
];

for (const [from, to, type, weight, reasoning] of handCrafted) {
  // Skip if either endpoint not in taxonomy
  if (!taxonomy.topics[from] || !taxonomy.topics[to]) continue;
  edges.push({ from, to, type, weight, reasoning });
}

const connections = { version: 1 as const, edges };
validateConnections(connections);
writeFileSync(join(contentDir, "_connections.json"), JSON.stringify(connections, null, 2) + "\n");
console.log(`Wrote ${edges.length} connection edges.`);
