import { pgTable, serial, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Activity log table for tracking all system activities
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // 'ticket_created', 'status_changed', 'admin_login', etc.
  userType: varchar("user_type", { length: 20 }).notNull(), // 'customer', 'admin', 'system'
  userId: varchar("user_id", { length: 100 }), // customer number, admin username, or system identifier
  description: text("description").notNull(),
  entityType: varchar("entity_type", { length: 50 }), // 'ticket', 'error_type', 'customer', etc.
  entityId: varchar("entity_id", { length: 100 }), // RMA number, error type ID, etc.
  metadata: jsonb("metadata"), // Additional structured data
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4/IPv6 address
  userAgent: text("user_agent"), // Browser/client information
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;