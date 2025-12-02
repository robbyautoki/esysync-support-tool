import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use HTTP-based connection which works in both Node.js and serverless environments
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Export pool as null for backward compatibility (not needed with HTTP driver)
export const pool = null;