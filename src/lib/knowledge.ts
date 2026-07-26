import { createServerFn } from "@tanstack/react-start";
import { sql, pool } from "~/db";
import { ensureTables } from "./db-setup";
import { verifyApiKey } from "./auth";

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface KnowledgeEntity {
  id: string;
  name: string;
  entity_type: string;
  description: string | null;
  domain: string;
  contributor_node_id: string | null;
  contributor_name: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeRelationship {
  id: string;
  source_entity_id: string;
  source_name: string;
  target_entity_id: string;
  target_name: string;
  relationship_type: string;
  description: string | null;
  contributor_node_id: string | null;
  created_at: string;
}

export interface KnowledgeStats {
  totalEntities: number;
  totalRelationships: number;
  totalContributingNodes: number;
}

// ──────────────────────────────────────────
// Entity type & domain constants
// ──────────────────────────────────────────

export const ENTITY_TYPES = [
  "project", "contract", "research", "guideline", "regulation",
  "equipment", "organization", "person", "software", "asset",
  "infrastructure", "concept", "other",
] as const;

export const DOMAINS = [
  "healthcare", "manufacturing", "energy", "education", "aviation",
  "maritime", "agriculture", "construction", "finance", "logistics",
  "defense", "space", "general",
] as const;

export const RELATIONSHIP_TYPES = [
  "depends_on", "contains", "references", "implements",
  "regulates", "owns", "produces", "consumes", "relates_to",
] as const;

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

function coerceEntity(row: Record<string, unknown>): KnowledgeEntity {
  return {
    id: String(row.id),
    name: String(row.name),
    entity_type: String(row.entity_type),
    description: row.description ? String(row.description) : null,
    domain: String(row.domain ?? "general"),
    contributor_node_id: row.contributor_node_id ? String(row.contributor_node_id) : null,
    contributor_name: row.contributor_name ? String(row.contributor_name) : null,
    metadata: parseKnowledgeJson(row.metadata),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function coerceRelationship(row: Record<string, unknown>): KnowledgeRelationship {
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

function parseKnowledgeJson(val: unknown): Record<string, unknown> {
  if (val && typeof val === "object" && !Array.isArray(val)) return val as Record<string, unknown>;
  if (typeof val === "string") {
    try { return JSON.parse(val) as Record<string, unknown>; } catch { return {}; }
  }
  return {};
}

// ──────────────────────────────────────────
// Create a knowledge entity
// ──────────────────────────────────────────

export const createEntity = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");

    const name = typeof d.name === "string" ? d.name.trim() : "";
    if (!name || name.length === 0) throw new Error("Entity name is required");
    if (name.length > 300) throw new Error("Entity name must be under 300 characters");

    const entity_type = typeof d.entity_type === "string" ? d.entity_type.trim() : "";
    if (!ENTITY_TYPES.includes(entity_type as typeof ENTITY_TYPES[number])) {
      throw new Error(`Invalid entity type. Must be one of: ${ENTITY_TYPES.join(", ")}`);
    }

    const description = typeof d.description === "string" ? d.description.trim() : "";
    if (description.length > 5000) throw new Error("Description must be under 5000 characters");

    const domain = typeof d.domain === "string" && DOMAINS.includes(d.domain as typeof DOMAINS[number])
      ? d.domain.trim()
      : "general";

    const contributor_node_id = typeof d.contributor_node_id === "string" ? d.contributor_node_id.trim() : null;

    return { name, entity_type, description, domain, contributor_node_id };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check if contributor_node_id provided
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    if (authKey && data.contributor_node_id) {
      const result = await verifyApiKey(authKey);
      if (!result.valid) throw new Error("Unauthorized: invalid API key");
      if (result.node_id !== data.contributor_node_id) throw new Error("Unauthorized: API key does not match contributor node");
    }

    const s = sql();
    const rows = await s`
      INSERT INTO knowledge_entities (name, entity_type, description, domain, contributor_node_id)
      VALUES (${data.name}, ${data.entity_type}, ${data.description || null}, ${data.domain}, ${data.contributor_node_id})
      RETURNING id, name, entity_type, description, domain, contributor_node_id, metadata, created_at, updated_at
    `;
    const entity = coerceEntity(rows[0]);

    // Get contributor name for activity log
    if (data.contributor_node_id) {
      const nodeRows = await s`SELECT name FROM nodes WHERE id = ${data.contributor_node_id}`;
      const nodeName = nodeRows.length > 0 ? String(nodeRows[0].name) : "Unknown";
      await s`
        INSERT INTO activity_log (node_id, action, details)
        VALUES (${data.contributor_node_id}, 'entity_created', ${'Created knowledge entity: ' + data.name})
      `;
      entity.contributor_name = nodeName;
    }

    return entity;
  });

// ──────────────────────────────────────────
// Get a single entity by ID
// ──────────────────────────────────────────

export const getEntity = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { id?: string } | null;
    if (!d?.id || typeof d.id !== "string" || !d.id.trim()) {
      throw new Error("Entity ID is required");
    }
    return { id: d.id.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT
         e.id, e.name, e.entity_type, e.description, e.domain,
         e.contributor_node_id, e.metadata,
         e.created_at::text AS created_at,
         e.updated_at::text AS updated_at,
         n.name AS contributor_name
       FROM knowledge_entities e
       LEFT JOIN nodes n ON e.contributor_node_id = n.id
       WHERE e.id = $1`,
      [data.id]
    );
    if (result.rows.length === 0) return null;
    return coerceEntity(result.rows[0]);
  });

// ──────────────────────────────────────────
// List entities (filtered, paginated)
// ──────────────────────────────────────────

export const listEntities = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    const query = typeof d?.query === "string" ? d.query.trim() : "";
    const entity_type = typeof d?.entity_type === "string" ? d.entity_type.trim() : "";
    const domain = typeof d?.domain === "string" ? d.domain.trim() : "";
    const sort = typeof d?.sort === "string" && ["newest", "name"].includes(d.sort)
      ? (d.sort as "newest" | "name")
      : "newest";
    const limit = typeof d?.limit === "number" && d.limit > 0 ? Math.min(Math.floor(d.limit), 100) : 50;
    const offset = typeof d?.offset === "number" && d.offset >= 0 ? Math.floor(d.offset) : 0;
    return { query, entity_type, domain, sort, limit, offset };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();

    const conditions: string[] = [];
    const params: unknown[] = [];
    let pi = 1;

    if (data.query) {
      const q = "%" + data.query + "%";
      conditions.push("(e.name ILIKE $" + pi + " OR e.description ILIKE $" + pi + " OR e.entity_type ILIKE $" + pi + ")");
      params.push(q);
      pi += 1;
    }

    if (data.entity_type) {
      conditions.push("e.entity_type = $" + pi);
      params.push(data.entity_type);
      pi += 1;
    }

    if (data.domain) {
      conditions.push("e.domain = $" + pi);
      params.push(data.domain);
      pi += 1;
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const orderClause = data.sort === "name" ? "ORDER BY e.name ASC, e.created_at DESC" : "ORDER BY e.created_at DESC";

    // Count
    const countSql = "SELECT COUNT(*) as total FROM knowledge_entities e " + whereClause;
    const countResult = await p.query(countSql, params);
    const total = Number((countResult.rows[0] as Record<string, unknown>).total ?? 0);

    // Fetch
    const fetchSql = `SELECT
      e.id, e.name, e.entity_type, e.description, e.domain,
      e.contributor_node_id, e.metadata,
      e.created_at::text AS created_at,
      e.updated_at::text AS updated_at,
      n.name AS contributor_name
    FROM knowledge_entities e
    LEFT JOIN nodes n ON e.contributor_node_id = n.id
    ${whereClause}
    ${orderClause}
    LIMIT $${pi} OFFSET $${pi + 1}`;

    const fetchParams = [...params, data.limit, data.offset];
    const result = await p.query(fetchSql, fetchParams);

    return {
      entities: result.rows.map((r) => coerceEntity(r)),
      total,
    };
  });

// ──────────────────────────────────────────
// Get all relationships for an entity
// ──────────────────────────────────────────

export const getEntityRelationships = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { entityId?: string } | null;
    if (!d?.entityId || typeof d.entityId !== "string" || !d.entityId.trim()) {
      throw new Error("Entity ID is required");
    }
    return { entityId: d.entityId.trim() };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT
         r.id,
         r.source_entity_id,
         se.name AS source_name,
         r.target_entity_id,
         te.name AS target_name,
         r.relationship_type, r.description,
         r.contributor_node_id,
         r.created_at::text AS created_at
       FROM knowledge_relationships r
       JOIN knowledge_entities se ON r.source_entity_id = se.id
       JOIN knowledge_entities te ON r.target_entity_id = te.id
       WHERE r.source_entity_id = $1 OR r.target_entity_id = $1
       ORDER BY r.created_at DESC`,
      [data.entityId]
    );
    return result.rows.map(coerceRelationship);
  });

