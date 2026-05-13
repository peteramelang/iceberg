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
