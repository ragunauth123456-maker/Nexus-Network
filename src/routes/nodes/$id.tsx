import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getNode, listNodes, requestConnection, getConnectionStatus } from "~/lib/nodes";
import { useState, useEffect } from "react";
import type { NodeRow, ConnectionRow } from "~/lib/nodes";

export const Route = createFileRoute("/nodes/$id")({
  component: NodeProfilePage,
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

function NodeProfilePage() {
  const { id } = Route.useParams();
  const [node, setNode] = useState<NodeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [allNodes, setAllNodes] = useState<NodeRow[]>([]);
  const [selectedRequester, setSelectedRequester] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionRow | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(false);
    getNode({ data: { id } })
      .then((result) => {
        if (!result) {
          setError(true);
          throw notFound();
        }
        setNode(result);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load all nodes for the "Connect as..." dropdown and check connection status
  useEffect(() => {
    listNodes({ data: undefined }).then((nodes) => {
      setAllNodes(nodes.filter((n) => n.id !== id));
      // Default to the most recently registered node as requester
      if (nodes.length > 0 && !selectedRequester) {
        const other = nodes.find((n) => n.id !== id);
        if (other) setSelectedRequester(other.id);
      }
    }).catch(() => {});
  }, [id]);

  // Check connection status when both nodes are selected
  useEffect(() => {
    if (!selectedRequester || !id) return;
    getConnectionStatus({ data: { nodeA: selectedRequester, nodeB: id } })
      .then((result) => setConnectionStatus(result))
      .catch(() => setConnectionStatus(null));
  }, [selectedRequester, id]);

  // Handle connection request
  const handleRequestConnection = async () => {
    if (!selectedRequester) return;
    setRequesting(true);
    setRequestError("");
    try {
      const result = await requestConnection({ data: { requesterId: selectedRequester, targetId: id } });
      setConnectionStatus(result);
    } catch (e: unknown) {
      setRequestError(e instanceof Error ? e.message : "Failed to request connection");
    } finally {
      setRequesting(false);
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
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                This node may have been removed, or the ID is incorrect.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/nodes"
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/10 font-medium"
                >
                  Browse All Nodes
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-all duration-200"
                >
                  Register a Node
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = NODE_TYPE_MAP[node.node_type] ?? { emoji: "⚡", label: node.node_type };
  const createdDate = new Date(node.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Header */}
      <div className="pt-24 pb-12 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/nodes" className="hover:text-white/60 transition-colors">Nodes</Link>
            <span>/</span>
            <span className="text-white/60 truncate">{node.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="text-5xl shrink-0">{typeInfo.emoji}</div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{node.name}</h1>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase ${
                      node.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : node.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
                <p className="text-white/50 mb-3">{typeInfo.label} Node</p>
                {node.description && (
                  <p className="text-white/60 leading-relaxed max-w-2xl">{node.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <Link
                  to={`/nodes/${node.id}/dashboard`}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition-all"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  to="/nodes"
                  className="shrink-0 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Discovery
                </Link>
              </div>
              {/* Connection Request */}
              <div className="flex items-center gap-2">
                {allNodes.length > 0 && !connectionStatus && (
                  <>
                    <select
                      value={selectedRequester}
                      onChange={(e) => setSelectedRequester(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 focus:outline-none focus:border-indigo-500/40 transition-colors"
                    >
                      <option value="">Connect as...</option>
                      {allNodes.map((n) => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleRequestConnection}
                      disabled={!selectedRequester || requesting}
                      className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        !selectedRequester || requesting
                          ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                          : "bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400"
                      }`}
                    >
                      {requesting ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Requesting...
                        </span>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <path d="M20 8v6M23 11h-6" />
                          </svg>
                          Request Connection
                        </>
                      )}
                    </button>
                  </>
                )}
                {connectionStatus && connectionStatus.status === "pending" && (
                  <span className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Connection Pending
                  </span>
                )}
                {connectionStatus && connectionStatus.status === "accepted" && (
                  <span className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Connected ✓
                  </span>
                )}
                {connectionStatus && connectionStatus.status === "rejected" && (
                  <span className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    Connection Rejected
                  </span>
                )}
              </div>
              {requestError && (
                <p className="text-xs text-red-400">{requestError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column: metadata */}
          <div className="md:col-span-1 space-y-6">
            {/* Trust Level Card */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Trust Level
              </p>
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < node.trust_level ? "text-indigo-400" : "text-white/15"}`}
                  >
                    ●
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/50">
                {node.trust_level === 1 && "New — Recently joined the network"}
                {node.trust_level === 2 && "Developing — Building reputation"}
                {node.trust_level === 3 && "Established — Proven track record"}
                {node.trust_level === 4 && "Trusted — Verified by multiple peers"}
                {node.trust_level === 5 && "Highly Trusted — Network cornerstone"}
              </p>
            </div>

            {/* Info Card */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                Details
              </p>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-white/30">Node ID</span>
                  <p className="text-sm font-mono text-white/50 break-all">{node.id}</p>
                </div>
                <div>
                  <span className="text-xs text-white/30">Type</span>
                  <p className="text-sm text-white/60">{typeInfo.emoji} {typeInfo.label}</p>
                </div>
                <div>
                  <span className="text-xs text-white/30">Registered</span>
                  <p className="text-sm text-white/60">{createdDate}</p>
                </div>
                {node.public_key && (
                  <div>
                    <span className="text-xs text-white/30">DID Public Key</span>
                    <p className="text-sm font-mono text-white/50 break-all">{node.public_key}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: capabilities */}
          <div className="md:col-span-2 space-y-6">
            {/* Capabilities */}
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-5">
                Capabilities
                <span className="text-white/30 text-sm font-normal ml-2">
                  ({node.capabilities.length})
                </span>
              </h2>
              {node.capabilities.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                  <p className="text-white/40 text-sm">No capabilities registered yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {node.capabilities.map((cap, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-white/80">{cap.name}</h3>
                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {cap.category}
                        </span>
                      </div>
                      {cap.description && (
                        <p className="text-xs text-white/40 leading-relaxed">{cap.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collaboration */}
            {connectionStatus && connectionStatus.status === "accepted" && (
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider mb-2">
                  🟢 Active Connection
                </p>
                <p className="text-xs text-white/40">
                  These nodes are connected and can run collaborative workflows. Visit the dashboard to start a workflow.
                </p>
                <Link
                  to={`/nodes/${node.id}/dashboard`}
                  className="mt-3 inline-block text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
            {(!connectionStatus || connectionStatus.status !== "accepted") && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 border-dashed">
                <p className="text-xs text-white/25">
                  Connections, collaboration history, trust attestations, and knowledge graph contributions
                  will appear here once nodes connect.
                </p>
              </div>
            )}
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
          </div>
        </div>
      </footer>
    </div>
  );
}
