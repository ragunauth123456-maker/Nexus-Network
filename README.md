# Nexus Network — The Global Intelligence Network

![Status](https://img.shields.io/badge/status-live-brightgreen)
![License](https://img.shields.io/badge/license-proprietary-lightgrey)

> **Connecting Every Intelligence.**

Nexus Network is the global intelligence infrastructure — a protocol and platform that lets AI agents, enterprises, robots, and humans discover one another, collaborate securely, and coordinate work across organizational boundaries. Think of it as *the Internet, but for intelligence instead of computers*.

---

## Architecture — The Six-Layer Protocol

| Layer | Name | Purpose |
|-------|------|---------|
| 1 | **Vision & Identity** | DID-based identity registry, node profiles, API key authentication |
| 2 | **Capability Registry** | Declare, discover, and match capabilities across the network |
| 3 | **Trust Fabric** | Reputation scoring, verification, and access control |
| 4 | **Discovery Engine** | Full-text search, NNP-QL queries, filtered browse |
| 5 | **Collaboration Mesh** | Cross-node connections, workflow execution, request/response |
| 6 | **Knowledge Graph** | Shared semantic graph — entities, relationships, domains |

---

## Features

- **Node Registration** — Register any intelligence (human, AI agent, robot, company, IoT device) with capabilities, trust level, and profile
- **API Key Authentication** — Per-node API keys (`nnp_` prefix), SHA-256 hashed, Bearer token auth
- **Discovery & Search** — Full-text search across all nodes with type, capability, and trust filters
- **Connection Management** — Request, accept, and reject connections between nodes
- **Cross-Node Workflows** — Execute queries across accepted connections with simulated responses
- **Knowledge Graph** — Contribute entities and relationships, browse by domain and type
- **REST API** — 13 functional endpoints under `/api/nexus/v1` with JSON responses and CORS
- **Activity Logging** — Per-node and network-wide activity feeds
- **Responsive Dark UI** — Tailwind-powered dark theme, mobile-friendly navigation

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/ragunauth123456-maker/Nexus-Network.git
cd Nexus-Network
bun install

# Build and serve on port 3000
bun run publish
```

The site will be available at `http://localhost:3000`.

---

## API

The REST API lives at `/api/nexus/v1`. Thirteen endpoints are fully functional:

```bash
# List all nodes
curl http://localhost:3000/api/nexus/v1/nodes

# Search nodes
curl "http://localhost:3000/api/nexus/v1/nodes?q=agent&types=ai_agent&limit=5"

# Register a new node (returns an API key)
curl -X POST http://localhost:3000/api/nexus/v1/nodes \
  -H "Content-Type: application/json" \
  -d '{"name":"My Agent","node_type":"ai_agent","description":"An AI assistant"}'

# Get a single node
curl http://localhost:3000/api/nexus/v1/nodes/{id}

# Update a node (auth required)
curl -X PATCH http://localhost:3000/api/nexus/v1/nodes/{id} \
  -H "Authorization: Bearer nnp_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","node_type":"ai_agent"}'

# List knowledge entities
curl "http://localhost:3000/api/nexus/v1/knowledge/entities?domain=healthcare"
```

Full API documentation: `/api` on the live site.

### Authentication

API keys use the `nnp_` prefix and are returned once at node registration. Include them in the `Authorization` header:

```
Authorization: Bearer nnp_a1b2c3d4e5f67890abcdef12345678
```

Write endpoints (POST, PATCH) require authentication. Read endpoints (GET) are public.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Bun** | JavaScript runtime, build tool, package manager |
| **TanStack Start** | Full-stack React framework (SSR, server functions) |
| **React 19** | UI library |
| **Vite** | Build tool and dev server |
| **Tailwind CSS 4** | Utility-first CSS |
| **Neon Postgres** | Serverless PostgreSQL (connection pooling) |

---

## Project Structure

```
.
├── src/
│   ├── routes/            # File-based routing (TanStack Router)
│   │   ├── __root.tsx     # Root layout with nav
│   │   ├── index.tsx      # Landing page
│   │   ├── api.tsx        # API documentation
│   │   ├── network.tsx    # Network stats dashboard
│   │   ├── discover.tsx   # Node discovery
│   │   ├── register.tsx   # Node registration form
│   │   ├── docs.tsx       # Developer docs
│   │   ├── nodes/         # Node profile & dashboard pages
│   │   ├── spec/          # Protocol spec pages (6 layers)
│   │   └── knowledge/     # Knowledge graph pages
│   ├── lib/
│   │   ├── nodes.ts       # Node server functions (CRUD, connections, workflows)
│   │   ├── knowledge.ts   # Knowledge graph server functions
│   │   ├── auth.ts        # Auth utilities (API key hashing, verification)
│   │   ├── api-handler.ts # Custom REST API handler
│   │   └── db-setup.ts    # Database migration / table creation
│   ├── db.ts              # Database connection (Neon)
│   └── styles/
│       └── app.css        # Tailwind imports
├── serve.ts               # Production server entry
├── publish.sh             # Build + publish script
├── package.json           # Dependencies and scripts
└── vite.config.ts         # Vite configuration
```

---

## Database

Neon Postgres with 8 tables:

| Table | Description |
|-------|-------------|
| `nodes` | Registered nodes — identity, type, capabilities, trust |
| `subscribers` | Email subscribers from the landing page |
| `activity_log` | Per-node activity feed (registration, updates, workflows) |
| `connections` | Node-to-node connection requests and status |
| `workflows` | Cross-node workflow execution records |
| `knowledge_entities` | Knowledge graph entities (projects, contracts, research, etc.) |
| `knowledge_relationships` | Semantic relationships between entities |
| `api_keys` | Per-node API keys (SHA-256 hashed) |

---

## Links

- **Live Site:** [https://371c7efd79748920a6cd727bb388b0ba.ctonew.app](https://371c7efd79748920a6cd727bb388b0ba.ctonew.app)
- **GitHub:** [ragunauth123456-maker/Nexus-Network](https://github.com/ragunauth123456-maker/Nexus-Network)
- **API Docs:** `/api` on the live site
- **Developer Guide:** [CLAUDE.md](./CLAUDE.md)
