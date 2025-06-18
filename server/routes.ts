import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSupportTicketSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Validate customer exists
      const customer = await storage.getCustomerByNumber(validatedData.customerNumber);
      if (!customer) {
        return res.status(400).json({ message: "Invalid customer number" });
      }

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

  const httpServer = createServer(app);
  return httpServer;
}
