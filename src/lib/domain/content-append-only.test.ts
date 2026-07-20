import { afterEach, describe, expect, it } from "vitest";
import {
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const scriptPath = resolve(process.cwd(), "scripts/check-content-append-only.mjs");
const temporaryRepositories: string[] = [];

function git(cwd: string, args: string[]) {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}

function createRepository(): string {
  const cwd = mkdtempSync(join(tmpdir(), "preuve90-content-integrity-"));
  temporaryRepositories.push(cwd);
  mkdirSync(join(cwd, "src/content/predictions"), { recursive: true });
  mkdirSync(join(cwd, "src/content/settlements"), { recursive: true });
  writeFileSync(join(cwd, "src/content/predictions/existing.json"), '{"id":"proof"}\n');
  writeFileSync(join(cwd, "src/content/settlements/existing.json"), '{"id":"settlement"}\n');
  git(cwd, ["init", "-q"]);
  git(cwd, ["config", "user.email", "tests@preuve90.invalid"]);
  git(cwd, ["config", "user.name", "Preuve90 Tests"]);
  git(cwd, ["add", "."]);
  git(cwd, ["commit", "-qm", "base"]);
  return cwd;
}

function check(cwd: string) {
  return spawnSync(process.execPath, [scriptPath, "HEAD"], {
    cwd,
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const directory of temporaryRepositories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("protection append-only des preuves JSON", () => {
  it("autorise l’ajout d’un nouveau JSON", () => {
    const cwd = createRepository();
    writeFileSync(join(cwd, "src/content/predictions/new.json"), '{"id":"new"}\n');
    git(cwd, ["add", "src/content/predictions/new.json"]);
    expect(check(cwd).status).toBe(0);
  });

  it("refuse la modification d’un JSON existant", () => {
    const cwd = createRepository();
    writeFileSync(join(cwd, "src/content/predictions/existing.json"), '{"secret":"changed"}\n');
    const result = check(cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("modification : src/content/predictions/existing.json");
    expect(result.stderr).not.toContain("secret");
  });

  it("refuse la suppression d’un JSON existant", () => {
    const cwd = createRepository();
    unlinkSync(join(cwd, "src/content/settlements/existing.json"));
    const result = check(cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("suppression : src/content/settlements/existing.json");
  });

  it("refuse le renommage d’un JSON existant", () => {
    const cwd = createRepository();
    renameSync(
      join(cwd, "src/content/predictions/existing.json"),
      join(cwd, "src/content/predictions/renamed.json"),
    );
    git(cwd, ["add", "-A"]);
    const result = check(cwd);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("renommage : src/content/predictions/existing.json");
    expect(result.stderr).toContain("src/content/predictions/renamed.json");
  });
});
