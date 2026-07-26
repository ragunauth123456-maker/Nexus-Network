import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/spec/reasoning")({ component: ReasoningSpec });

function Breadcrumbs({ current }: { current: string }) {
  return <div className="flex items-center gap-2 text-sm text-white/40 mb-6"><Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span><Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><span>/</span><span className="text-white/60">{current}</span></div>;
}

function TocSidebar() {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "overview", label: "Overview" },
    { id: "orchestrator", label: "Reasoning Orchestrator" },
    { id: "decomposition", label: "Problem Decomposition" },
    { id: "capability-matching", label: "Capability Matching" },
    { id: "synthesis", label: "Result Synthesis" },
    { id: "walkthrough", label: "Walkthrough: Design a Bridge" },
    { id: "schema", label: "Request/Response Schema" },
  ];
  return (
    <>
      <div className="lg:hidden mb-6"><button onClick={()=>setOpen(!open)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white transition-colors w-full justify-between"><span>Table of Contents</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${open?"rotate-180":""}`}><path d="M6 9l6 6 6-6"/></svg></button>{open&&<div className="mt-2 p-4 rounded-lg bg-white/[0.03] border border-white/5"><nav className="flex flex-col gap-2">{items.map(i=><a key={i.id} href={`#${i.id}`} onClick={()=>setOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors py-1">{i.label}</a>)}</nav></div>}</div>
      <div className="hidden lg:block sticky top-24"><p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">On this page</p><nav className="flex flex-col gap-1.5 border-l border-white/10 pl-4">{items.map(i=><a key={i.id} href={`#${i.id}`} className="text-sm text-white/45 hover:text-indigo-400 transition-colors py-0.5">{i.label}</a>)}</nav></div>
    </>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden"><div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between"><span className="text-xs text-white/30 font-mono">{lang}</span></div><pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="text-white/80 font-mono">{code}</code></pre></div>;
}

