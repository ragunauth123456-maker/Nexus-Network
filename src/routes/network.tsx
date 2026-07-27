import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  getNetworkStats,
  getRecentNetworkActivity,
  getNodeTypeDistribution,
  getDomainDistribution,
  type NetworkStats,
  type NetworkActivityEntry,
  type TypeDistribution,
  type DomainDistribution,
} from "~/lib/nodes";

export const Route = createFileRoute("/network")({
  component: NetworkPage,
});

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  node_registered: { label: "Node Registered", color: "text-emerald-400" },
  node_updated: { label: "Node Updated", color: "text-blue-400" },
  capability_added: { label: "Capability Added", color: "text-violet-400" },
  capability_removed: { label: "Capability Removed", color: "text-rose-400" },
  connection_requested: { label: "Connection Requested", color: "text-amber-400" },
  connection_accepted: { label: "Connection Accepted", color: "text-emerald-400" },
  connection_rejected: { label: "Connection Rejected", color: "text-red-400" },
  workflow_started: { label: "Workflow Started", color: "text-cyan-400" },
  workflow_completed: { label: "Workflow Completed", color: "text-emerald-400" },
  entity_created: { label: "Entity Created", color: "text-violet-400" },
  relationship_created: { label: "Relationship Created", color: "text-pink-400" },
  api_key_created: { label: "API Key Created", color: "text-indigo-400" },
  api_key_revoked: { label: "API Key Revoked", color: "text-red-400" },
};

const NODE_TYPE_EMOJI: Record<string, string> = {
  human: "🧑",
  ai_agent: "🤖",
  company: "🏢",
  government: "🏛️",
  hospital: "🏥",
  university: "🎓",
  factory: "🏭",
  vehicle: "🚗",
  robot: "🦾",
  digital_twin: "🪞",
  iot_device: "📡",
  other: "⚡",
};

const NODE_TYPE_LABELS: Record<string, string> = {
  human: "Human",
  ai_agent: "AI Agent",
  company: "Company",
  government: "Government",
  hospital: "Hospital",
  university: "University",
  factory: "Factory",
  vehicle: "Vehicle",
  robot: "Robot",
  digital_twin: "Digital Twin",
  iot_device: "IoT Device",
  other: "Other",
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-white/40 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function NetworkPage() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [activity, setActivity] = useState<NetworkActivityEntry[]>([]);
  const [typeDist, setTypeDist] = useState<TypeDistribution[]>([]);
  const [domainDist, setDomainDist] = useState<DomainDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, a, t, d] = await Promise.all([
          getNetworkStats(),
          getRecentNetworkActivity({ limit: 20 }),
          getNodeTypeDistribution(),
          getDomainDistribution(),
        ]);
        setStats(s);
        setActivity(a);
        setTypeDist(t);
        setDomainDist(d);
      } catch (err) {
        console.error("Failed to load network stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxTypeCount = typeDist.length > 0 ? Math.max(...typeDist.map((t) => t.count), 1) : 1;
  const maxDomainCount = domainDist.length > 0 ? Math.max(...domainDist.map((d) => d.count), 1) : 1;

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link to="/" className="hover:text-white/60 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-white/60">Network</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Network Overview
          </h1>
        </div>
        <p className="text-lg text-white/50 mb-12 max-w-3xl">
          Real-time aggregate statistics across the entire Nexus Network.
          Monitor nodes, connections, workflows, and knowledge contributions.
        </p>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
              >
                <div className="h-4 w-20 bg-white/5 rounded mb-3" />
                <div className="h-8 w-16 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            <StatCard
              label="Active Nodes"
              value={stats?.totalNodes ?? 0}
              icon="🔗"
            />
            <StatCard
              label="Connections"
              value={stats?.totalConnections ?? 0}
              icon="🤝"
            />
            <StatCard
              label="Workflows"
              value={stats?.totalWorkflows ?? 0}
              icon="⚡"
            />
            <StatCard
              label="Knowledge Entities"
              value={stats?.totalEntities ?? 0}
              icon="📚"
            />
            <StatCard
              label="Relationships"
              value={stats?.totalRelationships ?? 0}
              icon="🕸️"
            />
          </div>
        )}

        {/* Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Node Type Distribution */}
          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-semibold mb-5">Node Type Distribution</h2>
            {typeDist.length === 0 ? (
              <p className="text-white/30 text-sm">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {typeDist.map((t) => (
                  <div key={t.node_type} className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">
                      {NODE_TYPE_EMOJI[t.node_type] ?? "⚡"}
                    </span>
                    <span className="text-sm text-white/60 w-24 shrink-0">
                      {NODE_TYPE_LABELS[t.node_type] ?? t.node_type}
                    </span>
                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500/60 rounded-full transition-all"
                        style={{
                          width: `${Math.round((t.count / maxTypeCount) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white/40 w-8 text-right font-mono">
                      {t.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Domain Distribution */}
          <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h2 className="text-lg font-semibold mb-5">Knowledge Domain Distribution</h2>
            {domainDist.length === 0 ? (
              <p className="text-white/30 text-sm">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {domainDist.map((d) => (
                  <div key={d.domain} className="flex items-center gap-3">
                    <span className="text-sm text-white/60 w-28 shrink-0 capitalize">
                      {d.domain}
                    </span>
                    <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500/60 rounded-full transition-all"
                        style={{
                          width: `${Math.round((d.count / maxDomainCount) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white/40 w-8 text-right font-mono">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Recent Activity Feed */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Recent Network Activity
          </h2>
          {activity.length === 0 ? (
            <p className="text-white/30">
              No activity recorded yet. Register nodes and start collaborating to
              see activity here.
            </p>
          ) : (
            <div className="space-y-0 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
              {activity.map((entry, i) => {
                const actionInfo = ACTION_LABELS[entry.action] ?? {
                  label: entry.action,
                  color: "text-white/50",
                };
                return (
                  <div
                    key={entry.id}
                    className={`flex items-start gap-4 px-5 py-3.5 ${
                      i < activity.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <span className="text-lg mt-0.5 shrink-0">
                      {NODE_TYPE_EMOJI[entry.node_type] ?? "⚡"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to="/nodes/$id"
                          params={{ id: entry.node_id }}
                          className="text-sm font-medium text-white/80 hover:text-white transition-colors truncate"
                        >
                          {entry.node_name}
                        </Link>
                        <span className={`text-xs font-semibold ${actionInfo.color}`}>
                          {actionInfo.label}
                        </span>
                      </div>
                      {entry.details && (
                        <p className="text-xs text-white/40 mt-0.5 truncate">
                          {entry.details}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-white/25 whitespace-nowrap shrink-0">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nexus Network.
          </span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/spec" className="hover:text-white/60 transition-colors">
              Spec
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
