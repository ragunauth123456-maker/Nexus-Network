import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/spec/collaboration")({ component: CollaborationSpec });

function Breadcrumbs({ current }: { current: string }) {
  return <div className="flex items-center gap-2 text-sm text-white/40 mb-6"><Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span><Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><span>/</span><span className="text-white/60">{current}</span></div>;
}

function TocSidebar() {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "overview", label: "Overview" },
    { id: "workflows", label: "Workflows" },
    { id: "contracts", label: "Smart Contracts" },
    { id: "state-machine", label: "State Machine" },
    { id: "execution", label: "Execution & Audit" },
    { id: "security", label: "Security & Dispute Resolution" },
    { id: "schema", label: "Workflow Schema" },
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

function CollaborationSpec() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10">
          <div className="hidden lg:block w-56 shrink-0"><TocSidebar /></div>
          <div className="flex-1 min-w-0">
            <Breadcrumbs current="Universal Collaboration Layer" />
            <div className="flex items-center gap-3 mb-6"><h1 className="text-4xl md:text-5xl font-bold tracking-tight">Universal Collaboration Layer</h1><span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">Draft</span></div>
            <p className="text-lg text-white/50 mb-12 max-w-3xl">NNP Collaboration Layer (NNP-CL) — The protocol that governs how work flows across organizational boundaries. From discovery through negotiation, execution, and settlement, every cross-node interaction follows a verifiable, auditable state machine.</p>
            <div className="lg:hidden"><TocSidebar /></div>

            <section id="overview" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">1. Overview</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>The Collaboration Layer is where the network produces value. The five layers below it — Identity, Trust, Discovery, Knowledge, and Reasoning — all exist to enable this moment: two or more nodes agreeing to work together, executing that work across their respective systems, and settling the outcome in a way that is cryptographically verifiable and legally enforceable.</p>
                <p>NNP-CL is not a project management tool. It is a <strong>protocol for autonomous cross-organizational work</strong>. It defines the state machine that every collaboration follows, the contract format that binds participants, the execution protocol that coordinates their systems, and the audit trail that provides non-repudiable evidence of every action taken.</p>
              </div>
            </section>

            <section id="workflows" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">2. Workflows</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>A workflow in NNP-CL is a directed graph of <strong>tasks</strong>, each assigned to a specific node and connected by <strong>dependencies</strong>. Workflows are defined declaratively in NNP-WF (Workflow Definition Language) and executed by a <strong>Workflow Engine</strong> that can run on any participating node or on a dedicated orchestration node.</p>
                <p>Workflows support:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Parallel execution</strong> — tasks with no mutual dependencies run concurrently across different nodes.</li>
                  <li><strong>Conditional branching</strong> — the workflow can branch based on task outputs (e.g., "if the FEA analysis reveals stress above threshold, route to the redesign node").</li>
                  <li><strong>Human-in-the-loop steps</strong> — tasks that require human judgment, approval, or creative input. The human node receives the context and inputs and returns a signed decision.</li>
                  <li><strong>Compensation</strong> — if a task fails and cannot be retried, compensation tasks undo or mitigate the effects of completed upstream work.</li>
                </ul>
              </div>
            </section>

            <section id="contracts" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">3. Smart Contracts</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Every collaboration is governed by a <strong>Collaboration Contract</strong> — a machine-readable, cryptographically signed agreement that specifies:</p>
                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { item: "Participants", desc: "The DIDs of all nodes involved, their roles, and their signing keys." },
                    { item: "Scope", desc: "The workflow definition, inputs, expected outputs, and acceptance criteria." },
                    { item: "Terms", desc: "Pricing (per task or fixed), payment schedule, liability limits, and jurisdiction for dispute resolution." },
                    { item: "Trust Requirements", desc: "Minimum trust scores, required credentials, and any mandatory attestations." },
                    { item: "Timeline", desc: "Start date, milestone deadlines, and expiration. Late penalties and early-completion bonuses." },
                    { item: "Dispute Mechanism", desc: "Escalation path: automated resolution → mediator node → human arbitration → legal enforcement." },
                  ].map(c => (
                    <div key={c.item} className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-2">{c.item}</h4>
                      <p className="text-xs text-white/45 leading-relaxed">{c.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4">Contracts are hashed and anchored to the network's distributed ledger. The hash serves as a non-repudiable reference; the full contract is stored by each participant and can be revealed in case of a dispute.</p>
              </div>
            </section>

            <section id="state-machine" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">4. Collaboration State Machine</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Every collaboration progresses through a well-defined state machine:</p>
                <div className="space-y-2 mt-4">
                  {[
                    { state: "PROPOSED", desc: "An initiating node publishes a contract proposal. Target nodes are notified via their service endpoints." },
                    { state: "NEGOTIATING", desc: "Participants propose amendments to terms, scope, or timeline. Each amendment is a signed delta to the original contract." },
                    { state: "ACCEPTED", desc: "All required participants have signed the final contract. The contract hash is anchored. Payment escrow is initialized if monetary terms exist." },
                    { state: "IN_PROGRESS", desc: "The workflow engine dispatches tasks according to the DAG. Each task completion is signed by the executing node and recorded in the audit trail." },
                    { state: "COMPLETED", desc: "All tasks have been completed and outputs validated against acceptance criteria. The requesting node signs the final acceptance." },
                    { state: "SETTLED", desc: "Payment is released from escrow. Outcome attestations are issued by all participants, feeding into the Trust Layer's reputation graph." },
                    { state: "DISPUTED", desc: "A participant has raised a dispute. The workflow pauses, and the dispute resolution mechanism is invoked." },
                    { state: "CANCELLED", desc: "The collaboration was cancelled. Compensation tasks may be triggered depending on the cancellation terms." },
                  ].map(s => (
                    <div key={s.state} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-mono font-bold text-indigo-400 shrink-0 w-28 mt-0.5">{s.state}</span>
                      <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="execution" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">5. Execution & Audit Trails</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>Every action within a collaboration — task dispatch, task start, task completion, output validation, payment release — produces a signed <strong>Audit Record</strong>. These records are chained via content hashes, forming an immutable, append-only log. The audit trail serves three purposes:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Verifiability</strong> — any participant can verify that every action was authorized and correctly executed.</li>
                  <li><strong>Non-repudiation</strong> — no participant can deny having performed (or failed to perform) an action they signed.</li>
                  <li><strong>Dispute evidence</strong> — in case of a dispute, the audit trail provides a complete, tamper-evident record for the dispute resolver.</li>
                </ul>
              </div>
            </section>

            <section id="security" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">6. Security & Dispute Resolution</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>NNP-CL is designed for adversarial environments. Security properties include:</p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong>Message confidentiality</strong> — all inter-node communication is encrypted via DIDComm, ensuring only intended recipients can read task inputs and outputs.</li>
                  <li><strong>Data isolation</strong> — a node's internal systems are never directly exposed. Nodes pull tasks from the workflow engine; the engine never pushes into a node's infrastructure.</li>
                  <li><strong>Escrow</strong> — payments are held in protocol-level escrow until the COMPLETED state is reached, protecting both parties.</li>
                </ul>
                <p className="mt-4">Disputes follow an escalating resolution path: automated rule-based resolution for simple contract violations → mediator node (a neutral third-party node with high trust score) → binding human arbitration under the contract's specified jurisdiction.</p>
              </div>
            </section>

            <section id="schema" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">7. Workflow Definition Schema</h2>
              <CodeBlock code={`{
  "@context": "https://nexus.network/ns/collaboration/v1",
  "workflowId": "urn:nnp-cl:wf:bridge-design-0042",
  "contractRef": "urn:nnp-cl:contract:8a1b...f3c2",
  "tasks": [
    {
      "id": "site-analysis",
      "capability": "nnp-cap:geotechnical-analysis",
      "inputs": ["spanMeters", "location"],
      "outputs": ["soilReport", "seismicZone", "floodRisk"],
      "trustRequired": 0.6
    },
    {
      "id": "structural-design",
      "capability": "nnp-cap:structural-analysis",
      "inputs": ["soilReport", "seismicZone", "spanMeters", "loadClass"],
      "outputs": ["trussDesign", "memberSpecs", "connectionDetails"],
      "dependsOn": ["site-analysis"],
      "trustRequired": 0.75
    }
  ],
  "signatures": [
    { "signer": "did:nnp:z6MkrJV...2HtQw", "timestamp": "2026-07-26T10:00:00Z", "proof": "z5n2b..." },
    { "signer": "did:nnp:z6MkhaX...8EfV1", "timestamp": "2026-07-26T10:15:00Z", "proof": "z8m4d..." }
  ]
}`} />
            </section>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-10 px-6"><div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"><span className="text-white/30 text-sm">© {new Date().getFullYear()} Nexus Network.</span><div className="flex items-center gap-6 text-sm text-white/30"><Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link><Link to="/docs" className="hover:text-white/60 transition-colors">Docs</Link><Link to="/api" className="hover:text-white/60 transition-colors">API</Link><Link to="/network" className="hover:text-white/60 transition-colors">Network</Link></div></div></footer>
    </div>
  );
}
