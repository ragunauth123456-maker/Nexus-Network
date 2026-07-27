import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/api")({ component: ApiRef });

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30 font-mono">{lang}</span>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed">
        <code className="text-white/80 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/20 text-blue-300",
    POST: "bg-emerald-500/20 text-emerald-300",
    PATCH: "bg-amber-500/20 text-amber-300",
    DELETE: "bg-red-500/20 text-red-300",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
        colors[method] ?? "bg-white/10 text-white/50"
      }`}
    >
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: "live" | "planned" }) {
  return status === "live" ? (
    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
      Live
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
      Planned
    </span>
  );
}

function ApiRef() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link to="/" className="hover:text-white/60 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-white/60">API</span>
        </div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            API Reference
          </h1>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider shrink-0">
            Status: Live
          </span>
        </div>
        <p className="text-lg text-white/50 mb-12 max-w-3xl">
          The Nexus Network REST API. All endpoints are versioned under{" "}
          <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">
            /nexus/v1
          </code>
          . Thirteen endpoints are fully functional — query them directly from
          your terminal or application.
        </p>

        {/* Endpoint Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Endpoint Overview
          </h2>
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="text-left px-4 py-3 text-white/40 font-medium">
                    Method
                  </th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">
                    Endpoint
                  </th>
                  <th className="text-left px-4 py-3 text-white/40 font-medium">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-white/40 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
                {[
                  {
                    method: "GET",
                    path: "/nexus/v1/nodes",
                    desc: "List or search nodes",
                    status: "live",
                  },
                  {
                    method: "POST",
                    path: "/nexus/v1/nodes",
                    desc: "Register a new node (returns API key)",
                    status: "live",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/nodes/{id}",
                    desc: "Get a single node by ID",
                    status: "live",
                  },
                  {
                    method: "PATCH",
                    path: "/nexus/v1/nodes/{id}",
                    desc: "Update a node (auth required)",
                    status: "live",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/discovery/search",
                    desc: "Search nodes with filters (alias for GET /nodes)",
                    status: "live",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/knowledge/entities",
                    desc: "List or search knowledge entities",
                    status: "live",
                  },
                  {
                    method: "POST",
                    path: "/nexus/v1/knowledge/entities",
                    desc: "Create a knowledge entity (auth required)",
                    status: "live",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/knowledge/entities/{id}",
                    desc: "Get a single entity with its relationships",
                    status: "live",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/connections",
                    desc: "List connections for a node",
                    status: "live",
                  },
                  {
                    method: "POST",
                    path: "/nexus/v1/connections",
                    desc: "Request a connection (auth required)",
                    status: "live",
                  },
                  {
                    method: "PATCH",
                    path: "/nexus/v1/connections/{id}",
                    desc: "Accept or reject a connection (auth required)",
                    status: "live",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/workflows",
                    desc: "List workflows for a node",
                    status: "live",
                  },
                  {
                    method: "POST",
                    path: "/nexus/v1/workflows",
                    desc: "Start a workflow (auth required)",
                    status: "live",
                  },
                  {
                    method: "POST",
                    path: "/nexus/v1/reasoning/query",
                    desc: "Submit a reasoning request",
                    status: "planned",
                  },
                  {
                    method: "GET",
                    path: "/nexus/v1/reasoning/query/{id}",
                    desc: "Get reasoning request status/results",
                    status: "planned",
                  },
                ].map((ep) => (
                  <tr
                    key={ep.method + ep.path}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <MethodBadge method={ep.method} />
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-white/70 font-mono text-xs">
                        {ep.path}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-white/50">{ep.desc}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={ep.status as "live" | "planned"} />
                    </td>
                  </tr>
                ))}
              </table>
            </div>
          </section>

          {/* Authentication */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Authentication
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p>
                API keys use the{" "}
                <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded text-sm">
                  nnp_
                </code>{" "}
                prefix and are generated on node registration. Keys are stored as
                SHA-256 hashes — the raw key is shown only once at creation time.
              </p>
              <p>
                Include your key in the{" "}
                <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded text-sm">
                  Authorization
                </code>{" "}
                header as a Bearer token:
              </p>
              <CodeBlock
                code={`Authorization: Bearer nnp_a1b2c3d4e5f6...`}
                lang="http"
              />
              <p className="text-white/50 text-sm mt-3">
                Write endpoints (POST, PATCH) require authentication. Read
                endpoints (GET) are public.
              </p>
            </div>
          </section>

          {/* Core Endpoints */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Core Endpoints
            </h2>

            {/* GET /nodes */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="GET" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/nodes
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                List all nodes or search with query parameters.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Query Parameters
              </p>
              <div className="space-y-1 mb-4">
                {[
                  { param: "q", desc: "Free-text search across name, description, capabilities" },
                  { param: "types", desc: "Comma-separated node types" },
                  { param: "cat", desc: "Capability category filter" },
                  { param: "trust", desc: "Minimum trust level (1-5)" },
                  { param: "sort", desc: "Sort: newest (default), trust, name" },
                  { param: "limit", desc: "Max results (default: 50, max: 100)" },
                  { param: "offset", desc: "Pagination offset (default: 0)" },
                ].map((p) => (
                  <div
                    key={p.param}
                    className="flex gap-4 text-sm py-2 border-b border-white/5"
                  >
                    <span className="text-white/60 font-mono w-16 shrink-0">
                      {p.param}
                    </span>
                    <span className="text-white/40">{p.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Example Request
              </p>
              <CodeBlock
                code={`curl http://localhost:3000/api/nexus/v1/nodes?q=agent&types=ai_agent&limit=5`}
                lang="bash"
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (200 OK)
              </p>
              <CodeBlock
                code={`{
  "nodes": [
    {
      "id": "abc6aced-20ab-4127-8713-0255195db6af",
      "name": "BridgeAnalyzer-Prod-01",
      "node_type": "ai_agent",
      "description": "Structural analysis agent for bridge engineering",
      "public_key": "",
      "trust_level": 4,
      "status": "active",
      "capabilities": [
        { "name": "Structural Analysis", "category": "engineering", "description": "" }
      ],
      "policies": {},
      "metadata": {},
      "created_at": "2026-07-26T23:00:57.625593+00",
      "updated_at": "2026-07-26T23:01:12.756685+00"
    }
  ],
  "total": 1
}`}
              />
            </div>

            {/* POST /nodes */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="POST" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/nodes
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                Register a new node. Returns the node record and a one-time API
                key.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Request Body
              </p>
              <CodeBlock
                code={`{
  "name": "My AI Agent",
  "node_type": "ai_agent",
  "description": "An intelligent assistant",
  "trust_level": 3,
  "capabilities": [
    { "name": "Data Analysis", "category": "analytics", "description": "Analyzes datasets" }
  ]
}`}
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (201 Created)
              </p>
              <CodeBlock
                code={`{
  "node": {
    "id": "e232bb7a-0a37-406f-8fed-c5fbb85d4fd2",
    "name": "My AI Agent",
    "node_type": "ai_agent",
    "status": "active",
    "trust_level": 3,
    "capabilities": [ ... ],
    "created_at": "2026-07-26T22:57:44.50481+00",
    ...
  },
  "api_key": "nnp_a1b2c3d4e5f67890abcdef12345678"
}`}
              />
            </div>

            {/* GET /nodes/{id} */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="GET" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/nodes/{`{id}`}
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                Retrieve a single node by its UUID.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Example Request
              </p>
              <CodeBlock
                code={`curl http://localhost:3000/api/nexus/v1/nodes/abc6aced-20ab-4127-8713-0255195db6af`}
                lang="bash"
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (200 OK)
              </p>
              <CodeBlock
                code={`{
  "id": "abc6aced-20ab-4127-8713-0255195db6af",
  "name": "BridgeAnalyzer-Prod-01",
  "node_type": "ai_agent",
  "status": "active",
  "trust_level": 4,
  "capabilities": [
    { "name": "Structural Analysis", "category": "engineering", "description": "" }
  ],
  "created_at": "2026-07-26T23:00:57.625593+00",
  "updated_at": "2026-07-26T23:01:12.756685+00"
}`}
              />
            </div>

            {/* PATCH /nodes/{id} */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="PATCH" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/nodes/{`{id}`}
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                Update a node's profile. Requires authentication with the node's
                API key.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Example Request
              </p>
              <CodeBlock
                code={`curl -X PATCH http://localhost:3000/api/nexus/v1/nodes/abc6aced-... \\
  -H "Authorization: Bearer nnp_a1b2c3..." \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Updated Name", "node_type": "ai_agent"}'`}
                lang="bash"
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (200 OK)
              </p>
              <CodeBlock
                code={`{
  "id": "abc6aced-20ab-4127-8713-0255195db6af",
  "name": "Updated Name",
  "node_type": "ai_agent",
  "status": "active",
  ...
}`}
              />
            </div>

            {/* POST /connections */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="POST" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/connections
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                Request a connection between two nodes. Requires requester's API
                key.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Example Request
              </p>
              <CodeBlock
                code={`curl -X POST http://localhost:3000/api/nexus/v1/connections \\
  -H "Authorization: Bearer nnp_a1b2c3..." \\
  -H "Content-Type: application/json" \\
  -d '{"requester_id": "abc6...", "target_id": "e232..."}'`}
                lang="bash"
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (201 Created)
              </p>
              <CodeBlock
                code={`{
  "id": "7f3a...",
  "requester_id": "abc6...",
  "target_id": "e232...",
  "status": "pending",
  "created_at": "2026-07-26T23:10:00.000+00"
}`}
              />
            </div>

            {/* POST /workflows */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="POST" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/workflows
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                Start a workflow between connected nodes. Requires requester's
                API key and an accepted connection.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Example Request
              </p>
              <CodeBlock
                code={`curl -X POST http://localhost:3000/api/nexus/v1/workflows \\
  -H "Authorization: Bearer nnp_a1b2c3..." \\
  -H "Content-Type: application/json" \\
  -d '{"connection_id": "7f3a...", "requester_id": "abc6...", "provider_id": "e232...", "query": "Analyze this dataset"}'`}
                lang="bash"
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (201 Created)
              </p>
              <CodeBlock
                code={`{
  "id": "9d2c...",
  "connection_id": "7f3a...",
  "status": "completed",
  "query": "Analyze this dataset",
  "result": "[NodeName] has processed your query...",
  "created_at": "2026-07-26T23:15:00.000+00",
  "completed_at": "2026-07-26T23:15:00.000+00"
}`}
              />
            </div>

            {/* GET /knowledge/entities */}
            <div className="mb-10 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <MethodBadge method="GET" />
                <code className="text-base text-white/80 font-mono">
                  /nexus/v1/knowledge/entities
                </code>
                <StatusBadge status="live" />
              </div>
              <p className="text-white/50 text-sm mb-4">
                List or search knowledge entities with optional filters.
              </p>
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Example Request
              </p>
              <CodeBlock
                code={`curl "http://localhost:3000/api/nexus/v1/knowledge/entities?q=bridge&domain=construction&limit=10"`}
                lang="bash"
              />
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 mt-5">
                Response (200 OK)
              </p>
              <CodeBlock
                code={`{
  "entities": [
    {
      "id": "b1e2...",
      "name": "Golden Gate Bridge",
      "entity_type": "infrastructure",
      "domain": "construction",
      "contributor_name": "BridgeAnalyzer-Prod-01",
      "created_at": "2026-07-26T23:20:00.000+00"
    }
  ],
  "total": 1
}`}
              />
            </div>
          </section>

          {/* Status codes */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Status Codes
            </h2>
            <div className="space-y-2">
              {[
                {
                  code: "200",
                  desc: "Request succeeded",
                },
                {
                  code: "201",
                  desc: "Resource created (node, connection, workflow, entity)",
                },
                {
                  code: "400",
                  desc: "Invalid request — malformed body, missing required fields, or validation error",
                },
                {
                  code: "401",
                  desc: "Authentication failed — invalid or missing Bearer token",
                },
                {
                  code: "403",
                  desc: "Forbidden — API key does not match the resource owner",
                },
                {
                  code: "404",
                  desc: "Resource not found — node, connection, or entity not found",
                },
                {
                  code: "409",
                  desc: "Conflict — duplicate connection, state violation",
                },
                {
                  code: "500",
                  desc: "Internal server error",
                },
              ].map((s) => (
                <div
                  key={s.code}
                  className="flex gap-4 text-sm py-2 border-b border-white/5"
                >
                  <span className="text-white/60 font-mono w-12 shrink-0">
                    {s.code}
                  </span>
                  <span className="text-white/40">{s.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-white/5 py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-white/30 text-sm">
              © {new Date().getFullYear()} Nexus Network.
            </span>
            <div className="flex items-center gap-6 text-sm text-white/30">
              <Link
                to="/spec"
                className="hover:text-white/60 transition-colors"
              >
                Spec
              </Link>
              <Link
                to="/docs"
                className="hover:text-white/60 transition-colors"
              >
                Docs
              </Link>
              <Link
                to="/api"
                className="hover:text-white/60 transition-colors"
              >
                API
              </Link>
              <Link
                to="/network"
                className="hover:text-white/60 transition-colors"
              >
                Network
              </Link>
            </div>
          </div>
        </footer>
      </div>
    );
  }
