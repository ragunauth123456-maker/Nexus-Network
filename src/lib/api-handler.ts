// API handler for serve.ts — handles /api/nexus/v1/* requests.
// Uses @neondatabase/serverless Pool for all database access.

import { Pool } from "@neondatabase/serverless";
// Bun-native SHA-256
function createHash_sha256(key: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(key);
  return hasher.digest("hex") as string;
}

// ──────────────────────────────────────────
// DB helpers
// ──────────────────────────────────────────

let _pool: InstanceType<typeof Pool> | null = null;
function getPool(): InstanceType<typeof Pool> {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  _pool = new Pool({ connectionString: url });
  return _pool;
}

let _tablesReady = false;
async function ensureTables(): Promise<void> {
  if (_tablesReady) return;
  const p = getPool();
  await p.query(`CREATE TABLE IF NOT EXISTS nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    node_type TEXT NOT NULL,
    description TEXT,
    public_key TEXT DEFAULT '',
    trust_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    capabilities JSONB DEFAULT '[]',
    policies JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    query TEXT DEFAULT '',
    result TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS knowledge_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    description TEXT,
    domain TEXT DEFAULT 'general',
    contributor_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID REFERENCES knowledge_entities(id) ON DELETE CASCADE NOT NULL,
    target_entity_id UUID REFERENCES knowledge_entities(id) ON DELETE CASCADE NOT NULL,
    relationship_type TEXT NOT NULL,
    description TEXT,
    contributor_node_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`);
  await p.query(`CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID REFERENCES nodes(id) NOT NULL,
    key_hash TEXT NOT NULL,
    label TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(node_id, label)
  )`);
  _tablesReady = true;
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function hashKey(key: string): string {
  return createHash_sha256(key);
}

function generateApiKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return "nnp_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function authenticateRequest(req: Request): Promise<{ authenticated: boolean; node_id?: string }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { authenticated: false };
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) return { authenticated: false };
  const key = match[1].trim();
  if (!key.startsWith("nnp_")) return { authenticated: false };
  const hash = hashKey(key);
  const p = getPool();
  const result = await p.query("SELECT node_id FROM api_keys WHERE key_hash = $1 LIMIT 1", [hash]);
  if (result.rows.length === 0) return { authenticated: false };
  return { authenticated: true, node_id: String(result.rows[0].node_id) };
}

// ──────────────────────────────────────────
// JSON helpers
// ──────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function errorJson(message: string, status: number): Response {
  return json({ error: message }, status);
}

async function parseBody(req: Request): Promise<Record<string, unknown>> {
  try { return await req.json(); } catch { return {}; }
}

// ──────────────────────────────────────────
// Type helpers
// ──────────────────────────────────────────

interface Capability {
  name: string;
  category: string;
  description: string;
}

function parseJsonArray(val: unknown): Capability[] {
  if (Array.isArray(val)) return val as Capability[];
  if (typeof val === "string") {
    try { return JSON.parse(val) as Capability[]; } catch { return []; }
  }
  return [];
}

function parseJsonObject(val: unknown): Record<string, unknown> {
  if (val && typeof val === "object" && !Array.isArray(val)) return val as Record<string, unknown>;
  if (typeof val === "string") {
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return {}; }
  }
  return {};
}

function coerceNode(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    node_type: String(row.node_type),
    description: row.description ? String(row.description) : null,
    public_key: String(row.public_key ?? ""),
    trust_level: Number(row.trust_level ?? 1),
    status: String(row.status ?? "pending"),
    capabilities: parseJsonArray(row.capabilities),
    policies: parseJsonObject(row.policies),
    metadata: parseJsonObject(row.metadata),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function coerceConnection(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    requester_id: String(row.requester_id),
    target_id: String(row.target_id),
    status: String(row.status),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    requester_name: row.requester_name ? String(row.requester_name) : undefined,
    requester_type: row.requester_type ? String(row.requester_type) : undefined,
    target_name: row.target_name ? String(row.target_name) : undefined,
    target_type: row.target_type ? String(row.target_type) : undefined,
  };
}

