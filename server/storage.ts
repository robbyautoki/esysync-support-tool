import { users, customers, supportTickets, errorTypes, type User, type InsertUser, type Customer, type InsertCustomer, type SupportTicket, type InsertSupportTicket, type ErrorType, type InsertErrorType } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCustomerByNumber(customerNumber: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(rmaNumber: string): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  updateSupportTicketStatus(rmaNumber: string, status: string, statusDetails?: string, trackingNumber?: string): Promise<SupportTicket>;
  getActiveErrorTypes(): Promise<ErrorType[]>;
  createErrorType(errorType: InsertErrorType): Promise<ErrorType>;
  updateErrorType(id: number, updates: Partial<InsertErrorType>): Promise<ErrorType>;
  deleteErrorType(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCustomerByNumber(customerNumber: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.customerNumber, customerNumber));
    return customer || undefined;
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const [customer] = await db
      .insert(customers)
      .values(insertCustomer)
      .returning();
    return customer;
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db
      .insert(supportTickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async getSupportTicket(rmaNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.rmaNumber, rmaNumber));
    return ticket || undefined;
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(supportTickets).orderBy(supportTickets.createdAt);
  }

  async updateSupportTicketStatus(rmaNumber: string, status: string, statusDetails?: string, trackingNumber?: string): Promise<SupportTicket> {
    const [ticket] = await db
      .update(supportTickets)
      .set({ 
        status, 
        statusDetails, 
        trackingNumber,
        updatedAt: new Date()
      })
      .where(eq(supportTickets.rmaNumber, rmaNumber))
      .returning();
    return ticket;
  }

  async getActiveErrorTypes(): Promise<ErrorType[]> {
    return await db.select().from(errorTypes).where(eq(errorTypes.isActive, true));
  }

  async createErrorType(errorType: InsertErrorType): Promise<ErrorType> {
    const [newErrorType] = await db
      .insert(errorTypes)
      .values(errorType)
      .returning();
    return newErrorType;
  }

  async updateErrorType(id: number, updates: Partial<InsertErrorType>): Promise<ErrorType> {
    const [updatedErrorType] = await db
      .update(errorTypes)
      .set(updates)
      .where(eq(errorTypes.id, id))
      .returning();
    return updatedErrorType;
  }

  async deleteErrorType(id: number): Promise<void> {
    await db.delete(errorTypes).where(eq(errorTypes.id, id));
  }
}

export const storage = new DatabaseStorage();
