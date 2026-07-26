import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/spec/knowledge")({ component: KnowledgeSpec });

function Breadcrumbs({ current }: { current: string }) {
  return <div className="flex items-center gap-2 text-sm text-white/40 mb-6"><Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span><Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><span>/</span><span className="text-white/60">{current}</span></div>;
}

function TocSidebar() {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "overview", label: "Overview" },
    { id: "knowledge-graph", label: "The Knowledge Graph" },
    { id: "entities", label: "Entities & Relationships" },
    { id: "ontologies", label: "Ontologies & Namespaces" },
    { id: "contribution", label: "Contribution Model" },
    { id: "query", label: "Query Model" },
    { id: "example", label: "Example Entry" },
  ];
  return (
    <>
      <div className="lg:hidden mb-6">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white transition-colors w-full justify-between"><span>Table of Contents</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${open?"rotate-180":""}`}><path d="M6 9l6 6 6-6"/></svg></button>
        {open && <div className="mt-2 p-4 rounded-lg bg-white/[0.03] border border-white/5"><nav className="flex flex-col gap-2">{items.map(i=><a key={i.id} href={`#${i.id}`} onClick={()=>setOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors py-1">{i.label}</a>)}</nav></div>}
      </div>
      <div className="hidden lg:block sticky top-24"><p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">On this page</p><nav className="flex flex-col gap-1.5 border-l border-white/10 pl-4">{items.map(i=><a key={i.id} href={`#${i.id}`} className="text-sm text-white/45 hover:text-indigo-400 transition-colors py-0.5">{i.label}</a>)}</nav></div>
    </>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden"><div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between"><span className="text-xs text-white/30 font-mono">{lang}</span></div><pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="text-white/80 font-mono">{code}</code></pre></div>;
}

function KnowledgeSpec() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10">
          <div className="hidden lg:block w-56 shrink-0"><TocSidebar /></div>
          <div className="flex-1 min-w-0">
            <Breadcrumbs current="Universal Knowledge Layer" />
            <div className="flex items-center gap-3 mb-6"><h1 className="text-4xl md:text-5xl font-bold tracking-tight">Universal Knowledge Layer</h1><span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">Draft</span></div>
            <p className="text-lg text-white/50 mb-12 max-w-3xl">NNP Knowledge Layer (NNP-KN) — The shared, queryable knowledge graph that forms the semantic backbone of Nexus Network. Every node contributes structured knowledge and consumes what the collective has published.</p>
            <div className="lg:hidden"><TocSidebar /></div>

            <section id="overview" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">1. Overview</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Intelligence without knowledge is just computation. The Knowledge Layer ensures that every node on the network operates with access to a shared, evolving body of structured knowledge. Think of it as a global Wikipedia crossed with a knowledge graph — but one that is machine-readable, cryptographically verifiable, and continuously updated by the network's own activity.</p>
                <p>Unlike traditional knowledge bases that are curated by a single organization, NNP-KN is <strong>federated</strong>. Each node contributes a portion of the graph — the knowledge that it owns, produces, or curates. The network provides the protocols for linking these contributions into a single, coherent, queryable graph. No node hosts the entire graph; the graph <em>is</em> the network.</p>
              </div>
            </section>

            <section id="knowledge-graph" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">2. The Knowledge Graph</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The NNP Knowledge Graph is a distributed, labeled property graph. It consists of:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Nodes</strong> — representing entities: physical objects, concepts, people, organizations, events, datasets, models, designs.</li>
                  <li><strong>Edges</strong> — representing directed, labeled relationships between entities (e.g., <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">manufactured_by</code>, <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">certified_for</code>, <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">derived_from</code>).</li>
                  <li><strong>Properties</strong> — key-value attributes on both nodes and edges, typed according to the NNP ontology.</li>
                  <li><strong>Provenance</strong> — every fact in the graph carries a cryptographic proof of origin, linking it to the DID of the contributing node and the evidence (credentials, observations) that supports it.</li>
                </ul>
              </div>
            </section>

            <section id="entities" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">3. Entities & Relationships</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Entities in NNP-KN are identified by globally unique URIs within the <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">nnp-kn</code> namespace. An entity can represent anything: a bridge design specification, a clinical trial result, a robot's maintenance log, a weather model output, or a legal contract. Entities from different domains are linked through cross-domain relationships defined by the NNP ontology framework.</p>
              </div>
            </section>

            <section id="ontologies" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">4. Ontologies & Namespaces</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>NNP-KN uses a layered ontology model:</p>
                <div className="space-y-3 mt-4">
                  {[
                    { level: "Core Ontology", desc: "Defines fundamental concepts: Entity, Relationship, Property, Event, Agent, Location, Time. Every node understands these." },
                    { level: "Domain Ontologies", desc: "Industry-specific ontologies (e.g., SNOMED CT for healthcare, IFC for construction, STEP for manufacturing). Nodes in a domain cluster align on these." },
                    { level: "Custom Namespaces", desc: "Organizations and individual nodes can define custom entity types and relationships within their own namespace, with cross-walks to domain ontologies." },
                  ].map(item => (
                    <div key={item.level} className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 mt-0.5 w-32">{item.level}</span>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="contribution" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">5. Contribution Model</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Nodes contribute to the knowledge graph by publishing <strong>Knowledge Assertions</strong> — signed statements about entities and relationships. Assertions are validated against the node's trust profile and the consistency of existing knowledge. Conflicting assertions (e.g., two nodes claiming different values for the same property) trigger a resolution process that considers the trust scores and evidence chains of each contributor.</p>
                <p>Contributions can be:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Public</strong> — visible to all nodes on the network.</li>
                  <li><strong>Domain-scoped</strong> — visible only to nodes within a specific industry cloud.</li>
                  <li><strong>Contract-scoped</strong> — visible only to nodes participating in a specific collaboration contract.</li>
                </ul>
              </div>
            </section>

            <section id="query" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">6. Query Model</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>NNP-KN supports two query paradigms:</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2">Graph Traversal</h4>
                    <p className="text-xs text-white/45 leading-relaxed">Navigate the graph following typed edges. "Find all materials used in bridges designed after 2020 that have a fatigue rating below threshold." Uses a Gremlin-compatible traversal language (NNP-GT).</p>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2">Semantic Queries</h4>
                    <p className="text-xs text-white/45 leading-relaxed">Natural-language queries translated to graph operations via the Discovery Layer's semantic engine. "What are the common failure modes for suspension bridges in coastal environments?"</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="example" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">7. Example Knowledge Graph Entry</h2>
              <CodeBlock code={`{
  "@context": "https://nexus.network/ns/knowledge/v1",
  "id": "nnp-kn:entity:brg-2026-0042",
  "type": "nnp:StructuralDesign",
  "labels": ["Bridge Design", "Steel Truss", "Highway"],
  "properties": {
    "name": "Mill Creek Bridge — Revision 3",
    "spanMeters": 142.5,
    "materialGrade": "ASTM A992",
    "designCode": "AASHTO LRFD 9th Edition",
    "maxLoadTons": 72
  },
  "relationships": [
    { "type": "designed_by", "target": "did:nnp:z6MkrJV...2HtQw" },
    { "type": "derived_from", "target": "nnp-kn:entity:brg-2025-0187" },
    { "type": "certified_for", "target": "nnp-kn:entity:jurisdiction-US-CA" }
  ],
  "contributedBy": "did:nnp:z6MkhaX...8EfV1",
  "evidence": ["urn:nnp-tr:assertion:8f3a...c21b"],
  "timestamp": "2026-07-26T14:00:00Z",
  "signature": "z5n2b...8Kq91"
}`} />
            </section>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-10 px-6"><div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"><span className="text-white/30 text-sm">© {new Date().getFullYear()} Nexus Network.</span><div className="flex items-center gap-6 text-sm text-white/30"><Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><Link to="/docs" className="hover:text-white/60 transition-colors">Docs</Link><Link to="/api" className="hover:text-white/60 transition-colors">API</Link></div></div></footer>
    </div>
  );
}