function coerceWorkflow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    connection_id: String(row.connection_id),
    requester_id: String(row.requester_id),
    provider_id: String(row.provider_id),
    query: String(row.query ?? ""),
    result: String(row.result ?? ""),
    status: String(row.status),
    created_at: String(row.created_at),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    requester_name: row.requester_name ? String(row.requester_name) : undefined,
    provider_name: row.provider_name ? String(row.provider_name) : undefined,
  };
}

function coerceEntity(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    entity_type: String(row.entity_type),
    description: row.description ? String(row.description) : null,
    domain: String(row.domain ?? "general"),
    contributor_node_id: row.contributor_node_id ? String(row.contributor_node_id) : null,
    contributor_name: row.contributor_name ? String(row.contributor_name) : null,
    metadata: parseJsonObject(row.metadata),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function coerceRelationship(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    source_entity_id: String(row.source_entity_id),
    source_name: String(row.source_name ?? "Unknown"),
    target_entity_id: String(row.target_entity_id),
    target_name: String(row.target_name ?? "Unknown"),
    relationship_type: String(row.relationship_type),
    description: row.description ? String(row.description) : null,
    contributor_node_id: row.contributor_node_id ? String(row.contributor_node_id) : null,
    created_at: String(row.created_at),
  };
}

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────

const NODE_COLS = "id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at::text AS created_at, updated_at::text AS updated_at";

const VALID_TYPES = [
  "human", "ai_agent", "company", "government", "hospital",
  "university", "factory", "vehicle", "robot", "digital_twin",
  "iot_device", "other",
];

const ENTITY_TYPES = [
  "project", "contract", "research", "guideline", "regulation",
  "equipment", "organization", "person", "software", "asset",
  "infrastructure", "concept", "other",
];

const DOMAINS = [
  "healthcare", "manufacturing", "energy", "education", "aviation",
  "maritime", "agriculture", "construction", "finance", "logistics",
  "defense", "space", "general",
];

// ── Nodes ──

