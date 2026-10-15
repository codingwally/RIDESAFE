import { test, expect } from "@playwright/test";
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
let server: Server;
let address: string;

test.beforeAll(async () => {
  // Serve the checkout exactly as main/root Pages does: no Vite transforms.
  server = createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    if (!url.pathname.startsWith("/RIDESAFE/")) {
      response.writeHead(404).end();
      return;
    }
    const relative =
      decodeURIComponent(url.pathname.slice("/RIDESAFE/".length)) ||
      "index.html";
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const mime: Record<string, string> = {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
        ".woff2": "font/woff2",
      };
      response.setHeader(
        "Content-Type",
        mime[path.extname(file)] || "application/octet-stream",
      );
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const socket = server.address();
  if (!socket || typeof socket === "string")
    throw new Error("Static server did not start");
  address = `http://127.0.0.1:${socket.port}`;
});
test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 1000 },
]) {
  test(`fresh browser loads branch-published app at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.route("https://**", (route) => route.abort());
    const runtimeErrors: string[] = [];
    const failedAssets: string[] = [];
    const sourceRequests: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("response", (response) => {
      if (response.url().startsWith(address) && response.status() >= 400)
        failedAssets.push(response.url());
    });
    page.on("request", (request) => {
      if (/\.tsx?(?:\?|$)/.test(request.url()))
        sourceRequests.push(request.url());
    });
    await page.goto(`${address}/RIDESAFE/`);
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Where are you riding/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "More", exact: true }).click();
    await expect(page.locator(".score-ring strong")).toHaveText("82");
    expect(failedAssets).toEqual([]);
    expect(runtimeErrors).toEqual([]);
    expect(sourceRequests).toEqual([]);
  });
}
