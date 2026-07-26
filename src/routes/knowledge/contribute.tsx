import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createEntity, ENTITY_TYPES, DOMAINS, RELATIONSHIP_TYPES, searchEntities } from "~/lib/knowledge";
import type { KnowledgeEntity } from "~/lib/knowledge";
import { listNodes } from "~/lib/nodes";
import type { NodeRow } from "~/lib/nodes";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/knowledge/contribute")({
  component: ContributeKnowledgePage,
});

function ContributeKnowledgePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState("concept");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("general");
  const [contributorNodeId, setContributorNodeId] = useState("");
  const [nodes, setNodes] = useState<NodeRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Optional initial relationship
  const [addInitialRel, setAddInitialRel] = useState(false);
  const [initialRelTargetId, setInitialRelTargetId] = useState("");
  const [initialRelType, setInitialRelType] = useState("relates_to");
  const [initialRelDesc, setInitialRelDesc] = useState("");
  const [relSearch, setRelSearch] = useState("");
  const [relResults, setRelResults] = useState<KnowledgeEntity[]>([]);
  const [relSearching, setRelSearching] = useState(false);

  useEffect(() => {
    listNodes().then(setNodes).catch(() => {});
  }, []);

  useEffect(() => {
    if (!relSearch || relSearch.length < 2) { setRelResults([]); return; }
    setRelSearching(true);
    const timer = setTimeout(() => {
      searchEntities({ data: { query: relSearch } })
        .then((results) => setRelResults(results))
        .finally(() => setRelSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [relSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!name.trim()) {
      setError("Entity name is required.");
      return;
    }
    setSaving(true);
    try {
      const entity = await createEntity({
        data: {
          name: name.trim(),
          entity_type: entityType,
          description: description.trim(),
          domain,
          contributor_node_id: contributorNodeId || null,
        },
      });

      // Create initial relationship if requested
      if (addInitialRel && initialRelTargetId) {
        try {
          const { createRelationship } = await import("~/lib/knowledge");
          await createRelationship({
            data: {
              source_id: entity.id,
              target_id: initialRelTargetId,
              relationship_type: initialRelType,
              description: initialRelDesc.trim(),
              contributor_node_id: contributorNodeId || null,
            },
          });
        } catch (_) {
          // Don't fail the whole submission if relationship creation fails
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate({ to: `/knowledge/entities/${entity.id}` });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create entity.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Header */}
      <div className="pt-24 pb-8 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
            <span>/</span>
            <span className="text-white/60">Contribute</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Contribute Knowledge</h1>
          <p className="text-white/40 text-sm">
            Add a new entity to the global knowledge graph. Your contribution becomes
            part of the collective intelligence accessible to every node on Nexus Network.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {success ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold mb-3">Entity Created!</h2>
            <p className="text-white/50 mb-6">
              Your contributed entity is now part of the global knowledge graph.
            </p>
            <p className="text-white/30 text-sm">Redirecting to entity page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">
                Entity Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Project Apollo, HIPAA Compliance, GPT-4..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all"
                required
              />
            </div>

            {/* Entity Type */}
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">
                Entity Type <span className="text-red-400">*</span>
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#0a0b14]">{t}</option>
                ))}
              </select>
              <p className="text-xs text-white/20 mt-1">What kind of knowledge is this?</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">Description</label>
              <textarea
                placeholder="Describe this entity — what is it, why does it matter..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-sm transition-all resize-y"
              />
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d} className="bg-[#0a0b14]">{d}</option>
                ))}
              </select>
              <p className="text-xs text-white/20 mt-1">Which domain does this entity belong to?</p>
            </div>

            {/* Contributor Node */}
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-2">Contributing Node (optional)</label>
              <select
                value={contributorNodeId}
                onChange={(e) => setContributorNodeId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
              >
                <option value="" className="bg-[#0a0b14]">None (anonymous)</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id} className="bg-[#0a0b14]">{n.name} ({n.node_type})</option>
                ))}
              </select>
              <p className="text-xs text-white/20 mt-1">Which node is contributing this knowledge?</p>
            </div>

            {/* Initial Relationship */}
            <div className="pt-4 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addInitialRel}
                  onChange={(e) => setAddInitialRel(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500"
                />
                <span className="text-sm font-semibold text-white/60">Also add an initial relationship</span>
              </label>

              {addInitialRel && (
                <div className="mt-4 space-y-4 pl-7">
                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-2">Target Entity</label>
                    <input
                      type="text"
                      placeholder="Search for an existing entity..."
                      value={relSearch}
                      onChange={(e) => { setRelSearch(e.target.value); setInitialRelTargetId(""); }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 text-sm"
                    />
                    {relSearching && <div className="mt-2 text-xs text-white/30">Searching...</div>}
                    {relResults.length > 0 && !initialRelTargetId && (
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0b14]">
                        {relResults.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => { setInitialRelTargetId(e.id); setRelSearch(e.name); setRelResults([]); }}
                            className="w-full text-left px-4 py-2 hover:bg-white/[0.04] text-sm text-white/70 hover:text-white transition-colors"
                          >
                            {e.name} <span className="text-white/30">({e.entity_type})</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {initialRelTargetId && <div className="mt-2 text-xs text-emerald-400">✓ Entity selected</div>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-2">Relationship Type</label>
                    <select
                      value={initialRelType}
                      onChange={(e) => setInitialRelType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                    >
                      {RELATIONSHIP_TYPES.map((t: string) => (
                        <option key={t} value={t} className="bg-[#0a0b14]">{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/40 mb-2">Description (optional)</label>
                    <input
                      type="text"
                      placeholder="Describe how these entities relate..."
                      value={initialRelDesc}
                      onChange={(e) => setInitialRelDesc(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-semibold text-base transition-all duration-200 shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {saving ? "Creating..." : "Contribute to Knowledge Graph"}
              </button>
              <Link
                to="/knowledge"
                className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-base transition-all border border-white/10"
              >
                Cancel
              </Link>
            </div>
          </form>
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
            <Link to="/knowledge" className="hover:text-white/60 transition-colors">Knowledge</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