async function handleGetNodes(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const types = url.searchParams.get("types") ?? "";
  const cat = url.searchParams.get("cat") ?? "";
  const trust = url.searchParams.get("trust") ?? "";
  const sort = url.searchParams.get("sort") ?? "newest";
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

  const p = getPool();

  if (!q && !types && !cat && !trust) {
    const result = await p.query(`SELECT ${NODE_COLS} FROM nodes ORDER BY created_at DESC`);
    return json({ nodes: result.rows.map((r) => coerceNode(r as Record<string, unknown>)), total: result.rows.length });
  }

  const conditions: string[] = [];
  const params: unknown[] = [];
  let pi = 1;

  if (q) {
    conditions.push(`(name ILIKE $${pi} OR description ILIKE $${pi} OR capabilities::text ILIKE $${pi})`);
    params.push("%" + q + "%");
    pi++;
  }
  if (types) {
    const typeList = types.split(",").filter(Boolean);
    if (typeList.length > 0) {
      conditions.push(`node_type = ANY($${pi}::text[])`);
      params.push(typeList);
      pi++;
    }
  }
  if (cat) {
    conditions.push(`capabilities @> $${pi}::jsonb`);
    params.push(JSON.stringify([{ category: cat }]));
    pi++;
  }
  if (trust) {
    conditions.push(`trust_level >= $${pi}`);
    params.push(parseInt(trust, 10));
    pi++;
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  let orderClause = "ORDER BY created_at DESC";
  if (sort === "trust") orderClause = "ORDER BY trust_level DESC, created_at DESC";
  if (sort === "name") orderClause = "ORDER BY name ASC, created_at DESC";

  const countResult = await p.query(`SELECT COUNT(*) as total FROM nodes ${whereClause}`, params);
  const total = Number((countResult.rows[0] as Record<string, unknown>).total ?? 0);

  const fetchResult = await p.query(
    `SELECT ${NODE_COLS} FROM nodes ${whereClause} ${orderClause} LIMIT $${pi} OFFSET $${pi + 1}`,
    [...params, limit, offset]
  );
  return json({ nodes: fetchResult.rows.map((r) => coerceNode(r as Record<string, unknown>)), total });
}

async function handlePostNodes(req: Request): Promise<Response> {
  const body = await parseBody(req);

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return errorJson("Node name is required", 400);
  if (name.length > 200) return errorJson("Node name must be under 200 characters", 400);

  const node_type = typeof body.node_type === "string" ? body.node_type.trim() : "";
  if (!VALID_TYPES.includes(node_type)) return errorJson(`Invalid node type. Must be one of: ${VALID_TYPES.join(", ")}`, 400);

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > 2000) return errorJson("Description must be under 2000 characters", 400);

  const trust_level = typeof body.trust_level === "number" ? body.trust_level : 1;
  if (!Number.isInteger(trust_level) || trust_level < 1 || trust_level > 5) return errorJson("Trust level must be an integer between 1 and 5", 400);

  const capabilities: Capability[] = [];
  if (Array.isArray(body.capabilities)) {
    for (const cap of body.capabilities) {
      if (cap && typeof cap === "object") {
        const c = cap as Record<string, unknown>;
        const capName = typeof c.name === "string" ? c.name.trim() : "";
        if (capName) {
          capabilities.push({
            name: capName,
            category: typeof c.category === "string" ? c.category.trim() : "other",
            description: typeof c.description === "string" ? c.description.trim() : "",
          });
        }
      }
    }
  }

  const p = getPool();
  const result = await p.query(
    `INSERT INTO nodes (name, node_type, description, trust_level, capabilities, status)
     VALUES ($1, $2, $3, $4, $5, 'active')
     RETURNING id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at::text AS created_at, updated_at::text AS updated_at`,
    [name, node_type, description || null, trust_level, JSON.stringify(capabilities)]
  );
  const node = coerceNode(result.rows[0] as Record<string, unknown>);

  // Generate API key
  const rawKey = generateApiKey();
  const keyHash = hashKey(rawKey);
  await p.query(
    "INSERT INTO api_keys (node_id, key_hash, label) VALUES ($1, $2, 'default')",
    [node.id, keyHash]
  );

  await p.query(
    "INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [node.id, "node_registered", "Node registered as " + node_type]
  );

  return json({ node, api_key: rawKey }, 201);
}

async function handleGetNode(id: string): Promise<Response> {
  if (!isValidUUID(id)) return errorJson("Node not found", 404);
  const p = getPool();
  const result = await p.query(`SELECT ${NODE_COLS} FROM nodes WHERE id = $1`, [id]);
  if (result.rows.length === 0) return errorJson("Node not found", 404);
  return json(coerceNode(result.rows[0] as Record<string, unknown>));
}

async function handlePatchNode(id: string, req: Request): Promise<Response> {
  if (!isValidUUID(id)) return errorJson("Node not found", 404);

  // Auth required for PATCH
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return errorJson("Unauthorized", 401);
  if (auth.node_id !== id) return errorJson("Unauthorized: API key does not match this node", 403);

  const body = await parseBody(req);
  const p = getPool();

  const existing = await p.query("SELECT id FROM nodes WHERE id = $1", [id]);
  if (existing.rows.length === 0) return errorJson("Node not found", 404);

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return errorJson("Node name is required", 400);
  if (name.length > 200) return errorJson("Node name must be under 200 characters", 400);

  const node_type = typeof body.node_type === "string" ? body.node_type.trim() : "";
  if (!VALID_TYPES.includes(node_type)) return errorJson(`Invalid node type. Must be one of: ${VALID_TYPES.join(", ")}`, 400);

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > 2000) return errorJson("Description must be under 2000 characters", 400);

  const trust_level = typeof body.trust_level === "number" ? body.trust_level : 1;
  if (!Number.isInteger(trust_level) || trust_level < 1 || trust_level > 5) return errorJson("Trust level must be an integer between 1 and 5", 400);

  const result = await p.query(
    `UPDATE nodes SET name = $1, node_type = $2, description = $3, trust_level = $4, updated_at = NOW()
     WHERE id = $5 RETURNING ${NODE_COLS}`,
    [name, node_type, description || null, trust_level, id]
  );

  await p.query(
    "INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [id, "node_updated", "Node profile updated"]
  );

  return json(coerceNode(result.rows[0] as Record<string, unknown>));
}

