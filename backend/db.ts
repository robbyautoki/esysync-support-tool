import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Only use ws in Node.js environment, not in serverless
if (typeof globalThis.WebSocket === 'undefined') {
  // Node.js environment - use ws
  import("ws").then((ws) => {
    neonConfig.webSocketConstructor = ws.default;
  }).catch(() => {
    // In serverless environment, ws might not be available
    // Neon will use fetch-based connection instead
  });
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });