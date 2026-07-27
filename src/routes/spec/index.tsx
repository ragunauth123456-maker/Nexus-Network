import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/spec/")({
  component: SpecOverview,
});

const layers = [
  {
    number: 1,
    name: "Universal Identity Layer",
    slug: "/spec/identity",
    description:
      "Cryptographic identities for every intelligence on the network. Every node — human, AI, enterprise, robot — gets a single, verifiable identity rooted in public-key cryptography and W3C Decentralized Identifiers (DIDs).",
    color: "from-indigo-500 to-blue-500",
  },
  {
    number: 2,
    name: "Universal Trust Layer",
    slug: "/spec/trust",
    description:
      "Establishes trust between nodes without centralized authorities. Combines zero-knowledge proofs, verifiable credentials, and reputation graphs to let nodes prove assertions without exposing underlying secrets.",
    color: "from-indigo-500 to-emerald-500",
  },
  {
    number: 3,
    name: "Universal Discovery Layer",
    slug: "/spec/discovery",
    description:
      "Nodes find each other by capability, not by name. A semantic discovery protocol enables matchmaking between what a node can do and what another node needs — across entirely different domains and ontologies.",
    color: "from-indigo-500 to-amber-500",
  },
  {
    number: 4,
    name: "Universal Knowledge Layer",
    slug: "/spec/knowledge",
    description:
      "A shared, queryable knowledge graph. Every node contributes structured knowledge and consumes what others have published. Entities, relationships, and ontologies form the semantic backbone of the network.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    number: 5,
    name: "Universal Reasoning Layer",
    slug: "/spec/reasoning",
    description:
      "Collective reasoning composes expertise from many nodes into coordinated plans. A reasoning orchestrator decomposes problems, matches capabilities, and synthesizes multi-agent outputs into coherent results.",
    color: "from-indigo-500 to-rose-500",
  },
  {
    number: 6,
    name: "Universal Collaboration Layer",
    slug: "/spec/collaboration",
    description:
      "Secure, auditable workflows execute across organizational boundaries. Work is discovered, negotiated, contracted, executed, and verified — all on the protocol. State machines govern every cross-node interaction.",
    color: "from-indigo-500 to-cyan-500",
  },
];

function SpecOverview() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      {/* Page header */}
      <div className="pt-24 pb-16 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/60">Spec</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Nexus Network Protocol
                </h1>
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  Draft v0.1
                </span>
              </div>
              <p className="text-lg text-white/50 max-w-2xl">
                The Nexus Network Protocol (NNP) defines the open standard for global intelligence
                infrastructure. It specifies how intelligent nodes — human, machine, or organizational —
                establish identity, build trust, discover one another, share knowledge, compose reasoning,
                and execute collaboration across every boundary.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture diagram */}
      <div className="border-b border-white/5 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Protocol Stack</h2>
          <div className="relative max-w-2xl mx-auto">
            {/* Stack diagram */}
            <div className="flex flex-col gap-0">
              {layers.map((layer, i) => (
                <Link
                  key={layer.number}
                  to={layer.slug}
                  className={`group relative flex items-center gap-4 p-5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all duration-300 ${
                    i < layers.length - 1 ? "mb-3" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${layer.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {layer.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                      {layer.name}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5 line-clamp-1">{layer.description}</div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors shrink-0"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Connecting lines */}
            <div className="absolute left-7 top-12 bottom-0 w-px bg-gradient-to-b from-indigo-500/20 via-indigo-500/10 to-transparent pointer-events-none hidden" />
          </div>
        </div>
      </div>

      {/* Layer detail cards */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold tracking-tight mb-3">Layer Specifications</h2>
          <p className="text-white/50 mb-10 max-w-2xl">
            Each layer is defined by an open specification. Click through to read the full technical
            reference for any layer in the stack.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {layers.map((layer) => (
              <Link
                key={layer.number}
                to={layer.slug}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:bg-white/[0.06]"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center text-white font-bold text-lg mb-4`}
                >
                  {layer.number}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white/90 group-hover:text-white transition-colors">
                  {layer.name}
                </h3>
                <p className="text-white/45 text-sm leading-relaxed">{layer.description}</p>
                <div className="mt-4 flex items-center gap-1 text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Read specification
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
