import { createServerFn } from "@tanstack/react-start";
import { sql, pool } from "~/db";
import { ensureTables } from "./db-setup";

// ──────────────────────────────────────────
// Inline auth helpers (Bun-native — server only)
// ──────────────────────────────────────────
function hashKey(key: string): string {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(key);
  return hasher.digest("hex") as string;
}
function generateApiKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return "nnp_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function maskKey(key: string): string {
  if (key.length <= 16) return key.slice(0, 8) + "\u2026";
  return key.slice(0, 8) + "\u2026" + key.slice(-4);
}
async function verifyApiKey(key: string): Promise<{ valid: boolean; node_id?: string }> {
  if (!key || typeof key !== "string" || !key.startsWith("nnp_")) return { valid: false };
  await ensureTables();
  const h = hashKey(key);
  const rows = await sql()`SELECT node_id FROM api_keys WHERE key_hash = ${h} LIMIT 1`;
  if (rows.length === 0) return { valid: false };
  return { valid: true, node_id: String(rows[0].node_id) };
}
async function requireAuth(authKey: string | undefined, expectedNodeId: string): Promise<void> {
  if (!authKey) return;
  const result = await verifyApiKey(authKey);
  if (!result.valid) throw new Error("Unauthorized: invalid API key");
  if (result.node_id !== expectedNodeId) throw new Error("Unauthorized: API key does not match this node");
}

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface Capability {
  name: string;
  category: string;
  description: string;
}

export interface NodeRow {
  id: string;
  name: string;
  node_type: string;
  description: string | null;
  public_key: string;
  trust_level: number;
  status: string;
  capabilities: Capability[];
  policies: Record<string, unknown>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyRow {
  id: string;
  node_id: string;
  label: string;
  masked_key: string;
  created_at: string;
}

// ──────────────────────────────────────────
// Server fn: Verify an API key (for client use)
// ──────────────────────────────────────────

export const authenticateWithKey = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    const key = typeof d?.key === "string" ? d.key.trim() : "";
    return { key };
  })
  .handler(async ({ data }) => {
    return verifyApiKey(data.key);
  });

// ──────────────────────────────────────────
// Register a new node
// ──────────────────────────────────────────

