import { sql } from "~/db";

let migrated = false;

/**
 * Ensures the database tables exist. Safe to call multiple times —
 * only runs the migration once per process lifetime.
 */
export async function ensureTables(): Promise<void> {
  if (migrated) return;

  const s = sql();

  // nodes table
  await s`CREATE TABLE IF NOT EXISTS nodes (
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
  )`;

  // subscribers table
  await s`CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // activity_log table
  await s`CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // connections table
  await s`CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`;

  // workflows table
  await s`CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    query TEXT DEFAULT '',
    result TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
  )`;

  migrated = true;
}
