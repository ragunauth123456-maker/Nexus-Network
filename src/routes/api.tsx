import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/api")({ component: ApiRef });

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30 font-mono">{lang}</span>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="text-white/80 font-mono">{code}</code></pre>
    </div>
  );
}

function ApiRef() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link to="/" className="hover:text-white/60 transition-colors">Home</Link><span>/</span>
          <span className="text-white/60">API</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">API Reference</h1>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">Preview</span>
        </div>
        <p className="text-lg text-white/50 mb-12 max-w-3xl">
          The Nexus Network REST API. All endpoints are versioned under <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">/nexus/v1</code>.
          This is a preview of the planned API surface — endpoints will become functional in Phase 2 and beyond.
        </p>

        {/* Authentication */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Authentication</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>
              All API requests are authenticated using <strong>HTTP Signatures</strong> (IETF draft-cavage-http-signatures) with Ed25519 keys.
              Each request is signed by the node's private key, and the server verifies the signature against the public key registered in the node's DID Document.
            </p>
            <p>Authentication headers:</p>
            <CodeBlock code={`Authorization: Signature keyId="did:nnp:z6MkhaX...8EfV1#key-1",
  algorithm="ed25519",
  headers="(request-target) date host digest",
  signature="Base64(Ed25519Sign(...))"

Date: Mon, 27 Jul 2026 10:00:00 GMT
Host: api.nexus.network
Digest: SHA-256=Base64(hash(request-body))`} lang="http" />
            <p className="text-white/50 text-sm mt-3">
              For SDK consumers, authentication is handled automatically. You never construct these headers manually.
            </p>
          </div>
        </section>

        {/* Core Endpoints */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Core Endpoints</h2>

          {/* POST /nodes */}
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">POST</span>
              <code className="text-base text-white/80 font-mono">/nexus/v1/nodes</code>
            </div>
            <p className="text-white/50 text-sm mb-4">Register a new node on the network. Publishes the DID Document and Identity Descriptor to the Identity Registry.</p>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Request Body</p>
            <CodeBlock code={`{
  "label": "BridgeAnalyzer-Prod-01",
  "type": "AgentIdentity",
  "publicKey": {
    "type": "Ed25519VerificationKey2020",
    "publicKeyMultibase": "z6MkhaXg...8EfV1"
  },
  "serviceEndpoints": [
    {
      "type": "NexusAPI",
      "endpoint": "https://node1.engfirm.example/nexus/v1"
    }
  ]
}`} />
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">Response (201 Created)</p>
            <CodeBlock code={`{
  "did": "did:nnp:z6MkhaX...8EfV1",
  "nodeId": "node_7d2f3a1b...",
  "registeredAt": "2026-07-27T10:00:00Z",
  "status": "active"
}`} />
          </div>

          {/* GET /nodes/{id} */}
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300">GET</span>
              <code className="text-base text-white/80 font-mono">/nexus/v1/nodes/{'{id}'}</code>
            </div>
            <p className="text-white/50 text-sm mb-4">Retrieve a node's public profile, including its DID Document, capabilities, and trust score.</p>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Path Parameters</p>
            <div className="mb-4">
              <div className="flex gap-4 text-sm py-2 border-b border-white/5">
                <span className="text-white/60 font-mono w-20 shrink-0">id</span>
                <span className="text-white/40">The node's DID (e.g., <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded text-xs">did:nnp:z6MkhaX...8EfV1</code>) or node ID</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Response (200 OK)</p>
            <CodeBlock code={`{
  "did": "did:nnp:z6MkhaX...8EfV1",
  "nodeId": "node_7d2f3a1b...",
  "label": "BridgeAnalyzer-Prod-01",
  "type": "AgentIdentity",
  "status": "active",
  "registeredAt": "2026-07-27T10:00:00Z",
  "trustScore": 0.87,
  "capabilities": [
    { "type": "nnp-cap:structural-analysis", "proficiency": "expert" }
  ],
  "serviceEndpoints": [
    { "type": "NexusAPI", "endpoint": "https://..." }
  ]
}`} />
          </div>

          {/* GET /discovery/search */}
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300">GET</span>
              <code className="text-base text-white/80 font-mono">/nexus/v1/discovery/search</code>
            </div>
            <p className="text-white/50 text-sm mb-4">Search for nodes by capability. Accepts NNP-QL query strings and returns ranked results.</p>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Query Parameters</p>
            <div className="space-y-1 mb-4">
              {[
                { param: "q", desc: "NNP-QL query string" },
                { param: "limit", desc: "Maximum results to return (default: 20, max: 100)" },
                { param: "offset", desc: "Pagination offset (default: 0)" },
              ].map(p => (
                <div key={p.param} className="flex gap-4 text-sm py-2 border-b border-white/5">
                  <span className="text-white/60 font-mono w-20 shrink-0">{p.param}</span>
                  <span className="text-white/40">{p.desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Response (200 OK)</p>
            <CodeBlock code={`{
  "results": [
    {
      "nodeId": "node_7d2f3a1b...",
      "did": "did:nnp:z6MkhaX...8EfV1",
      "label": "BridgeAnalyzer-Prod-01",
      "matchScore": 0.96,
      "trustScore": 0.87,
      "capability": "nnp-cap:structural-analysis",
      "proficiency": "expert",
      "endpoint": "https://node1.engfirm.example/nexus/v1"
    }
  ],
  "total": 42,
  "query": "DISCOVER nodes WITH capability MATCHING ..."
}`} />
          </div>

          {/* POST /reasoning/query */}
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300">POST</span>
              <code className="text-base text-white/80 font-mono">/nexus/v1/reasoning/query</code>
            </div>
            <p className="text-white/50 text-sm mb-4">Submit a reasoning request to the network's Reasoning Orchestrator. The orchestrator decomposes the problem, matches capabilities, dispatches to nodes, and synthesizes results.</p>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Request Body</p>
            <CodeBlock code={`{
  "problem": {
    "description": "Analyze the fatigue life of this steel bridge design...",
    "domain": "civil-engineering",
    "inputs": {
      "designRef": "nnp-kn:entity:brg-2026-0042",
      "trafficClass": "HL-93"
    },
    "requiredOutputs": ["fatigueLife", "criticalJoints", "maintenanceSchedule"]
  },
  "options": {
    "maxCost": 500,
    "deadline": "2026-08-15T00:00:00Z",
    "confidenceThreshold": 0.85
  }
}`} />
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">Response (202 Accepted)</p>
            <CodeBlock code={`{
  "requestId": "urn:nnp-rs:req:7d2f...a1b3",
  "status": "accepted",
  "estimatedCompletion": "2026-08-01T12:00:00Z",
  "trackingUrl": "/nexus/v1/reasoning/query/urn:nnp-rs:req:7d2f...a1b3"
}`} />
          </div>

          {/* GET /reasoning/query/{id} */}
          <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-300">GET</span>
              <code className="text-base text-white/80 font-mono">/nexus/v1/reasoning/query/{'{id}'}</code>
            </div>
            <p className="text-white/50 text-sm mb-4">Retrieve the status and results of a submitted reasoning request. Supports long-polling for completion notifications.</p>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">Response (200 OK — In Progress)</p>
            <CodeBlock code={`{
  "requestId": "urn:nnp-rs:req:7d2f...a1b3",
  "status": "in_progress",
  "plan": {
    "totalSteps": 4,
    "completedSteps": 2,
    "currentStep": "fea-simulation"
  },
  "partialResults": [...]
}`} />
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">Response (200 OK — Completed)</p>
            <CodeBlock code={`{
  "requestId": "urn:nnp-rs:req:7d2f...a1b3",
  "status": "completed",
  "completedAt": "2026-07-30T16:45:00Z",
  "results": [...],
  "synthesis": {
    "fatigueLife": {...},
    "criticalJoints": [...],
    "maintenanceSchedule": {...},
    "overallConfidence": 0.91
  },
  "cost": { "total": 380, "currency": "USD" },
  "auditTrail": "urn:nnp-cl:trail:9c4b..."
}`} />
          </div>
        </section>

        {/* Status codes */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Status Codes</h2>
          <div className="space-y-2">
            {[
              { code: "200", desc: "Request succeeded" },
              { code: "201", desc: "Resource created (node registration, reasoning request)" },
              { code: "202", desc: "Request accepted, processing asynchronously" },
              { code: "400", desc: "Invalid request — malformed body, missing required fields, or validation error" },
              { code: "401", desc: "Authentication failed — invalid or missing HTTP Signature" },
              { code: "403", desc: "Forbidden — the authenticated node does not meet the trust requirements for this operation" },
              { code: "404", desc: "Resource not found — node, request, or capability not found" },
              { code: "409", desc: "Conflict — duplicate registration, state machine violation" },
              { code: "429", desc: "Rate limited — too many requests; respect Retry-After header" },
              { code: "500", desc: "Internal server error — a node or the orchestrator encountered an unexpected failure" },
            ].map((s) => (
              <div key={s.code} className="flex gap-4 text-sm py-2 border-b border-white/5">
                <span className="text-white/60 font-mono w-12 shrink-0">{s.code}</span>
                <span className="text-white/40">{s.desc}</span>
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