export const registerNode = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") {
      throw new Error("Request body is required");
    }

    const name = typeof d.name === "string" ? d.name.trim() : "";
    if (!name || name.length === 0) throw new Error("Node name is required");
    if (name.length > 200) throw new Error("Node name must be under 200 characters");

    const validTypes = [
      "human", "ai_agent", "company", "government", "hospital",
      "university", "factory", "vehicle", "robot", "digital_twin",
      "iot_device", "other",
    ];
    const node_type = typeof d.node_type === "string" ? d.node_type.trim() : "";
    if (!validTypes.includes(node_type)) {
      throw new Error(`Invalid node type. Must be one of: ${validTypes.join(", ")}`);
    }

    const description = typeof d.description === "string" ? d.description.trim() : "";
    if (description.length > 2000) throw new Error("Description must be under 2000 characters");

    const trust_level = typeof d.trust_level === "number" ? d.trust_level : 1;
    if (!Number.isInteger(trust_level) || trust_level < 1 || trust_level > 5) {
      throw new Error("Trust level must be an integer between 1 and 5");
    }

    const capabilities: Capability[] = [];
    if (Array.isArray(d.capabilities)) {
      for (const cap of d.capabilities) {
        if (cap && typeof cap === "object") {
          const c = cap as Record<string, unknown>;
          const capName = typeof c.name === "string" ? c.name.trim() : "";
          const capCat = typeof c.category === "string" ? c.category.trim() : "other";
          const capDesc = typeof c.description === "string" ? c.description.trim() : "";
          if (capName) {
            capabilities.push({ name: capName, category: capCat, description: capDesc });
          }
        }
      }
    }

    return { name, node_type, description, trust_level, capabilities };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();
    const rows = await s`
      INSERT INTO nodes (name, node_type, description, trust_level, capabilities, status)
      VALUES (${data.name}, ${data.node_type}, ${data.description}, ${data.trust_level}, ${JSON.stringify(data.capabilities)}, 'active')
      RETURNING id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at
    `;
    const node = coerceNode(rows[0]);

    // Generate an API key for the new node
    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);
    await s`
      INSERT INTO api_keys (node_id, key_hash, label)
      VALUES (${node.id}, ${keyHash}, 'default')
    `;

    // Log registration activity
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${node.id}, 'node_registered', ${'Node registered as ' + data.node_type})
    `;

    return { node, apiKey: rawKey };
  });

// ──────────────────────────────────────────
// Get a single node by ID
// ──────────────────────────────────────────

export const getNode = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { id?: string } | null;
    if (!d?.id || typeof d.id !== "string" || !d.id.trim()) {
      throw new Error("Node ID is required");
    }
    return { id: d.id.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();
    const rows = await s`
      SELECT id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at
      FROM nodes
      WHERE id = ${data.id}
    `;
    if (rows.length === 0) return null;
    return coerceNode(rows[0]);
  });

// ──────────────────────────────────────────
// List all nodes (newest first)
// ──────────────────────────────────────────

export const listNodes = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureTables();
    const s = sql();
    const rows = await s`
      SELECT id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at
      FROM nodes
      ORDER BY created_at DESC
    `;
    return rows.map(coerceNode);
  });

// ──────────────────────────────────────────
// Update a node
// ──────────────────────────────────────────

export const updateNode = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const id = typeof d.id === "string" ? d.id.trim() : "";
    if (!id) throw new Error("Node ID is required");

    const name = typeof d.name === "string" ? d.name.trim() : "";
    if (!name || name.length === 0) throw new Error("Node name is required");
    if (name.length > 200) throw new Error("Node name must be under 200 characters");

    const validTypes = [
      "human", "ai_agent", "company", "government", "hospital",
      "university", "factory", "vehicle", "robot", "digital_twin",
      "iot_device", "other",
    ];
    const node_type = typeof d.node_type === "string" ? d.node_type.trim() : "";
    if (!validTypes.includes(node_type)) {
      throw new Error(`Invalid node type. Must be one of: ${validTypes.join(", ")}`);
    }

    const description = typeof d.description === "string" ? d.description.trim() : "";
    if (description.length > 2000) throw new Error("Description must be under 2000 characters");

    const trust_level = typeof d.trust_level === "number" ? d.trust_level : 1;
    if (!Number.isInteger(trust_level) || trust_level < 1 || trust_level > 5) {
      throw new Error("Trust level must be an integer between 1 and 5");
    }

    return { id, name, node_type, description, trust_level };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.id);

    const s = sql();
    const rows = await s`
      UPDATE nodes
      SET name = ${data.name},
          node_type = ${data.node_type},
          description = ${data.description},
          trust_level = ${data.trust_level},
          updated_at = NOW()
      WHERE id = ${data.id}
      RETURNING id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at
    `;
    if (rows.length === 0) throw new Error("Node not found");

    // Log activity
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.id}, 'node_updated', 'Node profile updated')
    `;

    return coerceNode(rows[0]);
  });

// ──────────────────────────────────────────
// Add a capability to a node
// ──────────────────────────────────────────

