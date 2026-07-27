# Nexus Network — Developer Onboarding Guide

## Project Overview

Nexus Network is the global intelligence infrastructure — a TanStack Start (React + Vite + Tailwind) full-stack application backed by Neon Postgres. It provides node registration, discovery, cross-node collaboration, a knowledge graph, and a REST API. Think of it as "the Internet for intelligence."

## Tech Stack & Why

- **Bun** — Fast JS runtime with native crypto (`Bun.CryptoHasher`) and excellent Node compatibility. Avoid `node:crypto` imports — use Bun-native APIs everywhere.
- **TanStack Start** — Full-stack React framework. Server functions (`createServerFn`) are the primary data layer; they run on the server and are called from client components like regular async functions.
- **Neon Postgres** — Serverless PostgreSQL over HTTP. Use `sql()` for simple queries (tagged template), `pool()` for parameterized queries with `$1` placeholders.
- **Tailwind CSS 4** — Utility-first CSS. The site uses a dark theme (`bg-[#0a0b14]`, `text-white`, border `white/5`).
- **Vite** — Build tool. Caching can get stale — clear `node_modules/.vite` and `dist` if builds misbehave.

## How to Run Locally

```bash
bun install
bun run publish   # builds and serves on port 3000
```

The `publish.sh` script builds with Vite, then runs `serve.ts` with Bun. Port 3000 is the only public surface.

## Key Architectural Decisions

1. **Server functions over API routes for UI data** — Page data comes from `createServerFn()` calls in `src/lib/`. The REST API (`src/lib/api-handler.ts`) is a separate, independent handler mounted in `serve.ts`.

2. **Bun-native crypto only** — Never import `createHash` from `node:crypto`. Use `new Bun.CryptoHasher("sha256")`. API keys are hashed with SHA-256 before storage.

3. **File-based routing** — TanStack Router auto-generates routes from `src/routes/`. Add a `.tsx` file and the route is live.

4. **Per-page footers** — There is no global footer component. Each page has its own `<footer>`. When adding a new nav link, update the footer in every page.

5. **Database migration is lazy** — `ensureTables()` in `src/lib/db-setup.ts` uses `CREATE TABLE IF NOT EXISTS` and is called at the top of every server function. No migration tool — just edit the SQL.

## File Structure Walkthrough

```
src/
├── routes/
│   ├── __root.tsx              # Root layout — Nav component + Outlet
│   ├── index.tsx               # Landing page with email capture
│   ├── api.tsx                 # API reference docs page
│   ├── network.tsx             # Network stats dashboard
│   ├── discover.tsx            # Node discovery / browse page
│   ├── register.tsx            # Node registration form
│   ├── docs.tsx                # Developer documentation
│   ├── nodes/
│   │   ├── index.tsx           # Node search results
│   │   ├── $id.tsx             # Node public profile
│   │   └── $id/dashboard.tsx   # Node management dashboard (auth-gated)
│   ├── spec/                   # Protocol specification pages
│   └── knowledge/              # Knowledge graph pages (browse, contribute, entities)
├── lib/
│   ├── nodes.ts                # All node-related server functions
│   ├── knowledge.ts            # Knowledge graph server functions
│   ├── auth.ts                 # Auth utilities
│   ├── api-handler.ts          # Custom REST API handler (mounted in serve.ts)
│   └── db-setup.ts             # Table creation / migration
├── db.ts                       # Database connection (neon + pool)
└── styles/app.css              # Tailwind imports
```

## Server Function Patterns

Server functions are the primary data layer. They're defined with `createServerFn` and called from components like regular async functions.

### Read Example (GET)

```typescript
// In src/lib/nodes.ts
import { createServerFn } from "@tanstack/react-start";
import { pool } from "~/db";
import { ensureTables } from "./db-setup";

export const getNode = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { id?: string } | null;
    if (!d?.id || typeof d.id !== "string") throw new Error("Node ID is required");
    return { id: d.id.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      "SELECT id, name, node_type FROM nodes WHERE id = $1",
      [data.id]
    );
    if (result.rows.length === 0) return null;
    return coerceNode(result.rows[0]);
  });
```

### Write Example with Auth (POST)

```typescript
export const updateNode = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    // Validate input shape
    return { id: d.id, name: d.name, node_type: d.node_type };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check — pass authKey from client
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.id);

    const p = pool();
    await p.query("UPDATE nodes SET name = $1 WHERE id = $2", [data.name, data.id]);
    // Log activity...
  });
```

### Aggregation with Pool

```typescript
// For parameterized queries ($1, $2), use pool().query()
const p = pool();
const result = await p.query(
  "SELECT COUNT(*)::int as total FROM nodes WHERE status = $1",
  ["active"]
);
const total = Number(result.rows[0].total);
```

