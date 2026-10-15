import { useState } from "react";
import {
  Map,
  TriangleAlert,
  BookOpen,
  Users,
  Grid2X2,
  ShieldCheck,
  ArrowUpRight,
  Navigation,
  Wifi,
  BatteryFull,
} from "lucide-react";
import MapView from "./MapView";
import { Alerts, Community, Education, More } from "./Panels";
import { sampleReports, samplePosts } from "./data";
import type { Report, Post, Place } from "./data";
import { initialMetrics, isMetrics, isStrings, useStored } from "./state";
const isReports = (v: unknown): v is Report[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      typeof x.id === "string" &&
      typeof x.description === "string" &&
      typeof x.location === "string" &&
      typeof x.type === "string" &&
      typeof x.created === "string" &&
      x.demo === true &&
      (x.lat === undefined || typeof x.lat === "number") &&
      (x.lon === undefined || typeof x.lon === "number"),
  );
const isPosts = (v: unknown): v is Post[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      ["id", "title", "body", "category", "created"].every(
        (k) => typeof x[k] === "string",
      ) &&
      x.demo === true,
  );
const isPlaces = (v: unknown): v is Place[] =>
  Array.isArray(v) &&
  v.every(
    (x) =>
      x &&
      typeof x.id === "string" &&
      typeof x.name === "string" &&
      typeof x.area === "string" &&
      Number.isFinite(x.lat) &&
      Number.isFinite(x.lon),
  );
