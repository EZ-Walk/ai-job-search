import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const resumeDir = path.join(repoRoot, "resume");
const texFile = "notion-native.tex";
const builtPdf = path.join(resumeDir, "notion-native.pdf");
const outPath = path.join(repoRoot, "public/ethan-zaruba-walker-resume.pdf");

const lualatex = spawnSync("which", ["lualatex"], { encoding: "utf8" });
if (lualatex.status !== 0) {
  if (fs.existsSync(outPath)) {
    console.warn("lualatex not found; keeping committed public/ethan-zaruba-walker-resume.pdf");
    process.exit(0);
  }
  throw new Error("lualatex not found and no committed resume PDF exists");
}

const run = spawnSync("lualatex", ["-interaction=nonstopmode", texFile], {
  cwd: resumeDir,
  encoding: "utf8",
});

if (run.status !== 0) {
  console.error(run.stdout);
  console.error(run.stderr);
  throw new Error(`lualatex failed with status ${run.status}`);
}

if (!fs.existsSync(builtPdf)) {
  throw new Error(`Expected PDF at ${builtPdf}`);
}

fs.copyFileSync(builtPdf, outPath);

for (const ext of [".aux", ".log", ".out"]) {
  const artifact = path.join(resumeDir, `notion-native${ext}`);
  if (fs.existsSync(artifact)) {
    fs.unlinkSync(artifact);
  }
}

console.log(`Wrote ${outPath}`);
