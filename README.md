# RS Ride Safe Philippines

A static React + Vite + TypeScript motorcycle safety proof of concept. The centered desktop phone contains the actual app; mobile browsers get a full-screen interface.

Intended site: https://codingwally.github.io/RIDESAFE/

## Development

Use Node.js 22 or newer. No backend, paid API, or API key is required.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite uses `/RIDESAFE/` as its base path. Use the path shown by Vite when opening a local server. The app uses local state tabs, so GitHub Pages requires no SPA URL rewrite.

### Browser tests

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

The default executable is `/usr/bin/chromium`. Browser tests intentionally intercept external map services with test-only fixtures and abort tiles. No fixtures are used by the application. Tests cover routing alternatives and failures, explicit search, nearby essentials, mobile layout, reports, quizzes, community posts, reward thresholds and redemption, profile persistence, corrupt local storage, and foreground GPS cleanup. Five unit tests check score weighting, limits, storage validation, and service-area bounds.

## Features

- Leaflet and attributed OpenStreetMap tiles; zoom, optional foreground GPS, follow-location, and explicit departure selection. GPS permission failure leaves the manual planner available.
- Eight selectable Metro Manila/Pampanga landmarks; submitted Nominatim searches constrained to the Philippines, cached in memory and limited to one request per 1.2 seconds. No autocomplete requests.
- OSRM route previews with distance, estimated time, and alternatives when returned. Saved destinations are recalculated when reopened.
- On-demand OSM gas stations and explicitly tagged motorcycle-repair facilities within 3 km of the map center. No invented listings. Missing data is not evidence that services do not exist.
- Demo hazard map layer, local road reports, community categories and posting, four lessons with graded quizzes, rider profiles, simulated Safety Score, and threshold-gated demo redemptions.
- Separate LTO, national motorcycle law, expressway, and LGU information sections. RA 10054 and RA 10913 checked against Lawphil primary texts on 15 October 2026. This is not a guarantee of subsequent legal currency.

## Honest boundaries

OSRM's public driving profile is car-based, **not a motorcycle-aware routing engine**. The app does not infer legal access or filter expressways. Below-400cc warnings are explicit; 400cc or above is not blanket road clearance. There is no turn-by-turn guidance, speed-limit dataset, live traffic, verified live hazard feed, or safety certification. Follow signs and verify current rules with authorities and operators.

The Safety Score is entirely simulated: speed compliance 40%, smooth braking 20%, gentle acceleration 15%, safe patterns 25%. Browser GPS is not used to measure those behaviors. Harsh braking may be necessary to avoid a collision. Never prioritize a score over safety.

All Honda, Kawasaki, Suzuki, and Yamaha offers are hypothetical examples with no monetary value and no partnerships. RS has no manufacturer or MDPPA affiliation or endorsement. Reports and posts are local examples, not submissions to public services or other riders. Event examples are not scheduled events.

## Data and service use

`localStorage` retains profiles, demo reports, posts, learning progress, score inputs, saved destinations, and redemption records. Storage failures display a session-only notice. Nothing is uploaded to a shared backend.

Third-party services receive only information required for their requests:

| Service             | Data sent                          | Notes                                                                    |
| ------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| OpenStreetMap tiles | Visible tile coordinates           | Attribution remains visible; no bulk downloads or offline tile cache     |
| Nominatim           | Submitted query, restricted to PH  | Cached; at least 1.2 seconds between uncached searches                   |
| OSRM public demo    | Selected departure and destination | Car-routing approximation; no traffic or motorcycle filtering            |
| Overpass            | Map-center coordinates within 3 km | User-initiated; at least 30 seconds between requests; 50 results maximum |

GPS is opt-in, foreground only. The watch is cleared on tab changes, document hiding, and component cleanup. GPS updates do not automatically trigger route requests. Set a GPS location as departure explicitly. Browser permissions and HTTPS are required in production.

Public services have no uptime guarantee; failures are displayed without fabricated fallback routes or hazards. Review their policies and migrate to suitable hosted services before material traffic: [OSM tiles](https://operations.osmfoundation.org/policies/tiles/), [Nominatim](https://operations.osmfoundation.org/policies/nominatim/), [OSRM](https://github.com/Project-OSRM/osrm-backend/wiki/Demo-server), [Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API).

Fonts are self-hosted through Fontsource packages. No external font request or secret is embedded in the build.

## Deployment

The `.github/workflows/deploy.yml` workflow runs unit tests and the production build on pushes to `main`, then deploys `dist` with GitHub Pages Actions. It uses Node 22 and least-needed workflow permissions.

1. Use the user-provided repository `codingwally/RIDESAFE`. The repository was verified empty before this application was pushed.
2. Push this repository's `main` branch to `https://github.com/codingwally/RIDESAFE.git`.
3. In that repository's **Settings → Pages**, choose **GitHub Actions** as the source (or enable Pages with `build_type: workflow` via the API).
4. Run or rerun **Deploy to GitHub Pages**. Confirm the deployment succeeds, then visit the intended site above.

The deployment workflow targets the user-provided `codingwally/RIDESAFE` repository. A configured workflow alone is not proof of a successful Pages deployment; check the Actions run and published site.

## Project structure

- `src/data.ts`: shared TypeScript models, destinations, educational content, labeled demo datasets.
- `src/api.ts`: routing, search, and nearby-service adapters.
- `src/state.ts`: browser persistence and platform-independent simulated scoring functions.
- `src/MapView.tsx`: interactive Leaflet planner and foreground location lifecycle.
- `src/Panels.tsx`: education, reports, community, profile, regulations, and reward flows.
- `src/App.tsx`: desktop phone shell, mobile layout, and navigation.

These interfaces and pure functions can be reused or extracted for a future Android app and shared backend. The web UI does not implement background tracking.
