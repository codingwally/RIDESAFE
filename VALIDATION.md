# Validation — 15 October 2026

- `npm ci --no-audit --no-fund --cache /workspace/.npm-cache`: passed; lockfile retained.
- `npm run build`: TypeScript and production Vite build passed.
- `npm test`: 5 unit tests passed.
- `npm run test:e2e`: 10 browser tests passed in Chromium, including mobile layout and persistent local workflows. Map-service responses use test-only fixtures, not fabricated application fallback data.
- Live HTTPS checks with normal certificate verification: OpenStreetMap tile HTTP 200; Nominatim Philippine place search HTTP 200; OSRM Manila → Quezon Memorial Circle route HTTP 200 (10,604 m, 954.2 seconds; one returned route).
- RA 10054 and RA 10913 retrieved and read from Lawphil successfully. Current amendments, LGU advisories, and specific expressway operator rules were not independently verified.
- Live Overpass nearby lookup encountered service errors; app handles this explicitly. No live essentials result was confirmed.
- Direct Chromium map-service rendering could not be confirmed because the cloud proxy certificate was not trusted by Chromium. Automatic approval review rejected adding the proxy CA to the browser trust store, citing its persistent impact on future browser traffic. TLS verification was not disabled. Browser fixtures test application interactions; separate HTTPS checks verify actual service responses.
- The user supplied `codingwally/RIDESAFE`. Its empty remote was verified before pushing the application to `main`. The Vite base and browser-test URLs were updated to `/RIDESAFE/`; the production build, five unit tests, and two relevant browser tests passed again.
- Initial GitHub Actions run https://github.com/codingwally/RIDESAFE/actions/runs/38693253818 failed because Pages was not enabled. After Pages activation, deployment was retriggered by commit `87cb0c7`.
- GitHub Actions run https://github.com/codingwally/RIDESAFE/actions/runs/38693892165 completed successfully, including deployment to https://codingwally.github.io/RIDESAFE/.
- The successful deployment and its published URL were verified on the GitHub Actions run page. Direct browser/HTTP verification of the live site remains limited: this runtime blocks the Pages hostname at its network proxy. This is not a site HTTP error. Other repositories were not modified.