// ── Discovery ──

async function handleDiscoverySearch(req: Request): Promise<Response> {
  return handleGetNodes(req);
}

// ── Knowledge Entities ──

async function handleGetEntities(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const entity_type = url.searchParams.get("entity_type") ?? "";
  const domain = url.searchParams.get("domain") ?? "";
  const sort = url.searchParams.get("sort") ?? "newest";
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get("offset") ?? "0", 10) || 0, 0);

  const p = getPool();
  const conditions: string[] = [];
  const params: unknown[] = [];
  let pi = 1;

  if (q) {
    conditions.push(`(e.name ILIKE $${pi} OR e.description ILIKE $${pi} OR e.entity_type ILIKE $${pi})`);
    params.push("%" + q + "%");
    pi++;
  }
  if (entity_type) {
    conditions.push(`e.entity_type = $${pi}`);
    params.push(entity_type);
    pi++;
  }
  if (domain) {
    conditions.push(`e.domain = $${pi}`);
    params.push(domain);
    pi++;
  }

  const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
  const orderClause = sort === "name" ? "ORDER BY e.name ASC, e.created_at DESC" : "ORDER BY e.created_at DESC";

  const countResult = await p.query(`SELECT COUNT(*) as total FROM knowledge_entities e ${whereClause}`, params);
  const total = Number((countResult.rows[0] as Record<string, unknown>).total ?? 0);

  const fetchResult = await p.query(
    `SELECT e.id, e.name, e.entity_type, e.description, e.domain, e.contributor_node_id, e.metadata,
            e.created_at::text AS created_at, e.updated_at::text AS updated_at, n.name AS contributor_name
     FROM knowledge_entities e LEFT JOIN nodes n ON e.contributor_node_id = n.id
     ${whereClause} ${orderClause} LIMIT $${pi} OFFSET $${pi + 1}`,
    [...params, limit, offset]
  );
  return json({ entities: fetchResult.rows.map((r) => coerceEntity(r as Record<string, unknown>)), total });
}

async function handlePostEntity(req: Request): Promise<Response> {
  const body = await parseBody(req);

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return errorJson("Entity name is required", 400);
  if (name.length > 300) return errorJson("Entity name must be under 300 characters", 400);

  const entity_type = typeof body.entity_type === "string" ? body.entity_type.trim() : "";
  if (!ENTITY_TYPES.includes(entity_type)) return errorJson(`Invalid entity type. Must be one of: ${ENTITY_TYPES.join(", ")}`, 400);

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length > 5000) return errorJson("Description must be under 5000 characters", 400);

  const domain = typeof body.domain === "string" && DOMAINS.includes(body.domain) ? body.domain.trim() : "general";
  const contributor_node_id = typeof body.contributor_node_id === "string" ? body.contributor_node_id.trim() : null;

  // Auth required for POST
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return errorJson("Unauthorized", 401);

  const p = getPool();
  const result = await p.query(
    `INSERT INTO knowledge_entities (name, entity_type, description, domain, contributor_node_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, entity_type, description, domain, contributor_node_id, metadata,
               created_at::text AS created_at, updated_at::text AS updated_at`,
    [name, entity_type, description || null, domain, contributor_node_id]
  );
  const entity = coerceEntity(result.rows[0] as Record<string, unknown>);

  if (contributor_node_id) {
    const nodeResult = await p.query("SELECT name FROM nodes WHERE id = $1", [contributor_node_id]);
    const nodeName = nodeResult.rows.length > 0 ? String(nodeResult.rows[0].name) : "Unknown";
    await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
      [contributor_node_id, "entity_created", "Created knowledge entity: " + name]);
    entity.contributor_name = nodeName;
  }

  return json(entity, 201);
}

