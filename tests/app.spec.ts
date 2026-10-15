import { test, expect } from "@playwright/test";
const routeFixture = {
  code: "Ok",
  routes: [
    {
      distance: 11200,
      duration: 1500,
      geometry: {
        coordinates: [
          [120.9842, 14.5995],
          [121.01, 14.62],
          [121.0493, 14.6516],
        ],
      },
      legs: [{ summary: "Test route A" }],
    },
    {
      distance: 13500,
      duration: 1800,
      geometry: {
        coordinates: [
          [120.9842, 14.5995],
          [121.02, 14.6],
          [121.0493, 14.6516],
        ],
      },
      legs: [{ summary: "Test route B" }],
    },
  ],
};
test.beforeEach(async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (r) => r.abort());
  await page.route("https://router.project-osrm.org/**", (r) =>
    r.fulfill({ json: routeFixture }),
  );
  await page.goto("./");
});
test("phone app renders at desktop and fits mobile without horizontal overflow", async ({
  page,
}) => {
  await expect(
    page.getByRole("button", { name: /Where are you riding/ }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page
      .locator(".phone")
      .evaluate((e) => Math.round(e.getBoundingClientRect().width)),
  ).toBe(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeInViewport();
  await page.screenshot({ path: "/tmp/rs-mobile.png" });
});
test("selects destinations, switches route alternatives, changes departure and saves", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Metro Manila", exact: true }).click();
  await page.getByRole("button", { name: /Quezon Memorial Circle/ }).click();
  await expect(page.getByText("11.2 km")).toBeVisible();
  await expect(page.getByText(/sub-400cc expressway/)).toBeVisible();
  await page.getByRole("button", { name: "Route 2 · 30 min" }).click();
  await expect(page.getByText("13.5 km")).toBeVisible();
  await page.getByLabel("Departure", { exact: true }).selectOption("bgc");
  await expect(page.getByText("11.2 km")).toBeVisible();
  await page.getByRole("button", { name: "Save route destination" }).click();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: /Saved destinations/ }).click();
  await expect(
    page.getByRole("heading", { name: "Quezon Memorial Circle" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Open route/ }).click();
  await expect(page.getByText("11.2 km")).toBeVisible();
});
test("search submits once, renders results and displays route failures honestly", async ({
  page,
}) => {
  let requests = 0;
  await page.route("https://nominatim.openstreetmap.org/**", (r) => {
    requests++;
    return r.fulfill({
      json: [
        {
          place_id: 100,
          display_name: "Test landmark, Pampanga, Philippines",
          lat: "15.18",
          lon: "120.52",
        },
      ],
    });
  });
  await page.getByRole("button", { name: /Where are you riding/ }).click();
  await page.getByLabel("Search Philippine destinations").fill("Test landmark");
  expect(requests).toBe(0);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Test landmark,?/ }),
  ).toBeVisible();
  expect(requests).toBe(1);
  await page.route("https://router.project-osrm.org/**", (r) =>
    r.fulfill({ status: 503, json: {} }),
  );
  await page.getByRole("button", { name: /Test landmark,?/ }).click();
  await expect(page.getByText(/No route has been simulated/)).toBeVisible();
  await expect(page.locator(".alternatives")).toHaveCount(0);
});
test("nearby essentials use OSM responses and demo hazards require opt-in", async ({
  page,
}) => {
  await page.route("https://overpass-api.de/**", (r) =>
    r.fulfill({
      json: {
        elements: [
          {
            type: "node",
            id: 123,
            lat: 14.601,
            lon: 120.985,
            tags: { amenity: "fuel", name: "Test fuel" },
          },
        ],
      },
    }),
  );
  await page.getByRole("button", { name: "Map layers" }).click();
  await expect(
    page.getByRole("checkbox", { name: /Demo hazard markers/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /Demo hazard markers/ }).check();
  await page.getByRole("button", { name: /Find gas/ }).click();
  await expect(page.getByText(/1 OSM essentials/)).toBeVisible();
});
test("reports persist locally and can be deleted", async ({ page }) => {
  await page.getByRole("button", { name: "Alerts", exact: true }).click();
  await page.getByRole("button", { name: "Report a road concern" }).click();
  await page.getByLabel("Concern type").selectOption("Incident");
  await page
    .getByLabel("What should riders know?")
    .fill("Test report with a parked rider and clear location.");
  await page.getByRole("button", { name: "Save demo report" }).click();
  await expect(
    page.getByText(/Demo report saved on this device/),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Alerts", exact: true }).click();
  await page.getByRole("button", { name: "Incident", exact: true }).click();
  await expect(
    page.getByText("Test report with a parked rider and clear location."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByText("No demo reports in this category."),
  ).toBeVisible();
});
test("quiz rejects a wrong answer, completes a lesson, and retains progress", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Education", exact: true }).click();
  await page.getByRole("button", { name: /Read the road ahead/ }).click();
  await page.getByLabel("Close the gap to the rider ahead").check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Not quite/)).toBeVisible();
  await page.getByLabel("Reduce speed and increase following distance").check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText(/Correct. A small habit/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Education", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "1 of 4 lessons" }),
  ).toBeVisible();
});
test("community form saves a local announcement", async ({ page }) => {
  await page.getByRole("button", { name: "Community", exact: true }).click();
  await page.getByRole("button", { name: "Start a conversation" }).click();
  await page
    .getByLabel("Category", { exact: true })
    .selectOption("Announcement");
  await page.getByLabel("Title", { exact: true }).fill("Local rider test");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Remember to check tires before setting off.");
  await page.getByRole("button", { name: "Save local post" }).click();
  await page.getByRole("button", { name: "Announcement", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Local rider test" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Community", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Local rider test" }),
  ).toBeVisible();
});
test("simulation unlocks rewards, prevents repeat redemption, and profile persists", async ({
  page,
}) => {
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("button", { name: /Demo rewards/ }).click();
  await expect(page.getByRole("button", { name: "Locked" })).toHaveCount(2);
  await page
    .getByRole("button", { name: "Rider dashboard", exact: true })
    .click();
  await page.getByRole("button", { name: "Try a simulated ride" }).click();
  await page.getByRole("button", { name: "Steady, safe riding" }).click();
  await expect(page.getByRole("status")).toHaveText(/86 of 100/);
  await page.getByRole("button", { name: "Steady, safe riding" }).click();
  await page.getByRole("button", { name: /Demo rewards/ }).click();
  await expect(page.getByRole("button", { name: "Locked" })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Redeem demo", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Redeemed", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Rider dashboard", exact: true })
    .click();
  await page.getByRole("button", { name: /Profile & settings/ }).click();
  await page.getByLabel("Rider name").fill("Alex");
  await page.getByRole("button", { name: "400cc", exact: true }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await page.reload();
  await expect(page.getByText("400cc · 400cc & above")).toBeVisible();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Alex", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Demo rewards/ }).click();
  await expect(
    page.getByRole("button", { name: "Redeemed", exact: true }),
  ).toBeDisabled();
});
test("GPS foreground lifecycle clears tracking after changing tabs", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        watchPosition: (success: PositionCallback) => {
          success({
            coords: { latitude: 14.6, longitude: 120.98, accuracy: 12 },
            timestamp: Date.now(),
          } as GeolocationPosition);
          return 77;
        },
        clearWatch: (id: number) => {
          sessionStorage.setItem("cleared-watch", String(id));
        },
      },
    });
  });
  await page.reload();
  await page.getByRole("button", { name: "Follow my location" }).click();
  await expect(
    page.getByRole("button", { name: "Stop following location" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "More", exact: true }).click();
  expect(
    await page.evaluate(() => sessionStorage.getItem("cleared-watch")),
  ).toBe("77");
});
test("invalid browser state recovers and legal references are distinct", async ({
  page,
}) => {
  await page.evaluate(() => {
    localStorage.setItem("rs-score", '{"compliance":999}');
    localStorage.setItem("rs-reports", "{invalid");
  });
  await page.reload();
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(page.locator(".score-ring strong")).toHaveText("82");
  await page.getByRole("button", { name: "Rules & regulations" }).click();
  await expect(page.getByRole("link", { name: /RA 10054/ })).toHaveAttribute(
    "href",
    /lawphil.net/,
  );
  await expect(page.getByRole("link", { name: /RA 10913/ })).toHaveAttribute(
    "href",
    /lawphil.net/,
  );
  await expect(
    page.getByRole("heading", { name: "LGU ordinances" }),
  ).toBeVisible();
});
