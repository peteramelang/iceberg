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
