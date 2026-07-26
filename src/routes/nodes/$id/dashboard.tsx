import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  getNode, updateNode, addCapability, removeCapability, getNodeActivity,
  getNodeConnections, getPendingRequests, acceptConnection, rejectConnection,
  startWorkflow, getNodeWorkflows, listNodes,
  authenticateWithKey, listApiKeys, createApiKey, revokeApiKey,
  type ApiKeyRow,
} from "~/lib/nodes";
import { getNodeKnowledgeEntities, getNodeKnowledgeRelationships } from "~/lib/knowledge";
import type { KnowledgeEntity, KnowledgeRelationship } from "~/lib/knowledge";
import { useState, useEffect, useCallback } from "react";
import type { NodeRow, Capability, ActivityLogEntry, ConnectionRow, WorkflowRow } from "~/lib/nodes";

export const Route = createFileRoute("/nodes/$id/dashboard")({
  component: NodeDashboardPage,
});

// ──────────────────────────────────────────
// Constants (shared with register page)
// ──────────────────────────────────────────

const NODE_TYPES: { value: string; emoji: string; label: string }[] = [
  { value: "human", emoji: "🧑", label: "Human" },
  { value: "ai_agent", emoji: "🤖", label: "AI Agent" },
  { value: "company", emoji: "🏢", label: "Company" },
  { value: "government", emoji: "🏛️", label: "Government" },
  { value: "hospital", emoji: "🏥", label: "Hospital" },
  { value: "university", emoji: "🎓", label: "University" },
  { value: "factory", emoji: "🏭", label: "Factory" },
  { value: "vehicle", emoji: "🚗", label: "Vehicle" },
  { value: "robot", emoji: "🦾", label: "Robot" },
  { value: "digital_twin", emoji: "🪞", label: "Digital Twin" },
  { value: "iot_device", emoji: "📡", label: "IoT Device" },
  { value: "other", emoji: "⚡", label: "Other" },
];

const CAP_CATEGORIES = [
  "reasoning", "knowledge", "automation", "sensing",
  "computation", "communication", "other",
];

const ACTION_LABELS: Record<string, { emoji: string; label: string }> = {
  node_registered: { emoji: "🆕", label: "Node Registered" },
  node_updated: { emoji: "✏️", label: "Profile Updated" },
  capability_added: { emoji: "➕", label: "Capability Added" },
  capability_removed: { emoji: "➖", label: "Capability Removed" },
  connection_requested: { emoji: "📨", label: "Connection Requested" },
  connection_accepted: { emoji: "🤝", label: "Connection Accepted" },
  connection_rejected: { emoji: "❌", label: "Connection Rejected" },
  workflow_started: { emoji: "🚀", label: "Workflow Started" },
  workflow_completed: { emoji: "✅", label: "Workflow Completed" },
};

function getNodeTypeInfo(nodeType: string) {
  return NODE_TYPES.find((t) => t.value === nodeType) ?? { emoji: "⚡", label: nodeType };
}

// ──────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────

function OverviewPanel({ node }: { node: NodeRow }) {
  const typeInfo = getNodeTypeInfo(node.node_type);
  const createdDate = new Date(node.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const updatedDate = new Date(node.updated_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
      <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        Overview
      </h2>

      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl">{typeInfo.emoji}</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-xl font-semibold text-white/90">{node.name}</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {typeInfo.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
              node.status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              {node.status}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={`text-sm ${level <= node.trust_level ? "text-indigo-400" : "text-white/15"}`}
              >
                ●
              </span>
            ))}
            <span className="text-xs text-white/40 ml-1">
              Trust Level {node.trust_level}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-2xl font-bold text-white/80">{node.capabilities.length}</p>
          <p className="text-xs text-white/40">Capabilities</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-2xl font-bold text-white/30">0</p>
          <p className="text-xs text-white/40">Connections</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-2xl font-bold text-white/80">—</p>
          <p className="text-xs text-white/40">Activity</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-sm font-medium text-white/60">{createdDate}</p>
          <p className="text-xs text-white/40">Registered</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-white/30">Last updated</span>
          <span className="text-white/50">{updatedDate}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-white/30">Node ID</span>
          <span className="text-white/50 font-mono">{node.id.slice(0, 8)}…</span>
        </div>
      </div>
    </div>
  );
}