// ──────────────────────────────────────────
// Create a relationship between entities
// ──────────────────────────────────────────

export const createRelationship = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | null;
    if (!d || typeof d !== "object") throw new Error("Request body is required");

    const source_id = typeof d.source_id === "string" ? d.source_id.trim() : "";
    const target_id = typeof d.target_id === "string" ? d.target_id.trim() : "";
    if (!source_id) throw new Error("Source entity ID is required");
    if (!target_id) throw new Error("Target entity ID is required");
    if (source_id === target_id) throw new Error("Cannot relate an entity to itself");

    const relationship_type = typeof d.relationship_type === "string" ? d.relationship_type.trim() : "";
    if (!RELATIONSHIP_TYPES.includes(relationship_type as typeof RELATIONSHIP_TYPES[number])) {
      throw new Error(`Invalid relationship type. Must be one of: ${RELATIONSHIP_TYPES.join(", ")}`);
    }

    const description = typeof d.description === "string" ? d.description.trim() : "";
    const contributor_node_id = typeof d.contributor_node_id === "string" ? d.contributor_node_id.trim() : null;

    return { source_id, target_id, relationship_type, description, contributor_node_id };
  })
  .handler(async ({ data }) => {
    await ensureTables();

    // Auth check if contributor_node_id provided
    const authKey = (data as Record<string, unknown>).authKey as string | undefined;
    if (authKey && data.contributor_node_id) {
      const result = await verifyApiKey(authKey);
      if (!result.valid) throw new Error("Unauthorized: invalid API key");
      if (result.node_id !== data.contributor_node_id) throw new Error("Unauthorized: API key does not match contributor node");
    }

    const s = sql();

    const rows = await s`
      INSERT INTO knowledge_relationships (source_entity_id, target_entity_id, relationship_type, description, contributor_node_id)
      VALUES (${data.source_id}, ${data.target_id}, ${data.relationship_type}, ${data.description || null}, ${data.contributor_node_id})
      RETURNING id, source_entity_id, target_entity_id, relationship_type, description, contributor_node_id, created_at
    `;

    // Get names
    const sourceRows = await s`SELECT name FROM knowledge_entities WHERE id = ${data.source_id}`;
    const targetRows = await s`SELECT name FROM knowledge_entities WHERE id = ${data.target_id}`;
    const sourceName = sourceRows.length > 0 ? String(sourceRows[0].name) : "Unknown";
    const targetName = targetRows.length > 0 ? String(targetRows[0].name) : "Unknown";

    const rel = coerceRelationship({ ...rows[0], source_name: sourceName, target_name: targetName });

    // Log activity
    if (data.contributor_node_id) {
      await s`
        INSERT INTO activity_log (node_id, action, details)
        VALUES (${data.contributor_node_id}, 'relationship_created', ${'Created relationship: ' + sourceName + ' → ' + rel.relationship_type + ' → ' + targetName})
      `;
    }

    return rel;
  });

