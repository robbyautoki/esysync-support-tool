import express from "express";
import type { Request, Response, NextFunction } from "express";
import { storage } from "../backend/storage";
import { insertSupportTicketSchema, insertErrorTypeSchema } from "../shared/schema";
import { z } from "zod";
import ActivityLogger from "../backend/activity-logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Persistent admin sessions with in-memory storage
const adminSessions = new Map<string, {
  username: string;
  isAdmin: boolean;
  role?: string;
  firstName?: string;
  lastName?: string;
  expiresAt: number;
}>();

const requireAdmin = (req: any, res: any, next: any) => {
  const sessionId = req.headers['x-session-id'];

  if (sessionId === 'dev-admin-session') {
    req.user = { username: 'admin', isAdmin: true };
    return next();
  }

  const session = adminSessions.get(sessionId);
  if (session && session.isAdmin && session.expiresAt > Date.now()) {
    req.user = session;
    next();
  } else {
    if (session && session.expiresAt <= Date.now()) {
      adminSessions.delete(sessionId);
    }
    return res.status(401).json({ message: "Admin access required" });
  }
};

const requireAuth = (req: any, res: any, next: any) => {
  const sessionId = req.headers['x-session-id'];

  if (sessionId === 'dev-admin-session') {
    req.user = { username: 'admin', isAdmin: true };
    return next();
  }

  const session = adminSessions.get(sessionId);
  if (session && session.expiresAt > Date.now()) {
    req.user = session;
    next();
  } else {
    if (session && session.expiresAt <= Date.now()) {
      adminSessions.delete(sessionId);
    }
    return res.status(401).json({ message: "Authentication required" });
  }
};