export const addCapability = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const nodeId = typeof d.nodeId === "string" ? d.nodeId.trim() : "";
    if (!nodeId) throw new Error("Node ID is required");

    const cap = d.capability as Record<string, unknown> | null;
    if (!cap || typeof cap !== "object") throw new Error("Capability is required");
    const name = typeof cap.name === "string" ? cap.name.trim() : "";
    if (!name) throw new Error("Capability name is required");
    const category = typeof cap.category === "string" ? cap.category.trim() : "other";
    const description = typeof cap.description === "string" ? cap.description.trim() : "";

    return { nodeId, capability: { name, category, description } };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.nodeId);

    const s = sql();

    // Get current capabilities
    const rows = await s`
      SELECT capabilities FROM nodes WHERE id = ${data.nodeId}
    `;
    if (rows.length === 0) throw new Error("Node not found");

    const current = parseJsonArray(rows[0].capabilities);
    current.push(data.capability);

    const updated = await s`
      UPDATE nodes
      SET capabilities = ${JSON.stringify(current)},
          updated_at = NOW()
      WHERE id = ${data.nodeId}
      RETURNING id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at
    `;

    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.nodeId}, 'capability_added', ${'Added capability: ' + data.capability.name})
    `;

    return coerceNode(updated[0]);
  });

// ──────────────────────────────────────────
// Remove a capability from a node
// ──────────────────────────────────────────

export const removeCapability = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const nodeId = typeof d.nodeId === "string" ? d.nodeId.trim() : "";
    if (!nodeId) throw new Error("Node ID is required");
    const index = typeof d.index === "number" ? d.index : -1;
    if (index < 0 || !Number.isInteger(index)) throw new Error("Valid capability index is required");
    return { nodeId, index };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.nodeId);

    const s = sql();

    const rows = await s`
      SELECT capabilities FROM nodes WHERE id = ${data.nodeId}
    `;
    if (rows.length === 0) throw new Error("Node not found");

    const current = parseJsonArray(rows[0].capabilities);
    if (data.index >= current.length) throw new Error("Capability index out of range");

    const removed = current[data.index];
    current.splice(data.index, 1);

    const updated = await s`
      UPDATE nodes
      SET capabilities = ${JSON.stringify(current)},
          updated_at = NOW()
      WHERE id = ${data.nodeId}
      RETURNING id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at
    `;

    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.nodeId}, 'capability_removed', ${'Removed capability: ' + (removed?.name || 'unknown')})
    `;

    return coerceNode(updated[0]);
  });

// ──────────────────────────────────────────
// Get activity log for a node
// ──────────────────────────────────────────

export interface ActivityLogEntry {
  id: string;
  node_id: string;
  action: string;
  details: string;
  created_at: string;
}

export const getNodeActivity = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { nodeId?: string } | null;
    if (!d?.nodeId || typeof d.nodeId !== "string" || !d.nodeId.trim()) {
      throw new Error("Node ID is required");
    }
    return { nodeId: d.nodeId.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();
    const rows = await s`
      SELECT id, node_id, action, details, created_at
      FROM activity_log
      WHERE node_id = ${data.nodeId}
      ORDER BY created_at DESC
    `;
    return rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      node_id: String(r.node_id),
      action: String(r.action),
      details: String(r.details ?? ""),
      created_at: String(r.created_at),
    }));
  });

// ──────────────────────────────────────────
// Search & filter nodes
// ──────────────────────────────────────────

export interface SearchNodesParams {
  query?: string;
  nodeTypes?: string[];
  capabilityCategory?: string;
  minTrust?: number;
  sortBy?: "newest" | "trust" | "name";
  limit?: number;
  offset?: number;
}

export interface SearchNodesResult {
  nodes: NodeRow[];
  total: number;
}