export default function App() {
  const [tab, setTab] = useState("Map");
  const [cc, setCc, ccError] = useStored(
    "rs-cc",
    125,
    (v): v is number =>
      typeof v === "number" && v >= 50 && v <= 2500 && Number.isInteger(v),
  );
  const [name, setName, nameError] = useStored(
    "rs-name",
    "Guest rider",
    (v): v is string =>
      typeof v === "string" && v.trim().length > 0 && v.length <= 40,
  );
  const [reports, setReports, reportError] = useStored(
    "rs-reports",
    sampleReports,
    isReports,
  );
  const [posts, setPosts, postError] = useStored(
    "rs-posts",
    samplePosts,
    isPosts,
  );
  const [completed, setCompleted, lessonError] = useStored(
    "rs-lessons",
    [],
    isStrings,
  );
  const [metrics, setMetrics, scoreError] = useStored(
    "rs-score",
    initialMetrics,
    isMetrics,
  );
  const [redeemed, setRedeemed, rewardError] = useStored(
    "rs-redeemed",
    [],
    isStrings,
  );
  const [saved, setSaved, savedError] = useStored<Place[]>(
    "rs-saved",
    [],
    isPlaces,
  );
  const [launch, setLaunch] = useState<Place | null>(null);
  const nav = [
    { name: "Map", icon: Map },
    { name: "Alerts", icon: TriangleAlert },
    { name: "Education", icon: BookOpen },
    { name: "Community", icon: Users },
    { name: "More", icon: Grid2X2 },
  ];
  return (
    <div className="website">
      <header className="site-header">
        <a href={import.meta.env.BASE_URL} className="brand">
          <span className="brand-mark">
            RS
            <span />
          </span>
          <span>
            RIDE SAFE<small>PHILIPPINES</small>
          </span>
        </a>
        <div className="site-header-right">
          <span className="status-dot" />
          INDEPENDENT SAFETY INITIATIVE
          <span className="edition">
            WEB PROOF OF CONCEPT <ArrowUpRight size={13} />
          </span>
        </div>
      </header>
      <main className="stage">
        <div className="desktop-intro">
          <span className="eyebrow">FOR THE JOURNEY. FOR EVERY RIDER.</span>
          <h1>
            Your next ride.
            <br />A safer one<span>.</span>
          </h1>
          <p>
            A little preparation goes a long way.
            <br />
            Plan your route, build good habits,
            <br />
            and look out for each other.
          </p>
          <div className="intro-tag">
            <span className="flag">
              <i />
              <i />
            </span>
            Made for Philippine roads.
          </div>
          <div className="intro-rule" />
          <span className="small-text muted">
            REAL MAP. PRACTICAL LEARNING.
            <br />
            ONE SHARED RESPONSIBILITY.
          </span>
        </div>
        <div className="phone-wrap">
          <div className="phone-button one" />
          <div className="phone-button two" />
          <div className="phone-button three" />
          <div className="phone">
            <div className="phone-status">
              <span>9:41</span>
              <div className="dynamic-island" />
              <span>
                <Wifi size={14} />
                <BatteryFull size={19} />
              </span>
            </div>
            <header className="app-header">
              <button
                className="app-brand"
                onClick={() => setTab("Map")}
                aria-label="Ride Safe home"
              >
                <span className="brand-mark small">
                  RS
                  <span />
                </span>
                <span>
                  RIDE SAFE<small>PHILIPPINES</small>
                </span>
              </button>
              <span className="app-demo">BETA DEMO</span>
              <button
                className="avatar"
                onClick={() => setTab("More")}
                aria-label="Open rider dashboard"
              >
                {name.slice(0, 2).toUpperCase()}
              </button>
            </header>
            {[
              ccError,
              nameError,
              reportError,
              postError,
              lessonError,
              scoreError,
              rewardError,
              savedError,
            ].some(Boolean) && (
              <div className="storage-error" role="alert">
                Browser storage unavailable. Changes last only for this session.
              </div>
            )}
            <div className="app-content">
              <div className={`map-tab ${tab === "Map" ? "" : "hidden"}`}>
                <MapView
                  active={tab === "Map"}
                  cc={cc}
                  reports={reports}
                  saved={saved}
                  onSave={(p) => {
                    if (!saved.some((s) => s.id === p.id))
                      setSaved([...saved, p]);
                  }}
                  launch={launch}
                />
              </div>
              {tab === "Alerts" && (
                <Alerts reports={reports} save={setReports} />
              )}
              {tab === "Education" && (
                <Education completed={completed} save={setCompleted} />
              )}
              {tab === "Community" && (
                <Community posts={posts} save={setPosts} />
              )}
              {tab === "More" && (
                <More
                  cc={cc}
                  setCc={setCc}
                  name={name}
                  setName={setName}
                  metrics={metrics}
                  setMetrics={setMetrics}
                  redeemed={redeemed}
                  setRedeemed={setRedeemed}
                  saved={saved}
                  onLaunch={(p) => {
                    setLaunch({ ...p });
                    setTab("Map");
                  }}
                  onRemove={(id) => setSaved(saved.filter((p) => p.id !== id))}
                />
              )}
            </div>
            <nav className="bottom-nav" aria-label="Main navigation">
              {nav.map((n) => (
                <button
                  key={n.name}
                  aria-current={tab === n.name ? "page" : undefined}
                  className={tab === n.name ? "selected" : ""}
                  onClick={() => setTab(n.name)}
                >
                  <n.icon size={21} strokeWidth={tab === n.name ? 2.4 : 1.7} />
                  <span>{n.name}</span>
                  {tab === n.name && <i />}
                </button>
              ))}
            </nav>
            <div className="home-indicator">
              <span />
            </div>
          </div>
        </div>
        <aside className="desktop-aside">
          <span className="side-index">01 / THE ROAD AHEAD</span>
          <div className="side-feature">
            <span>
              <Navigation size={23} />
            </span>
            <h3>Find your way.</h3>
            <p>
              Explore real maps and plan
              <br />
              your next destination.
            </p>
          </div>
          <div className="side-feature">
            <span>
              <ShieldCheck size={23} />
            </span>
            <h3>Build safer habits.</h3>
            <p>
              Practical lessons and a<br />
              simulated rider dashboard.
            </p>
          </div>
          <div className="aside-note">
            <span className="dot" />
            <p>
              The phone is the app.
              <br />
              <strong>Go ahead, explore it.</strong>
            </p>
          </div>
        </aside>
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} RS Ride Safe Philippines</span>
        <span>
          Independent prototype · No manufacturer or MDPPA endorsement
        </span>
        <span>Ride aware. Arrive safe.</span>
      </footer>
    </div>
  );
}
