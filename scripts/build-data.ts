/**
 * Regenerates `src/data/us.json` from the US Social Security Administration
 * national baby-names dataset (public domain).
 *
 * Usage:
 *   1. Download https://www.ssa.gov/oact/babynames/names.zip
 *   2. Unzip the `yobXXXX.txt` files into `scripts/source/`
 *   3. `npm run build:data`
 *
 * Each `yobXXXX.txt` line is `Name,Sex,Count` (e.g. `Mary,F,7065`). We sum every
 * year so each name carries its all-time male and female birth counts, which is
 * what lets us return a probability rather than a single hard-coded label.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(here, "source");
const outFile = join(here, "..", "src", "data", "us.json");

// name -> [maleCount, femaleCount]
const counts = new Map<string, [number, number]>();

const files = readdirSync(sourceDir).filter((f) => /^yob\d{4}\.txt$/.test(f));
if (files.length === 0) {
  throw new Error(`No yobXXXX.txt files found in ${sourceDir}. See the header comment for setup steps.`);
}

for (const file of files) {
  const text = readFileSync(join(sourceDir, file), "utf8");
  for (const line of text.split("\n")) {
    const [rawName, sex, rawCount] = line.trim().split(",");
    if (!rawName || !sex) continue;
    const name = rawName.toLowerCase();
    const count = Number.parseInt(rawCount ?? "", 10) || 0;
    const entry = counts.get(name) ?? [0, 0];
    if (sex === "M") entry[0] += count;
    else if (sex === "F") entry[1] += count;
    counts.set(name, entry);
  }
}

// Sort keys so regenerating produces a stable, diff-friendly file.
const sorted: Record<string, [number, number]> = {};
for (const name of [...counts.keys()].sort()) sorted[name] = counts.get(name)!;

writeFileSync(outFile, JSON.stringify(sorted));
console.log(`Wrote ${Object.keys(sorted).length} names from ${files.length} year files to ${outFile}`);
