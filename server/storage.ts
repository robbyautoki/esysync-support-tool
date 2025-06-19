import { users, customers, supportTickets, errorTypes, activityLogs, type User, type InsertUser, type InsertEmployee, type Customer, type InsertCustomer, type SupportTicket, type InsertSupportTicket, type ErrorType, type InsertErrorType, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Employee management
  getAllEmployees(): Promise<User[]>;
  createEmployee(employee: any): Promise<User>;
  updateEmployee(id: number, updates: any): Promise<User>;
  deleteEmployee(id: number): Promise<void>;
  toggleEmployeeStatus(id: number, isActive: boolean): Promise<User>;
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
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number, offset?: number): Promise<ActivityLog[]>;
  getActivityLogsByUser(userId: string, userType: string): Promise<ActivityLog[]>;
  getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]>;
  getActivityLogsByType(activityType: string): Promise<ActivityLog[]>;
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

  // Activity log operations
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [activityLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return activityLog;
  }

  async getActivityLogs(limit: number = 100, offset: number = 0): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getActivityLogsByUser(userId: string, userType: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), eq(activityLogs.userType, userType)))
      .orderBy(desc(activityLogs.timestamp));
  }

  async getActivityLogsByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.entityType, entityType), eq(activityLogs.entityId, entityId)))
      .orderBy(desc(activityLogs.timestamp));
  }

  async getActivityLogsByType(activityType: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.activityType, activityType))
      .orderBy(desc(activityLogs.timestamp));
  }

  // Employee management methods
  async getAllEmployees(): Promise<User[]> {
    return await db.select().from(users)
      .orderBy(desc(users.createdAt));
  }

  async createEmployee(employee: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...employee,
        isAdmin: employee.role === 'admin',
      })
      .returning();
    return user;
  }

  async updateEmployee(id: number, updates: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        isAdmin: updates.role === 'admin',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async toggleEmployeeStatus(id: number, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
