import { storage } from "./storage";
import { ActivityLogger } from "./activity-logger";

// Auto-archive tickets older than 30 days
export async function scheduleAutoArchiving() {
  // Run every 24 hours (86400000 ms)
  setInterval(async () => {
    try {
      console.log('[SCHEDULER] Running auto-archiving job...');
      const archivedCount = await storage.archiveOldTickets();
      
      if (archivedCount > 0) {
        console.log(`[SCHEDULER] Archived ${archivedCount} tickets`);
        await ActivityLogger.logSystemStartup(); // Log the archiving action
      }
      
    } catch (error) {
      console.error('[SCHEDULER] Auto-archiving failed:', error);
      await ActivityLogger.logSystemError('Auto-archiving failed', JSON.stringify(error));
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Also run once at startup
  try {
    const archivedCount = await storage.archiveOldTickets();
    if (archivedCount > 0) {
      console.log(`[SCHEDULER] Initial archive: ${archivedCount} tickets archived`);
    }
  } catch (error) {
    console.error('[SCHEDULER] Initial archiving failed:', error);
  }
}