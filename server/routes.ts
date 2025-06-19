import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupportTicketSchema, insertErrorTypeSchema } from "@shared/schema";
import { z } from "zod";
import ActivityLogger from "./activity-logger";

// Persistent admin sessions with database storage
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
  
  // Allow admin credentials for development
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

// Allow both admin and employee access
const requireAuth = (req: any, res: any, next: any) => {
  const sessionId = req.headers['x-session-id'];
  
  // Allow admin credentials for development
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin/Employee login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check built-in admin account
      if (username === "admin" && password === "admin123") {
        const sessionId = Math.random().toString(36).substring(2, 8);
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
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
      
      // Check database users (employees and additional admins)
      const user = await storage.getUserByUsername(username);
      if (user && user.isActive && user.password === password) {
        const sessionId = Math.random().toString(36).substring(2, 8);
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
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

  // Admin: Update ticket status (both PATCH and PUT for compatibility)
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
      
      // Get error type before deletion for logging
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



  // Get all error types (admin)
  app.get("/api/admin/error-types", requireAdmin, async (req, res) => {
    try {
      const errorTypes = await storage.getActiveErrorTypes();
      res.json(errorTypes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create error type (admin)
  app.post("/api/admin/error-types", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertErrorTypeSchema.parse(req.body);
      const errorType = await storage.createErrorType(validatedData);
      res.json(errorType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Update error type (admin)
  app.put("/api/admin/error-types/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertErrorTypeSchema.parse(req.body);
      const errorType = await storage.updateErrorType(id, validatedData);
      res.json(errorType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Delete error type (admin)
  app.delete("/api/admin/error-types/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteErrorType(id);
      res.json({ message: "Error type deleted" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all support tickets (admin)
  app.get("/api/admin/tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update support ticket status (admin)
  app.put("/api/admin/tickets/:rmaNumber/status", requireAdmin, async (req, res) => {
    try {
      const { rmaNumber } = req.params;
      const { status, statusDetails, trackingNumber } = req.body;
      
      const ticket = await storage.updateSupportTicketStatus(rmaNumber, status, statusDetails, trackingNumber);
      res.json(ticket);
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
      
      // Return ticket data without sensitive admin information
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

  const httpServer = createServer(app);
  return httpServer;
}
