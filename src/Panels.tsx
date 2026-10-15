import { useState } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  ChevronRight,
  Check,
  Plus,
  TriangleAlert,
  CloudRain,
  Construction,
  ShieldCheck,
  BookOpen,
  Clock3,
  Gift,
  LockKeyhole,
  CheckCircle2,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  ExternalLink,
  MapPin,
  CircleHelp,
  Users,
  MessageCircle,
  Send,
  Gauge,
  Zap,
  Hand,
  TrendingUp,
} from "lucide-react";
import type { Place, Post, Report } from "./data";
import { lessons, offers, places } from "./data";
import { initialMetrics, simulate, score } from "./state";
import type { Metrics } from "./state";
export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice">
      <CircleHelp size={16} />
      <span>{children}</span>
    </div>
  );
}
export function Alerts({
  reports,
  save,
}: {
  reports: Report[];
  save: (r: Report[]) => void;
}) {
  const [filter, setFilter] = useState("All"),
    [form, setForm] = useState(false),
    [type, setType] = useState("Pothole"),
    [location, setLocation] = useState(places[0].id),
    [description, setDescription] = useState(""),
    [notice, setNotice] = useState("");
  const categories = ["All", "Pothole", "Flooding", "Roadworks", "Incident"];
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 10) return;
    const p = places.find((p) => p.id === location)!;
    save([
      {
        id: crypto.randomUUID(),
        type,
        description: description.trim(),
        location: p.name,
        lat: p.lat,
        lon: p.lon,
        created: new Date().toISOString(),
        demo: true,
      },
      ...reports,
    ]);
    setDescription("");
    setForm(false);
    setNotice(
      "Demo report saved on this device. It was not sent to authorities or other riders.",
    );
  }
  return (
    <div className="page">
      <PageTitle
        eyebrow="AWARENESS IS EVERYTHING"
        title="Eyes on the road."
        description="Know what to look out for. Help build safer habits."
      />
      <DemoNote>
        Demo community reports. None are verified live hazards. Your submissions
        stay on this device.
      </DemoNote>
      <button className="primary full" onClick={() => setForm(!form)}>
        <Plus size={18} />
        Report a road concern
      </button>
      {form && (
        <form className="card form-stack" onSubmit={submit}>
          <h3>New demo report</h3>
          <label>
            Concern type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Example location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            What should riders know?
            <textarea
              required
              minLength={10}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the concern (at least 10 characters)"
            />
          </label>
          <p className="small-text muted">
            Report only while safely parked. Do not include personal
            information.
          </p>
          <button className="primary" type="submit">
            Save demo report
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => setForm(false)}
          >
            Cancel
          </button>
        </form>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <div className="chips" aria-label="Filter reports">
        {categories.map((c) => (
          <button
            className={filter === c ? "selected" : ""}
            key={c}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h3>Road awareness</h3>
        <span>
          {reports.filter((r) => filter === "All" || r.type === filter).length}{" "}
          examples
        </span>
      </div>
      {reports
        .filter((r) => filter === "All" || r.type === filter)
        .map((r) => (
          <article className="card report-card" key={r.id}>
            <div className="row">
              <span
                className={`report-icon ${r.type === "Flooding" ? "water" : ""}`}
              >
                {r.type === "Flooding" ? (
                  <CloudRain size={20} />
                ) : r.type === "Roadworks" ? (
                  <Construction size={20} />
                ) : (
                  <TriangleAlert size={20} />
                )}
              </span>
              <div>
                <h3>{r.type}</h3>
                <span className="small-text muted">{r.location}</span>
              </div>
              <span className="badge amber">DEMO</span>
            </div>
            <p>{r.description}</p>
            <div className="row between small-text muted">
              <span>
                {r.created.includes("T")
                  ? new Date(r.created).toLocaleDateString("en-PH")
                  : r.created}
              </span>
              {!r.id.startsWith("demo-") && (
                <button
                  className="text-button"
                  onClick={() => save(reports.filter((x) => x.id !== r.id))}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      {!reports.filter((r) => filter === "All" || r.type === filter).length && (
        <div className="empty">No demo reports in this category.</div>
      )}
      <div className="emergency">
        <ShieldCheck size={20} />
        <div>
          <strong>In an emergency, call 911.</strong>
          <p>This demo is not an emergency reporting service.</p>
        </div>
        <a href="tel:911" aria-label="Call emergency services 911">
          <ArrowUpRight size={20} />
        </a>
      </div>
    </div>
  );
}
export function Education({
  completed,
  save,
}: {
  completed: string[];
  save: (s: string[]) => void;
}) {
  const [lesson, setLesson] = useState<string | null>(null),
    [answer, setAnswer] = useState<number | null>(null),
    [checked, setChecked] = useState(false);
  const selected = lessons.find((l) => l.id === lesson);
  if (selected)
    return (
      <div className="page">
        <button
          className="back-button"
          onClick={() => {
            setLesson(null);
            setAnswer(null);
            setChecked(false);
          }}
        >
          <ArrowLeft size={17} />
          All lessons
        </button>
        <PageTitle
          eyebrow={selected.topic.toUpperCase()}
          title={selected.title}
          description={`${selected.minutes} minute read · Safety essentials`}
        />
        <div className="lesson-art">
          <ShieldCheck size={55} />
          <span>
            Small habits.
            <br />
            Safer journeys.
          </span>
        </div>
        <p className="lesson-copy">{selected.body}</p>
        <div className="card quiz">
          <span className="eyebrow">QUICK KNOWLEDGE CHECK</span>
          <h3>{selected.question}</h3>
          <fieldset>
            <legend className="sr-only">Choose an answer</legend>
            {selected.options.map((option, i) => (
              <label
                className={`quiz-option ${checked && i === selected.answer ? "correct" : ""}`}
                key={option}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={answer === i}
                  disabled={checked && answer === selected.answer}
                  onChange={() => {
                    setAnswer(i);
                    setChecked(false);
                  }}
                />
                {option}
              </label>
            ))}
          </fieldset>
          <button
            className="primary full"
            disabled={
              answer === null || (checked && answer === selected.answer)
            }
            onClick={() => {
              setChecked(true);
              if (
                answer === selected.answer &&
                !completed.includes(selected.id)
              )
                save([...completed, selected.id]);
            }}
          >
            {checked && answer === selected.answer
              ? "Lesson completed"
              : "Check answer"}
          </button>
          {checked && (
            <p
              role="status"
              className={answer === selected.answer ? "success" : "notice"}
            >
              {answer === selected.answer
                ? "Correct. A small habit that makes a real difference."
                : "Not quite. Review the lesson and try another answer."}
            </p>
          )}
        </div>
        <p className="small-text muted">
          General education; not a substitute for professional rider training or
          emergency-response certification.
        </p>
      </div>
    );
  return (
    <div className="page">
      <PageTitle
        eyebrow="LEARN A LITTLE. RIDE A LITTLE SAFER."
        title="Build better habits."
        description="Practical knowledge for every Philippine rider."
      />
      <div className="learning-banner">
        <div>
          <span className="eyebrow">YOUR LEARNING JOURNEY</span>
          <h2>
            {completed.length} of {lessons.length} lessons
          </h2>
          <p>A few minutes today. A safer ride tomorrow.</p>
        </div>
        <BookOpen size={34} />
        <div className="progress">
          <span
            style={{ width: `${(completed.length / lessons.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="section-heading">
        <h3>Rider essentials</h3>
        <span>Free to explore</span>
      </div>
      {lessons.map((l, i) => (
        <button
          className="lesson-card"
          key={l.id}
          onClick={() => {
            setLesson(l.id);
            setChecked(false);
            setAnswer(null);
          }}
        >
          <span className={`lesson-number lesson-${i}`}>
            {completed.includes(l.id) ? (
              <Check size={24} />
            ) : (
              String(i + 1).padStart(2, "0")
            )}
          </span>
          <span>
            <small>{l.topic}</small>
            <strong>{l.title}</strong>
            <span className="small-text muted">
              <Clock3 size={12} />
              {l.minutes} min ·{" "}
              {completed.includes(l.id) ? "Completed" : "Lesson & quiz"}
            </span>
          </span>
          <ChevronRight size={18} />
        </button>
      ))}
      <DemoNote>
        Our education reflects the responsible-riding themes promoted by groups
        such as MDPPA. RS is an independent proof of concept, with no official
        affiliation or endorsement.
      </DemoNote>
    </div>
  );
}
export function Community({
  posts,
  save,
}: {
  posts: Post[];
  save: (p: Post[]) => void;
}) {
  const [form, setForm] = useState(false),
    [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [category, setCategory] = useState("Discussion"),
    [filter, setFilter] = useState("All");
  const categories = [
    "All",
    "Discussion",
    "Safety campaign",
    "Education event",
    "Announcement",
  ];
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    save([
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        body: body.trim(),
        category,
        created: new Date().toISOString(),
        demo: true,
      },
      ...posts,
    ]);
    setForm(false);
    setBody("");
    setTitle("");
  }
  return (
    <div className="page">
      <PageTitle
        eyebrow="GOOD RIDERS LOOK OUT FOR EACH OTHER"
        title="Ride together."
        description="Shared experiences. One safer community."
      />
      <div className="community-banner">
        <Users size={30} />
        <div>
          <h3>Different bikes. Same road.</h3>
          <p>Respect starts with every rider.</p>
        </div>
      </div>
      <DemoNote>
        Local demo board. Posts are stored only in your browser, not shared
        publicly. Campaigns and events below are examples.
      </DemoNote>
      <button className="primary full" onClick={() => setForm(!form)}>
        <Plus size={18} />
        Start a conversation
      </button>
      {form && (
        <form className="card form-stack" onSubmit={submit}>
          <h3>Your demo post</h3>
          <label>
            Category
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            Message
            <textarea
              required
              maxLength={800}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <button className="primary">
            <Send size={16} />
            Save local post
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => setForm(false)}
          >
            Cancel
          </button>
        </form>
      )}
      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={c === filter ? "selected" : ""}
            onClick={() => setFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {posts
        .filter((p) => filter === "All" || p.category === filter)
        .map((p) => (
          <article className="card post-card" key={p.id}>
            <div className="row between">
              <span className="category-label">{p.category}</span>
              <span className="badge">LOCAL DEMO</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <div className="row between small-text muted">
              <span>
                <MessageCircle size={13} />{" "}
                {p.created.includes("T")
                  ? new Date(p.created).toLocaleDateString("en-PH")
                  : p.created}
              </span>
              {!p.id.startsWith("p") && (
                <button
                  className="text-button"
                  onClick={() => save(posts.filter((x) => x.id !== p.id))}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      {!posts.filter((p) => filter === "All" || p.category === filter)
        .length && (
        <p className="empty">No local posts yet. Start a conversation.</p>
      )}
    </div>
  );
}
const regulations = [
  {
    title: "LTO guidance",
    body: "Check the Land Transportation Office for licensing, registration, roadworthiness, and current advisories. Carry the appropriate valid license and ensure your vehicle documents are in order.",
    links: [
      { label: "Land Transportation Office", url: "https://lto.gov.ph/" },
    ],
  },
  {
    title: "Motorcycle laws",
    body: "RA 10054 (Motorcycle Helmet Act of 2009) requires standard protective motorcycle helmets for riders and back riders, subject to its scope and exceptions. RA 10913 (Anti-Distracted Driving Act) restricts device use while driving, including temporary stops at traffic lights; consult the law for allowed uses and exceptions.",
    links: [
      {
        label: "RA 10054 · primary legal text",
        url: "https://lawphil.net/statutes/repacts/ra2010/ra_10054_2010.html",
      },
      {
        label: "RA 10913 · primary legal text",
        url: "https://lawphil.net/statutes/repacts/ra2016/ra_10913_2016.html",
      },
    ],
  },
  {
    title: "Expressway restrictions",
    body: "Philippine limited-access expressways generally restrict motorcycles below 400cc. A 400cc-or-above profile is not a guarantee of access to any particular road. Verify the specific operator’s current rules, vehicle eligibility, entry signs, and advisories. The map’s car-routing service cannot enforce motorcycle restrictions.",
    links: [
      {
        label: "Toll Regulatory Board · confirm operator rules",
        url: "https://trb.gov.ph/",
      },
    ],
  },
  {
    title: "LGU ordinances",
    body: "Local rules may vary by city or municipality, including parking, traffic schemes, and road closures. No current LGU restriction dataset is integrated. Verify with the LGU or local traffic office and follow on-site signs. Community reports are not legal authority.",
    links: [
      {
        label: "Quezon City official portal",
        url: "https://quezoncity.gov.ph/",
      },
      {
        label: "Pampanga provincial government",
        url: "https://pampanga.gov.ph/",
      },
    ],
  },
];
export function More({
  cc,
  setCc,
  name,
  setName,
  metrics,
  setMetrics,
  redeemed,
  setRedeemed,
  saved,
  onLaunch,
  onRemove,
}: {
  cc: number;
  setCc: (n: number) => void;
  name: string;
  setName: (s: string) => void;
  metrics: Metrics;
  setMetrics: (m: Metrics) => void;
  redeemed: string[];
  setRedeemed: (s: string[]) => void;
  saved: Place[];
  onLaunch: (p: Place) => void;
  onRemove: (id: string) => void;
}) {
  const [section, setSection] = useState("overview"),
    [status, setStatus] = useState(""),
    [simOpen, setSimOpen] = useState(false),
    [editName, setEditName] = useState(name),
    [editCc, setEditCc] = useState(String(cc));
  const currentScore = score(metrics);
  const rows = [
    {
      id: "rewards",
      icon: Gift,
      title: "Demo rewards",
      subtitle: "Good habits, a little extra motivation",
    },
    {
      id: "rules",
      icon: BookOpen,
      title: "Rules & regulations",
      subtitle: "Know your responsibilities",
    },
    {
      id: "saved",
      icon: Bookmark,
      title: "Saved destinations",
      subtitle: `${saved.length} ${saved.length === 1 ? "place" : "places"} for your next ride`,
    },
    {
      id: "settings",
      icon: SlidersHorizontal,
      title: "Profile & settings",
      subtitle: "Your bike. Your preferences.",
    },
  ];
  return (
    <div className="page">
      {section !== "overview" && (
        <button
          className="back-button"
          onClick={() => {
            setSection("overview");
            setStatus("");
          }}
        >
          <ArrowLeft size={17} />
          Rider dashboard
        </button>
      )}
      {section === "overview" && (
        <>
          <PageTitle
            eyebrow="EVERY GOOD HABIT COUNTS"
            title="Your rider dashboard."
            description="A little more aware. A little more prepared."
          />
          <div className="rider-profile">
            <span className="avatar large">
              {name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h3>{name}</h3>
              <p>
                {cc}cc motorcycle · {cc < 400 ? "Below 400cc" : "400cc & above"}
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Edit rider profile"
              onClick={() => setSection("settings")}
            >
              <SlidersHorizontal size={19} />
            </button>
          </div>
          <div className="score-card">
            <div className="row between">
              <span className="eyebrow">SAFETY SCORE</span>
              <span className="badge">SIMULATED</span>
            </div>
            <div className="score-main">
              <div
                className="score-ring"
                style={{ "--score": `${currentScore}%` } as React.CSSProperties}
              >
                <div>
                  <strong>{currentScore}</strong>
                  <span>out of 100</span>
                </div>
              </div>
              <div>
                <span className="score-label">
                  {currentScore >= 85
                    ? "Great habits"
                    : currentScore >= 70
                      ? "On the right track"
                      : "Room to improve"}
                </span>
                <h3>
                  Every ride is a<br />
                  chance to improve.
                </h3>
                <p>Build consistency, not speed.</p>
              </div>
            </div>
            <div className="score-metrics">
              {(
                [
                  { key: "compliance", label: "Speed compliance", icon: Gauge },
                  { key: "braking", label: "Smooth braking", icon: Hand },
                  {
                    key: "acceleration",
                    label: "Gentle acceleration",
                    icon: Zap,
                  },
                  { key: "patterns", label: "Safe patterns", icon: TrendingUp },
                ] as const
              ).map((m) => (
                <div key={m.key}>
                  <span>
                    <m.icon size={14} />
                    {m.label}
                  </span>
                  <strong>{metrics[m.key]}</strong>
                  <div className="metric-bar">
                    <i style={{ width: `${metrics[m.key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="primary full"
              onClick={() => setSimOpen(!simOpen)}
            >
              {simOpen ? "Close simulator" : "Try a simulated ride"}
              <ArrowUpRight size={17} />
            </button>
          </div>
          {simOpen && (
            <div className="card simulator">
              <span className="badge amber">DEMO · NO REAL RIDE TRACKING</span>
              <h3>See how habits change your score</h3>
              <p>
                Tap an event to model its effect. These values are illustrative,
                not measurements.
              </p>
              <div className="sim-buttons">
                {(
                  [
                    {
                      id: "steady",
                      text: "Steady, safe riding",
                      icon: ShieldCheck,
                    },
                    { id: "speed", text: "Above speed limit", icon: Gauge },
                    { id: "brake", text: "Harsh braking", icon: Hand },
                    { id: "accelerate", text: "Rapid acceleration", icon: Zap },
                  ] as const
                ).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      const next = simulate(metrics, e.id);
                      setMetrics(next);
                      setStatus(
                        `${e.text}: simulated score ${score(next)} of 100.`,
                      );
                    }}
                  >
                    <e.icon size={18} />
                    {e.text}
                  </button>
                ))}
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setMetrics(initialMetrics);
                  setStatus(
                    "Demo score reset to 82. Existing demo redemptions are retained.",
                  );
                }}
              >
                <RotateCcw size={14} />
                Reset simulated score
              </button>
            </div>
          )}
          <DemoNote>
            Browser GPS cannot reliably assess harsh braking, acceleration,
            speed-limit compliance, or overall riding safety. This score uses
            only demo inputs and is not a safety certification.
          </DemoNote>
          {rows.map((r) => (
            <button
              className="menu-row"
              key={r.id}
              onClick={() => {
                setSection(r.id);
                setStatus("");
              }}
            >
              <span className="menu-icon">
                <r.icon size={20} />
              </span>
              <span>
                <strong>{r.title}</strong>
                <small>{r.subtitle}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </>
      )}
      {section === "rewards" && (
        <>
          <PageTitle
            eyebrow="BETTER HABITS, EXTRA MOTIVATION"
            title="A little reward."
            description="Explore how responsible riding could unlock benefits."
          />
          <div className="reward-summary">
            <ShieldCheck size={23} />
            <span>Your simulated score</span>
            <strong>
              {currentScore}
              <small>/100</small>
            </strong>
          </div>
          <DemoNote>
            Hypothetical offers only. Honda, Kawasaki, Suzuki, and Yamaha are
            sample categories, not partners. No monetary value; no real store
            accepts these vouchers.
          </DemoNote>
          {offers.map((o) => (
            <article className="voucher card" key={o.brand}>
              <div className="row between">
                <span className="brand-name">{o.brand}</span>
                <span className="badge">HYPOTHETICAL</span>
              </div>
              <strong className="voucher-amount">{o.amount}</strong>
              <p>{o.category} · demonstration offer</p>
              <div className="voucher-footer">
                <span>{o.threshold}+ Safety Score</span>
                <button
                  className={
                    redeemed.includes(o.brand)
                      ? "text-button"
                      : "primary compact"
                  }
                  disabled={
                    currentScore < o.threshold || redeemed.includes(o.brand)
                  }
                  onClick={() => {
                    if (
                      currentScore >= o.threshold &&
                      !redeemed.includes(o.brand)
                    ) {
                      setRedeemed([...redeemed, o.brand]);
                      setStatus(
                        `${o.brand} DEMO voucher redeemed on this device. It has no monetary value.`,
                      );
                    }
                  }}
                >
                  {redeemed.includes(o.brand) ? (
                    <>
                      <CheckCircle2 size={15} />
                      Redeemed
                    </>
                  ) : currentScore < o.threshold ? (
                    <>
                      <LockKeyhole size={15} />
                      Locked
                    </>
                  ) : (
                    "Redeem demo"
                  )}
                </button>
              </div>
              {redeemed.includes(o.brand) && (
                <div className="demo-code">
                  DEMO-{o.brand.toUpperCase()}-RS · NOT VALID FOR PURCHASE
                </div>
              )}
            </article>
          ))}
          <div className="card">
            <h3>Why responsible riding matters</h3>
            <p>
              Consistent speed compliance, smoother inputs, and safer riding
              patterns improve this illustrative score. Higher scores unlock
              demo offers. Real eligibility would require validated
              measurements, privacy safeguards, and actual partner agreements.
            </p>
            <p className="small-text muted">
              Demo weighting: speed compliance 40%, braking 20%, acceleration
              15%, safe patterns 25%. Never delay emergency braking to protect a
              score.
            </p>
          </div>
        </>
      )}
      {section === "rules" && (
        <>
          <PageTitle
            eyebrow="INFORMED RIDERS. SAFER ROADS."
            title="Know the rules."
            description="Primary references, separate from community reports."
          />
          <DemoNote>
            Educational summaries, not legal advice. RA 10054 and RA 10913 text
            checked on 15 October 2026 via Lawphil. Later amendments and current
            local advisories are not independently verified. Confirm current
            rules with the responsible authority.
          </DemoNote>
          {regulations.map((r) => (
            <article className="card rules-card" key={r.title}>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              {r.links.map((l) => (
                <a
                  className="source-link"
                  href={l.url}
                  key={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                  <ExternalLink size={14} />
                </a>
              ))}
            </article>
          ))}
          <p className="small-text muted">
            Government links and Lawphil legal texts are references. All in-app
            rider reports are unverified local demonstrations and do not
            establish legal restrictions.
          </p>
        </>
      )}
      {section === "saved" && (
        <>
          <PageTitle
            eyebrow="PLANS FOR THE ROAD AHEAD"
            title="Your saved stops."
            description="Destinations saved on this device. Routes are recalculated when opened."
          />
          {saved.length ? (
            saved.map((p) => (
              <div className="card saved-card" key={p.id}>
                <MapPin size={20} />
                <div>
                  <h3>{p.name}</h3>
                  <small>{p.area}</small>
                  <div className="row">
                    <button className="text-button" onClick={() => onLaunch(p)}>
                      Open route <ChevronRight size={14} />
                    </button>
                    <button
                      className="text-button muted"
                      onClick={() => onRemove(p.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty">
              <Bookmark size={28} />
              <h3>Your next ride belongs here.</h3>
              <p>
                Find a destination on the map and tap the bookmark in its route
                preview.
              </p>
            </div>
          )}
        </>
      )}
      {section === "settings" && (
        <>
          <PageTitle
            eyebrow="MAKE IT YOUR RIDE"
            title="Profile & settings."
            description="Stored locally. No account or tracking server."
          />
          <form
            className="card form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(editCc);
              if (!editName.trim() || n < 50 || n > 2500) return;
              setName(editName.trim());
              setCc(n);
              setStatus("Rider profile saved on this device.");
            }}
          >
            <label>
              Rider name
              <input
                required
                maxLength={40}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </label>
            <label>
              Motorcycle displacement (cc)
              <input
                type="number"
                required
                min={50}
                max={2500}
                step={1}
                value={editCc}
                onChange={(e) => setEditCc(e.target.value)}
              />
            </label>
            <div className="chips">
              {[125, 155, 400, 650].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={Number(editCc) === n ? "selected" : ""}
                  onClick={() => setEditCc(String(n))}
                >
                  {n}cc
                </button>
              ))}
            </div>
            <p className="small-text muted">
              400cc is the profile boundary used here. Engine size alone does
              not confirm road access. Our car-based route service does not
              filter restricted roads.
            </p>
            <button className="primary">Save profile</button>
          </form>
          <div className="card">
            <h3>Your privacy, by design</h3>
            <p>
              Reports, posts, learning progress, profiles, scores, saved stops,
              and demo redemptions stay in this browser’s local storage.
              Clearing site data removes them.
            </p>
            <p>
              Location runs only while you enable follow-location on the visible
              Map tab. Routes send departure and destination coordinates to
              OSRM. Nearby searches send map-focus coordinates to Overpass.
              Place searches go to Nominatim, and map tiles load from
              OpenStreetMap.
            </p>
            <p>
              No background tracking, real-time traffic, verified live hazards,
              or safety-certified navigation.
            </p>
          </div>
        </>
      )}
      {status && (
        <p className="notice" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
