import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Testimonial {
  quote: string;
  driver: string;
  title: string;
  stat: string;
}

interface Spec {
  label: string;
  value: string;
  unit: string;
  target: number;
  suffix: string;
  color: "crimson" | "electric" | "titanium";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SPECS: Spec[] = [
  { label: "0–100 km/h", value: "1.9", unit: "seconds", target: 19, suffix: "", color: "crimson" },
  { label: "Peak Power Output", value: "1,050", unit: "HP", target: 1050, suffix: "", color: "electric" },
  { label: "Thermal Drift Index", value: "0", unit: "%", target: 0, suffix: "%", color: "crimson" },
  { label: "Heat Retention Span", value: "24", unit: "hours", target: 24, suffix: "", color: "electric" },
  { label: "Downforce @ 300 km/h", value: "1,800", unit: "kg", target: 1800, suffix: "", color: "titanium" },
  { label: "Carbon Panel Layers", value: "47", unit: "layers", target: 47, suffix: "", color: "titanium" },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "I pushed it past 340 on the Kemmel straight. The cockpit temperature barely moved. I've never felt this… comfortable while going this fast. It's supernatural.",
    driver: "Léa Montfort",
    title: "3× Le Mans Champion",
    stat: "340 km/h",
  },
  {
    quote: "It simply does not overheat. Ever. I kept waiting for the warning light. It never came. At some point I started worrying it was broken.",
    driver: "Marcus Reinhardt",
    title: "F1 World Driver's Champion",
    stat: "0 Overheats",
  },
  {
    quote: "The ThermaLock chassis armor is genuinely alien technology. Our engineers reverse-engineered it for three weeks. Their conclusion? 'Basically a thermos. But make it go 340.'",
    driver: "Chidinma Okafor",
    title: "Head of Powertrain, Apex Engineering",
    stat: "3 Weeks",
  },
];

const HOTSPOTS = [
  { id: "wing", x: 82, y: 22, label: "Rear Wing", desc: "Vacuum-Insulated Double-Wall Downforce Spoilers — 1,800 kg downforce, zero thermal coefficient expansion under racing load." },
  { id: "cockpit", x: 52, y: 38, label: "Cockpit", desc: "ThermaLock™ Pilot Capsule — maintains 21°C regardless of external engine temps. Milton Flask technology, scaled up." },
  { id: "nose", x: 14, y: 48, label: "Nose Cone", desc: "Aero-Kevlar Triple-Wall Nose Section — proprietary vacuum cavity absorbs 97% of impact thermal energy." },
  { id: "floor", x: 45, y: 68, label: "Floor Diffuser", desc: "Active Ground Effect Diffuser with Cryo-Seal edge banding. Generates ground suction equivalent to 4× car weight." },
];

