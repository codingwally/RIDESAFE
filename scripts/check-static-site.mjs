import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const changes = execFileSync(
  "git",
  [
    "status",
    "--porcelain",
    "--untracked-files=all",
    "--",
    "index.html",
    "icon.svg",
    "assets",
    ".nojekyll",
  ],
  { cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8" },
);
if (changes.trim()) {
  console.error(
    "The branch-published site is out of date. Run npm run build and commit index.html, icon.svg, assets, and .nojekyll.",
  );
  process.exit(1);
}
console.log("Branch-published files match the production build.");
