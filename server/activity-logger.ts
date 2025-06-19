import { storage } from "./storage";
import type { InsertActivityLog } from "@shared/schema";

export class ActivityLogger {
  static async log(
    activityType: string,
    userType: string,
    description: string,
    options: {
      userId?: string;
      entityType?: string;
      entityId?: string;
      metadata?: object;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<void> {
    try {
      const logData: InsertActivityLog = {
        activityType,
        userType,
        userId: options.userId || null,
        description,
        entityType: options.entityType || null,
        entityId: options.entityId || null,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
      };

      await storage.createActivityLog(logData);
      console.log(`[ACTIVITY LOG] ${activityType}: ${description}`);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Convenience methods for common activities
  static async logTicketCreated(rmaNumber: string, customerNumber: string, errorType: string, req?: any): Promise<void> {
    await this.log(
      'ticket_created',
      'customer',
      `Neues Support-Ticket erstellt: ${rmaNumber} für Fehlertyp "${errorType}"`,
      {
        userId: customerNumber,
        entityType: 'ticket',
        entityId: rmaNumber,
        metadata: { errorType, customerNumber },
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logStatusChanged(rmaNumber: string, oldStatus: string, newStatus: string, adminUser: string, req?: any): Promise<void> {
    await this.log(
      'status_changed',
      'admin',
      `Ticket-Status geändert von "${oldStatus}" zu "${newStatus}" für RMA ${rmaNumber}`,
      {
        userId: adminUser,
        entityType: 'ticket',
        entityId: rmaNumber,
        metadata: { oldStatus, newStatus, rmaNumber },
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logAdminLogin(username: string, req?: any): Promise<void> {
    await this.log(
      'admin_login',
      'admin',
      `Administrator "${username}" hat sich angemeldet`,
      {
        userId: username,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logAdminLogout(username: string, req?: any): Promise<void> {
    await this.log(
      'admin_logout',
      'admin',
      `Administrator "${username}" hat sich abgemeldet`,
      {
        userId: username,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logErrorTypeCreated(errorType: string, adminUser: string, req?: any): Promise<void> {
    await this.log(
      'error_type_created',
      'admin',
      `Neuer Fehlertyp erstellt: "${errorType}"`,
      {
        userId: adminUser,
        entityType: 'error_type',
        entityId: errorType,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logErrorTypeUpdated(errorType: string, adminUser: string, req?: any): Promise<void> {
    await this.log(
      'error_type_updated',
      'admin',
      `Fehlertyp aktualisiert: "${errorType}"`,
      {
        userId: adminUser,
        entityType: 'error_type',
        entityId: errorType,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logErrorTypeDeleted(errorType: string, adminUser: string, req?: any): Promise<void> {
    await this.log(
      'error_type_deleted',
      'admin',
      `Fehlertyp gelöscht: "${errorType}"`,
      {
        userId: adminUser,
        entityType: 'error_type',
        entityId: errorType,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logCustomerCreated(customerNumber: string, req?: any): Promise<void> {
    await this.log(
      'customer_created',
      'customer',
      `Neuer Kunde erstellt: ${customerNumber}`,
      {
        userId: customerNumber,
        entityType: 'customer',
        entityId: customerNumber,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logCustomerValidated(customerNumber: string, req?: any): Promise<void> {
    await this.log(
      'customer_validated',
      'customer',
      `Kundennummer validiert: ${customerNumber}`,
      {
        userId: customerNumber,
        entityType: 'customer',
        entityId: customerNumber,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent'),
      }
    );
  }

  static async logSystemStartup(): Promise<void> {
    await this.log(
      'system_startup',
      'system',
      'System wurde gestartet',
      {
        userId: 'system',
        metadata: { 
          timestamp: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform,
        },
      }
    );
  }

  static async logSystemError(error: string, context?: string): Promise<void> {
    await this.log(
      'system_error',
      'system',
      `Systemfehler aufgetreten: ${error}`,
      {
        userId: 'system',
        metadata: { 
          error,
          context,
          timestamp: new Date().toISOString(),
        },
      }
    );
  }
}

export default ActivityLogger;