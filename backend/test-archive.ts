// Test script to check and manually archive old tickets
import { storage } from "./storage";

async function testArchiving() {
  console.log('=== Testing Archive System ===');
  
  // Check all tickets
  const allTickets = await storage.getAllSupportTickets();
  console.log(`Current active tickets: ${allTickets.length}`);
  
  // Check archived tickets
  const archivedTickets = await storage.getArchivedTickets();
  console.log(`Current archived tickets: ${archivedTickets.length}`);
  
  // Check if any tickets should be archived (for testing, let's check 7 days old)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const oldTickets = allTickets.filter(ticket => 
    new Date(ticket.createdAt) < sevenDaysAgo
  );
  
  console.log(`Tickets older than 7 days: ${oldTickets.length}`);
  oldTickets.forEach(ticket => {
    console.log(`  - ${ticket.rmaNumber} (${ticket.createdAt})`);
  });
  
  // Try archiving
  console.log('\n=== Running Archive Job ===');
  const archivedCount = await storage.archiveOldTickets();
  console.log(`Archived ${archivedCount} tickets`);
  
  // Check again
  const newArchivedTickets = await storage.getArchivedTickets();
  console.log(`Archived tickets after job: ${newArchivedTickets.length}`);
}

// Run if called directly
if (require.main === module) {
  testArchiving().catch(console.error);
}

export { testArchiving };