export const searchNodes = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    const query = typeof d?.query === "string" ? d.query.trim() : "";
    const nodeTypes = Array.isArray(d?.nodeTypes)
      ? (d.nodeTypes as string[]).filter((t) => typeof t === "string" && t.length > 0)
      : [];
    const capabilityCategory =
      typeof d?.capabilityCategory === "string" ? d.capabilityCategory.trim() : "";
    const minTrust =
      typeof d?.minTrust === "number" && d.minTrust >= 1 && d.minTrust <= 5 ? d.minTrust : 0;
    const sortBy =
      typeof d?.sortBy === "string" && ["newest", "trust", "name"].includes(d.sortBy)
        ? (d.sortBy as "newest" | "trust" | "name")
        : "newest";
    const limit =
      typeof d?.limit === "number" && d.limit > 0 ? Math.min(Math.floor(d.limit), 100) : 50;
    const offset =
      typeof d?.offset === "number" && d.offset >= 0 ? Math.floor(d.offset) : 0;

    return { query, nodeTypes, capabilityCategory, minTrust, sortBy, limit, offset };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();

    const conditions: string[] = [];
    const params: unknown[] = [];
    let pi = 1;

    if (data.query) {
      const q = "%" + data.query + "%";
      conditions.push(
        "(name ILIKE $" + pi + " OR description ILIKE $" + (pi + 1) + " OR capabilities::text ILIKE $" + (pi + 2) + ")"
      );
      params.push(q, q, q);
      pi += 3;
    }

    if (data.nodeTypes.length > 0) {
      conditions.push("node_type = ANY($" + pi + "::text[])");
      params.push(data.nodeTypes);
      pi += 1;
    }

    if (data.capabilityCategory) {
      conditions.push("capabilities @> $" + pi + "::jsonb");
      params.push(JSON.stringify([{ category: data.capabilityCategory }]));
      pi += 1;
    }

    if (data.minTrust > 0) {
      conditions.push("trust_level >= $" + pi);
      params.push(data.minTrust);
      pi += 1;
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    let orderClause = "ORDER BY created_at DESC";
    if (data.sortBy === "trust") orderClause = "ORDER BY trust_level DESC, created_at DESC";
    if (data.sortBy === "name") orderClause = "ORDER BY name ASC, created_at DESC";

    // Count
    const countSql = "SELECT COUNT(*) as total FROM nodes " + whereClause;
    const countResult = await p.query(countSql, params);
    const total = Number((countResult.rows[0] as Record<string, unknown>).total ?? 0);

    // Fetch
    const fetchSql = "SELECT id, name, node_type, description, public_key, trust_level, status, capabilities, policies, metadata, created_at, updated_at FROM nodes " + whereClause + " " + orderClause + " LIMIT $" + pi + " OFFSET $" + (pi + 1);
    const fetchParams = [...params, data.limit, data.offset];
    const result = await p.query(fetchSql, fetchParams);

    return {
      nodes: result.rows.map((r) => coerceNode(r as Record<string, unknown>)),
      total,
    };
  });

// ──────────────────────────────────────────
// Connection types
// ──────────────────────────────────────────

export interface ConnectionRow {
  id: string;
  requester_id: string;
  target_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_type?: string;
  target_name?: string;
  target_type?: string;
}

export interface WorkflowRow {
  id: string;
  connection_id: string;
  requester_id: string;
  provider_id: string;
  query: string;
  result: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  requester_name?: string;
  provider_name?: string;
}

// ──────────────────────────────────────────
// Request a connection from one node to another
// ──────────────────────────────────────────

export const requestConnection = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const requesterId = typeof d.requesterId === "string" ? d.requesterId.trim() : "";
    const targetId = typeof d.targetId === "string" ? d.targetId.trim() : "";
    if (!requesterId) throw new Error("Requester ID is required");
    if (!targetId) throw new Error("Target ID is required");
    if (requesterId === targetId) throw new Error("Cannot connect a node to itself");
    return { requesterId, targetId };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.requesterId);

    const s = sql();

    // Check if connection already exists
    const existing = await s`
      SELECT id, status FROM connections
      WHERE (requester_id = ${data.requesterId} AND target_id = ${data.targetId})
         OR (requester_id = ${data.targetId} AND target_id = ${data.requesterId})
      LIMIT 1
    `;
    if (existing.length > 0) {
      throw new Error(`Connection already exists with status: ${existing[0].status}`);
    }

    const rows = await s`
      INSERT INTO connections (requester_id, target_id, status)
      VALUES (${data.requesterId}, ${data.targetId}, 'pending')
      RETURNING id, requester_id, target_id, status, created_at, updated_at
    `;

    // Get requester name for activity log
    const reqNode = await s`SELECT name FROM nodes WHERE id = ${data.requesterId}`;
    const targetNode = await s`SELECT name FROM nodes WHERE id = ${data.targetId}`;
    const reqName = reqNode.length > 0 ? String(reqNode[0].name) : "Unknown";
    const tgtName = targetNode.length > 0 ? String(targetNode[0].name) : "Unknown";

    // Log activity on both sides
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.requesterId}, 'connection_requested', ${'Connection requested with ' + tgtName})
    `;
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.targetId}, 'connection_requested', ${'Connection requested from ' + reqName})
    `;

    return coerceConnection(rows[0]);
  });

// ──────────────────────────────────────────
// Accept a connection request
// ──────────────────────────────────────────