async function handleGetEntity(id: string): Promise<Response> {
  if (!isValidUUID(id)) return errorJson("Entity not found", 404);
  const p = getPool();
  const result = await p.query(
    `SELECT e.id, e.name, e.entity_type, e.description, e.domain, e.contributor_node_id, e.metadata,
            e.created_at::text AS created_at, e.updated_at::text AS updated_at, n.name AS contributor_name
     FROM knowledge_entities e LEFT JOIN nodes n ON e.contributor_node_id = n.id WHERE e.id = $1`,
    [id]
  );
  if (result.rows.length === 0) return errorJson("Entity not found", 404);

  const relResult = await p.query(
    `SELECT r.id, r.source_entity_id, se.name AS source_name, r.target_entity_id, te.name AS target_name,
            r.relationship_type, r.description, r.contributor_node_id, r.created_at::text AS created_at
     FROM knowledge_relationships r
     JOIN knowledge_entities se ON r.source_entity_id = se.id
     JOIN knowledge_entities te ON r.target_entity_id = te.id
     WHERE r.source_entity_id = $1 OR r.target_entity_id = $1
     ORDER BY r.created_at DESC`,
    [id]
  );

  const entity = coerceEntity(result.rows[0] as Record<string, unknown>);
  const relationships = relResult.rows.map((r) => coerceRelationship(r as Record<string, unknown>));
  return json({ ...entity, relationships });
}

// ── Connections ──

async function handleGetConnections(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const node_id = url.searchParams.get("node_id");
  if (!node_id) return errorJson("Query parameter 'node_id' is required", 400);

  const p = getPool();
  const result = await p.query(
    `SELECT c.id, c.requester_id, c.target_id, c.status, c.created_at::text AS created_at, c.updated_at::text AS updated_at,
            r.name AS requester_name, r.node_type AS requester_type,
            t.name AS target_name, t.node_type AS target_type
     FROM connections c JOIN nodes r ON c.requester_id = r.id JOIN nodes t ON c.target_id = t.id
     WHERE c.requester_id = $1 OR c.target_id = $1 ORDER BY c.created_at DESC`,
    [node_id]
  );
  return json(result.rows.map((r) => coerceConnection(r as Record<string, unknown>)));
}

async function handlePostConnection(req: Request): Promise<Response> {
  const body = await parseBody(req);
  const requesterId = typeof body.requester_id === "string" ? body.requester_id.trim() : "";
  const targetId = typeof body.target_id === "string" ? body.target_id.trim() : "";

  if (!requesterId) return errorJson("Requester ID is required", 400);
  if (!targetId) return errorJson("Target ID is required", 400);
  if (requesterId === targetId) return errorJson("Cannot connect a node to itself", 400);

  // Auth required — key must match requester
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return errorJson("Unauthorized", 401);
  if (auth.node_id !== requesterId) return errorJson("Unauthorized: API key does not match requester", 403);

  const p = getPool();

  const existing = await p.query(
    "SELECT id, status FROM connections WHERE (requester_id = $1 AND target_id = $2) OR (requester_id = $3 AND target_id = $4) LIMIT 1",
    [requesterId, targetId, targetId, requesterId]
  );
  if (existing.rows.length > 0) {
    return errorJson(`Connection already exists with status: ${existing.rows[0].status}`, 409);
  }

  const result = await p.query(
    `INSERT INTO connections (requester_id, target_id, status)
     VALUES ($1, $2, 'pending')
     RETURNING id, requester_id, target_id, status, created_at::text AS created_at, updated_at::text AS updated_at`,
    [requesterId, targetId]
  );

  const reqNode = await p.query("SELECT name FROM nodes WHERE id = $1", [requesterId]);
  const targetNode = await p.query("SELECT name FROM nodes WHERE id = $1", [targetId]);
  const reqName = reqNode.rows.length > 0 ? String(reqNode.rows[0].name) : "Unknown";
  const tgtName = targetNode.rows.length > 0 ? String(targetNode.rows[0].name) : "Unknown";

  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [requesterId, "connection_requested", "Connection requested with " + tgtName]);
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [targetId, "connection_requested", "Connection requested from " + reqName]);

  return json(coerceConnection(result.rows[0] as Record<string, unknown>), 201);
}

