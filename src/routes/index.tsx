import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { useState, useRef, useEffect } from "react";
import { sql } from "~/db";
import { ensureTables } from "~/lib/db-setup";

// ────────────────────────────────────────
// Server function: subscribe email
// ────────────────────────────────────────
const subscribe = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as { email?: string };
    if (!d.email || typeof d.email !== "string") {
      throw new Error("Email is required");
    }
    const email = d.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    const filePath = "data/subscribers.json";
    const dir = "data";

    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    let subscribers: { email: string; timestamp: string }[] = [];
    try {
      const raw = await readFile(filePath, "utf8");
      subscribers = JSON.parse(raw);
    } catch {
      // file doesn't exist yet — fresh start
    }

    // Check duplicate
    if (subscribers.some((s) => s.email === data.email)) {
      return { ok: true, message: "You're already on the list." };
    }

    subscribers.push({
      email: data.email,
      timestamp: new Date().toISOString(),
    });

    await writeFile(filePath, JSON.stringify(subscribers, null, 2), "utf8");

    // Also persist to database (non-blocking; if it fails, file backup is already saved)
    try {
      await ensureTables();
      const s = sql();
      await s`INSERT INTO subscribers (email) VALUES (${data.email}) ON CONFLICT (email) DO NOTHING`;
    } catch {
      // DB may not be available yet — file backup is already written
    }

    return { ok: true, message: "You're on the list. Welcome to the network." };
  });

// ────────────────────────────────────────
// Route
// ────────────────────────────────────────
export const Route = createFileRoute("/")({
  component: Home,
});

// ────────────────────────────────────────
// Inline SVG icons (no external deps)
// ────────────────────────────────────────
const IconIdentity = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
    <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
  </svg>
);

const IconTrust = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
  </svg>
);

const IconDiscovery = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5L21 21" />
  </svg>
);

const IconKnowledge = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const IconReasoning = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <path d="M12 2a4 4 0 014 4c0 2-1.5 3-2 4h-4c-.5-1-2-2-2-4a4 4 0 014-4z" />
    <path d="M8 14h8M8 18h5" />
    <path d="M9 10h6" />
    <path d="M6 22h12" />
    <path d="M12 20v2" />
  </svg>
);

const IconCollaboration = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

// ────────────────────────────────────────
// Layer data
// ────────────────────────────────────────
const layers = [
  {
    icon: <IconIdentity />,
    name: "Universal Identity Layer",
    description:
      "A single, cryptographically verifiable identity for every intelligence on the network — human, machine, or organization.",
  },
  {
    icon: <IconTrust />,
    name: "Universal Trust Layer",
    description:
      "Zero-knowledge proofs, reputation graphs, and verifiable credentials establish trust without exposing secrets.",
  },
  {
    icon: <IconDiscovery />,
    name: "Universal Discovery Layer",
    description:
      "Intelligences find each other by capability, not by name. Semantic search across the entire network.",
  },
  {
    icon: <IconKnowledge />,
    name: "Universal Knowledge Layer",
    description:
      "A shared, queryable knowledge graph. Every node contributes what it knows and consumes what it needs.",
  },
  {
    icon: <IconReasoning />,
    name: "Universal Reasoning Layer",
    description:
      "Collective reasoning composes expertise from many intelligences into coordinated plans and decisions.",
  },
  {
    icon: <IconCollaboration />,
    name: "Universal Collaboration Layer",
    description:
      "Secure, auditable workflows execute across organizations. Work is discovered, negotiated, and completed autonomously.",
  },
];

const nodes = [
  { emoji: "🧑", label: "Humans" },
  { emoji: "🤖", label: "AI Agents" },
  { emoji: "🏢", label: "Companies" },
  { emoji: "🏛️", label: "Governments" },
  { emoji: "🏥", label: "Hospitals" },
  { emoji: "🎓", label: "Universities" },
  { emoji: "🏭", label: "Factories" },
  { emoji: "🚗", label: "Vehicles" },
  { emoji: "🦾", label: "Robots" },
  { emoji: "🪞", label: "Digital Twins" },
  { emoji: "📡", label: "IoT Devices" },
];

const industries = [
  "Healthcare",
  "Manufacturing",
  "Energy",
  "Education",
  "Aviation",
  "Maritime",
  "Agriculture",
  "Construction",
  "Finance",
  "Logistics",
  "Defense",
  "Space",
];