export const acceptConnection = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const connectionId = typeof d.connectionId === "string" ? d.connectionId.trim() : "";
    if (!connectionId) throw new Error("Connection ID is required");
    return { connectionId };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();

    // Get target_id for auth check
    const connCheck = await s`
      SELECT requester_id, target_id FROM connections WHERE id = ${data.connectionId}
    `;
    if (connCheck.length === 0) throw new Error("Connection not found");
    const targetId = String(connCheck[0].target_id);

    // Auth check — key must match target node (the one accepting)
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, targetId);

    const rows = await s`
      UPDATE connections
      SET status = 'accepted', updated_at = NOW()
      WHERE id = ${data.connectionId} AND status = 'pending'
      RETURNING id, requester_id, target_id, status, created_at, updated_at
    `;
    if (rows.length === 0) throw new Error("Connection not found or not in pending state");

    const conn = rows[0];
    // Get names
    const reqNode = await s`SELECT name FROM nodes WHERE id = ${conn.requester_id}`;
    const targetNode = await s`SELECT name FROM nodes WHERE id = ${conn.target_id}`;
    const reqName = reqNode.length > 0 ? String(reqNode[0].name) : "Unknown";
    const tgtName = targetNode.length > 0 ? String(targetNode[0].name) : "Unknown";

    // Log activity on both sides
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${conn.requester_id}, 'connection_accepted', ${'Connection with ' + tgtName + ' accepted'})
    `;
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${conn.target_id}, 'connection_accepted', ${'Connection with ' + reqName + ' accepted'})
    `;

    return coerceConnection(conn);
  });

// ──────────────────────────────────────────
// Reject a connection request
// ──────────────────────────────────────────

export const rejectConnection = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const connectionId = typeof d.connectionId === "string" ? d.connectionId.trim() : "";
    if (!connectionId) throw new Error("Connection ID is required");
    return { connectionId };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();

    // Get target_id for auth check
    const connCheck = await s`
      SELECT requester_id, target_id FROM connections WHERE id = ${data.connectionId}
    `;
    if (connCheck.length === 0) throw new Error("Connection not found");
    const targetId = String(connCheck[0].target_id);

    // Auth check — key must match target node (the one rejecting)
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, targetId);

    const rows = await s`
      UPDATE connections
      SET status = 'rejected', updated_at = NOW()
      WHERE id = ${data.connectionId} AND status = 'pending'
      RETURNING id, requester_id, target_id, status, created_at, updated_at
    `;
    if (rows.length === 0) throw new Error("Connection not found or not in pending state");

    const conn = rows[0];
    // Get names
    const reqNode = await s`SELECT name FROM nodes WHERE id = ${conn.requester_id}`;
    const targetNode = await s`SELECT name FROM nodes WHERE id = ${conn.target_id}`;
    const reqName = reqNode.length > 0 ? String(reqNode[0].name) : "Unknown";
    const tgtName = targetNode.length > 0 ? String(targetNode[0].name) : "Unknown";

    // Log activity on both sides
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${conn.requester_id}, 'connection_rejected', ${'Connection with ' + tgtName + ' rejected'})
    `;
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${conn.target_id}, 'connection_rejected', ${'Connection with ' + reqName + ' rejected'})
    `;

    return coerceConnection(conn);
  });

// ──────────────────────────────────────────
// Get all connections for a node (including names)
// ──────────────────────────────────────────