async function handlePatchConnection(id: string, req: Request): Promise<Response> {
  if (!isValidUUID(id)) return errorJson("Connection not found", 404);
  const body = await parseBody(req);
  const action = body.action;
  if (action !== "accept" && action !== "reject") return errorJson("Action must be 'accept' or 'reject'", 400);

  // Auth required — key must match target node
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return errorJson("Unauthorized", 401);

  const p = getPool();

  // Get target_id for auth check
  const connCheck = await p.query("SELECT target_id FROM connections WHERE id = $1", [id]);
  if (connCheck.rows.length === 0) return errorJson("Connection not found", 404);
  const targetId = String(connCheck.rows[0].target_id);
  if (auth.node_id !== targetId) return errorJson("Unauthorized: API key does not match target node", 403);
  const newStatus = action === "accept" ? "accepted" : "rejected";

  const result = await p.query(
    `UPDATE connections SET status = $1, updated_at = NOW()
     WHERE id = $2 AND status = 'pending'
     RETURNING id, requester_id, target_id, status, created_at::text AS created_at, updated_at::text AS updated_at`,
    [newStatus, id]
  );
  if (result.rows.length === 0) return errorJson("Connection not found or not in pending state", 404);

  const conn = result.rows[0] as Record<string, unknown>;
  const reqNode = await p.query("SELECT name FROM nodes WHERE id = $1", [String(conn.requester_id)]);
  const targetNode = await p.query("SELECT name FROM nodes WHERE id = $1", [String(conn.target_id)]);
  const reqName = reqNode.rows.length > 0 ? String(reqNode.rows[0].name) : "Unknown";
  const tgtName = targetNode.rows.length > 0 ? String(targetNode.rows[0].name) : "Unknown";

  const actionLabel = action === "accept" ? "accepted" : "rejected";
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [String(conn.requester_id), "connection_" + actionLabel, "Connection with " + tgtName + " " + actionLabel]);
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [String(conn.target_id), "connection_" + actionLabel, "Connection with " + reqName + " " + actionLabel]);

  return json(coerceConnection(conn));
}

// ── Workflows ──

async function handleGetWorkflows(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const node_id = url.searchParams.get("node_id");
  if (!node_id) return errorJson("Query parameter 'node_id' is required", 400);

  const p = getPool();
  const result = await p.query(
    `SELECT w.id, w.connection_id, w.requester_id, w.provider_id, w.query, w.result, w.status,
            w.created_at::text AS created_at, w.completed_at::text AS completed_at,
            r.name AS requester_name, p2.name AS provider_name
     FROM workflows w JOIN nodes r ON w.requester_id = r.id JOIN nodes p2 ON w.provider_id = p2.id
     WHERE w.requester_id = $1 OR w.provider_id = $1 ORDER BY w.created_at DESC`,
    [node_id]
  );
  return json(result.rows.map((r) => coerceWorkflow(r as Record<string, unknown>)));
}

