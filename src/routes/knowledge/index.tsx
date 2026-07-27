import { createFileRoute, Link } from "@tanstack/react-router";
import { getKnowledgeStats, getEntityTypeDistribution, listEntities, DOMAINS } from "~/lib/knowledge";
import type { KnowledgeEntity } from "~/lib/knowledge";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/knowledge/")({
  component: KnowledgeOverviewPage,
});

const ENTITY_TYPE_BADGES: Record<string, { emoji: string; color: string }> = {
  project: { emoji: "📋", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  contract: { emoji: "📜", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  research: { emoji: "🔬", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  guideline: { emoji: "📖", color: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  regulation: { emoji: "⚖️", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  equipment: { emoji: "🔧", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  organization: { emoji: "🏢", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
  person: { emoji: "👤", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  software: { emoji: "💻", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  asset: { emoji: "💎", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  infrastructure: { emoji: "🏗️", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  concept: { emoji: "💡", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  other: { emoji: "📌", color: "bg-white/5 text-white/50 border-white/10" },
};

const DOMAIN_EMOJIS: Record<string, string> = {
  healthcare: "🏥",
  manufacturing: "🏭",
  energy: "⚡",
  education: "🎓",
  aviation: "✈️",
  maritime: "🚢",
  agriculture: "🌾",
  construction: "🏗️",
  finance: "💰",
  logistics: "📦",
  defense: "🛡️",
  space: "🚀",
  general: "🌐",
};

function KnowledgeOverviewPage() {
  const [stats, setStats] = useState({ totalEntities: 0, totalRelationships: 0, totalContributingNodes: 0 });
  const [typeDist, setTypeDist] = useState<{ entity_type: string; count: number }[]>([]);
  const [recentEntities, setRecentEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getKnowledgeStats({ data: undefined }),
      getEntityTypeDistribution({ data: undefined }),
      listEntities({ data: { limit: 6, sort: "newest" } }),
    ])
      .then(([s, t, e]) => {
        setStats(s);
        setTypeDist(t);
        setRecentEntities(e.entities);
      })
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Universal Knowledge Layer
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            The Universal
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
              Knowledge Layer.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Intelligence isn't just connected — it's collectively knowable. Every node on Nexus
            Network contributes entities, defines relationships, and builds a shared graph of
            understanding that spans every domain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/knowledge/entities"
              className="px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2 justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
              Browse Entities
            </Link>
            <Link
              to="/knowledge/contribute"
              className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-medium text-lg transition-all border border-white/10 inline-flex items-center gap-2 justify-center"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Contribute Knowledge
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-4xl font-extrabold text-indigo-400 mb-2">{stats.totalEntities}</p>
                <p className="text-sm text-white/40">Entities in the Graph</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-4xl font-extrabold text-purple-400 mb-2">{stats.totalRelationships}</p>
                <p className="text-sm text-white/40">Relationships Defined</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                <p className="text-4xl font-extrabold text-emerald-400 mb-2">{stats.totalContributingNodes}</p>
                <p className="text-sm text-white/40">Contributing Nodes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Entities */}
      <div className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Recently Added</h2>
              <p className="text-white/40 text-sm">The newest knowledge entities in the graph.</p>
            </div>
            <Link
              to="/knowledge/entities"
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          {recentEntities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🧠</div>
              <p className="text-white/40 text-sm">No entities yet.</p>
              <Link to="/knowledge/contribute" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                Be the first to contribute →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {recentEntities.map((entity) => {
                const badge = ENTITY_TYPE_BADGES[entity.entity_type] ?? ENTITY_TYPE_BADGES.other;
                return (
                  <Link
                    key={entity.id}
                    to={`/knowledge/entities/${entity.id}`}
                    className="group p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 block"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {badge.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white/90 truncate mb-1">{entity.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                            {entity.entity_type}
                          </span>
                          <span className="text-[10px] text-white/30">{entity.domain}</span>
                        </div>
                        {entity.description && (
                          <p className="text-xs text-white/40 line-clamp-2">{entity.description}</p>
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
      </div>

      {/* Entity Type Distribution */}
      {typeDist.length > 0 && (
        <div className="border-t border-white/5 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold tracking-tight mb-3 text-center">Entity Type Distribution</h2>
            <p className="text-white/40 text-sm mb-8 text-center">What kinds of knowledge are being contributed.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {typeDist.map((item) => {
                const badge = ENTITY_TYPE_BADGES[item.entity_type] ?? ENTITY_TYPE_BADGES.other;
                return (
                  <Link
                    key={item.entity_type}
                    to={`/knowledge/entities?entity_type=${item.entity_type}`}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all duration-300 group"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {badge.emoji}
                    </span>
                    <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors text-center">
                      {item.entity_type}
                    </span>
                    <span className="text-xs text-white/30">{item.count} entity{item.count !== 1 ? "ies" : ""}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Domain Exploration */}
      <div className="border-t border-white/5 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-3 text-center">Explore by Domain</h2>
          <p className="text-white/40 text-sm mb-8 text-center">Knowledge spans every sector. Dive into a domain.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {DOMAINS.map((domain) => (
              <Link
                key={domain}
                to={`/knowledge/entities?domain=${domain}`}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.08] text-white/70 hover:text-white text-sm font-medium transition-all duration-200 inline-flex items-center gap-2"
              >
                <span>{DOMAIN_EMOJIS[domain] ?? "🌐"}</span>
                {domain}
              </Link>
            ))}
          </div>
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
            <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
