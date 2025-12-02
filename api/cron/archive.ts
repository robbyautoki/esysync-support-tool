import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../backend/storage';
import { ActivityLogger } from '../../backend/activity-logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron request from Vercel
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[CRON] Running auto-archiving job...');
    const archivedCount = await storage.archiveOldTickets();

    if (archivedCount > 0) {
      console.log(`[CRON] Archived ${archivedCount} tickets`);
      await ActivityLogger.logSystemStartup();
    }

    return res.status(200).json({
      success: true,
      archivedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Auto-archiving failed:', error);
    await ActivityLogger.logSystemError('Auto-archiving failed', JSON.stringify(error));

    return res.status(500).json({
      success: false,
      error: 'Auto-archiving failed'
    });
  }
}
