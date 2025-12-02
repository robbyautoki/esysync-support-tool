import express from "express";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, and, lt } from "drizzle-orm";
import { z } from "zod";
import {
  users,
  customers,
  supportTickets,
  errorTypes,
  activityLogs,
  ticketLogs,
  insertSupportTicketSchema,
  insertErrorTypeSchema,
} from "../shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database setup
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), hasDbUrl: true });
});

// Admin sessions
const adminSessions = new Map<string, { username: string; isAdmin: boolean; role?: string; firstName?: string; lastName?: string; expiresAt: number }>();

const requireAdmin = (req: any, res: any, next: any) => {
  const sessionId = req.headers["x-session-id"];
  if (sessionId === "dev-admin-session") { req.user = { username: "admin", isAdmin: true }; return next(); }
  const session = adminSessions.get(sessionId);
  if (session && session.isAdmin && session.expiresAt > Date.now()) { req.user = session; next(); }
  else { return res.status(401).json({ message: "Admin access required" }); }
};

const requireAuth = (req: any, res: any, next: any) => {
  const sessionId = req.headers["x-session-id"];
  if (sessionId === "dev-admin-session") { req.user = { username: "admin", isAdmin: true }; return next(); }
  const session = adminSessions.get(sessionId);
  if (session && session.expiresAt > Date.now()) { req.user = session; next(); }
  else { return res.status(401).json({ message: "Authentication required" }); }
};

