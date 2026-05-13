import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile, type TopicFrontmatter } from "../lib/content.js";
import { readLedger, writeLedger, setTopicStageStatus, setStageStatus } from "../lib/ledger.js";
import { validateConnections } from "../lib/validate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const ledgerPath = join(repoRoot, "content", "_ledger.smoke.json");
const contentDir = join(repoRoot, "content-smoke");
const runsDir = join(repoRoot, ".git", "iceberg-runs");

type ResearchOutput = {
  agentId: string;
  definition: string;
  resources: TopicFrontmatter["resources"];
};

interface TopicSpec { slug: string; phase: string; researchFile: string; }

const topics: TopicSpec[] = [
  { slug: "authentication", phase: "foundations", researchFile: "research-authentication-a.json" },
  { slug: "logging", phase: "reliability", researchFile: "research-logging-a.json" }
];

for (const t of topics) {
  const research: ResearchOutput = JSON.parse(
    readFileSync(join(runsDir, t.researchFile), "utf8")
  );

  const mdPath = join(contentDir, t.phase, `${t.slug}.md`);
  const { frontmatter, body } = readTopicFile(mdPath);

  const updated: TopicFrontmatter = {
    ...frontmatter,
    definition: research.definition,
    resources: research.resources,
    provenance: {
      researchedAt: new Date().toISOString(),
      pipelineVersion: 1,
      rounds: 1,
      stabilized: true
    }
  };

  writeTopicFile(mdPath, updated, body);
  console.log(`Updated ${mdPath}`);

  setTopicStageStatus(ledgerPath, t.slug, t.phase, "research", "completed", {
    round: 1,
    agentRunIds: [research.agentId]
  });
  setTopicStageStatus(ledgerPath, t.slug, t.phase, "consistency", "completed", { round: 1 });
  setTopicStageStatus(ledgerPath, t.slug, t.phase, "adversarial", "completed", { round: 1 });
  setTopicStageStatus(ledgerPath, t.slug, t.phase, "liveness", "completed", { round: 1 });
}

const led = readLedger(ledgerPath);
for (const t of topics) {
  led.topics[t.slug]!.stages.stabilized = true;
}
writeLedger(ledgerPath, led);

const connections = {
  version: 1 as const,
  edges: [
    {
      from: "authentication",
      to: "logging",
      type: "related" as const,
      weight: 0.4,
      reasoning: "Authentication events are commonly logged for audit trails and incident investigation."
    }
  ]
};
validateConnections(connections);
const connectionsPath = join(contentDir, "_connections.json");
writeFileSync(connectionsPath, JSON.stringify(connections, null, 2) + "\n");
console.log(`Wrote ${connectionsPath}`);

setStageStatus(ledgerPath, "stage_5_connections", "completed", { artifactPath: "content-smoke/_connections.json" });

const ledFinal = readLedger(ledgerPath);
ledFinal.connections = { status: "completed", artifactPath: "content-smoke/_connections.json" };
writeLedger(ledgerPath, ledFinal);

console.log("Smoke pipeline finalized.");
