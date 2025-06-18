import { users, customers, supportTickets, type User, type InsertUser, type Customer, type InsertCustomer, type SupportTicket, type InsertSupportTicket } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getCustomerByNumber(customerNumber: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getSupportTicket(rmaNumber: string): Promise<SupportTicket | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<string, Customer>;
  private supportTickets: Map<string, SupportTicket>;
  private currentUserId: number;
  private currentCustomerId: number;
  private currentTicketId: number;

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.supportTickets = new Map();
    this.currentUserId = 1;
    this.currentCustomerId = 1;
    this.currentTicketId = 1;

    // Add some demo customers for validation
    this.createCustomer({ customerNumber: "KD123456", email: "test@example.com", name: "Test Customer" });
    this.createCustomer({ customerNumber: "KD789012", email: "demo@example.com", name: "Demo Customer" });
    this.createCustomer({ customerNumber: "KD345678", email: "sample@example.com", name: "Sample Customer" });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCustomerByNumber(customerNumber: string): Promise<Customer | undefined> {
    return this.customers.get(customerNumber);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = this.currentCustomerId++;
    const customer: Customer = { ...insertCustomer, id };
    this.customers.set(insertCustomer.customerNumber, customer);
    return customer;
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.currentTicketId++;
    const ticket: SupportTicket = { 
      ...insertTicket, 
      id,
      createdAt: new Date()
    };
    this.supportTickets.set(insertTicket.rmaNumber, ticket);
    return ticket;
  }

  async getSupportTicket(rmaNumber: string): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(rmaNumber);
  }
}

export const storage = new MemStorage();