// ──────────────────────────────────────────
// Get knowledge graph stats
// ──────────────────────────────────────────

export const getKnowledgeStats = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureTables();
    const p = pool();

    const [entityResult, relResult, nodeResult] = await Promise.all([
      p.query("SELECT COUNT(*) as total FROM knowledge_entities"),
      p.query("SELECT COUNT(*) as total FROM knowledge_relationships"),
      p.query("SELECT COUNT(DISTINCT contributor_node_id) as total FROM knowledge_entities WHERE contributor_node_id IS NOT NULL"),
    ]);

    return {
      totalEntities: Number((entityResult.rows[0] as Record<string, unknown>).total ?? 0),
      totalRelationships: Number((relResult.rows[0] as Record<string, unknown>).total ?? 0),
      totalContributingNodes: Number((nodeResult.rows[0] as Record<string, unknown>).total ?? 0),
    } satisfies KnowledgeStats;
  });

// ──────────────────────────────────────────
// Search entities (autocomplete)
// ──────────────────────────────────────────

export const searchEntities = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const d = data as { query?: string } | null;
    const query = typeof d?.query === "string" ? d.query.trim() : "";
    return { query };
  })
  .handler(async ({ data }) => {
    await ensureTables();
    if (!data.query) return [];
    const s = sql();
    const q = "%" + data.query + "%";
    const rows = await s`
      SELECT e.id, e.name, e.entity_type, e.description, e.domain,
             e.contributor_node_id, e.metadata,
             e.created_at, e.updated_at,
             n.name AS contributor_name
      FROM knowledge_entities e
      LEFT JOIN nodes n ON e.contributor_node_id = n.id
      WHERE e.name ILIKE ${q} OR e.description ILIKE ${q}
      ORDER BY e.name ASC
      LIMIT 20
    `;
    return rows.map(coerceEntity);
  });

