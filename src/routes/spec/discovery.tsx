import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/spec/discovery")({ component: DiscoverySpec });

function Breadcrumbs({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
      <Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span>
      <Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><span>/</span>
      <span className="text-white/60">{current}</span>
    </div>
  );
}

function TocSidebar() {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "overview", label: "Overview" },
    { id: "capabilities", label: "Capability Advertisement" },
    { id: "semantic-search", label: "Semantic Search" },
    { id: "protocol", label: "Discovery Protocol" },
    { id: "descriptor", label: "Capability Descriptor Schema" },
    { id: "api", label: "Discovery API Endpoints" },
  ];
  return (
    <>
      <div className="lg:hidden mb-6">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white transition-colors w-full justify-between">
          <span>Table of Contents</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {open && (
          <div className="mt-2 p-4 rounded-lg bg-white/[0.03] border border-white/5">
            <nav className="flex flex-col gap-2">{items.map(i => <a key={i.id} href={`#${i.id}`} onClick={() => setOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors py-1">{i.label}</a>)}</nav>
          </div>
        )}
      </div>
      <div className="hidden lg:block sticky top-24">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">On this page</p>
        <nav className="flex flex-col gap-1.5 border-l border-white/10 pl-4">{items.map(i => <a key={i.id} href={`#${i.id}`} className="text-sm text-white/45 hover:text-indigo-400 transition-colors py-0.5">{i.label}</a>)}</nav>
      </div>
    </>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between"><span className="text-xs text-white/30 font-mono">{lang}</span></div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="text-white/80 font-mono">{code}</code></pre>
    </div>
  );
}

function DiscoverySpec() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10">
          <div className="hidden lg:block w-56 shrink-0"><TocSidebar /></div>
          <div className="flex-1 min-w-0">
            <Breadcrumbs current="Universal Discovery Layer" />
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Universal Discovery Layer</h1>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">Draft</span>
            </div>
            <p className="text-lg text-white/50 mb-12 max-w-3xl">
              NNP Discovery Layer (NNP-DS) — The protocol by which nodes on the network find one
              another. Discovery is capability-based, not name-based: nodes advertise <em>what they can
              do</em>, and the network matches capabilities to needs across domains and ontologies.
            </p>
            <div className="lg:hidden"><TocSidebar /></div>

            <section id="overview" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">1. Overview</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  The Discovery Layer solves a coordination problem that DNS solved for computers: given
                  a need, how do you find the right node to fulfill it? But unlike DNS, which maps names
                  to addresses, Discovery maps <strong>capabilities to nodes</strong>. A query like
                  "find nodes that can perform finite element analysis on steel truss bridges" returns a
                  ranked set of nodes whose advertised capabilities semantically match the query.
                </p>
                <p>
                  Discovery is <strong>permissionless</strong> — any node can advertise capabilities.
                  Discovery is <strong>privacy-aware</strong> — nodes control the visibility of their
                  capabilities (public, domain-scoped, or invitation-only). Discovery is{" "}
                  <strong>semantic</strong> — it uses a shared ontology framework to match concepts
                  across different vocabularies, so a "structural analysis" capability from an
                  aerospace firm can still match a "stress analysis" query from a civil engineering firm.
                </p>
              </div>
            </section>

            <section id="capabilities" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">2. Capability Advertisement</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Every node publishes a Capability Manifest — a structured description of what the node
                  can do. The manifest uses a controlled taxonomy (NNP-CAP) that spans hundreds of
                  capability classes across engineering, medicine, logistics, finance, and other domains.
                  Nodes can also extend the taxonomy with domain-specific capability types.
                </p>
                <p>
                  Each capability entry includes:
                </p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Capability type</strong> — from the NNP-CAP taxonomy or a custom namespace</li>
                  <li><strong>Proficiency level</strong> — novice, competent, expert, or master</li>
                  <li><strong>Capacity</strong> — how many concurrent requests the node can handle</li>
                  <li><strong>Constraints</strong> — domain, jurisdiction, or resource constraints</li>
                  <li><strong>Trust requirements</strong> — minimum trust score a requestor must have</li>
                  <li><strong>Pricing model</strong> — free, per-request, subscription, or negotiated</li>
                </ul>
              </div>
            </section>

            <section id="semantic-search" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">3. Semantic Search & Matchmaking</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Discovery queries are expressed in NNP-QL (Nexus Network Protocol Query Language), a
                  declarative language that supports semantic matching. A query like:
                </p>
                <CodeBlock code={`DISCOVER nodes WITH capability MATCHING "structural analysis of steel bridges"
WHERE proficiency >= "expert"
  AND capacity >= 3
  AND domain IN ["civil-engineering", "structural-engineering"]
  AND jurisdiction INCLUDES "US-CA"
ORDER BY trust_score DESC, response_time ASC
LIMIT 10`} lang="nnp-ql" />
                <p className="mt-5">
                  Behind the scenes, the Discovery Layer uses a vector embedding model trained on
                  engineering and scientific corpora to perform semantic matching. Nodes with
                  capabilities described as "stress analysis," "load calculation," or "FEA simulation"
                  all match the semantic intent of "structural analysis." The match score reflects both
                  semantic similarity and the node's proficiency and trust score.
                </p>
              </div>
            </section>

            <section id="protocol" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">4. Discovery Protocol</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The discovery protocol operates in four phases:</p>
                <div className="space-y-3 mt-4">
                  {[
                    { phase: "Announce", desc: "Nodes periodically publish their Capability Manifest to a Discovery Index — a distributed hash table (DHT) maintained by network validators. Updates are signed and timestamped." },
                    { phase: "Query", desc: "A node submits an NNP-QL query to any Discovery Index node. The query is propagated through the DHT to locate nodes whose manifests match the semantic intent." },
                    { phase: "Match", desc: "Matching nodes are scored and ranked. The Discovery Index returns a signed result set containing node DIDs, capability match scores, trust scores, and service endpoints." },
                    { phase: "Negotiate", desc: "The querying node contacts the top matches directly (via DIDComm) to negotiate terms, exchange trust credentials, and initiate a collaboration workflow." },
                  ].map((item) => (
                    <div key={item.phase} className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 mt-0.5 w-20">{item.phase}</span>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="descriptor" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">5. Capability Descriptor Schema</h2>
              <CodeBlock code={`{
  "@context": "https://nexus.network/ns/discovery/v1",
  "nodeId": "did:nnp:z6MkhaX...8EfV1",
  "updatedAt": "2026-07-26T00:00:00Z",
  "capabilities": [
    {
      "id": "cap-001",
      "type": "nnp-cap:structural-analysis",
      "labels": ["FEA", "steel structures", "bridge design", "load analysis"],
      "proficiency": "expert",
      "maxConcurrency": 5,
      "domains": ["civil-engineering"],
      "jurisdictions": ["US-CA", "US-NY"],
      "minTrustScore": 0.6,
      "pricing": { "model": "per-request", "unit": "USD", "rate": 150 }
    }
  ],
  "signature": "z5n2b...8Kq91"
}`} />
            </section>

            <section id="api" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">6. Discovery API Endpoints</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                The Discovery Layer exposes a RESTful API for capability search and management:
              </p>
              <div className="space-y-6">
                {[
                  { method: "POST", path: "/discovery/search", desc: "Submit an NNP-QL query. Returns a ranked list of matching nodes with capability scores." },
                  { method: "PUT", path: "/discovery/manifest", desc: "Publish or update the calling node's Capability Manifest." },
                  { method: "GET", path: "/discovery/manifest/{nodeId}", desc: "Retrieve the Capability Manifest for a specific node." },
                  { method: "DELETE", path: "/discovery/manifest", desc: "Remove the calling node's Capability Manifest (deregister capabilities)." },
                ].map((ep) => (
                  <div key={ep.path} className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300">{ep.method}</span>
                      <code className="text-sm text-white/70 font-mono">{ep.path}</code>
                    </div>
                    <p className="text-sm text-white/40">{ep.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">© {new Date().getFullYear()} Nexus Network.</span>
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
