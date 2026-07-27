import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { listEntities, ENTITY_TYPES, DOMAINS } from "~/lib/knowledge";
import type { KnowledgeEntity } from "~/lib/knowledge";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/knowledge/entities")({
  component: EntityBrowserPage,
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    entity_type: typeof search.entity_type === "string" ? search.entity_type : "",
    domain: typeof search.domain === "string" ? search.domain : "",
    sort: typeof search.sort === "string" ? search.sort : "newest",
  }),
});

const ENTITY_TYPE_BADGES: Record<string, string> = {
  project: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contract: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  research: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  guideline: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  regulation: "bg-red-500/10 text-red-400 border-red-500/20",
  equipment: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  organization: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  person: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  software: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  asset: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  infrastructure: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  concept: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  other: "bg-white/5 text-white/50 border-white/10",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A-Z)" },
];

function EntityBrowserPage() {
  const search = useSearch({ from: "/knowledge/entities" });
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const [typeFilter, setTypeFilter] = useState(search.entity_type ?? "");
  const [domainFilter, setDomainFilter] = useState(search.domain ?? "");
  const [sortBy, setSortBy] = useState(search.sort ?? "newest");

  const fetchEntities = useCallback(() => {
    setLoading(true);
    listEntities({
      data: {
        query: searchInput,
        entity_type: typeFilter,
        domain: domainFilter,
        sort: sortBy as "newest" | "name",
        limit: 50,
      },
    })
      .then((result) => {
        setEntities(result.entities);
        setTotal(result.total);
      })
      .finally(() => setLoading(false));
  }, [searchInput, typeFilter, domainFilter, sortBy]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntities();
  };

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Header */}
      <div className="pt-24 pb-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
            <span>/</span>
            <span className="text-white/60">Entities</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Entity Browser</h1>
          <p className="text-white/40 text-sm">
            Explore {total} knowledge {total === 1 ? "entity" : "entities"} in the graph
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="border-b border-white/5 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
              <input
                type="text"
                placeholder="Search entities by name, description, or type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-all duration-200"
            >
              Search
            </button>
          </form>
          <div className="flex flex-wrap gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/70 text-sm focus:outline-none focus:border-indigo-500/50"
            >
              <option value="" className="bg-[#0a0b14]">All Entity Types</option>
              {ENTITY_TYPES.map((t) => (
                <option key={t} value={t} className="bg-[#0a0b14]">{t}</option>
              ))}
            </select>
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/70 text-sm focus:outline-none focus:border-indigo-500/50"
            >
              <option value="" className="bg-[#0a0b14]">All Domains</option>
              {DOMAINS.map((d) => (
                <option key={d} value={d} className="bg-[#0a0b14]">{d}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/70 text-sm focus:outline-none focus:border-indigo-500/50"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#0a0b14]">{o.label}</option>
              ))}
            </select>
            {(typeFilter || domainFilter || searchInput) && (
              <button
                onClick={() => { setTypeFilter(""); setDomainFilter(""); setSearchInput(""); }}
                className="px-4 py-2 rounded-lg text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : entities.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-xl font-semibold text-white/50 mb-2">No entities match.</h2>
            <p className="text-white/30 text-sm mb-6">
              {searchInput || typeFilter || domainFilter
                ? "Try adjusting your filters."
                : "Be the first to contribute knowledge."}
            </p>
            <Link
              to="/knowledge/contribute"
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-all duration-200 inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Contribute Knowledge
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {entities.map((entity) => {
              const badgeClass = ENTITY_TYPE_BADGES[entity.entity_type] ?? ENTITY_TYPE_BADGES.other;
              return (
                <Link
                  key={entity.id}
                  to={`/knowledge/entities/${entity.id}`}
                  className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 block"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white/90 truncate mb-2">{entity.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                          {entity.entity_type}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/10">
                          {entity.domain}
                        </span>
                      </div>
                      {entity.description && (
                        <p className="text-xs text-white/40 line-clamp-2 mb-3">{entity.description}</p>
                      )}
                      {entity.contributor_name && (
                        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                          <span>Contributed by</span>
                          <Link
                            to={`/nodes/${entity.contributor_node_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-indigo-400/70 hover:text-indigo-300 transition-colors font-medium"
                          >
                            {entity.contributor_name}
                          </Link>
                        </div>
                      )}
                    </div>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors shrink-0 mt-1">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              );
            })}
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
            <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