### Calling from a Component

```typescript
import { getNode } from "~/lib/nodes";

function MyComponent() {
  const [node, setNode] = useState(null);
  useEffect(() => {
    getNode({ id: "abc-123" }).then(setNode);
  }, []);
}
```

## Database Schema

8 tables in Neon Postgres:

- **nodes** — Core identity. Fields: `id` (UUID PK), `name`, `node_type`, `description`, `public_key`, `trust_level` (1-5), `status`, `capabilities` (JSONB), `policies` (JSONB), `metadata` (JSONB), timestamps.
- **subscribers** — Email capture. Fields: `id`, `email` (UNIQUE), `subscribed_at`.
- **activity_log** — Event log. Fields: `id`, `node_id` (FK→nodes), `action`, `details`, `created_at`.
- **connections** — Node relationships. Fields: `id`, `requester_id` (FK→nodes), `target_id` (FK→nodes), `status` (pending/accepted/rejected), timestamps.
- **workflows** — Collaboration records. Fields: `id`, `connection_id` (FK→connections), `requester_id`, `provider_id`, `query`, `result`, `status`, timestamps.
- **knowledge_entities** — Graph nodes. Fields: `id`, `name`, `entity_type`, `description`, `domain`, `contributor_node_id`, `metadata`, timestamps.
- **knowledge_relationships** — Graph edges. Fields: `id`, `source_entity_id`, `target_entity_id`, `relationship_type`, `description`, `contributor_node_id`, `created_at`.
- **api_keys** — Auth keys. Fields: `id`, `node_id` (FK→nodes), `key_hash` (SHA-256), `label`, `created_at`. UNIQUE on (node_id, label).

## API Handler Pattern

The REST API (`src/lib/api-handler.ts`) is a standalone custom handler — NOT TanStack Start server functions. It's mounted in `serve.ts`:

```typescript
// serve.ts
import { handleApiRequest } from "./src/lib/api-handler";

// In request handler:
const apiResponse = await handleApiRequest(req);
if (apiResponse) return apiResponse;
```

The handler:
1. Checks if the URL starts with `/api/nexus/v1/`
2. Handles CORS preflight (OPTIONS)
3. Routes to handler functions by method + path
4. Returns JSON responses with proper status codes
5. Uses its own database pool (separate from `src/db.ts`)
6. Authenticates via Bearer token → SHA-256 hash → `api_keys` table lookup

### Adding a New Endpoint

1. Add a handler function in `api-handler.ts` (e.g., `handleGetXxx`)
2. Add a route match in the `handleApiRequest` router section
3. Ensure tables with `ensureTables()` (it's called once at entry)

## Auth System Overview

- API keys use `nnp_` prefix (32 hex chars = 16 random bytes)
- Keys are SHA-256 hashed before storage — raw key shown only once at registration
- Auth is Bearer token: `Authorization: Bearer nnp_a1b2c3...`
- `verifyApiKey(key)` returns `{ valid: boolean, node_id?: string }`
- `requireAuth(authKey, expectedNodeId)` throws if auth fails
- Server functions pass `authKey` from the client in the data payload
- The REST API handler reads the `Authorization` header directly

## Common Gotchas

1. **Date coercion** — PostgreSQL timestamps come back as JS Date objects. React can't render them. Always coerce to `String(row.created_at)` in server function returns.

2. **Bun-native crypto** — Never `import { createHash } from "node:crypto"`. Use `new Bun.CryptoHasher("sha256")`. The `node:crypto` import breaks in some Bun/Vite configurations.

3. **Vite caching** — If changes don't appear, clear caches: `rm -rf node_modules/.vite dist .run && bun run publish`.

4. **Pool vs sql()** — Use `sql()` for simple tagged-template queries. Use `pool()` for parameterized queries with `$1` placeholders. Don't mix them — `sql()` uses `neon()`, `pool()` uses `Pool`.

5. **JSONB columns** — PostgreSQL stores JSONB as objects. When reading, they come back as parsed JSON. When writing, stringify with `JSON.stringify()`.

6. **Footnote: per-page footers** — Adding a new nav item means updating the `<footer>` in every page. There's no shared footer component.

## Build & Deploy

```bash
# Development
bun run dev         # Vite dev server with HMR

# Production build
bun run build       # Vite build only (output in dist/)

# Publish (build + serve)
bun run publish     # Builds with Vite, serves with Bun on port 3000

# Format code
bun run format      # Prettier
```

The live site is auto-published to port 3000. The `publish.sh` script handles build and server startup.
