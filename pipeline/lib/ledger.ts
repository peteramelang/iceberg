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
