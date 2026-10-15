import { cp, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
const html = await readFile(path.join(output, "index.html"), "utf8");
if (!html.includes("/RIDESAFE/assets/") || html.includes("/src/main.tsx")) {
  throw new Error("Refusing to publish an HTML entry without compiled assets.");
}
// GitHub Pages may publish either an Actions artifact or main/root. Both must
// contain the built app. Keep earlier hashed assets so cached HTML still works.
for (const entry of await readdir(output)) {
  await cp(path.join(output, entry), path.join(root, entry), {
    recursive: true,
  });
}
await writeFile(path.join(root, ".nojekyll"), "");
await writeFile(path.join(output, ".nojekyll"), "");
console.log("Prepared a compiled site for both Pages publishing modes.");