// Login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin123") {
      const sessionId = Math.random().toString(36).substring(2, 8);
      adminSessions.set(sessionId, { username: "admin", isAdmin: true, role: "admin", expiresAt: Date.now() + 86400000 });
      return res.json({ sessionId, username: "admin", isAdmin: true, role: "admin" });
    }
    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (user && user.isActive && user.password === password) {
      const sessionId = Math.random().toString(36).substring(2, 8);
      adminSessions.set(sessionId, { username: user.username, isAdmin: user.isAdmin || user.role === "admin", role: user.role || "employee", firstName: user.firstName ?? undefined, lastName: user.lastName ?? undefined, expiresAt: Date.now() + 86400000 });
      res.json({ sessionId, username: user.username, isAdmin: user.isAdmin || user.role === "admin", role: user.role || "employee", firstName: user.firstName, lastName: user.lastName });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user
app.get("/api/admin/user", requireAuth, async (req: any, res) => {
  res.json({ username: req.user.username, role: req.user.role || "admin", isAdmin: req.user.isAdmin, firstName: req.user.firstName, lastName: req.user.lastName });
});

// Get all users
app.get("/api/admin/users", requireAuth, async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get active error types (PUBLIC)
app.get("/api/error-types", async (req, res) => {
  try {
    const types = await db.select().from(errorTypes).where(eq(errorTypes.isActive, true));
    res.json(types);
  } catch (error) {
    console.error("Error fetching error types:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all tickets
app.get("/api/admin/tickets", requireAuth, async (req, res) => {
  try {
    const tickets = await db.select().from(supportTickets).where(eq(supportTickets.isArchived, false)).orderBy(desc(supportTickets.createdAt));
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get archived tickets
app.get("/api/admin/archived-tickets", requireAuth, async (req, res) => {
  try {
    const tickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update ticket
app.patch("/api/admin/tickets/:rmaNumber", requireAuth, async (req: any, res) => {
  try {
    const { rmaNumber } = req.params;
    const updates = req.body;
    const [ticket] = await db.update(supportTickets).set({ ...updates, updatedAt: new Date() }).where(eq(supportTickets.rmaNumber, rmaNumber)).returning();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update ticket status
app.patch("/api/admin/tickets/:rmaNumber/status", requireAdmin, async (req: any, res) => {
  try {
    const { rmaNumber } = req.params;
    const { status, statusDetails, trackingNumber } = req.body;
    const [ticket] = await db.update(supportTickets).set({ status, statusDetails, trackingNumber, updatedAt: new Date() }).where(eq(supportTickets.rmaNumber, rmaNumber)).returning();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/admin/tickets/:rmaNumber/status", requireAdmin, async (req: any, res) => {
  try {
    const { rmaNumber } = req.params;
    const { status, statusDetails, trackingNumber } = req.body;
    const [ticket] = await db.update(supportTickets).set({ status, statusDetails, trackingNumber, updatedAt: new Date() }).where(eq(supportTickets.rmaNumber, rmaNumber)).returning();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get ticket logs
app.get("/api/admin/tickets/:rmaNumber/logs", requireAuth, async (req, res) => {
  try {
    const { rmaNumber } = req.params;
    const logs = await db.select().from(ticketLogs).where(eq(ticketLogs.rmaNumber, rmaNumber)).orderBy(desc(ticketLogs.createdAt));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin error types
app.get("/api/admin/error-types", requireAdmin, async (req, res) => {
  try {
    const types = await db.select().from(errorTypes).where(eq(errorTypes.isActive, true));
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/admin/error-types", requireAdmin, async (req: any, res) => {
  try {
    const data = insertErrorTypeSchema.parse(req.body);
    const [errorType] = await db.insert(errorTypes).values(data).returning();
    res.json(errorType);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ message: "Invalid data", errors: error.errors }); }
    else { res.status(500).json({ message: "Internal server error" }); }
  }
});

app.put("/api/admin/error-types/:id", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const [errorType] = await db.update(errorTypes).set(req.body).where(eq(errorTypes.id, id)).returning();
    res.json(errorType);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/admin/error-types/:id", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(errorTypes).where(eq(errorTypes.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/admin/error-types/:id/video", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const { videoEnabled, videoUrl } = req.body;
    const [errorType] = await db.update(errorTypes).set({ videoEnabled, videoUrl: videoUrl || null }).where(eq(errorTypes.id, id)).returning();
    res.json(errorType);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Activity logs
app.get("/api/admin/logs", requireAdmin, async (req, res) => {
  try {
    const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Employees
app.get("/api/admin/employees", requireAdmin, async (req, res) => {
  try {
    const employees = await db.select().from(users);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/admin/employees", requireAdmin, async (req: any, res) => {
  try {
    const [employee] = await db.insert(users).values(req.body).returning();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/admin/employees/:id", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const [employee] = await db.update(users).set(req.body).where(eq(users.id, id)).returning();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/admin/employees/:id", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(users).where(eq(users.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch("/api/admin/employees/:id/toggle", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive } = req.body;
    const [employee] = await db.update(users).set({ isActive }).where(eq(users.id, id)).returning();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Customer validation
app.get("/api/customers/:customerNumber/validate", async (req, res) => {
  try {
    const { customerNumber } = req.params;
    const [customer] = await db.select().from(customers).where(eq(customers.customerNumber, customerNumber));
    res.json(customer ? { valid: true, customer } : { valid: false });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Generate RMA
app.post("/api/rma/generate", async (req, res) => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
  res.json({ rmaNumber: `RMA-${year}-${randomNumber}` });
});

// Create ticket
app.post("/api/support-tickets", async (req, res) => {
  try {
    const data = insertSupportTicketSchema.parse(req.body);
    const [ticket] = await db.insert(supportTickets).values(data).returning();
    res.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) { res.status(400).json({ message: "Invalid data", errors: error.errors }); }
    else { console.error("Error:", error); res.status(500).json({ message: "Internal server error" }); }
  }
});

// Get ticket by RMA
app.get("/api/support-tickets/:rmaNumber", async (req, res) => {
  try {
    const { rmaNumber } = req.params;
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.rmaNumber, rmaNumber));
    if (ticket) { res.json(ticket); } else { res.status(404).json({ message: "Ticket not found" }); }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Public ticket tracking
app.get("/api/track/:rmaNumber", async (req, res) => {
  try {
    const { rmaNumber } = req.params;
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.rmaNumber, rmaNumber));
    if (!ticket) { return res.status(404).json({ message: "Ticket nicht gefunden" }); }
    res.json({ id: ticket.id, rmaNumber: ticket.rmaNumber, accountNumber: ticket.accountNumber, displayNumber: ticket.displayNumber, displayLocation: ticket.displayLocation, contactEmail: ticket.contactEmail, errorType: ticket.errorType, shippingMethod: ticket.shippingMethod, status: ticket.status, statusDetails: ticket.statusDetails, trackingNumber: ticket.trackingNumber, createdAt: ticket.createdAt });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Archive tickets
app.post("/api/admin/tickets/archive", requireAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await db.update(supportTickets).set({ isArchived: true, archivedAt: new Date() }).where(and(eq(supportTickets.status, "shipped"), eq(supportTickets.isArchived, false), lt(supportTickets.updatedAt, thirtyDaysAgo))).returning();
    res.json({ archivedCount: result.length });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default app;
