import { createFileRoute, Link } from "@tanstack/react-router";
import { listNodes, type NodeRow } from "~/lib/nodes";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/discover")({
  component: DiscoverPage,
});

const NODE_TYPE_MAP: Record<string, { emoji: string; label: string }> = {
  human: { emoji: "🧑", label: "Human" },
  ai_agent: { emoji: "🤖", label: "AI Agent" },
  company: { emoji: "🏢", label: "Company" },
  government: { emoji: "🏛️", label: "Government" },
  hospital: { emoji: "🏥", label: "Hospital" },
  university: { emoji: "🎓", label: "University" },
  factory: { emoji: "🏭", label: "Factory" },
  vehicle: { emoji: "🚗", label: "Vehicle" },
  robot: { emoji: "🦾", label: "Robot" },
  digital_twin: { emoji: "🪞", label: "Digital Twin" },
  iot_device: { emoji: "📡", label: "IoT Device" },
  other: { emoji: "⚡", label: "Other" },
};

const QUICK_CHIPS = [
  { label: "🤖 AI Agents", types: "ai_agent" },
  { label: "🧠 Reasoning", cat: "reasoning" },
  { label: "🏥 Healthcare", types: "hospital" },
  { label: "🦾 Robots", types: "robot" },
  { label: "📚 Knowledge", cat: "knowledge" },
  { label: "⚙️ Automation", cat: "automation" },
  { label: "🎓 Universities", types: "university" },
  { label: "🏭 Factories", types: "factory" },
];

function buildSearchUrl(chip: { types?: string; cat?: string }): string {
  const params = new URLSearchParams();
  if (chip.types) params.set("types", chip.types);
  if (chip.cat) params.set("cat", chip.cat);
  return "/nodes?" + params.toString();
}

function TrustDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={"text-[10px] " + (i <= level ? "text-indigo-400" : "text-white/15")}
        >
          ●
        </span>
      ))}
    </span>
  );
}

function FeaturedCard({ node }: { node: NodeRow }) {
  const typeInfo = NODE_TYPE_MAP[node.node_type] ?? { emoji: "⚡", label: node.node_type };
  return (
    <Link
      to={`/nodes/${node.id}`}
      className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 block"
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
          {typeInfo.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-white/90 truncate">{node.name}</h3>
            <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {node.status}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
            <span>{typeInfo.label}</span>
            <span>·</span>
            <TrustDots level={node.trust_level} />
          </div>
          {node.description && (
            <p className="text-xs text-white/40 line-clamp-2">{node.description}</p>
          )}
          {node.capabilities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {node.capabilities.slice(0, 3).map((cap, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50"
                >
                  {cap.name}
                </span>
              ))}
              {node.capabilities.length > 3 && (
                <span className="text-[10px] text-white/30">
                  +{node.capabilities.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors shrink-0 mt-1"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}

function DiscoverPage() {
  const [recentNodes, setRecentNodes] = useState<NodeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNodes()
      .then((all) => setRecentNodes(all.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Hero */}
      <div className="pt-32 md:pt-40 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
            Universal Discovery Layer
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Discover
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
              Intelligence.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find nodes by what they can do, not just what they're called. Search across every
            intelligence on the network — humans, AI agents, robots, enterprises, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/nodes"
              className="px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2 justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
              Search All Nodes
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-lg transition-all border border-white/10"
            >
              Register a Node
            </Link>
          </div>
        </div>
      </div>

      {/* Quick-start chips */}
      <div className="border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-sm font-semibold text-white/30 uppercase tracking-wider mb-5 text-center">
            Quick Start
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {QUICK_CHIPS.map((chip, i) => (
              <Link
                key={i}
                to={buildSearchUrl(chip)}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] text-white/70 hover:text-white text-sm font-medium transition-all duration-200"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Explore by type */}
      <div className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-3 text-center">
            Explore by Node Type
          </h2>
          <p className="text-white/40 text-sm mb-8 text-center">
            Every kind of intelligence is a first-class node on Nexus Network.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(NODE_TYPE_MAP).map(([value, info]) => (
              <Link
                key={value}
                to={"/nodes?types=" + value}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                  {info.emoji}
                </span>
                <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors text-center">
                  {info.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured / recent nodes */}
      <div className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Recently Registered
              </h2>
              <p className="text-white/40 text-sm">
                The newest nodes on the network.
              </p>
            </div>
            <Link
              to="/nodes"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : recentNodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🪞</div>
              <p className="text-white/40 text-sm">No nodes registered yet.</p>
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                Be the first →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {recentNodes.map((node) => (
                <FeaturedCard key={node.id} node={node} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nexus Network. Building the global intelligence infrastructure.
          </span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link>
            <Link to="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
            <Link to="/api" className="hover:text-white/60 transition-colors">API</Link>
            <Link to="/network" className="hover:text-white/60 transition-colors">Network</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
