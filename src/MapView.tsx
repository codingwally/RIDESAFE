import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  Search,
  X,
  LocateFixed,
  Plus,
  Minus,
  ChevronRight,
  ArrowUpRight,
  Navigation,
  Fuel,
  TriangleAlert,
  Layers,
  MapPin,
  Bookmark,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";
import { places, start } from "./data";
import type { Place, Report } from "./data";
import { getRoutes, searchPlaces, getEssentials } from "./api";
import type { Route, Essential } from "./api";
import { inPhilippines } from "./state";

function MapSync({
  route,
  focus,
  active,
  zoom,
  onCenter,
}: {
  route?: Route;
  focus: Place;
  active: boolean;
  zoom: number;
  onCenter: (p: Place) => void;
}) {
  const map = useMap();
  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onCenter({
        id: "center",
        name: "Map center",
        area: "Current map view",
        lat: c.lat,
        lon: c.lng,
      });
    },
  });
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => map.invalidateSize(), 100);
      return () => clearTimeout(timer);
    }
  }, [active, map]);
  useEffect(() => {
    map.flyTo([focus.lat, focus.lon], map.getZoom(), { duration: 0.7 });
  }, [focus, map]);
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  useEffect(() => {
    if (route)
      map.fitBounds(
        route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
        {
          paddingTopLeft: [32, 155],
          paddingBottomRight: [32, 230],
          maxZoom: 15,
        },
      );
  }, [route, map]);
  return null;
}
function TileHealth({ onError }: { onError: () => void }) {
  return (
    <TileLayer
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
      eventHandlers={{ tileerror: onError }}
    />
  );
}
export default function MapView({
  active,
  cc,
  reports,
  saved,
  onSave,
  launch,
}: {
  active: boolean;
  cc: number;
  reports: Report[];
  saved: Place[];
  onSave: (p: Place) => void;
  launch: Place | null;
}) {
  const [origin, setOrigin] = useState<Place>(start),
    [destination, setDestination] = useState<Place | null>(null);
  const [focus, setFocus] = useState<Place>(start),
    [zoom, setZoom] = useState(12),
    [mapCenter, setMapCenter] = useState<Place>(start);
  const [query, setQuery] = useState(""),
    [searchOpen, setSearchOpen] = useState(false),
    [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false),
    [routing, setRouting] = useState(false),
    [routes, setRoutes] = useState<Route[]>([]),
    [selected, setSelected] = useState(0);
  const [message, setMessage] = useState(""),
    [tileError, setTileError] = useState(false),
    [following, setFollowing] = useState(false),
    [gps, setGps] = useState<Place | null>(null);
  const [showDemo, setShowDemo] = useState(false),
    [essentials, setEssentials] = useState<Essential[]>([]),
    [nearbyLoading, setNearbyLoading] = useState(false),
    [showLayers, setShowLayers] = useState(false);
  const routeSequence = useRef(0),
    requestSequence = useRef(0);
  const filtered = places.filter((p) =>
    `${p.name} ${p.area}`.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (launch) {
      setDestination(launch);
      setSearchOpen(false);
      setRoutes([]);
      setMessage("");
    }
  }, [launch]);
  useEffect(() => {
    const current = ++routeSequence.current;
    setRoutes([]);
    setSelected(0);
    setRouting(false);
    if (!destination) return;
    setRouting(true);
    setMessage("");
    getRoutes(origin, destination)
      .then((data) => {
        if (routeSequence.current === current) setRoutes(data);
      })
      .catch((e) => {
        if (routeSequence.current === current)
          setMessage(
            `Route unavailable. ${e.message} No route has been simulated.`,
          );
      })
      .finally(() => {
        if (routeSequence.current === current) setRouting(false);
      });
    return () => {
      routeSequence.current++;
    };
  }, [origin, destination]);
  useEffect(() => {
    if (!active) setFollowing(false);
  }, [active]);
  useEffect(() => {
    if (!following || !active) return;
    if (!navigator.geolocation) {
      setMessage(
        "This browser does not support location. Use the departure selector.",
      );
      setFollowing(false);
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => {
        if (!inPhilippines(p.coords.latitude, p.coords.longitude)) {
          setMessage(
            "Your location is outside the Philippine service area. Choose a Philippine departure.",
          );
          setFollowing(false);
          return;
        }
        const place: Place = {
          id: "gps",
          name: "My GPS location",
          area: `Accuracy approximately ${Math.round(p.coords.accuracy)} m`,
          lat: p.coords.latitude,
          lon: p.coords.longitude,
        };
        setGps(place);
        setFocus(place);
        setZoom(15);
      },
      (e) => {
        setMessage(
          e.code === 1
            ? "Location permission denied. Choose a departure instead."
            : "GPS location unavailable. Try outdoors or choose a departure.",
        );
        setFollowing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
    const hide = () => {
      if (document.hidden) setFollowing(false);
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      navigator.geolocation.clearWatch(id);
      document.removeEventListener("visibilitychange", hide);
    };
  }, [following, active]);
  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 3 || searching) return;
    const n = ++requestSequence.current;
    setSearching(true);
    setMessage("");
    try {
      const found = await searchPlaces(query.trim());
      if (n === requestSequence.current) {
        setResults(found);
        if (!found.length)
          setMessage(
            "No Philippine destinations found. Try a city or landmark.",
          );
      }
    } catch (e) {
      setMessage(
        `Search unavailable. ${(e as Error).message} You can still choose a listed destination.`,
      );
    } finally {
      if (n === requestSequence.current) setSearching(false);
    }
  }
  function choose(p: Place) {
    requestSequence.current++;
    setSearching(false);
    setDestination(p);
    setFocus(p);
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setFollowing(false);
  }
  async function nearby() {
    setNearbyLoading(true);
    setMessage("");
    try {
      const found = await getEssentials(mapCenter);
      setEssentials(found);
      setMessage(
        found.length
          ? `${found.length} OSM essentials within 3 km of the map center. Listings may be incomplete; confirm opening hours and service.`
          : "No mapped essentials found within 3 km of the map center. This does not mean none exist.",
      );
    } catch (e) {
      setMessage(`Nearby search unavailable. ${(e as Error).message}`);
    } finally {
      setNearbyLoading(false);
    }
  }
  const route = routes[selected];
  return (
    <section className="map-view" aria-label="Philippines route planner">
      <MapContainer
        center={[start.lat, start.lon]}
        zoom={12}
        zoomControl={false}
        className="map-canvas"
      >
        <TileHealth onError={() => setTileError(true)} />
        <MapSync
          route={route}
          focus={focus}
          zoom={zoom}
          active={active}
          onCenter={setMapCenter}
        />
        <CircleMarker
          center={[origin.lat, origin.lon]}
          radius={7}
          pathOptions={{
            color: "#fff",
            weight: 3,
            fillColor: "#155be8",
            fillOpacity: 1,
          }}
        >
          <Popup>Departure: {origin.name}</Popup>
        </CircleMarker>
        {gps && (
          <CircleMarker
            center={[gps.lat, gps.lon]}
            radius={9}
            pathOptions={{
              color: "#155be8",
              fillColor: "#155be8",
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              {gps.name}
              <br />
              {gps.area}
            </Popup>
          </CircleMarker>
        )}
        {routes.map((r, i) => (
          <Polyline
            key={i}
            positions={r.geometry.coordinates.map(([lon, lat]) => [lat, lon])}
            pathOptions={{
              color: i === selected ? "#155be8" : "#98aec8",
              weight: i === selected ? 6 : 4,
              opacity: 0.9,
            }}
            eventHandlers={{ click: () => setSelected(i) }}
          />
        ))}
        {destination && (
          <CircleMarker
            center={[destination.lat, destination.lon]}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 3,
              fillColor: "#10243a",
              fillOpacity: 1,
            }}
          >
            <Popup>{destination.name}</Popup>
          </CircleMarker>
        )}
        {showDemo &&
          reports
            .filter((r) => r.lat && r.lon)
            .map((r) => (
              <CircleMarker
                key={r.id}
                center={[r.lat!, r.lon!]}
                radius={8}
                pathOptions={{
                  color: "#a6600b",
                  fillColor: "#f8b84e",
                  fillOpacity: 1,
                }}
              >
                <Popup>
                  <strong>DEMO · {r.type}</strong>
                  <br />
                  {r.description}
                  <br />
                  Not a live hazard.
                </Popup>
              </CircleMarker>
            ))}
        {essentials.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={6}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: p.type === "fuel" ? "#158167" : "#7654a9",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.type === "fuel" ? "Gas station" : "Motorcycle repair"} ·
              OpenStreetMap
              <br />
              Availability not verified.
              <br />
              <button
                onClick={() => choose({ ...p, area: "OpenStreetMap listing" })}
              >
                Preview route here
              </button>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="map-top">
        <button className="search-trigger" onClick={() => setSearchOpen(true)}>
          <Search size={20} />
          <span>
            {destination ? destination.name : "Where are you riding?"}
            <small>
              {destination
                ? destination.area
                : "Find a place. Plan a safer ride."}
            </small>
          </span>
          <span className="keycap">
            <ArrowUpRight size={17} />
          </span>
        </button>
        <div className="map-pills">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className={showLayers ? "active" : ""}
          >
            <Layers size={14} />
            Map layers
          </button>
          <span className="profile-pill">
            <span className="dot" />
            {cc}cc · {cc < 400 ? "Below 400cc" : "400cc & above"}
          </span>
        </div>
        {showLayers && (
          <div className="layer-panel">
            <label className="toggle-label">
              <span>
                Demo hazard markers<small>Illustrative, not live reports</small>
              </span>
              <input
                type="checkbox"
                checked={showDemo}
                onChange={(e) => setShowDemo(e.target.checked)}
              />
            </label>
            <button
              className="text-button"
              disabled={nearbyLoading}
              onClick={nearby}
            >
              <Fuel size={16} />
              {nearbyLoading
                ? "Searching OSM…"
                : "Find gas & motorcycle repair"}
            </button>
            <small>
              OpenStreetMap data · within 3 km of current map center
            </small>
          </div>
        )}
      </div>
      <div className="map-tools">
        <button
          aria-label="Zoom in"
          onClick={() => setZoom((z) => Math.min(z + 1, 19))}
        >
          <Plus size={19} />
        </button>
        <button
          aria-label="Zoom out"
          onClick={() => setZoom((z) => Math.max(z - 1, 5))}
        >
          <Minus size={19} />
        </button>
        <button
          aria-label={
            following ? "Stop following location" : "Follow my location"
          }
          className={following ? "active" : ""}
          onClick={() => {
            setMessage("");
            setFollowing(!following);
          }}
        >
          <LocateFixed size={20} />
        </button>
      </div>
      <div className="map-bottom">
        {tileError && (
          <div className="map-notice">
            Map tiles unavailable on this network. Search and route services may
            also be limited.{" "}
            <button
              onClick={() => {
                setTileError(false);
                setZoom((z) => (z === 12 ? 13 : 12));
              }}
            >
              Retry
            </button>
          </div>
        )}
        {message && (
          <div role="status" className="map-notice">
            <span>{message}</span>
            <button
              aria-label="Dismiss map message"
              onClick={() => setMessage("")}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {destination ? (
          <div className="route-card">
            <div className="row between">
              <span className="eyebrow">ROUTE PREVIEW</span>
              <button
                className="icon-button small"
                aria-label="Clear destination"
                onClick={() => {
                  setDestination(null);
                  setRoutes([]);
                  setMessage("");
                  setFocus(origin);
                }}
              >
                <X size={17} />
              </button>
            </div>
            <label className="departure-label">
              From{" "}
              <select
                aria-label="Departure"
                value={origin.id}
                onChange={(e) => {
                  const p = [start, ...places, ...(gps ? [gps] : [])].find(
                    (p) => p.id === e.target.value,
                  );
                  if (p) setOrigin(p);
                }}
              >
                {[start, ...places, ...(gps ? [gps] : [])].map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {routing ? (
              <p className="loading">
                <LoaderCircle className="spin" size={16} /> Finding available
                routes…
              </p>
            ) : route ? (
              <>
                <div className="route-summary">
                  <strong>
                    {Math.round(route.duration / 60)} <span>min</span>
                  </strong>
                  <span>
                    {(route.distance / 1000).toFixed(1)} km{" "}
                    <small>Estimated · no live traffic</small>
                  </span>
                  <button
                    aria-label="Save route destination"
                    className="icon-button"
                    onClick={() => onSave(destination)}
                  >
                    <Bookmark
                      size={20}
                      fill={
                        saved.some((p) => p.id === destination.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
                <div className="alternatives">
                  {routes.map((r, i) => (
                    <button
                      className={i === selected ? "selected" : ""}
                      key={i}
                      onClick={() => setSelected(i)}
                    >
                      Route {i + 1} · {Math.round(r.duration / 60)} min
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="muted">
                No route available. Change the departure or destination.
              </p>
            )}
            <p className="route-warning">
              <TriangleAlert size={13} />
              <span>
                Car-based OSRM preview. Motorcycle access and{" "}
                {cc < 400 ? "sub-400cc expressway" : "road"} restrictions are
                not verified. Check signs and official rules; do not use as
                turn-by-turn guidance.
              </span>
            </p>
          </div>
        ) : (
          <div className="explore-card">
            <div className="row between">
              <div>
                <span className="eyebrow">LET’S RIDE RESPONSIBLY</span>
                <h2>A better ride starts here.</h2>
              </div>
              <div className="round-icon">
                <Navigation size={22} />
              </div>
            </div>
            <p>Plan ahead. Stay aware. Get home safe.</p>
            <div className="quick-destinations">
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setQuery("Metro Manila");
                }}
              >
                Metro Manila <ChevronRight size={14} />
              </button>
              <button
                onClick={() => {
                  setSearchOpen(true);
                  setQuery("Pampanga");
                }}
              >
                Pampanga <ChevronRight size={14} />
              </button>
            </div>
            <div className="map-source">
              <span className="dot" />
              Live map · reports are demo only
            </div>
          </div>
        )}
      </div>
      {searchOpen && (
        <div className="search-sheet">
          <div className="row">
            <button
              className="icon-button"
              aria-label="Close destination search"
              onClick={() => {
                setSearchOpen(false);
                requestSequence.current++;
                setSearching(false);
              }}
            >
              <ArrowLeft size={20} />
            </button>
            <h2>Find your next stop</h2>
          </div>
          <form onSubmit={search} className="search-form">
            <Search size={18} />
            <input
              autoFocus
              aria-label="Search Philippine destinations"
              placeholder="City, landmark, or address"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setResults([]);
                requestSequence.current++;
                setSearching(false);
              }}
            />
            <button
              className="primary compact"
              disabled={query.trim().length < 3 || searching}
            >
              {searching ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                "Search"
              )}
            </button>
          </form>
          <p className="muted small-text">
            Search Philippine places with OpenStreetMap. Search runs only when
            submitted.
          </p>
          <h3>{results.length ? "Search results" : "Popular destinations"}</h3>
          <div className="place-list">
            {(results.length ? results : filtered).map((p) => (
              <button key={p.id} onClick={() => choose(p)}>
                <span className="place-icon">
                  <MapPin size={19} />
                </span>
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.area}</small>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
          {!filtered.length && !results.length && (
            <p className="empty">Press Search to look up this destination.</p>
          )}
          {message && (
            <p role="status" className="notice">
              {message}
            </p>
          )}
          <div className="notice">
            <Navigation size={16} />
            <span>
              Set your route while parked. Keep your attention on the road.
            </span>
          </div>
          <p className="source-credit">
            Search © OpenStreetMap contributors · Nominatim
          </p>
        </div>
      )}
    </section>
  );
}