async function handlePostWorkflow(req: Request): Promise<Response> {
  const body = await parseBody(req);
  const connectionId = typeof body.connection_id === "string" ? body.connection_id.trim() : "";
  const requesterId = typeof body.requester_id === "string" ? body.requester_id.trim() : "";
  const providerId = typeof body.provider_id === "string" ? body.provider_id.trim() : "";
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (!connectionId || !requesterId || !providerId || !query) {
    return errorJson("All of 'connection_id', 'requester_id', 'provider_id', and 'query' are required", 400);
  }

  // Auth required — key must match requester
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) return errorJson("Unauthorized", 401);
  if (auth.node_id !== requesterId) return errorJson("Unauthorized: API key does not match requester", 403);

  const p = getPool();

  const conn = await p.query(
    "SELECT id, status FROM connections WHERE id = $1 AND status = 'accepted'",
    [connectionId]
  );
  if (conn.rows.length === 0) return errorJson("Connection not found or not accepted", 400);

  const result = await p.query(
    `INSERT INTO workflows (connection_id, requester_id, provider_id, query, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id, connection_id, requester_id, provider_id, query, result, status, created_at::text AS created_at, completed_at`,
    [connectionId, requesterId, providerId, query]
  );
  const workflow = result.rows[0] as Record<string, unknown>;

  const reqNode = await p.query("SELECT name FROM nodes WHERE id = $1", [requesterId]);
  const provNode = await p.query("SELECT name FROM nodes WHERE id = $1", [providerId]);
  const provName = provNode.rows.length > 0 ? String(provNode.rows[0].name) : "Unknown";
  const reqName = reqNode.rows.length > 0 ? String(reqNode.rows[0].name) : "Unknown";

  const summary = query.length > 40 ? query.substring(0, 40) + "..." : query;
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [requesterId, "workflow_started", "Workflow started: " + summary]);
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [providerId, "workflow_started", "Workflow received from " + reqName + ": " + summary]);

  const simulatedResult = `[${provName}] has processed your query about "${summary}". Analysis complete. Results would be delivered here in the full protocol.`;
  const updated = await p.query(
    `UPDATE workflows SET result = $1, status = 'completed', completed_at = NOW()
     WHERE id = $2
     RETURNING id, connection_id, requester_id, provider_id, query, result, status, created_at::text AS created_at, completed_at`,
    [simulatedResult, String(workflow.id)]
  );

  const finalWf = updated.rows[0] as Record<string, unknown>;
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [requesterId, "workflow_completed", "Workflow completed with " + provName]);
  await p.query("INSERT INTO activity_log (node_id, action, details) VALUES ($1, $2, $3)",
    [providerId, "workflow_completed", "Workflow completed with " + reqName]);

  return json(coerceWorkflow({ ...finalWf, requester_name: reqName, provider_name: provName }), 201);
}

// ──────────────────────────────────────────
// Router
// ──────────────────────────────────────────

export async function handleApiRequest(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (!pathname.startsWith("/api/nexus/v1/")) return null;

  // Ensure database tables exist
  try { await ensureTables(); } catch (e: any) { console.error("ensureTables failed:", e.message); }

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const method = req.method.toUpperCase();

  try {
    // ── Nodes ──
    if (pathname === "/api/nexus/v1/nodes") {
      if (method === "GET") return handleGetNodes(req);
      if (method === "POST") return handlePostNodes(req);
    }

    const nodeMatch = pathname.match(/^\/api\/nexus\/v1\/nodes\/([^/]+)$/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      if (method === "GET") return handleGetNode(id);
      if (method === "PATCH") return handlePatchNode(id, req);
    }

    // ── Discovery ──
    if (pathname === "/api/nexus/v1/discovery/search") {
      if (method === "GET") return handleDiscoverySearch(req);
    }

    // ── Knowledge ──
    if (pathname === "/api/nexus/v1/knowledge/entities") {
      if (method === "GET") return handleGetEntities(req);
      if (method === "POST") return handlePostEntity(req);
    }

    const entityMatch = pathname.match(/^\/api\/nexus\/v1\/knowledge\/entities\/([^/]+)$/);
    if (entityMatch) {
      if (method === "GET") return handleGetEntity(entityMatch[1]);
    }

    // ── Connections ──
    if (pathname === "/api/nexus/v1/connections") {
      if (method === "GET") return handleGetConnections(req);
      if (method === "POST") return handlePostConnection(req);
    }

    const connMatch = pathname.match(/^\/api\/nexus\/v1\/connections\/([^/]+)$/);
    if (connMatch) {
      if (method === "PATCH") return handlePatchConnection(connMatch[1], req);
    }

    // ── Workflows ──
    if (pathname === "/api/nexus/v1/workflows") {
      if (method === "GET") return handleGetWorkflows(req);
      if (method === "POST") return handlePostWorkflow(req);
    }

    return errorJson(`No ${method} handler for ${pathname}`, 404);
  } catch (err: any) {
    console.error("API error:", err.message || err);
    return errorJson(err.message || "Internal server error", 500);
  }
}