export const getNodeConnections = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { nodeId?: string } | null;
    if (!d?.nodeId || typeof d.nodeId !== "string" || !d.nodeId.trim()) {
      throw new Error("Node ID is required");
    }
    return { nodeId: d.nodeId.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT
         c.id, c.requester_id, c.target_id, c.status,
         c.created_at::text AS created_at, c.updated_at::text AS updated_at,
         r.name AS requester_name, r.node_type AS requester_type,
         t.name AS target_name, t.node_type AS target_type
       FROM connections c
       JOIN nodes r ON c.requester_id = r.id
       JOIN nodes t ON c.target_id = t.id
       WHERE c.requester_id = $1 OR c.target_id = $1
       ORDER BY c.created_at DESC`,
      [data.nodeId]
    );
    return result.rows.map(coerceConnectionJoined);
  });

// ──────────────────────────────────────────
// Get pending incoming requests for a node
// ──────────────────────────────────────────

export const getPendingRequests = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { nodeId?: string } | null;
    if (!d?.nodeId || typeof d.nodeId !== "string" || !d.nodeId.trim()) {
      throw new Error("Node ID is required");
    }
    return { nodeId: d.nodeId.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT
         c.id, c.requester_id, c.target_id, c.status,
         c.created_at::text AS created_at, c.updated_at::text AS updated_at,
         r.name AS requester_name, r.node_type AS requester_type,
         t.name AS target_name, t.node_type AS target_type
       FROM connections c
       JOIN nodes r ON c.requester_id = r.id
       JOIN nodes t ON c.target_id = t.id
       WHERE c.target_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [data.nodeId]
    );
    return result.rows.map(coerceConnectionJoined);
  });

// ──────────────────────────────────────────
// Start a workflow (query) between connected nodes
// ──────────────────────────────────────────

export const startWorkflow = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const connectionId = typeof d.connectionId === "string" ? d.connectionId.trim() : "";
    const requesterId = typeof d.requesterId === "string" ? d.requesterId.trim() : "";
    const providerId = typeof d.providerId === "string" ? d.providerId.trim() : "";
    const query = typeof d.query === "string" ? d.query.trim() : "";
    if (!connectionId) throw new Error("Connection ID is required");
    if (!requesterId) throw new Error("Requester ID is required");
    if (!providerId) throw new Error("Provider ID is required");
    if (!query) throw new Error("Query is required");
    return { connectionId, requesterId, providerId, query };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check — key must match requester
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.requesterId);

    const s = sql();

    // Verify connection is accepted
    const conn = await s`
      SELECT id, status FROM connections
      WHERE id = ${data.connectionId} AND status = 'accepted'
    `;
    if (conn.length === 0) throw new Error("Connection not found or not accepted");

    // Create workflow entry
    const rows = await s`
      INSERT INTO workflows (connection_id, requester_id, provider_id, query, status)
      VALUES (${data.connectionId}, ${data.requesterId}, ${data.providerId}, ${data.query}, 'pending')
      RETURNING id, connection_id, requester_id, provider_id, query, result, status, created_at, completed_at
    `;
    const workflow = rows[0];

    // Get names for activity log
    const reqNode = await s`SELECT name FROM nodes WHERE id = ${data.requesterId}`;
    const provNode = await s`SELECT name FROM nodes WHERE id = ${data.providerId}`;
    const provName = provNode.length > 0 ? String(provNode[0].name) : "Unknown";
    const reqName = reqNode.length > 0 ? String(reqNode[0].name) : "Unknown";

    // Log activity on both sides
    const summary = data.query.length > 40 ? data.query.substring(0, 40) + "..." : data.query;
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.requesterId}, 'workflow_started', ${'Workflow started: ' + summary})
    `;
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.providerId}, 'workflow_started', ${'Workflow received from ' + reqName + ': ' + summary})
    `;

    // Simulate a response
    const simulatedResult = `[${provName}] has processed your query about "${summary}". Analysis complete. Results would be delivered here in the full protocol.`;

    const updated = await s`
      UPDATE workflows
      SET result = ${simulatedResult}, status = 'completed', completed_at = NOW()
      WHERE id = ${workflow.id}
      RETURNING id, connection_id, requester_id, provider_id, query, result, status, created_at, completed_at
    `;

    const finalWorkflow = updated[0];

    // Log completion
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.requesterId}, 'workflow_completed', ${'Workflow completed with ' + provName})
    `;
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.providerId}, 'workflow_completed', ${'Workflow completed with ' + reqName})
    `;

    return coerceWorkflowJoined(finalWorkflow, reqName, provName);
  });

// ──────────────────────────────────────────
// Get workflows for a node
// ──────────────────────────────────────────

export const getNodeWorkflows = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { nodeId?: string } | null;
    if (!d?.nodeId || typeof d.nodeId !== "string" || !d.nodeId.trim()) {
      throw new Error("Node ID is required");
    }
    return { nodeId: d.nodeId.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT
         w.id, w.connection_id, w.requester_id, w.provider_id,
         w.query, w.result, w.status,
         w.created_at::text AS created_at,
         w.completed_at::text AS completed_at,
         r.name AS requester_name,
         p.name AS provider_name
       FROM workflows w
       JOIN nodes r ON w.requester_id = r.id
       JOIN nodes p ON w.provider_id = p.id
       WHERE w.requester_id = $1 OR w.provider_id = $1
       ORDER BY w.created_at DESC`,
      [data.nodeId]
    );
    return result.rows.map(coerceWorkflowJoined);
  });