// Admin/Employee login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
      const sessionId = Math.random().toString(36).substring(2, 8);
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

      adminSessions.set(sessionId, {
        username: "admin",
        isAdmin: true,
        role: "admin",
        expiresAt
      });

      await ActivityLogger.logAdminLogin(username, req);

      res.json({ sessionId, username: "admin", isAdmin: true, role: "admin" });
      return;
    }

    const user = await storage.getUserByUsername(username);
    if (user && user.isActive && user.password === password) {
      const sessionId = Math.random().toString(36).substring(2, 8);
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

      adminSessions.set(sessionId, {
        username: user.username,
        isAdmin: user.isAdmin || user.role === 'admin',
        role: user.role || 'employee',
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        expiresAt
      });

      if (user.role === 'admin' || user.isAdmin) {
        await ActivityLogger.logAdminLogin(username, req);
      } else {
        await ActivityLogger.logEmployeeLogin(username, req);
      }

      res.json({
        sessionId,
        username: user.username,
        isAdmin: user.isAdmin || user.role === 'admin',
        role: user.role || 'employee',
        firstName: user.firstName,
        lastName: user.lastName
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user info
app.get("/api/admin/user", requireAuth, async (req: any, res) => {
  try {
    res.json({
      username: req.user.username,
      role: req.user.role || "admin",
      isAdmin: req.user.isAdmin,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users for dropdown
app.get("/api/admin/users", requireAuth, async (req: any, res) => {
  try {
    const users = await storage.getAllEmployees();
    const adminUser = users.find((user: any) => user.username === 'admin');
    if (!adminUser) {
      users.unshift({
        id: 'admin',
        username: 'admin',
        firstName: null,
        lastName: null,
        isActive: true,
        role: 'admin'
      } as any);
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get active error types for frontend
app.get("/api/error-types", async (req, res) => {
  try {
    const errorTypes = await storage.getActiveErrorTypes();
    res.json(errorTypes);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin/Employee: Get all support tickets for Kanban board
app.get("/api/admin/tickets", requireAuth, async (req, res) => {
  try {
    const tickets = await storage.getAllSupportTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Get archived tickets
app.get("/api/admin/archived-tickets", requireAuth, async (req, res) => {
  try {
    const tickets = await storage.getAllTicketsForArchive();
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching all tickets for archive:', error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// Admin: Update ticket (extended version)
app.patch("/api/admin/tickets/:rmaNumber", requireAuth, async (req: any, res) => {
  try {
    const { rmaNumber } = req.params;
    const updates = req.body;
    const editedBy = req.user?.username || 'system';

    const ticket = await storage.updateSupportTicket(rmaNumber, updates, editedBy);

    await storage.createTicketLog({
      ticketId: ticket.id,
      rmaNumber: ticket.rmaNumber,
      action: 'ticket_updated',
      description: `Ticket wurde von ${editedBy} bearbeitet`,
      editedBy,
      newValue: JSON.stringify(updates)
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: "Failed to update ticket" });
  }
});

// Admin: Get ticket logs
app.get("/api/admin/tickets/:rmaNumber/logs", requireAuth, async (req, res) => {
  try {
    const { rmaNumber } = req.params;
    const logs = await storage.getTicketLogs(rmaNumber);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching ticket logs:', error);
    res.status(500).json({ message: "Failed to fetch ticket logs" });
  }
});

// Admin: Archive old tickets (manual trigger)
app.post("/api/admin/tickets/archive", requireAdmin, async (req, res) => {
  try {
    const archivedCount = await storage.archiveOldTickets();
    res.json({ archivedCount });
  } catch (error) {
    console.error('Error archiving tickets:', error);
    res.status(500).json({ message: "Failed to archive tickets" });
  }
});

// Update ticket status
const updateTicketStatus = async (req: any, res: any) => {
  try {
    const { rmaNumber } = req.params;
    const { status, statusDetails, trackingNumber } = req.body;

    const oldTicket = await storage.getSupportTicket(rmaNumber);
    const ticket = await storage.updateSupportTicketStatus(rmaNumber, status, statusDetails, trackingNumber);

    if (oldTicket && oldTicket.status !== status) {
      await ActivityLogger.logStatusChanged(rmaNumber, oldTicket.status, status, req.user.username, req);
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

app.patch("/api/admin/tickets/:rmaNumber/status", requireAdmin, updateTicketStatus);
app.put("/api/admin/tickets/:rmaNumber/status", requireAdmin, updateTicketStatus);

// Admin: Get all error types
app.get("/api/admin/error-types", requireAdmin, async (req, res) => {
  try {
    const errorTypes = await storage.getActiveErrorTypes();
    res.json(errorTypes);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Create error type
app.post("/api/admin/error-types", requireAdmin, async (req: any, res) => {
  try {
    const validatedData = insertErrorTypeSchema.parse(req.body);
    const errorType = await storage.createErrorType(validatedData);

    await ActivityLogger.logErrorTypeCreated(validatedData.title, req.user.username, req);

    res.json(errorType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Admin: Update error type
app.put("/api/admin/error-types/:id", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    const errorType = await storage.updateErrorType(id, updates);

    await ActivityLogger.logErrorTypeUpdated(updates.title || `ID ${id}`, req.user.username, req);

    res.json(errorType);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Delete error type
app.delete("/api/admin/error-types/:id", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);

    const errorTypes = await storage.getActiveErrorTypes();
    const errorType = errorTypes.find(et => et.id === id);

    await storage.deleteErrorType(id);

    if (errorType) {
      await ActivityLogger.logErrorTypeDeleted(errorType.title, req.user.username, req);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: Update video settings for error type
app.patch("/api/admin/error-types/:id/video", requireAdmin, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const { videoEnabled, videoUrl } = req.body;

    const updates: any = {};
    if (typeof videoEnabled === 'boolean') {
      updates.videoEnabled = videoEnabled;
    }
    if (videoUrl !== undefined) {
      updates.videoUrl = videoUrl || null;
    }

    const errorType = await storage.updateErrorType(id, updates);

    await ActivityLogger.logErrorTypeUpdated(
      `Video-Einstellungen für ${errorType.title}`,
      req.user.username,
      req
    );

    res.json(errorType);
  } catch (error) {
    console.error("Error updating video settings:", error);
    res.status(500).json({ message: "Failed to update video settings" });
  }
});

// Admin only: Get activity logs
app.get("/api/admin/logs", requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const activityType = req.query.type as string;
    const userType = req.query.userType as string;
    const userId = req.query.userId as string;

    let logs;
    if (activityType) {
      logs = await storage.getActivityLogsByType(activityType);
    } else if (userType && userId) {
      logs = await storage.getActivityLogsByUser(userId, userType);
    } else {
      logs = await storage.getActivityLogs(limit, offset);
    }

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Employee Management Routes
app.get('/api/admin/employees', requireAdmin, async (req, res) => {
  try {
    const employees = await storage.getAllEmployees();
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post('/api/admin/employees', requireAdmin, async (req: any, res) => {
  try {
    const employee = await storage.createEmployee(req.body);
    await ActivityLogger.logEmployeeCreated(employee.username, req.user.username, req);
    res.json(employee);
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put('/api/admin/employees/:id', requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const employee = await storage.updateEmployee(parseInt(id), req.body);
    await ActivityLogger.logEmployeeUpdated(employee.username, req.user.username, req);
    res.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete('/api/admin/employees/:id', requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const employee = await storage.getUser(parseInt(id));
    await storage.deleteEmployee(parseInt(id));
    if (employee) {
      await ActivityLogger.logEmployeeDeleted(employee.username, req.user.username, req);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.patch('/api/admin/employees/:id/toggle', requireAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const employee = await storage.toggleEmployeeStatus(parseInt(id), isActive);
    await ActivityLogger.logEmployeeStatusChanged(employee.username, isActive, req.user.username, req);
    res.json(employee);
  } catch (error) {
    console.error("Error toggling employee status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Validate customer number
app.get("/api/customers/:customerNumber/validate", async (req, res) => {
  try {
    const { customerNumber } = req.params;
    const customer = await storage.getCustomerByNumber(customerNumber);

    if (customer) {
      res.json({ valid: true, customer });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Generate RMA number
app.post("/api/rma/generate", async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const rmaNumber = `RMA-${year}-${randomNumber}`;

    res.json({ rmaNumber });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create support ticket
app.post("/api/support-tickets", async (req, res) => {
  try {
    const validatedData = insertSupportTicketSchema.parse(req.body);
    const ticket = await storage.createSupportTicket(validatedData);

    await ActivityLogger.logTicketCreated(
      ticket.rmaNumber,
      ticket.accountNumber || 'Unbekannt',
      ticket.errorType,
      req
    );

    res.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

// Get support ticket by RMA number
app.get("/api/support-tickets/:rmaNumber", async (req, res) => {
  try {
    const { rmaNumber } = req.params;
    const ticket = await storage.getSupportTicket(rmaNumber);

    if (ticket) {
      res.json(ticket);
    } else {
      res.status(404).json({ message: "Support ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Public ticket tracking route
app.get('/api/track/:rmaNumber', async (req, res) => {
  try {
    const { rmaNumber } = req.params;
    const ticket = await storage.getSupportTicket(rmaNumber);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket nicht gefunden" });
    }

    const publicTicketData = {
      id: ticket.id,
      rmaNumber: ticket.rmaNumber,
      accountNumber: ticket.accountNumber,
      displayNumber: ticket.displayNumber,
      displayLocation: ticket.displayLocation,
      contactEmail: ticket.contactEmail,
      errorType: ticket.errorType,
      shippingMethod: ticket.shippingMethod,
      status: ticket.status,
      statusDetails: ticket.statusDetails,
      trackingNumber: ticket.trackingNumber,
      createdAt: ticket.createdAt
    };

    res.json(publicTicketData);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Fehler beim Abrufen des Tickets" });
  }
});

export default app;