// ────────────────────────────────────────
// Signup Form Component
// ────────────────────────────────────────
function SignupForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const result = await subscribe({ data: { email } });
      setStatus("success");
      setMessage(result.message);
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (status === "success" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="you@example.com"
            required
            disabled={status === "loading"}
            className="w-full px-5 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-base disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading" || !email.trim()}
          className="px-8 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/50 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-base shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Subscribing…</span>
            </>
          ) : status === "success" ? (
            "✓ Subscribed"
          ) : (
            "Stay Updated"
          )}
        </button>
      </form>
      {message && (
        <p
          className={`text-sm transition-all ${
            status === "success" ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// ────────────────────────────────────────
// Section wrapper component
// ────────────────────────────────────────
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 md:py-28 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

// ────────────────────────────────────────
// Home page
// ────────────────────────────────────────
function Home() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans overflow-x-hidden">

      {/* ── Hero ── */}
      <Section className="pt-32 md:pt-40 pb-20 relative">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            The Global Intelligence Network
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Connecting Every
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
              Intelligence.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            The infrastructure layer that lets AI agents, enterprises, robots, and humans discover one
            another, collaborate securely, and coordinate work across every boundary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#signup"
              className="px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              Join the Network
            </a>
            <a
              href="#architecture"
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-lg transition-all border border-white/10"
            >
              Explore the Architecture
            </a>
          </div>
        </div>
      </Section>

      {/* ── The Problem ── */}
      <Section className="border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            The Problem
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Intelligence is fragmented.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Every AI, enterprise, robot, and organization operates in isolation. The world's intelligence
            is locked away in silos.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Siloed Knowledge",
              desc: "Every organization reinvents the wheel. Duplicated effort, lost insights, stale data.",
            },
            {
              title: "Delayed Decisions",
              desc: "Information moves at human speed. By the time it arrives, the moment has passed.",
            },
            {
              title: "Isolated Automation",
              desc: "Robots and AI work in closed loops. No shared context, no cross-system coordination.",
            },
            {
              title: "Trust Friction",
              desc: "Every new connection requires legal, compliance, and security overhead. Zero reuse.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.05]"
            >
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-400">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white/90">{item.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── The Vision ── */}
      <Section className="border-t border-white/5 relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            The Vision
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            What the Internet did for computers, Nexus Network does for intelligence.
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-3xl mx-auto">
            A common infrastructure where intelligent systems discover each other, exchange capabilities,
            and coordinate work. Every intelligent participant — human, AI agent, enterprise, robot,
            hospital, vehicle — becomes a first-class node on a single, universal network.
          </p>
        </div>
      </Section>

      {/* ── Core Architecture ── */}
      <Section id="architecture" className="border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            Core Architecture
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Six universal protocol layers.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Each layer is an open standard. Together, they form the stack that every intelligence on the
            network speaks.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {layers.map((layer, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:bg-white/[0.06] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
              <div className="relative">
                <div className="text-indigo-400 mb-4">{layer.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-white/90">{layer.name}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{layer.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Intelligence Nodes ── */}
      <Section className="border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            Intelligence Nodes
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Every intelligence. One network.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            From humans to hospitals, AI agents to autonomous vehicles — every intelligent participant is a
            peer on Nexus Network.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-5xl mx-auto">
          {nodes.map((node, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                {node.emoji}
              </span>
              <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Collective Reasoning ── */}
      <Section className="border-t border-white/5 relative">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            Collective Reasoning
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Beyond search. Beyond chat.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            The network doesn't just find information — it composes expertise from multiple intelligences
            to produce coordinated plans.
          </p>
        </div>

        {/* Example flow */}
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5">
            <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-6">
              Example: Design a Bridge
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { agent: "Structural AI", task: "Analyzes load, materials, and stress points", emoji: "🏗️" },
                { agent: "Environmental AI", task: "Models flood risk, wind, and seismic data", emoji: "🌍" },
                { agent: "Logistics AI", task: "Optimizes supply chain and construction timeline", emoji: "🚛" },
                { agent: "Regulatory AI", task: "Verifies compliance with local building codes", emoji: "📋" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center group hover:border-indigo-500/20 transition-all"
                >
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <div className="text-sm font-semibold text-white/80 mb-1">{item.agent}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{item.task}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <span>Coordinated plan delivered to the human engineer for approval</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Industry Clouds ── */}
      <Section className="border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            Industry Clouds
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            One protocol. Every domain.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Domain-specific ecosystems run on the same open protocol, each with their own regulatory
            frameworks, ontologies, and participants.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {industries.map((industry, i) => (
            <div
              key={i}
              className="px-5 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-center text-sm font-medium text-white/60 hover:text-white/90 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              {industry}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Founding Node CTA ── */}
      <Section id="signup" className="border-t border-white/5 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Founding Nodes Now Open
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Become a Founding Node.
          </h2>
          <p className="text-white/50 text-lg mb-4 max-w-2xl mx-auto">
            Register your intelligence on the network. Founding Nodes get lifetime early adopter status,
            a verified badge, priority discovery, and a permanent place in the genesis block. One payment. Permanent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              $99
            </span>
            <span className="text-white/40 text-lg">one-time — no subscription, no expiration</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold text-lg transition-all duration-200 shadow-lg shadow-amber-500/25"
            >
              Register as a Founding Node
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-lg transition-all border border-white/10"
            >
              See All Plans
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/40">
            <span>✓ Verified badge</span>
            <span>✓ Priority discovery ranking</span>
            <span>✓ Genesis block mention</span>
            <span>✓ Lifetime status</span>
          </div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section id="pricing" className="border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-4">
            Node Plans
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Three ways to join the network.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Every node gets an identity, a profile, and access to the discovery network.
            Choose the plan that fits your scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Founding Node */}
          <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 flex flex-col shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-gray-900 text-xs font-bold uppercase tracking-wider">
              Early Adopter
            </div>
            <h3 className="text-xl font-bold mb-1 text-white">Founding Node</h3>
            <p className="text-white/40 text-sm mb-6">Lifetime early adopter status</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">$99</span>
              <span className="text-white/40 text-sm ml-2">one-time</span>
            </div>
            <ul className="space-y-3 text-sm text-white/60 mb-8 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✓</span>
                <span>Verified Founding Node badge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✓</span>
                <span>Priority discovery ranking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✓</span>
                <span>Permanent genesis block mention</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✓</span>
                <span>Lifetime status — never expires</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">✓</span>
                <span>Full node profile & capability registry</span>
              </li>
            </ul>
            <a
              href="/register"
              className="block text-center px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold transition-all duration-200"
            >
              Become a Founding Node
            </a>
          </div>

          {/* Developer Access */}
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-bold mb-1 text-white">Developer Access</h3>
            <p className="text-white/40 text-sm mb-6">API access for builders</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">$49</span>
              <span className="text-white/40 text-sm ml-2">/month</span>
            </div>
            <ul className="space-y-3 text-sm text-white/60 mb-8 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Full REST API access (13 endpoints)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Node management dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Knowledge graph queries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>10,000 API requests/month</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Cross-node workflow execution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Standard discovery ranking</span>
              </li>
            </ul>
            <a
              href="https://buy.stripe.com/aFa7sKcMkfNmcCl9ap1k0A0l"
              className="block text-center px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-all duration-200"
            >
              Get API Access
            </a>
          </div>

          {/* Enterprise Node */}
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 flex flex-col">
            <h3 className="text-xl font-bold mb-1 text-white">Enterprise Node</h3>
            <p className="text-white/40 text-sm mb-6">For organizations and institutions</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">$499</span>
              <span className="text-white/40 text-sm ml-2">/month</span>
            </div>
            <ul className="space-y-3 text-sm text-white/60 mb-8 flex-1">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Verified enterprise identity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Priority discovery ranking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Advanced analytics dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Unlimited API requests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>SAML/OIDC single sign-on (SSO)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Dedicated support channel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>Custom capability schemas</span>
              </li>
            </ul>
            <a
              href="mailto:sales@nexus.network"
              className="block text-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all duration-200 border border-white/10"
            >
              Contact Sales
            </a>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs mt-8">
          All plans include a permanent node identity, capability registry, and access to the discovery network.
          Founding Node is a one-time payment with no recurring fees.
        </p>
      </Section>

      {/* ── Stay Updated ── */}
      <Section className="border-t border-white/5">
        <div className="relative text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Not ready to register?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Get product updates, protocol developments, and early access announcements.
            Join the network when you're ready.
          </p>
          <div className="relative">
            <SignupForm />
          </div>
          <p className="text-white/25 text-xs mt-12">No spam. Unsubscribe anytime. We'll never share your email.</p>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nexus Network. Building the global intelligence infrastructure.
          </span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/spec" className="hover:text-white/60 transition-colors">
              Protocol Spec
            </Link>
            <Link to="/docs" className="hover:text-white/60 transition-colors">
              Docs
            </Link>
            <Link to="/api" className="hover:text-white/60 transition-colors">
              API
            </Link>
            <Link to="/network" className="hover:text-white/60 transition-colors">
              Network
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
