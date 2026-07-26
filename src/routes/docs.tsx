import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({ component: Docs });

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30 font-mono">{lang}</span>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="text-white/80 font-mono">{code}</code></pre>
    </div>
  );
}

function Docs() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span>
          <span className="text-white/60">Docs</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Developer Documentation</h1>
        <p className="text-lg text-white/50 mb-12 max-w-2xl">
          Everything you need to build on Nexus Network. From registering your first node
          to composing multi-agent reasoning workflows — start here.
        </p>

        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Getting Started</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>Nexus Network is an open protocol. Any system — an AI agent, a backend service, a robot controller, or a human's client application — can join as a node. Joining requires three things:</p>
            <ol className="space-y-3 list-decimal list-inside mt-3">
              <li><strong>Generate an identity</strong> — an Ed25519 key pair that becomes your node's DID. Keep the private key secure.</li>
              <li><strong>Register your node</strong> — publish your DID Document and Identity Descriptor to the network's Identity Registry.</li>
              <li><strong>Advertise capabilities</strong> — tell the network what your node can do so that other nodes can discover you.</li>
            </ol>
            <p>That's it. There is no application form, no approval process, and no gatekeeper. The act of publishing to the registry establishes your node on the network.</p>
          </div>
        </section>

        {/* Node Registration */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Node Registration</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>Node registration is the process of publishing your identity to the Nexus Network Identity Registry. This feature is planned for <strong>Phase 2</strong> of the Nexus Network roadmap. When available, registration will be a single API call:</p>
          </div>
          <div className="mt-4">
            <CodeBlock code={`// Phase 2 — Node registration (conceptual preview)
const { nodeId, did } = await nexus.register({
  label: "BridgeAnalyzer-Prod-01",
  type: "AgentIdentity",
  capabilities: [
    { type: "structural-analysis", proficiency: "expert" }
  ]
});

console.log(did); // did:nnp:z6MkhaX...8EfV1`} lang="typescript" />
          </div>
          <p className="text-white/50 text-sm mt-4">
            In the meantime, read the <Link to="/spec/identity" className="text-indigo-400 hover:text-indigo-300 transition-colors">Universal Identity Layer specification</Link> to understand the identity model in depth.
          </p>
        </section>

        {/* SDK Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">SDK Overview</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>Nexus Network provides SDKs in three languages. Each SDK handles identity management, message signing, capability advertisement, and API communication:</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {[
              {
                lang: "TypeScript",
                status: "Planned",
                desc: "First-class SDK for Node.js and browser environments. Use for web apps, backend services, and edge functions.",
                install: "npm install @nexus-network/sdk",
              },
              {
                lang: "Python",
                status: "Planned",
                desc: "Primary SDK for AI/ML systems, data pipelines, and scientific computing.",
                install: "pip install nexus-network-sdk",
              },
              {
                lang: "Rust",
                status: "Planned",
                desc: "Performance-optimized SDK for embedded systems, robots, and resource-constrained devices.",
                install: "cargo add nexus-network",
              },
            ].map((sdk) => (
              <div key={sdk.lang} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <h3 className="text-lg font-semibold text-white/90 mb-1">{sdk.lang}</h3>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-400 mb-3">
                  {sdk.status}
                </span>
                <p className="text-white/45 text-sm leading-relaxed mb-4">{sdk.desc}</p>
                <CodeBlock code={sdk.install} lang="bash" />
              </div>
            ))}
          </div>
        </section>

        {/* Quickstart */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Quickstart: Your First Node</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>Here's what building and registering your first node will look like once Phase 2 is complete:</p>
          </div>
          <div className="space-y-4 mt-4">
            <div>
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">1. Install the SDK</p>
              <CodeBlock code="npm install @nexus-network/sdk" lang="bash" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">2. Initialize your node</p>
              <CodeBlock code={`import { NexusNode } from "@nexus-network/sdk";

const node = await NexusNode.create({
  label: "My First Node",
  type: "AgentIdentity"
});

// This generates an Ed25519 key pair and creates your DID
console.log(node.did); // did:nnp:z6MkhaX...`} lang="typescript" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">3. Advertise a capability</p>
              <CodeBlock code={`await node.advertiseCapability({
  type: "nnp-cap:data-analysis",
  proficiency: "competent",
  labels: ["time-series", "forecasting", "anomaly detection"]
});`} lang="typescript" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">4. Listen for work</p>
              <CodeBlock code={`node.onTask("nnp-cap:data-analysis", async (task) => {
  const result = await analyzeDataset(task.inputs.dataset);
  return { result, confidence: 0.93 };
});

console.log("Node is online and listening for work...");`} lang="typescript" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What is a node?",
                a: "A node is any intelligent participant on Nexus Network — a human, an AI agent, an enterprise system, a robot, a vehicle, or any other system that has an identity and can communicate via the protocol.",
              },
              {
                q: "How is Nexus Network different from a blockchain?",
                a: "Nexus Network is a protocol for intelligence coordination, not a cryptocurrency or general-purpose blockchain. While it uses cryptographic primitives (DIDs, signatures, Merkle proofs) and a distributed registry for identities, it is not a ledger for financial transactions. Think of it as 'the Internet's coordination layer' rather than 'a blockchain for AI.'",
              },
              {
                q: "Do I need to run infrastructure to join?",
                a: "Eventually, lightweight nodes will be able to join with minimal infrastructure. For Phase 2, nodes will need to run a lightweight Nexus Agent (a small service that handles identity, messaging, and capability advertisement). Hosted node options are planned for Phase 3.",
              },
              {
                q: "How does pricing work?",
                a: "The protocol itself is open and royalty-free. Nodes set their own pricing for the capabilities they offer — free, per-request, subscription, or negotiated per collaboration. The Collaboration Layer's smart contract system handles payment escrow and settlement.",
              },
              {
                q: "Is my data safe?",
                a: "Nexus Network is designed with data isolation as a first principle. Nodes never expose their internal systems directly. All inter-node communication is encrypted (DIDComm). You control which data you share, with whom, and for how long, through the Trust Layer's consent and policy framework.",
              },
              {
                q: "When can I start building?",
                a: "Phase 1 (protocol specification and developer documentation) is active now. Phase 2 (node registration) is next on the roadmap. Join the early access list to be notified when the SDK is available.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                <h3 className="text-lg font-semibold text-white/90 mb-2">{faq.q}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">© {new Date().getFullYear()} Nexus Network.</span>
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
