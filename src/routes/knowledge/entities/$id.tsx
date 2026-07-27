import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  getEntity, getEntityRelationships, createRelationship,
  searchEntities, RELATIONSHIP_TYPES,
} from "~/lib/knowledge";
import type { KnowledgeEntity, KnowledgeRelationship } from "~/lib/knowledge";
import { listNodes } from "~/lib/nodes";
import type { NodeRow } from "~/lib/nodes";
import { useState, useEffect, useCallback } from "react";

export const Route = createFileRoute("/knowledge/entities/$id")({
  component: EntityDetailPage,
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

const RELATIONSHIP_COLORS: Record<string, string> = {
  depends_on: "bg-red-500/10 text-red-400 border-red-500/20",
  contains: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  references: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  implements: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  regulates: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  owns: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  produces: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  consumes: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  relates_to: "bg-white/5 text-white/50 border-white/10",
};

function EntityDetailPage() {
  const { id } = Route.useParams();
  const [entity, setEntity] = useState<KnowledgeEntity | null>(null);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Add relationship form state
  const [showAddRel, setShowAddRel] = useState(false);
  const [relTargetId, setRelTargetId] = useState("");
  const [relType, setRelType] = useState("relates_to");
  const [relDesc, setRelDesc] = useState("");
  const [relNodeId, setRelNodeId] = useState("");
  const [relSaving, setRelSaving] = useState(false);
  const [relError, setRelError] = useState("");
  const [relSuccess, setRelSuccess] = useState(false);

  // Search for target entity
  const [entitySearch, setEntitySearch] = useState("");
  const [searchResults, setSearchResults] = useState<KnowledgeEntity[]>([]);
  const [searching, setSearching] = useState(false);
  const [nodes, setNodes] = useState<NodeRow[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getEntity({ data: { id } })
      .then((result) => {
        if (!result) {
          setError(true);
          throw notFound();
        }
        setEntity(result);
        if (result.contributor_node_id) setRelNodeId(result.contributor_node_id);
        return getEntityRelationships({ data: { entityId: id } });
      })
      .then((rels) => {
        setRelationships(rels);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    // Load nodes for contributor dropdown
    listNodes().then(setNodes).catch(() => {});
  }, [id]);

  // Search entities for relationship target
  useEffect(() => {
    if (!entitySearch || entitySearch.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchEntities({ data: { query: entitySearch } })
        .then((results) => setSearchResults(results.filter((e: KnowledgeEntity) => e.id !== id)))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [entitySearch, id]);

  const handleAddRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    setRelError("");
    setRelSuccess(false);
    if (!relTargetId) {
      setRelError("Please select a target entity.");
      return;
    }
    if (!relType) {
      setRelError("Please select a relationship type.");
      return;
    }
    setRelSaving(true);
    try {
      const result = await createRelationship({
        data: {
          source_id: id,
          target_id: relTargetId,
          relationship_type: relType,
          description: relDesc,
          contributor_node_id: relNodeId || null,
        },
      });
      setRelationships((prev) => [result, ...prev]);
      setShowAddRel(false);
      setRelTargetId("");
      setRelDesc("");
      setRelType("relates_to");
      setEntitySearch("");
      setRelSuccess(true);
      setTimeout(() => setRelSuccess(false), 3000);
    } catch (err: any) {
      setRelError(err.message || "Failed to create relationship.");
    } finally {
      setRelSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0a0b14] text-white font-sans flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !entity) {
    return (
      <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
        <div className="pt-24 pb-16 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
              <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
              <span>/</span>
              <span className="text-white/60">Not Found</span>
            </div>
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🧠</div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">Entity Not Found</h1>
              <p className="text-white/50 mb-8">This entity may have been removed, or the ID is incorrect.</p>
              <Link to="/knowledge/entities" className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all duration-200">
                Browse All Entities
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const badgeClass = ENTITY_TYPE_BADGES[entity.entity_type] ?? ENTITY_TYPE_BADGES.other;
  const sourceRels = relationships.filter((r) => r.source_entity_id === id);
  const targetRels = relationships.filter((r) => r.target_entity_id === id);

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Breadcrumb */}
      <div className="pt-24 pb-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
            <span>/</span>
            <Link to="/knowledge/entities" className="hover:text-white/60 transition-colors">Entities</Link>
            <span>/</span>
            <span className="text-white/60 truncate max-w-[200px]">{entity.name}</span>
          </div>

          {/* Entity Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${badgeClass}`}>
                  {entity.entity_type}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs bg-white/5 text-white/50 border border-white/10">
                  {entity.domain}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{entity.name}</h1>
              {entity.description && (
                <p className="text-white/50 max-w-2xl leading-relaxed">{entity.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowAddRel(!showAddRel)}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-sm transition-all duration-200 inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Relationship
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/5">
            {entity.contributor_name && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/30">Contributed by</span>
                <Link
                  to={`/nodes/${entity.contributor_node_id}`}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  {entity.contributor_name}
                </Link>
              </div>
            )}
            <span className="text-sm text-white/20">·</span>
            <span className="text-xs text-white/30">Created {new Date(entity.created_at).toLocaleDateString()}</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-white/30">Updated {new Date(entity.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Add Relationship Form */}
      {showAddRel && (
        <div className="border-b border-white/5 py-6 bg-white/[0.01]">
          <div className="max-w-5xl mx-auto px-6">
            <h3 className="text-lg font-semibold mb-4">Add Relationship</h3>
            <form onSubmit={handleAddRelationship} className="space-y-4">
              {relError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{relError}</div>
              )}
              {relSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">Relationship created successfully!</div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Target Entity</label>
                <input
                  type="text"
                  placeholder="Search for an entity..."
                  value={entitySearch}
                  onChange={(e) => { setEntitySearch(e.target.value); setRelTargetId(""); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 text-sm"
                />
                {searching && (
                  <div className="mt-2 text-sm text-white/30">Searching...</div>
                )}
                {searchResults.length > 0 && !relTargetId && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0b14]">
                    {searchResults.map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => { setRelTargetId(e.id); setEntitySearch(e.name); setSearchResults([]); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.04] text-sm text-white/70 hover:text-white transition-colors"
                      >
                        {e.name} <span className="text-white/30">({e.entity_type})</span>
                      </button>
                    ))}
                  </div>
                )}
                {relTargetId && (
                  <div className="mt-2 text-sm text-emerald-400">✓ Entity selected</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Relationship Type</label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                >
                  {RELATIONSHIP_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0a0b14]">{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Description (optional)</label>
                <input
                  type="text"
                  placeholder="Describe the relationship..."
                  value={relDesc}
                  onChange={(e) => setRelDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Contributing Node (optional)</label>
                <select
                  value={relNodeId}
                  onChange={(e) => setRelNodeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="" className="bg-[#0a0b14]">None</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id} className="bg-[#0a0b14]">{n.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={relSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium text-sm transition-all duration-200"
                >
                  {relSaving ? "Creating..." : "Create Relationship"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddRel(false); setRelError(""); }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Relationships */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold tracking-tight mb-6">
          Relationships <span className="text-white/30 text-sm font-normal">({relationships.length})</span>
        </h2>

        {relationships.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔗</div>
            <p className="text-white/40 text-sm">No relationships yet.</p>
            <button
              onClick={() => setShowAddRel(true)}
              className="text-indigo-400 hover:text-indigo-300 text-sm mt-2"
            >
              Add the first relationship →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Source of */}
            {sourceRels.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                  Source of ({sourceRels.length})
                </h3>
                <div className="space-y-2">
                  {sourceRels.map((rel) => {
                    const relColor = RELATIONSHIP_COLORS[rel.relationship_type] ?? RELATIONSHIP_COLORS.relates_to;
                    return (
                      <div key={rel.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <span className="text-lg shrink-0 mt-0.5">→</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${relColor}`}>
                                {rel.relationship_type}
                              </span>
                              <Link
                                to={`/knowledge/entities/${rel.target_entity_id}`}
                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                {rel.target_name}
                              </Link>
                            </div>
                            {rel.description && (
                              <p className="text-xs text-white/40 mt-1">{rel.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Target of */}
            {targetRels.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
                  Target of ({targetRels.length})
                </h3>
                <div className="space-y-2">
                  {targetRels.map((rel) => {
                    const relColor = RELATIONSHIP_COLORS[rel.relationship_type] ?? RELATIONSHIP_COLORS.relates_to;
                    return (
                      <div key={rel.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all duration-200">
                        <div className="flex items-start gap-3">
                          <span className="text-lg shrink-0 mt-0.5">←</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Link
                                to={`/knowledge/entities/${rel.source_entity_id}`}
                                className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                {rel.source_name}
                              </Link>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${relColor}`}>
                                {rel.relationship_type}
                              </span>
                            </div>
                            {rel.description && (
                              <p className="text-xs text-white/40 mt-1">{rel.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
