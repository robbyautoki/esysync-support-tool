import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { pgTable, text, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Define errorTypes table inline
const errorTypes = pgTable("error_types", {
  id: serial("id").primaryKey(),
  errorId: text("error_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").default("hardware").notNull(),
  iconName: text("icon_name").notNull(),
  videoUrl: text("video_url"),
  videoEnabled: boolean("video_enabled").default(true).notNull(),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true).notNull(),
  hasSubOptions: boolean("has_sub_options").default(false).notNull(),
  subOptions: jsonb("sub_options"),
  requiredChecks: jsonb("required_checks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
