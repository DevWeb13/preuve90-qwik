import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const forbiddenDashPattern = /[\u2013\u2014]/g;
const trackedFiles = execFileSync("git", ["ls-files", "-z"])
  .toString("utf8")
  .split("\0")
  .filter(Boolean);

let occurrenceCount = 0;

for (const filePath of trackedFiles) {
  const contents = readFileSync(filePath);
  if (contents.includes(0)) continue;

  const text = contents.toString("utf8");
  for (const match of text.matchAll(forbiddenDashPattern)) {
    const lineNumber = text.slice(0, match.index).split("\n").length;
    console.error(`${filePath}:${lineNumber}`);
    occurrenceCount += 1;
  }
}

if (occurrenceCount > 0) {
  console.error(
    `${occurrenceCount} occurrence${occurrenceCount > 1 ? "s" : ""} de U+2013 ou U+2014 détectée${
      occurrenceCount > 1 ? "s" : ""
    }.`,
  );
  process.exitCode = 1;
}