// ──────────────────────────────────────────
// Get entity type distribution
// ──────────────────────────────────────────

export const getEntityTypeDistribution = createServerFn({ method: "GET" })
  .handler(async () => {
    await ensureTables();
    const p = pool();
    const result = await p.query(
      `SELECT entity_type, COUNT(*) as count
       FROM knowledge_entities
       GROUP BY entity_type
       ORDER BY count DESC`
    );
    return result.rows.map((r: Record<string, unknown>) => ({
      entity_type: String(r.entity_type),
      count: Number(r.count),
    }));
  });

// ──────────────────────────────────────────
// Get entities contributed by a node
// ──────────────────────────────────────────

export const getNodeKnowledgeEntities = createServerFn({ method: "GET" })
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
         e.id, e.name, e.entity_type, e.description, e.domain,
         e.contributor_node_id, e.metadata,
         e.created_at::text AS created_at,
         e.updated_at::text AS updated_at,
         n.name AS contributor_name
       FROM knowledge_entities e
       LEFT JOIN nodes n ON e.contributor_node_id = n.id
       WHERE e.contributor_node_id = $1
       ORDER BY e.created_at DESC`,
      [data.nodeId]
    );
    return result.rows.map(coerceEntity);
  });

// ──────────────────────────────────────────
// Get relationships contributed by a node
// ──────────────────────────────────────────

export const getNodeKnowledgeRelationships = createServerFn({ method: "GET" })
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
         r.id, r.source_entity_id, r.target_entity_id,
         se.name AS source_name,
         te.name AS target_name,
         r.relationship_type, r.description,
         r.contributor_node_id,
         r.created_at::text AS created_at
       FROM knowledge_relationships r
       JOIN knowledge_entities se ON r.source_entity_id = se.id
       JOIN knowledge_entities te ON r.target_entity_id = te.id
       WHERE r.contributor_node_id = $1
       ORDER BY r.created_at DESC`,
      [data.nodeId]
    );
    return result.rows.map(coerceRelationship);
  });
