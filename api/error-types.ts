import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { errorTypes } from "../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ message: "DATABASE_URL not set" });
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const types = await db.select().from(errorTypes).where(eq(errorTypes.isActive, true));
    return res.json(types);
  } catch (error) {
    console.error("Error fetching error types:", error);
    return res.status(500).json({ message: "Internal server error", error: String(error) });
  }
}
