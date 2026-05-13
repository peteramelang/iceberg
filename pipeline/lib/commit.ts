import { execSync } from "node:child_process";

export interface GitCommitInput {
  cwd: string;
  paths: string[];
  message: string;
}

export function gitCommit(input: GitCommitInput): string | null {
  for (const p of input.paths) {
    execSync(`git add -- ${shellEscape(p)}`, { cwd: input.cwd, stdio: "pipe" });
  }
  const status = execSync("git status --porcelain", { cwd: input.cwd }).toString().trim();
  if (status === "") return null;

  execSync(`git commit -m ${shellEscape(input.message)}`, { cwd: input.cwd, stdio: "pipe" });
  const sha = execSync("git rev-parse --short HEAD", { cwd: input.cwd }).toString().trim();
  return sha;
}

function shellEscape(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}