function EditProfileForm({
  node,
  onSaved,
}: {
  node: NodeRow;
  onSaved: (updated: NodeRow) => void;
}) {
  const [name, setName] = useState(node.name);
  const [nodeType, setNodeType] = useState(node.node_type);
  const [description, setDescription] = useState(node.description ?? "");
  const [trustLevel, setTrustLevel] = useState(node.trust_level);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const result = await updateNode({
        data: {
          id: node.id,
          name,
          node_type: nodeType,
          description,
          trust_level: trustLevel,
        },
      });
      onSaved(result);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
      <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Profile
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            Profile saved successfully.
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Node Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Node Type */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Node Type</label>
          <select
            value={nodeType}
            onChange={(e) => setNodeType(e.target.value)}
            disabled={saving}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
              backgroundSize: "0.875rem",
            }}
          >
            {NODE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={saving}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 resize-y"
          />
          <p className="text-[10px] text-white/30 mt-1">{description.length}/2000</p>
        </div>

        {/* Trust Level */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2">Trust Level</label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setTrustLevel(level)}
                disabled={saving}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border ${
                  trustLevel === level
                    ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-300"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:border-white/20"
                } disabled:opacity-50`}
              >
                <div className="flex justify-center gap-0.5 mb-0.5">
                  {Array.from({ length: level }).map((_, i) => (
                    <span key={i} className="text-xs">●</span>
                  ))}
                  {Array.from({ length: 5 - level }).map((_, i) => (
                    <span key={i} className="text-xs text-white/15">●</span>
                  ))}
                </div>
                <span>
                  {["New","Developing","Established","Trusted","Highly Trusted"][level - 1]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim() || !nodeType}
          className="w-full py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/30 text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}

function CapabilityManager({
  node,
  onUpdated,
}: {
  node: NodeRow;
  onUpdated: (updated: NodeRow) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("reasoning");
  const [newDescription, setNewDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    setAdding(true);
    try {
      const result = await addCapability({
        data: {
          nodeId: node.id,
          capability: { name: newName.trim(), category: newCategory, description: newDescription.trim() },
        },
      });
      onUpdated(result);
      setNewName("");
      setNewDescription("");
      setNewCategory("reasoning");
    } catch (err: any) {
      setError(err.message || "Failed to add capability.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (index: number) => {
    setError("");
    setRemoving(index);
    try {
      const result = await removeCapability({ data: { nodeId: node.id, index } });
      onUpdated(result);
    } catch (err: any) {
      setError(err.message || "Failed to remove capability.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
      <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Capabilities
        <span className="text-white/30 text-sm font-normal">({node.capabilities.length})</span>
      </h2>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Existing capabilities */}
      {node.capabilities.length === 0 ? (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 border-dashed text-center mb-4">
          <p className="text-white/40 text-sm">No capabilities yet. Add one below.</p>
        </div>
      ) : (
        <div className="space-y-2 mb-5">
          {node.capabilities.map((cap, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white/70 truncate">{cap.name}</span>
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {cap.category}
                  </span>
                </div>
                {cap.description && (
                  <p className="text-xs text-white/40 truncate">{cap.description}</p>
                )}
              </div>
              <button
                onClick={() => handleRemove(i)}
                disabled={removing !== null}
                className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                {removing === i ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add capability form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
        <p className="text-xs font-medium text-white/40">Add Capability</p>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Capability name"
          disabled={adding}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50"
        />
        <div className="flex gap-2">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={adding}
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "0.75rem",
            }}
          >
            {CAP_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Short description (optional)"
          disabled={adding}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="w-full py-2 rounded-lg bg-indigo-500/80 hover:bg-indigo-500 disabled:bg-indigo-500/20 text-white text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          {adding ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding…
            </>
          ) : (
            "+ Add Capability"
          )}
        </button>
      </form>
    </div>
  );
}

function ActivityFeed({ nodeId }: { nodeId: string }) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNodeActivity({ data: { nodeId } })
      .then(setActivities)
      .finally(() => setLoading(false));
  }, [nodeId]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Activity Log
        </h2>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
      <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Activity Log
        <span className="text-white/30 text-sm font-normal">({activities.length})</span>
      </h2>

      {activities.length === 0 ? (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 border-dashed text-center">
          <p className="text-white/40 text-sm">No activity yet.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />
          <div className="space-y-4">
            {activities.map((act) => {
              const actionInfo = ACTION_LABELS[act.action] ?? { emoji: "📌", label: act.action };
              const time = new Date(act.created_at).toLocaleString("en-US", {
                month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
              });
              return (
                <div key={act.id} className="flex gap-3">
                  <div className="relative z-10 w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
                      <span className="text-xs">{actionInfo.emoji}</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/70">{actionInfo.label}</p>
                    {act.details && (
                      <p className="text-xs text-white/40">{act.details}</p>
                    )}
                    <p className="text-[10px] text-white/25 mt-0.5">{time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionsPanel({ nodeId }: { nodeId: string }) {
  const [connections, setConnections] = useState<ConnectionRow[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ConnectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workflowModal, setWorkflowModal] = useState<{ conn: ConnectionRow } | null>(null);
  const [workflowQuery, setWorkflowQuery] = useState("");
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [conns, pending] = await Promise.all([
        getNodeConnections({ data: { nodeId } }),
        getPendingRequests({ data: { nodeId } }),
      ]);
      setConnections(conns);
      setPendingRequests(pending);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAccept = async (connectionId: string) => {
    try {
      await acceptConnection({ data: { connectionId } });
      loadData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to accept");
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await rejectConnection({ data: { connectionId } });
      loadData();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reject");
    }
  };

  const handleStartWorkflow = async () => {
    if (!workflowModal || !workflowQuery.trim()) return;
    setSending(true);
    try {
      const conn = workflowModal.conn;
      const otherId = conn.requester_id === nodeId ? conn.target_id : conn.requester_id;
      await startWorkflow({
        data: {
          connectionId: conn.id,
          requesterId: nodeId,
          providerId: otherId,
          query: workflowQuery.trim(),
        },
      });
      setWorkflowModal(null);
      setWorkflowQuery("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start workflow");
    } finally {
      setSending(false);
    }
  };

  const acceptedConnections = connections.filter((c) => c.status === "accepted");

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center py-12">
        <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Incoming Requests */}
      {pendingRequests.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
          <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-amber-400">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            Incoming Requests
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((req) => {
              const otherName = req.requester_name || "Unknown";
              const otherType = req.requester_type || "other";
              const typeInfo = getNodeTypeInfo(otherType);
              return (
                <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{typeInfo.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-white/80">{otherName}</p>
                      <p className="text-xs text-white/40">{typeInfo.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium border border-emerald-500/20 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium border border-red-500/20 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Connections */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
        <h2 className="text-lg font-bold tracking-tight mb-5 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-indigo-400">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          Active Connections
          <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{acceptedConnections.length}</span>
        </h2>
        {acceptedConnections.length === 0 ? (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 border-dashed text-center">
            <div className="text-3xl mb-3 text-white/20">🔗</div>
            <p className="text-white/40 text-sm mb-3">No active connections yet</p>
            <Link
              to="/nodes"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Discover Nodes
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {acceptedConnections.map((conn) => {
              const isRequester = conn.requester_id === nodeId;
              const otherName = isRequester ? (conn.target_name || "Unknown") : (conn.requester_name || "Unknown");
              const otherType = isRequester ? (conn.target_type || "other") : (conn.requester_type || "other");
              const otherId = isRequester ? conn.target_id : conn.requester_id;
              const typeInfo = getNodeTypeInfo(otherType);
              const connDate = new Date(conn.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              });
              return (
                <div key={conn.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{typeInfo.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white/80">{otherName}</p>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">Connected {connDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWorkflowModal({ conn })}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-medium border border-indigo-500/20 transition-all"
                    >
                      Start Workflow
                    </button>
                    <Link
                      to={`/nodes/${otherId}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 text-xs font-medium border border-white/10 transition-all"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workflow Modal */}
      {workflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setWorkflowModal(null)}>
          <div className="bg-[#12141f] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">
              Start Workflow
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Ask {(() => {
                const conn = workflowModal.conn;
                const isReq = conn.requester_id === nodeId;
                return isReq ? (conn.target_name || "connected node") : (conn.requester_name || "connected node");
              })()} a question:
            </p>
            <textarea
              value={workflowQuery}
              onChange={(e) => setWorkflowQuery(e.target.value)}
              placeholder="e.g., What insights can you share about recent market trends?"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 resize-none h-24 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => { setWorkflowModal(null); setWorkflowQuery(""); }}
                className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartWorkflow}
                disabled={!workflowQuery.trim() || sending}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !workflowQuery.trim() || sending
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-indigo-500 hover:bg-indigo-400 text-white"
                }`}
              >
                {sending ? "Sending..." : "Submit Query"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KnowledgePanel({ nodeId }: { nodeId: string }) {
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [relationships, setRelationships] = useState<KnowledgeRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getNodeKnowledgeEntities({ data: { nodeId } }),
      getNodeKnowledgeRelationships({ data: { nodeId } }),
    ])
      .then(([ents, rels]) => {
        setEntities(ents);
        setRelationships(rels);
      })
      .finally(() => setLoading(false));
  }, [nodeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-6 w-6 text-indigo-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const badgeColor = (type: string) => {
    const colors: Record<string, string> = {
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
    };
    return colors[type] ?? "bg-white/5 text-white/50 border-white/10";
  };

  const relColors: Record<string, string> = {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold tracking-tight">Knowledge Contributions</h2>
        <Link
          to="/knowledge/contribute"
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-all duration-200 inline-flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Contribute
        </Link>
      </div>

      {/* Entities */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
          Entities ({entities.length})
        </h3>
        {entities.length === 0 ? (
          <p className="text-white/30 text-sm">No entities contributed yet.</p>
        ) : (
          <div className="space-y-2">
            {entities.map((entity) => (
              <Link
                key={entity.id}
                to={`/knowledge/entities/${entity.id}`}
                className="block p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-white/80 truncate">{entity.name}</h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor(entity.entity_type)}`}>
                        {entity.entity_type}
                      </span>
                      <span className="text-[10px] text-white/30">{entity.domain}</span>
                    </div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white/20 shrink-0 mt-1">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Relationships */}
      <div>
        <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">
          Relationships ({relationships.length})
        </h3>
        {relationships.length === 0 ? (
          <p className="text-white/30 text-sm">No relationships contributed yet.</p>
        ) : (
          <div className="space-y-2">
            {relationships.map((rel) => {
              const rc = relColors[rel.relationship_type] ?? relColors.relates_to;
              return (
                <div key={rel.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-indigo-400 font-medium truncate max-w-[140px]">{rel.source_name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${rc}`}>
                      {rel.relationship_type}
                    </span>
                    <span className="text-indigo-400 font-medium truncate max-w-[140px]">{rel.target_name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


// ──────────────────────────────────────────
// Main Dashboard Page
// ──────────────────────────────────────────

function NodeDashboardPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [node, setNode] = useState<NodeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "capabilities" | "activity" | "connections" | "workflows" | "knowledge">("overview");

  const loadNode = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await getNode({ data: { id } });
      if (!result) { setError(true); return; }
      setNode(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadNode(); }, [loadNode]);

  const handleNodeUpdated = (updated: NodeRow) => {
    setNode(updated);
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

  if (error || !node) {
    return (
      <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
        <div className="pt-24 pb-16 border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
              <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/nodes" className="hover:text-white/60 transition-colors">Nodes</Link>
              <span>/</span>
              <span className="text-white/60">Not Found</span>
            </div>
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h1 className="text-3xl font-bold tracking-tight mb-3">Node Not Found</h1>
              <p className="text-white/50 mb-8">This node may have been removed, or the ID is incorrect.</p>
              <Link to="/nodes" className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all duration-200">
                Browse All Nodes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = getNodeTypeInfo(node.node_type);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "profile", label: "Edit Profile" },
    { key: "capabilities", label: "Capabilities" },
    { key: "activity", label: "Activity" },
    { key: "connections", label: "Connections" },
    { key: "workflows", label: "Workflows" },
    { key: "knowledge", label: "Knowledge" },
  ] as const;

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Header */}
      <div className="pt-24 pb-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/nodes" className="hover:text-white/60 transition-colors">Nodes</Link>
            <span>/</span>
            <Link to={`/nodes/${node.id}`} className="hover:text-white/60 transition-colors truncate max-w-[200px]">{node.name}</Link>
            <span>/</span>
            <span className="text-white/60">Dashboard</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{typeInfo.emoji}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{node.name}</h1>
                <p className="text-sm text-white/40">Dashboard</p>
              </div>
            </div>
            <Link
              to={`/nodes/${node.id}`}
              className="shrink-0 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-white/5 sticky top-[73px] z-30 bg-[#0a0b14]/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-indigo-400 text-white"
                    : "border-transparent text-white/40 hover:text-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === "overview" && <OverviewPanel node={node} />}
        {activeTab === "profile" && <EditProfileForm node={node} onSaved={handleNodeUpdated} />}
        {activeTab === "capabilities" && <CapabilityManager node={node} onUpdated={handleNodeUpdated} />}
        {activeTab === "activity" && <ActivityFeed nodeId={node.id} />}
        {activeTab === "connections" && <ConnectionsPanel nodeId={node.id} />}
        {activeTab === "workflows" && <WorkflowsPanel nodeId={node.id} />}
        {activeTab === "knowledge" && <KnowledgePanel nodeId={node.id} />}
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
          </div>
        </div>
      </footer>
    </div>
  );
}
