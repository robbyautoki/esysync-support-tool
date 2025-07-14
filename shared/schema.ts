import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  role: text("role").default("employee").notNull(), // 'admin', 'employee'
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  rmaNumber: text("rma_number").notNull().unique(),
  // Customer and display data
  accountNumber: text("account_number").notNull(),
  displayNumber: text("display_number").notNull(),
  displayLocation: text("display_location").notNull(),
  returnAddress: text("return_address"),
  contactEmail: text("contact_email").notNull(),
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
  videoEnabled: boolean("video_enabled").default(true).notNull(),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  role: z.enum(['admin', 'employee']).default('employee'),
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
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type User = typeof users.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertErrorType = z.infer<typeof insertErrorTypeSchema>;
export type ErrorType = typeof errorTypes.$inferSelect;

// Activity log table for comprehensive system tracking
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activityType: text("activity_type").notNull(), // 'ticket_created', 'status_changed', 'admin_login', etc.
  userType: text("user_type").notNull(), // 'customer', 'admin', 'system'
  userId: text("user_id"), // customer number, admin username, or system identifier
  description: text("description").notNull(),
  entityType: text("entity_type"), // 'ticket', 'error_type', 'customer', etc.
  entityId: text("entity_id"), // RMA number, error type ID, etc.
  metadata: text("metadata"), // Additional structured data as JSON string
  ipAddress: text("ip_address"), // IPv4/IPv6 address
  userAgent: text("user_agent"), // Browser/client information
});

export const insertActivityLogSchema = createInsertSchema(activityLogs);

export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
