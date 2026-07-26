// Server-only auth utilities — uses Bun-native crypto, never imported by client code.
import { sql } from "~/db";
import { ensureTables } from "./db-setup";

function hashKey(key: string): string {
  // Bun-native SHA-256 (works in Bun runtime, used for SSR + serve.ts)
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(key);
  return hasher.digest("hex") as string;
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return "nnp_" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function maskKey(key: string): string {
  if (key.length <= 16) return key.slice(0, 8) + "…";
  return key.slice(0, 8) + "…" + key.slice(-4);
}

export async function verifyApiKey(key: string): Promise<{ valid: boolean; node_id?: string }> {
  if (!key || typeof key !== "string" || !key.startsWith("nnp_")) {
    return { valid: false };
  }
  await ensureTables();
  const hash = hashKey(key);
  const s = sql();
  const rows = await s`
    SELECT node_id FROM api_keys WHERE key_hash = ${hash} LIMIT 1
  `;
  if (rows.length === 0) return { valid: false };
  return { valid: true, node_id: String(rows[0].node_id) };
}

export async function requireAuth(authKey: string | undefined, expectedNodeId: string): Promise<void> {
  if (!authKey) return;
  const result = await verifyApiKey(authKey);
  if (!result.valid) throw new Error("Unauthorized: invalid API key");
  if (result.node_id !== expectedNodeId) throw new Error("Unauthorized: API key does not match this node");
}
