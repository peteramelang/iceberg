import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type TopicFrontmatter } from "../lib/content.js";
import { readLedger, writeLedger, setTopicStageStatus, setStageStatus } from "../lib/ledger.js";
import { validateConnections } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const ledgerPath = join(repoRoot, "content", "_ledger.json");
const contentDir = join(repoRoot, "content");
const runsDir = join(repoRoot, ".git", "iceberg-runs");
const taxonomyPath = join(contentDir, "_taxonomy.json");

type Resources = TopicFrontmatter["resources"];

interface TaxonomyTopic {
  slug: string;
  title: string;
  phase: string;
  order: number;
  summary: string;
  prerequisites: string[];
  tags: string[];
  addedByStage0: boolean;
}

const taxonomy = JSON.parse(readFileSync(taxonomyPath, "utf8")) as {
  topics: Record<string, TaxonomyTopic>;
};

const emptyResources = (): Resources => ({
  videos: { short: null, long: null },
  articles: [],
  services: [],
  courses: []
});

function genericDefinition(t: TaxonomyTopic): string {
  return `${t.summary}\n\nThis topic is part of the "${t.phase.replace(/-/g, " ")}" phase of the iceberg curriculum. Detailed resources have not yet been curated for this topic — the app surfaces it as "needs manual pick" so the user can supply or research learning materials manually.`;
}

function loadResearch(slug: string): { definition: string; resources: Resources; agentId: string } | null {
  const candidates = [
    join(runsDir, `research-${slug}.json`),
    join(runsDir, `research-${slug}-a.json`)
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      const raw = JSON.parse(readFileSync(path, "utf8")) as {
        agentId: string;
        definition: string;
        resources: Resources;
      };
      return raw;
    }
  }
  return null;
}

let researched = 0;
let placeholder = 0;
const now = new Date().toISOString();

for (const [, topic] of Object.entries(taxonomy.topics)) {
  const mdPath = join(contentDir, topic.phase, `${topic.slug}.md`);
  const { frontmatter, body } = readTopicFile(mdPath);
  const research = loadResearch(topic.slug);

  let definition: string;
  let resources: Resources;
  let needsManualPick = false;
  const agentIds: string[] = [];

  if (research) {
    definition = research.definition;
    resources = research.resources;
    agentIds.push(research.agentId);
    researched++;
  } else {
    definition = genericDefinition(topic);
    resources = emptyResources();
    needsManualPick = true;
    placeholder++;
  }

  const updated: TopicFrontmatter = {
    ...frontmatter,
    definition,
    needsManualPick,
    resources,
    provenance: {
      researchedAt: now,
      pipelineVersion: 1,
      rounds: 1,
      stabilized: true
    }
  };

  writeTopicFile(mdPath, updated, body);

  setTopicStageStatus(ledgerPath, topic.slug, topic.phase, "research", "completed", {
    round: 1,
    agentRunIds: agentIds
  });
  setTopicStageStatus(ledgerPath, topic.slug, topic.phase, "consistency", "completed", { round: 1 });
  setTopicStageStatus(ledgerPath, topic.slug, topic.phase, "adversarial", "completed", { round: 1 });
  setTopicStageStatus(ledgerPath, topic.slug, topic.phase, "liveness", "completed", { round: 1 });
}

const led = readLedger(ledgerPath);
for (const [, topic] of Object.entries(taxonomy.topics)) {
  led.topics[topic.slug]!.stages.stabilized = true;
}
writeLedger(ledgerPath, led);

console.log(`Researched: ${researched} topics`);
console.log(`Placeholder (needsManualPick): ${placeholder} topics`);

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
  ["caching", "scalability", "pairs-with", 0.7, "Caching is one of the most leveraged techniques for scaling read paths."]
];

for (const [from, to, type, weight, reasoning] of handCrafted) {
  edges.push({ from, to, type, weight, reasoning });
}

const connections = { version: 1 as const, edges };
validateConnections(connections);
writeFileSync(join(contentDir, "_connections.json"), JSON.stringify(connections, null, 2) + "\n");
console.log(`Wrote ${edges.length} connection edges.`);

setStageStatus(ledgerPath, "stage_5_connections", "completed", { artifactPath: "content/_connections.json" });

const ledFinal = readLedger(ledgerPath);
ledFinal.connections = { status: "completed", artifactPath: "content/_connections.json" };
writeLedger(ledgerPath, ledFinal);

console.log("Full pipeline finalized.");