// ──────────────────────────────────────────
// Get connection status between two nodes (for profile page)
// ──────────────────────────────────────────

export const getConnectionStatus = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    const nodeA = typeof d?.nodeA === "string" ? d.nodeA.trim() : "";
    const nodeB = typeof d?.nodeB === "string" ? d.nodeB.trim() : "";
    if (!nodeA || !nodeB) throw new Error("Both node IDs are required");
    return { nodeA, nodeB };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();
    const rows = await s`
      SELECT id, requester_id, target_id, status, created_at, updated_at
      FROM connections
      WHERE (requester_id = ${data.nodeA} AND target_id = ${data.nodeB})
         OR (requester_id = ${data.nodeB} AND target_id = ${data.nodeA})
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return coerceConnection(rows[0]);
  });

// ──────────────────────────────────────────
// API Key Management
// ──────────────────────────────────────────

export const listApiKeys = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    const nodeId = typeof d?.nodeId === "string" ? d.nodeId.trim() : "";
    if (!nodeId) throw new Error("Node ID is required");
    return { nodeId };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();
    const rows = await s`
      SELECT id, node_id, key_hash, label, created_at
      FROM api_keys
      WHERE node_id = ${data.nodeId}
      ORDER BY created_at DESC
    `;
    return rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      node_id: String(r.node_id),
      label: String(r.label ?? "default"),
      masked_key: "nnp_" + String(r.key_hash).substring(0, 4) + "…" + String(r.key_hash).substring(String(r.key_hash).length - 4),
      created_at: String(r.created_at),
    }));
  });

export const createApiKey = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const nodeId = typeof d.nodeId === "string" ? d.nodeId.trim() : "";
    if (!nodeId) throw new Error("Node ID is required");
    const label = typeof d.label === "string" ? d.label.trim() : "default";
    return { nodeId, label };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, data.nodeId);

    const rawKey = generateApiKey();
    const keyHash = hashKey(rawKey);
    const s = sql();

    // Check for label uniqueness
    const existing = await s`
      SELECT id FROM api_keys WHERE node_id = ${data.nodeId} AND label = ${data.label}
    `;
    const label = existing.length > 0 ? data.label + "_" + Date.now() : data.label;

    await s`
      INSERT INTO api_keys (node_id, key_hash, label)
      VALUES (${data.nodeId}, ${keyHash}, ${label})
    `;

    // Log activity
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${data.nodeId}, 'api_key_created', ${'API key created: ' + label})
    `;

    return { apiKey: rawKey, label };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");
    const keyId = typeof d.keyId === "string" ? d.keyId.trim() : "";
    if (!keyId) throw new Error("Key ID is required");
    return { keyId };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const s = sql();

    // Get the node_id for this key
    const keyRows = await s`
      SELECT node_id, label FROM api_keys WHERE id = ${data.keyId}
    `;
    if (keyRows.length === 0) throw new Error("API key not found");
    const nodeId = String(keyRows[0].node_id);
    const label = String(keyRows[0].label ?? "default");

    // Auth check
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    await requireAuth(authKey, nodeId);

    await s`DELETE FROM api_keys WHERE id = ${data.keyId}`;

    // Log activity
    await s`
      INSERT INTO activity_log (node_id, action, details)
      VALUES (${nodeId}, 'api_key_revoked', ${'API key revoked: ' + label})
    `;

    return { success: true };
  });

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function coerceNode(row: Record<string, unknown>): NodeRow {
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

function coerceConnection(row: Record<string, unknown>): ConnectionRow {
  return {
    id: String(row.id),
    requester_id: String(row.requester_id),
    target_id: String(row.target_id),
    status: String(row.status),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function coerceConnectionJoined(row: Record<string, unknown>): ConnectionRow {
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

// ──────────────────────────────────────────
// Network Stats — aggregate counts
// ──────────────────────────────────────────

export interface NetworkStats {
  totalNodes: number;
  totalConnections: number;
  totalWorkflows: number;
  totalEntities: number;
  totalRelationships: number;
}

export const getNetworkStats = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureTables();
    const p = pool();

    const [nodeResult, connResult, wfResult, entityResult, relResult] = await Promise.all([
      p.query("SELECT COUNT(*)::int as total FROM nodes WHERE status = 'active'"),
      p.query("SELECT COUNT(*)::int as total FROM connections WHERE status = 'accepted'"),
      p.query("SELECT COUNT(*)::int as total FROM workflows"),
      p.query("SELECT COUNT(*)::int as total FROM knowledge_entities"),
      p.query("SELECT COUNT(*)::int as total FROM knowledge_relationships"),
    ]);

    return {
      totalNodes: Number((nodeResult.rows[0] as Record<string, unknown>).total ?? 0),
      totalConnections: Number((connResult.rows[0] as Record<string, unknown>).total ?? 0),
      totalWorkflows: Number((wfResult.rows[0] as Record<string, unknown>).total ?? 0),
      totalEntities: Number((entityResult.rows[0] as Record<string, unknown>).total ?? 0),
      totalRelationships: Number((relResult.rows[0] as Record<string, unknown>).total ?? 0),
    } satisfies NetworkStats;
  });

// ──────────────────────────────────────────
// Recent network activity (last N entries)
// ──────────────────────────────────────────

export interface NetworkActivityEntry {
  id: string;
  node_id: string;
  node_name: string;
  node_type: string;
  action: string;
  details: string;
  created_at: string;
}

export const getRecentNetworkActivity = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { limit?: number } | null;
    const limit = typeof d?.limit === "number" && d.limit > 0 ? Math.min(Math.floor(d.limit), 100) : 20;
    return { limit };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT
         a.id, a.node_id, a.action, a.details,
         a.created_at::text AS created_at,
         n.name AS node_name, n.node_type
       FROM activity_log a
       JOIN nodes n ON a.node_id = n.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [data.limit]
    );
    return result.rows.map((r: Record<string, unknown>) => ({
      id: String(r.id),
      node_id: String(r.node_id),
      node_name: String(r.node_name ?? "Unknown"),
      node_type: String(r.node_type ?? "unknown"),
      action: String(r.action),
      details: String(r.details ?? ""),
      created_at: String(r.created_at),
    })) satisfies NetworkActivityEntry[];
  });

