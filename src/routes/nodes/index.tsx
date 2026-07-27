import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { searchNodes, type NodeRow, type Capability } from "~/lib/nodes";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/nodes/")({
  component: NodesListPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    types: typeof search.types === "string" && search.types ? search.types.split(",").filter(Boolean) : [],
    cat: typeof search.cat === "string" ? search.cat : "",
    trust: typeof search.trust === "string" ? parseInt(search.trust) || 0 : 0,
    sort: typeof search.sort === "string" ? search.sort : "newest",
  }),
});

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────

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

const CAP_CATEGORIES = [
  "reasoning", "knowledge", "automation", "sensing",
  "computation", "communication", "other",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "trust", label: "Trust Level (High)" },
  { value: "name", label: "Name (A-Z)" },
];

const TRUST_LABELS: Record<number, string> = {
  1: "New",
  2: "Developing",
  3: "Established",
  4: "Trusted",
  5: "Highly Trusted",
};

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function matchesSearch(node: NodeRow, query: string): Capability[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const matched: Capability[] = [];
  for (const cap of node.capabilities) {
    if (
      cap.name.toLowerCase().includes(q) ||
      cap.description.toLowerCase().includes(q)
    ) {
      matched.push(cap);
    }
  }
  return matched;
}

function TrustDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={TRUST_LABELS[level] ?? "Level " + level}>
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

// ──────────────────────────────────────────
// NodeCard
// ──────────────────────────────────────────

function NodeCard({ node, query }: { node: NodeRow; query: string }) {
  const typeInfo = NODE_TYPE_MAP[node.node_type] ?? { emoji: "⚡", label: node.node_type };
  const matchedCaps = matchesSearch(node, query);

  return (
    <div className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300">
      <Link to={`/nodes/${node.id}`} className="block">
        <div className="flex items-start gap-4">
          <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
            {typeInfo.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors truncate">
                {node.name}
              </h3>
              <span
                className={
                  "shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase " +
                  (node.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : node.status === "pending"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20")
                }
              >
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
            {/* Capabilities */}
            {node.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {node.capabilities.slice(0, 5).map((cap, i) => {
                  const isMatch = matchedCaps.some((m) => m.name === cap.name);
                  return (
                    <span
                      key={i}
                      className={
                        "px-2 py-0.5 rounded text-[10px] " +
                        (isMatch
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25"
                          : "bg-white/5 text-white/50")
                      }
                    >
                      {cap.name}
                    </span>
                  );
                })}
                {node.capabilities.length > 5 && (
                  <span className="text-[10px] text-white/30 self-center">
                    +{node.capabilities.length - 5} more
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
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] text-white/20">
          {node.capabilities.length} capabilities
        </span>
        <Link
          to={`/nodes/${node.id}/dashboard`}
          className="text-[10px] font-medium text-white/30 hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </Link>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Page component
// ──────────────────────────────────────────

function NodesListPage() {
  const searchParams = useSearch({ from: "/nodes/" });
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Local state mirroring URL search params
  const [query, setQuery] = useState(searchParams.q ?? "");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(searchParams.types ?? []);
  const [capCategory, setCapCategory] = useState(searchParams.cat ?? "");
  const [minTrust, setMinTrust] = useState(searchParams.trust ?? 0);
  const [sortBy, setSortBy] = useState(searchParams.sort ?? "newest");

  // Debounce helper
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync from URL on mount
  useEffect(() => {
    if (searchParams.q !== undefined) setQuery(searchParams.q);
    if (searchParams.types !== undefined) setSelectedTypes(searchParams.types);
    if (searchParams.cat !== undefined) setCapCategory(searchParams.cat);
    if (searchParams.trust !== undefined) setMinTrust(searchParams.trust);
    if (searchParams.sort !== undefined) setSortBy(searchParams.sort);
  }, []);

  // Fetch
  const fetchNodes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchNodes({
        data: {
          query: debouncedQuery,
          nodeTypes: selectedTypes,
          capabilityCategory: capCategory,
          minTrust: minTrust > 0 ? minTrust : undefined,
          sortBy: sortBy as "newest" | "trust" | "name",
          limit: 50,
          offset: 0,
        },
      });
      setNodes(result.nodes);
      setTotal(result.total);
    } catch (err) {
      console.error("Search failed:", err);
      setNodes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedTypes, capCategory, minTrust, sortBy]);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const hasFilters = query || selectedTypes.length > 0 || capCategory || minTrust > 0;

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setSelectedTypes([]);
    setCapCategory("");
    setMinTrust(0);
    setSortBy("newest");
  }

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Header */}
      <div className="pt-24 pb-12 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/discover" className="hover:text-white/60 transition-colors">Discover</Link>
            <span>/</span>
            <span className="text-white/60">Search</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                Discover Nodes
              </h1>
              <p className="text-lg text-white/50 max-w-2xl">
                Find intelligence nodes by capability, type, trust level, or keyword.
              </p>
            </div>
            <Link
              to="/register"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all duration-200"
            >
              + Register Node
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-3xl">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes by name, description, or capability..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-base"
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-[#0a0b14]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Node Type chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-white/40 mr-1">Type:</span>
              {(Object.entries(NODE_TYPE_MAP) as [string, { emoji: string; label: string }][]).map(([value, info]) => (
                <button
                  key={value}
                  onClick={() => toggleType(value)}
                  className={
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all border " +
                    (selectedTypes.includes(value)
                      ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                      : "bg-white/[0.03] border-white/5 text-white/40 hover:text-white/60 hover:border-white/15")
                  }
                >
                  {info.emoji} {info.label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 hidden lg:block" />

            {/* Capability Category */}
            <select
              value={capCategory}
              onChange={(e) => setCapCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "0.625rem",
                paddingRight: "2rem",
              }}
            >
              <option value="">All Capabilities</option>
              {CAP_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Trust Level */}
            <select
              value={minTrust}
              onChange={(e) => setMinTrust(parseInt(e.target.value) || 0)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "0.625rem",
                paddingRight: "2rem",
              }}
            >
              <option value="0">Any Trust</option>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Trust {"≥"} {lvl} ({TRUST_LABELS[lvl]})
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.5rem center",
                backgroundSize: "0.625rem",
                paddingRight: "2rem",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:text-white/60 transition-colors border border-white/5 hover:border-white/15"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Results count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-white/40">
            {loading ? (
              "Searching..."
            ) : (
              <>
                Showing <span className="text-white/60 font-medium">{nodes.length}</span>
                {total !== nodes.length && (
                  <> of <span className="text-white/60 font-medium">{total}</span></>
                )}
                {" "}node{nodes.length !== 1 ? "s" : ""}
                {hasFilters && " matching your filters"}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : nodes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-xl font-semibold text-white/60 mb-3">No nodes match your search</h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto">
              Try different filters or search terms. The network is growing every day.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium transition-all border border-white/10"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {nodes.map((node) => (
              <NodeCard key={node.id} node={node} query={debouncedQuery} />
            ))}
          </div>
        )}
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
