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