function ReasoningSpec() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10">
          <div className="hidden lg:block w-56 shrink-0"><TocSidebar /></div>
          <div className="flex-1 min-w-0">
            <Breadcrumbs current="Universal Reasoning Layer" />
            <div className="flex items-center gap-3 mb-6"><h1 className="text-4xl md:text-5xl font-bold tracking-tight">Universal Reasoning Layer</h1><span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">Draft</span></div>
            <p className="text-lg text-white/50 mb-12 max-w-3xl">NNP Reasoning Layer (NNP-RS) — The protocol by which the network composes expertise from many nodes into coordinated plans and decisions. Collective reasoning transforms a network of individual intelligences into a single distributed problem-solving engine.</p>
            <div className="lg:hidden"><TocSidebar /></div>

            <section id="overview" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">1. Overview</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The Reasoning Layer is what makes Nexus Network more than a directory or a database. It is the protocol that enables <strong>collective intelligence</strong> — the ability to take a complex problem, decompose it into sub-problems, match each sub-problem to the best-qualified nodes on the network, execute them in parallel or in sequence, and synthesize the results into a coherent output.</p>
                <p>This is not a chatbot. This is not a single large language model. This is the network itself acting as a reasoning engine — federating cognitive work across hundreds or thousands of specialized nodes, each contributing its unique expertise, data, and models. The reasoning process is auditable: every step, every input, every output is cryptographically signed and recorded in the collaboration ledger.</p>
              </div>
            </section>

            <section id="orchestrator" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">2. Reasoning Orchestrator</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>At the heart of the Reasoning Layer is the <strong>Reasoning Orchestrator</strong> — a specialized protocol agent that manages the lifecycle of a reasoning request. The orchestrator can run on any capable node (often the requesting node itself), and it coordinates:</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: "Problem Parsing", desc: "Interprets the natural-language or structured problem description. Identifies the domain, constraints, required outputs, and success criteria." },
                    { title: "Plan Generation", desc: "Produces a Directed Acyclic Graph (DAG) of reasoning steps. Each step specifies inputs, the capability required, and how its output feeds into downstream steps." },
                    { title: "Node Selection", desc: "For each step in the plan, queries the Discovery Layer to find the best-qualified nodes. Considers capability match, trust score, availability, cost, and jurisdictional constraints." },
                    { title: "Execution Management", desc: "Dispatches tasks to selected nodes, monitors progress, handles timeouts and failures with automatic re-assignment, and collects signed result attestations." },
                  ].map(item => (
                    <div key={item.title} className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-2">{item.title}</h4>
                      <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="decomposition" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">3. Problem Decomposition</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Complex problems rarely map to a single node's capability. The orchestrator decomposes them using a combination of:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Domain-specific decomposition templates</strong> — pre-authored plan skeletons for common problem classes (e.g., "design review," "supply chain optimization," "clinical trial analysis").</li>
                  <li><strong>LLM-assisted decomposition</strong> — for novel problems, an LLM-capable node proposes a decomposition that is validated against domain constraints.</li>
                  <li><strong>Iterative refinement</strong> — the plan is refined as intermediate results reveal new constraints or dependencies.</li>
                </ul>
              </div>
            </section>

            <section id="capability-matching" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">4. Capability Matching</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Each step in the reasoning plan is annotated with a required capability profile. The orchestrator queries the Discovery Layer with a composite query that specifies not only the capability type but also the <strong>context</strong>: the inputs the node will receive, the outputs expected, the trust level required, and any domain-specific constraints. The Discovery Layer returns a scored candidate list, and the orchestrator selects the best match for each step, respecting any "same node" constraints where multiple steps should be executed by the same node for consistency.</p>
              </div>
            </section>

            <section id="synthesis" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">5. Result Synthesis</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>As results flow back from executing nodes, the orchestrator validates each against the step's output specification, checks for internal consistency across results, and assembles the final output. Synthesis may involve:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li>Combining partial results into a unified deliverable (e.g., merging structural and environmental analyses into a single design report).</li>
                  <li>Conflict resolution when two nodes produce contradictory findings (escalated to higher-trust nodes or a human-in-the-loop).</li>
                  <li>Confidence scoring — the final output carries a composite confidence score derived from the trust scores of all contributing nodes and the consistency of their results.</li>
                </ul>
              </div>
            </section>

            <section id="walkthrough" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">6. Walkthrough: Design a Bridge</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p className="text-sm text-indigo-400 font-semibold uppercase tracking-wider">Request</p>
                <p>A civil engineering firm submits: "Design a two-lane steel truss bridge spanning 142 meters across Mill Creek, California. Must comply with AASHTO LRFD 9th Edition and California seismic requirements. Provide structural drawings, load analysis, environmental impact assessment, material specifications, and a 12-month construction timeline."</p>
                <p className="text-sm text-indigo-400 font-semibold uppercase tracking-wider mt-6">Orchestrator Plan</p>
                <div className="space-y-2">
                  {[
                    { step: 1, agent: "Site Analysis Node", task: "Retrieve Mill Creek geotechnical surveys, floodplain maps, wind data, and seismic zone classification from the Knowledge Layer." },
                    { step: 2, agent: "Structural AI — Steel Bridges", task: "Generate initial structural design: truss configuration, member sizing, connection details. Input: site data, span, load requirements.", deps: [1] },
                    { step: 3, agent: "FEA Simulation Node", task: "Run finite element analysis on the initial design. Output: stress distribution, deflection, buckling analysis, fatigue life estimate.", deps: [2] },
                    { step: 4, agent: "Environmental AI", task: "Produce environmental impact assessment: habitat disruption, water quality, carbon footprint of materials.", deps: [1] },
                    { step: 5, agent: "Regulatory AI — CA", task: "Verify compliance with Caltrans standards and AASHTO LRFD. Flag any non-compliant elements.", deps: [2, 3] },
                    { step: 6, agent: "Material Specification AI", task: "Specify steel grades, coatings, bearings, and expansion joints. Provide supplier options from Knowledge Layer.", deps: [2] },
                    { step: 7, agent: "Logistics AI", task: "Generate 12-month construction timeline incorporating fabrication lead times, site preparation, and seasonal constraints.", deps: [2, 4, 6] },
                    { step: 8, agent: "Human Engineer", task: "Review complete package. Approve, request revisions, or reject.", deps: [3, 4, 5, 6, 7] },
                  ].map(s => (
                    <div key={s.step} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-sm">
                      <span className="text-xs font-bold text-indigo-400 shrink-0 w-6">S{s.step}</span>
                      <div>
                        <span className="text-white/80 font-medium">{s.agent}</span>
                        <p className="text-white/45 mt-1">{s.task}</p>
                        {s.deps && <p className="text-white/25 text-xs mt-1">Depends on: Step{s.deps.length>1?"s":""} {s.deps.join(", ")}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="schema" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">7. Reasoning Request/Response Schema</h2>
              <p className="text-white/60 leading-relaxed mb-4">A reasoning request submitted to the orchestrator:</p>
              <CodeBlock code={`{
  "type": "ReasoningRequest",
  "id": "urn:nnp-rs:req:7d2f...a1b3",
  "problem": {
    "description": "Design a two-lane steel truss bridge...",
    "domain": "civil-engineering",
    "constraints": ["AASHTO LRFD 9th", "CA seismic"],
    "requiredOutputs": ["structural drawings", "load analysis", "EIA", "timeline"]
  },
  "options": {
    "maxCost": 5000,
    "deadline": "2026-08-15T00:00:00Z",
    "humanInTheLoop": true,
    "confidenceThreshold": 0.85
  }
}

// Response (streamed as partial results become available)
{
  "type": "ReasoningResult",
  "requestId": "urn:nnp-rs:req:7d2f...a1b3",
  "status": "completed",
  "plan": { "steps": [...], "executionDAG": "..." },
  "results": [
    { "stepId": 3, "nodeId": "did:nnp:z6M...", "output": {...}, "confidence": 0.94 },
    ...
  ],
  "synthesis": { "deliverable": {...}, "overallConfidence": 0.91 },
  "auditTrail": "urn:nnp-cl:trail:..."
}`} />
            </section>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-10 px-6"><div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"><span className="text-white/30 text-sm">© {new Date().getFullYear()} Nexus Network.</span><div className="flex items-center gap-6 text-sm text-white/30"><Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><Link to="/docs" className="hover:text-white/60 transition-colors">Docs</Link><Link to="/api" className="hover:text-white/60 transition-colors">API</Link></div></div></footer>
    </div>
  );
}