const DOMESTIC_SPECS = [
  { label: "Frunk Storage", value: "3-Tier Heated Tiffin Compartment", detail: "Maintains meal temperature at 65°C through 7G braking events. Stackable. Dishwasher safe." },
  { label: "Cupholders", value: "Zero-Spill Flask Cup Holders", detail: "Vacuum-sealed, 3G lateral rated. Fits any Milton 500ml flask. Yes, the lids lock." },
  { label: "Thermal Warranty", value: "24 Hours Cold / 12 Hours Hot", detail: "Applies to both beverages and engine coolant. No exceptions." },
  { label: "Water Resistance", value: "IPX-9K (Pressure Wash Safe)", detail: "Tested at full paddock hose pressure. Also tested by a confused team mechanic." },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (target === 0) { setCount(0); return; }
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SpecCard({ spec, started }: { spec: Spec; started: boolean }) {
  const raw = useCountUp(spec.target, 1800, started);
  const display = spec.target >= 1000 ? raw.toLocaleString() : raw.toString();

  const colorClass = {
    crimson: "text-crimson",
    electric: "text-electric",
    titanium: "text-titanium",
  }[spec.color];

  const barColor = {
    crimson: "bg-crimson",
    electric: "bg-electric",
    titanium: "bg-titanium/60",
  }[spec.color];

  const barPct = spec.target === 0 ? 100 : Math.min((raw / spec.target) * 100, 100);

  return (
    <div className="bg-carbon-light border border-titanium/10 p-6 relative overflow-hidden group hover:border-titanium/25 transition-colors duration-300">
      <div className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30 w-full" style={{ color: spec.color === "crimson" ? "#FF1E27" : spec.color === "electric" ? "#00F0FF" : "#E2E8F0" }} />

      <p className="font-mono text-xs text-titanium-dim uppercase tracking-widest mb-4">{spec.label}</p>

      <div className="flex items-end gap-2 mb-4">
        <span className={`font-display text-5xl font-black leading-none ${colorClass}`}>
          {display}
        </span>
        <span className="font-mono text-sm text-titanium-dim mb-1">{spec.unit}</span>
      </div>

      <div className="h-px bg-carbon-mid relative overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: started ? `${barPct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function ThermaSlider() {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { updatePos(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/7] overflow-hidden cursor-col-resize select-none bg-carbon-mid"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* Exterior side */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1645400379459-f6fd3d963fd4?w=1400&h=600&fit=crop&auto=format"
          alt="Milton Apex-1 exterior"
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/60 to-transparent" />
        <div className="absolute bottom-4 left-6 font-mono text-xs text-titanium-dim uppercase tracking-widest">Exterior — Apex-1 Body Shell</div>
      </div>

      {/* Interior / X-ray side */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1519752594763-2633d8d4ea29?w=1400&h=600&fit=crop&auto=format"
          alt="Milton ThermaLock thermal engine interior"
          className="w-full h-full object-cover"
          draggable={false}
          style={{ filter: "hue-rotate(180deg) saturate(1.4)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-electric/10 to-carbon/60 mix-blend-screen" />
        <div className="absolute bottom-4 right-6 font-mono text-xs text-electric uppercase tracking-widest">ThermaLock™ Interior X-Ray</div>
      </div>

      {/* Drag handle */}
      <div
        className="absolute top-0 bottom-0 w-px bg-electric z-10"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-carbon border-2 border-electric flex items-center justify-center glow-electric">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M5 4L2 8L5 12M11 4L14 8L11 12" stroke="#00F0FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-6 font-display text-sm font-bold tracking-widest uppercase text-titanium/60">← Exterior</div>
      <div className="absolute top-4 right-6 font-display text-sm font-bold tracking-widest uppercase text-electric/80">ThermaLock™ →</div>
    </div>
  );
}

function HotspotMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative w-full aspect-[16/7] bg-carbon-light overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1678952967835-c0141cd511e4?w=1400&h=600&fit=crop&auto=format"
        alt="Milton Apex-1 with interactive hotspots"
        className="w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/80 via-transparent to-transparent" />

      {HOTSPOTS.map((h) => (
        <div key={h.id} className="absolute" style={{ left: `${h.x}%`, top: `${h.y}%` }}>
          <button
            className="relative w-5 h-5 -translate-x-1/2 -translate-y-1/2"
            onClick={() => setActive(active === h.id ? null : h.id)}
            aria-label={h.label}
          >
            <span className="absolute inset-0 rounded-full bg-crimson pulse-dot" />
            <span className="relative z-10 block w-5 h-5 rounded-full bg-crimson border-2 border-crimson/80" />
          </button>

          {active === h.id && (
            <div className="absolute z-20 w-56 bg-carbon border border-crimson/40 p-4 text-left"
              style={{
                top: h.y > 50 ? "auto" : "100%",
                bottom: h.y > 50 ? "100%" : "auto",
                left: h.x > 60 ? "auto" : "50%",
                right: h.x > 60 ? "50%" : "auto",
                transform: "none",
                marginTop: "8px",
                marginBottom: "8px",
              }}>
              <p className="font-mono text-xs text-crimson uppercase tracking-widest mb-1">{h.label}</p>
              <p className="font-body text-xs text-titanium-dim leading-relaxed">{h.desc}</p>
            </div>
          )}
        </div>
      ))}

      <div className="absolute bottom-4 left-6 font-mono text-xs text-titanium-dim">
        TAP MARKERS TO INSPECT COMPONENTS
      </div>
    </div>
  );
}

function TestimonialCard({ t, active }: { t: Testimonial; active: boolean }) {
  return (
    <div className={`bg-carbon-light border p-8 transition-all duration-500 ${active ? "border-crimson/50 scale-[1.01]" : "border-titanium/10"}`}>
      <div className="flex items-start gap-4 mb-6">
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" className="shrink-0 mt-1">
          <path d="M0 20V12C0 5.373 4.477 1.12 13.431 0L14 2.4C10.217 3.2 8.217 5.2 8 8H13V20H0ZM15 20V12C15 5.373 19.477 1.12 28.431 0L29 2.4C25.217 3.2 23.217 5.2 23 8H28V20H15Z" fill="#FF1E27" fillOpacity="0.4" />
        </svg>
        <p className="font-body text-titanium/90 leading-relaxed text-sm italic">{t.quote}</p>
      </div>
      <div className="flex items-center justify-between border-t border-titanium/10 pt-4">
        <div>
          <p className="font-display text-base font-bold text-titanium uppercase tracking-wide">{t.driver}</p>
          <p className="font-mono text-xs text-titanium-dim">{t.title}</p>
        </div>
        <div className="font-display text-2xl font-black text-crimson">{t.stat}</div>
      </div>
    </div>
  );
}

function DomesticAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-titanium/15 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-6 bg-carbon-light hover:bg-carbon-mid transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-electric uppercase tracking-widest">CLASSIFIED</span>
          <span className="font-display text-lg font-bold text-titanium uppercase tracking-wider">Domestic Utilities</span>
          <span className="font-mono text-xs text-titanium-dim italic">(engineer eyes only)</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <path d="M3 5L8 10L13 5" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-500 ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="bg-carbon p-6 grid sm:grid-cols-2 gap-4">
          {DOMESTIC_SPECS.map((s) => (
            <div key={s.label} className="border border-electric/15 p-4">
              <p className="font-mono text-xs text-electric uppercase tracking-widest mb-1">{s.label}</p>
              <p className="font-display text-sm font-bold text-titanium uppercase mb-2">{s.value}</p>
              <p className="font-body text-xs text-titanium-dim leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sticky Dock ──────────────────────────────────────────────────────────────
function StickyDock({ visible }: { visible: boolean }) {
  const [allocations, setAllocations] = useState(3);
  const [time, setTime] = useState({ d: 47, h: 14, m: 22, s: 9 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${visible ? "translate-y-0" : "translate-y-full"}`}
      style={{ animation: visible ? "slide-up 0.4s ease-out" : undefined }}
    >
      <div className="bg-carbon/95 backdrop-blur-sm border-t border-crimson/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-crimson glow-crimson" />
              <span className="font-mono text-xs text-titanium-dim uppercase">2027 Allocation</span>
            </div>
            <div className="font-display text-sm font-bold text-crimson uppercase">
              Only {allocations} chassis remaining
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {[
                { val: time.d, label: "D" },
                { val: time.h, label: "H" },
                { val: time.m, label: "M" },
                { val: time.s, label: "S" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center">
                  <div className="font-mono text-base font-bold text-electric w-7 text-center">
                    {String(val).padStart(2, "0")}
                  </div>
                  <div className="font-mono text-[9px] text-titanium-dim">{label}</div>
                </div>
              ))}
            </div>

            <button
              className="bg-crimson hover:bg-crimson-dark font-display font-black text-white uppercase tracking-widest px-6 py-2.5 text-sm transition-all duration-200 glow-crimson active:scale-95"
              onClick={() => setAllocations((a) => Math.max(0, a - 1))}
            >
              Lock In Allocation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [showDock, setShowDock] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { ref: specsRef, inView: specsInView } = useInView(0.2);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const heroH = heroRef.current?.offsetHeight ?? 600;
      setShowDock(window.scrollY > heroH * 0.6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((a) => (a + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-carbon text-titanium overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-titanium/8 bg-carbon/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-crimson flex items-center justify-center">
            <span className="font-display font-black text-white text-xs">M</span>
          </div>
          <div>
            <span className="font-display font-black text-titanium uppercase tracking-widest text-sm">MILTON</span>
            <span className="font-mono text-xs text-crimson ml-2 uppercase tracking-wider">Grand Prix</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Apex-1", "ThermaLock™", "Telemetry", "Paddock"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace("™", "")}`} className="font-mono text-xs text-titanium-dim hover:text-titanium uppercase tracking-widest transition-colors">
              {item}
            </a>
          ))}
        </div>
        <button className="bg-crimson hover:bg-crimson-dark font-display font-black text-white uppercase text-xs tracking-widest px-4 py-2 transition-colors">
          Reserve
        </button>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} id="apex-1" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 grid-bg opacity-100" />
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1645400379459-f6fd3d963fd4?w=1440&h=900&fit=crop&auto=format"
            alt="Milton Apex-1 hypercar"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/70 to-carbon/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-carbon/60" />
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/20 to-transparent" style={{ animation: "scan-line 4s linear infinite" }} />
        </div>

        {/* Corner brackets */}
        <div className="absolute top-24 left-6 w-8 h-8 border-l-2 border-t-2 border-crimson/60" />
        <div className="absolute top-24 right-6 w-8 h-8 border-r-2 border-t-2 border-crimson/60" />
        <div className="absolute bottom-8 left-6 w-8 h-8 border-l-2 border-b-2 border-crimson/60" />
        <div className="absolute bottom-8 right-6 w-8 h-8 border-r-2 border-b-2 border-crimson/60" />

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-crimson" />
              <span className="font-mono text-xs text-electric uppercase tracking-[0.3em]">Season 2027 · Chassis 1 of 25</span>
            </div>

            <h1 className="font-display font-black uppercase leading-[0.9] mb-6">
              <span className="block text-7xl md:text-9xl text-titanium tracking-tighter">MILTON</span>
              <span className="block text-7xl md:text-9xl text-crimson tracking-tighter" style={{ WebkitTextStroke: "2px #FF1E27", WebkitTextFillColor: "transparent" }}>APEX-1</span>
            </h1>

            <p className="font-body text-titanium-dim text-lg leading-relaxed max-w-xl mb-4">
              Street-legal F1 hypercar with proprietary{" "}
              <span className="text-electric font-mono text-sm">ThermaLock™ Chassis Armor</span>.
              Built from the same thermal science that keeps your coffee warm — scaled to contain 1,050 HP.
            </p>

            <p className="font-display text-2xl font-bold text-titanium/50 uppercase tracking-widest mb-10 italic">
              "Insulated from the Competition."
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group bg-crimson hover:bg-crimson-dark font-display font-black text-white uppercase tracking-widest px-8 py-4 text-lg transition-all duration-200 glow-crimson flex items-center gap-3">
                Reserve Chassis (1 of 25)
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform">
                  <path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <button className="border border-titanium/30 hover:border-electric font-display font-bold text-titanium hover:text-electric uppercase tracking-widest px-8 py-4 text-lg transition-all duration-200">
                Enter the Paddock
              </button>
            </div>

            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-titanium/10">
              {[{ v: "1.9s", l: "0–100" }, { v: "1,050", l: "HP" }, { v: "0%", l: "Thermal Drift" }].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl font-black text-crimson">{s.v}</div>
                  <div className="font-mono text-xs text-titanium-dim uppercase tracking-widest">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="font-mono text-xs text-titanium-dim uppercase tracking-widest">Scroll</span>
          <div className="w-px h-6 bg-gradient-to-b from-titanium-dim to-transparent" />
        </div>
      </section>

      {/* ── TELEMETRY & SPECS ── */}
      <section id="telemetry" className="py-24 bg-carbon carbon-texture">
        <div ref={specsRef} className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-12 h-px bg-electric" />
            <span className="font-mono text-xs text-electric uppercase tracking-[0.3em]">Live Telemetry Feed</span>
          </div>
          <h2 className="font-display font-black text-6xl md:text-7xl text-titanium uppercase tracking-tight mb-3">
            ZERO HEAT LOSS.<br />
            <span className="text-crimson">MAXIMUM VELOCITY.</span>
          </h2>
          <p className="font-body text-titanium-dim max-w-xl mb-16 leading-relaxed">
            Every metric below is live-calibrated through the ThermaLock™ Chassis Armor. These numbers don't drift. They're insulated.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPECS.map((spec) => (
              <SpecCard key={spec.label} spec={spec} started={specsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ── THERMALOCK TECH ── */}
      <section id="thermalock" className="py-24 bg-carbon-light">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-12 h-px bg-crimson" />
            <span className="font-mono text-xs text-crimson uppercase tracking-[0.3em]">Proprietary Technology</span>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <h2 className="font-display font-black text-6xl text-titanium uppercase tracking-tight leading-tight">
                THERMALOCK™<br />
                <span className="text-electric">CHASSIS ARMOR</span>
              </h2>
            </div>
            <div>
              <p className="font-body text-titanium-dim leading-relaxed mb-4">
                Double-Wall Vacuum Aero-Kevlar body panels eliminate thermal drift across the entire drivetrain. The same principle behind Milton's original vacuum flask — now engineered to contain a hybrid V6 pushing 1,050 HP at 18,000 RPM.
              </p>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-titanium-dim uppercase tracking-widest">Drag to reveal interior</span>
                <div className="flex-1 h-px bg-titanium/10" />
                <span className="font-mono text-xs text-electric uppercase">ThermaLock™</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mb-12">
          <ThermaSlider />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-px bg-titanium/10">
            {[
              { title: "Double-Wall Vacuum", body: "47-layer Aero-Kevlar panels with vacuum cavity. Thermal conductivity: effectively 0.", icon: "◈" },
              { title: "Active Cryo Circulation", body: "Sub-zero coolant loops derived from Milton's 24-hour ice-retention technology.", icon: "◉" },
              { title: "Cockpit Climate Lock", body: "Pilot zone maintained at ±0.5°C regardless of ambient track temperature.", icon: "◎" },
            ].map((item) => (
              <div key={item.title} className="bg-carbon p-8 hover:bg-carbon-mid transition-colors">
                <div className="text-3xl text-electric mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-lg text-titanium uppercase tracking-wide mb-2">{item.title}</h3>
                <p className="font-body text-sm text-titanium-dim leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOTSPOT MAP ── */}
      <section className="py-24 bg-carbon">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-12 h-px bg-titanium/40" />
            <span className="font-mono text-xs text-titanium-dim uppercase tracking-[0.3em]">Configuration Inspector</span>
          </div>
          <h2 className="font-display font-black text-5xl text-titanium uppercase tracking-tight">
            EXPLORE THE <span className="text-crimson">APEX-1</span>
          </h2>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <HotspotMap />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="paddock" className="py-24 bg-carbon-light carbon-texture">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-12 h-px bg-crimson" />
            <span className="font-mono text-xs text-crimson uppercase tracking-[0.3em]">From the Grid</span>
          </div>
          <h2 className="font-display font-black text-5xl text-titanium uppercase tracking-tight mb-16">
            PADDOCK<br />INTELLIGENCE
          </h2>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={t.driver} t={t} active={i === activeTestimonial} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-px w-8 transition-all duration-300 ${i === activeTestimonial ? "bg-crimson w-12" : "bg-titanium/30"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── COCKPIT PHOTO ── */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1780982907230-bb42eb1a4965?w=1440&h=800&fit=crop&auto=format"
          alt="Milton Apex-1 cockpit — driver perspective"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon via-carbon/60 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6">
            <p className="font-mono text-xs text-electric uppercase tracking-[0.3em] mb-4">Cockpit Perspective</p>
            <h2 className="font-display font-black text-7xl md:text-9xl text-titanium uppercase tracking-tight leading-none">
              YOUR<br /><span className="text-crimson">OFFICE.</span>
            </h2>
            <p className="font-body text-titanium-dim mt-4 max-w-sm leading-relaxed">
              Climate-locked at 21°C. Zero vibration transfer from the powertrain. The most comfortable seat in motorsport — or your kitchen table.
            </p>
          </div>
        </div>
      </section>

      {/* ── DOMESTIC UTILITIES EASTER EGG ── */}
      <section className="py-16 bg-carbon">
        <div className="max-w-7xl mx-auto px-6">
          <DomesticAccordion />
        </div>
      </section>

      {/* ── PRE-ORDER CTA ── */}
      <section className="py-32 bg-crimson relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/20" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-xs text-white/60 uppercase tracking-[0.4em] mb-6">Season 2027 Production Run</p>
          <h2 className="font-display font-black text-7xl md:text-9xl text-white uppercase tracking-tight leading-none mb-6">
            25<br />CHASSIS.
          </h2>
          <p className="font-display text-2xl font-bold text-white/70 uppercase tracking-wide mb-10">
            Zero Thermal Drift. Zero Compromise. Zero Left.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-carbon hover:bg-carbon-light font-display font-black text-titanium uppercase tracking-widest px-10 py-5 text-xl transition-all duration-200 border border-white/20">
              Reserve Your Chassis
            </button>
            <button className="border-2 border-white/40 hover:border-white font-display font-bold text-white uppercase tracking-widest px-10 py-5 text-xl transition-all duration-200">
              Request Full Specs
            </button>
          </div>
          <p className="font-mono text-xs text-white/40 mt-8">
            ℹ Reservation requires a non-refundable deposit of €125,000. Delivery Q3 2027. Thermos not included.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-carbon border-t border-titanium/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-crimson flex items-center justify-center">
                  <span className="font-display font-black text-white text-sm">M</span>
                </div>
                <div>
                  <div className="font-display font-black text-titanium uppercase tracking-widest">MILTON GRAND PRIX</div>
                  <div className="font-mono text-xs text-titanium-dim">Zero Heat Loss. Maximum Velocity.</div>
                </div>
              </div>
              <p className="font-body text-sm text-titanium-dim leading-relaxed max-w-xs">
                Founded on the principle that the best insulation wins — whether in your kitchen or on the starting grid.
              </p>
            </div>
            {[
              { title: "The Machine", links: ["Apex-1", "ThermaLock™", "Specifications", "Configurator"] },
              { title: "Milton Racing", links: ["Heritage", "Season 2027", "Media", "Press Kit"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-mono text-xs text-titanium-dim uppercase tracking-widest mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="font-body text-sm text-titanium/60 hover:text-titanium transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-titanium/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-titanium-dim">© 2027 Milton Grand Prix. All rights reserved. All temperatures maintained.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-electric animate-pulse" />
              <span className="font-mono text-xs text-electric">LIVE TELEMETRY ACTIVE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── STICKY DOCK ── */}
      <StickyDock visible={showDock} />

      {/* Bottom padding for dock */}
      <div className="h-16" />
    </div>
  );
}