// ──────────────────────────────────────────
// Node type distribution
// ──────────────────────────────────────────

export interface TypeDistribution {
  node_type: string;
  count: number;
}

export const getNodeTypeDistribution = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT node_type, COUNT(*)::int as count
       FROM nodes WHERE status = 'active'
       GROUP BY node_type
       ORDER BY count DESC`
    );
    return result.rows.map((r: Record<string, unknown>) => ({
      node_type: String(r.node_type),
      count: Number(r.count),
    })) satisfies TypeDistribution[];
  });

// ──────────────────────────────────────────
// Domain distribution
// ──────────────────────────────────────────

export interface DomainDistribution {
  domain: string;
  count: number;
}

export const getDomainDistribution = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT domain, COUNT(*)::int as count
       FROM knowledge_entities
       GROUP BY domain
       ORDER BY count DESC`
    );
    return result.rows.map((r: Record<string, unknown>) => ({
      domain: String(r.domain),
      count: Number(r.count),
    })) satisfies DomainDistribution[];
  });

function coerceWorkflowJoined(row: Record<string, unknown>, reqName?: string, provName?: string): WorkflowRow {
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
    requester_name: reqName ?? (row.requester_name ? String(row.requester_name) : undefined),
    provider_name: provName ?? (row.provider_name ? String(row.provider_name) : undefined),
  };
}
