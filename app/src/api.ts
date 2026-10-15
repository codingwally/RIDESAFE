import type { Place } from "./data";
export type Route = {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
  legs: { summary: string }[];
};
export type Essential = {
  id: string;
  name: string;
  type: "fuel" | "repair";
  lat: number;
  lon: number;
};
async function request(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok)
    throw new Error(
      `Service returned ${response.status}. Please try again later.`,
    );
  return response.json();
}
const cache = new Map<string, Place[]>();
let lastSearch = 0;
export async function searchPlaces(query: string): Promise<Place[]> {
  const key = query.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  if (Date.now() - lastSearch < 1200)
    throw new Error("Please wait a moment before searching again.");
  lastSearch = Date.now();
  const data = await request(
    `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q: query, format: "jsonv2", countrycodes: "ph", limit: "5", "accept-language": "en" })}`,
  );
  const result = data.map(
    (p: {
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
    }) => ({
      id: String(p.place_id),
      name: p.display_name.split(",")[0],
      area: p.display_name.split(",").slice(1, 4).join(","),
      lat: Number(p.lat),
      lon: Number(p.lon),
    }),
  );
  cache.set(key, result);
  return result;
}
export async function getRoutes(from: Place, to: Place): Promise<Route[]> {
  const data = await request(
    `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson&alternatives=true&steps=false`,
  );
  if (data.code !== "Ok" || !data.routes?.length)
    throw new Error(
      "No route was found between these locations. Try another destination.",
    );
  return data.routes;
}
let lastNearby = 0;
export async function getEssentials(center: Place): Promise<Essential[]> {
  if (Date.now() - lastNearby < 30000)
    throw new Error("Please wait 30 seconds between nearby searches.");
  lastNearby = Date.now();
  const repair = `[out:json][timeout:12];(nwr(around:3000,${center.lat},${center.lon})[amenity=fuel];nwr(around:3000,${center.lat},${center.lon})[shop=motorcycle]["service:motorcycle:repair"=yes];);out center 50;`;
  const data = await request(
    `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(repair)}`,
  );
  return data.elements
    .map(
      (p: {
        type: string;
        id: number;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags: Record<string, string>;
      }) => ({
        id: `${p.type}-${p.id}`,
        name:
          p.tags.name ||
          (p.tags.amenity === "fuel" ? "Gas station" : "Motorcycle repair"),
        type: p.tags.amenity === "fuel" ? "fuel" : "repair",
        lat: p.lat ?? p.center?.lat,
        lon: p.lon ?? p.center?.lon,
      }),
    )
    .filter((p: Essential) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
}
