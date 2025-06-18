import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupportTicketSchema, insertErrorTypeSchema } from "@shared/schema";
import { z } from "zod";

// Simple session middleware for admin authentication
const sessions = new Map<string, { username: string; isAdmin: boolean }>();

const requireAdmin = (req: any, res: any, next: any) => {
  const sessionId = req.headers['x-session-id'];
  const session = sessions.get(sessionId);
  
  if (!session || !session.isAdmin) {
    return res.status(401).json({ message: "Admin access required" });
  }
  
  req.user = session;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === "admin" && password === "admin123") {
        const sessionId = Math.random().toString(36).substring(2, 8);
        sessions.set(sessionId, { username: "admin", isAdmin: true });
        

        
        res.json({ sessionId, username: "admin", isAdmin: true });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
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

  // Admin: Get all support tickets for Kanban board
  app.get("/api/admin/tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Update ticket status
  app.patch("/api/admin/tickets/:rmaNumber/status", requireAdmin, async (req, res) => {
    try {
      const { rmaNumber } = req.params;
      const { status, statusDetails, trackingNumber } = req.body;
      
      const ticket = await storage.updateSupportTicketStatus(rmaNumber, status, statusDetails, trackingNumber);
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

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

  // Admin: Update error type
  app.put("/api/admin/error-types/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const errorType = await storage.updateErrorType(id, updates);
      res.json(errorType);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Delete error type
  app.delete("/api/admin/error-types/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteErrorType(id);
      res.json({ success: true });
    } catch (error) {
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
