import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  rmaNumber: text("rma_number").notNull().unique(),
  customerNumber: text("customer_number").notNull(),
  errorType: text("error_type").notNull(),
  shippingMethod: text("shipping_method").notNull(),
  restartConfirmed: boolean("restart_confirmed").notNull(),
  status: text("status").notNull().default("pending"), // pending, workshop, shipped
  statusDetails: text("status_details"), // Additional status information
  trackingNumber: text("tracking_number"), // For shipped items
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerNumber: text("customer_number").notNull().unique(),
  email: text("email"),
  name: text("name"),
});

export const errorTypes = pgTable("error_types", {
  id: serial("id").primaryKey(),
  errorId: text("error_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  videoUrl: text("video_url"),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
});

export const insertErrorTypeSchema = createInsertSchema(errorTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertErrorType = z.infer<typeof insertErrorTypeSchema>;
export type ErrorType = typeof errorTypes.$inferSelect;
