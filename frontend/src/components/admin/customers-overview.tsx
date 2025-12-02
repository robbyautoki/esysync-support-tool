import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, User, Mail, Calendar, Monitor, MapPin, Package, MoreHorizontal, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SupportTicket } from "@shared/schema";

interface CustomersOverviewProps {
  sessionId: string;
}

interface CustomerData {
  accountNumber: string;
  contactEmail: string;
  displayNumber: string;
  displayLocation: string;
  returnAddress: string;
  firstTicketDate: string;
  lastTicketDate: string;
  totalTickets: number;
  pendingTickets: number;
  tickets: SupportTicket[];
}

export default function CustomersOverview({ sessionId }: CustomersOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "tickets">("date");

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/tickets"],
    meta: {
      headers: { "x-session-id": sessionId },
    },
  });

  // Group tickets by customer
  const customersMap = new Map<string, CustomerData>();
  
  tickets.forEach(ticket => {
    const key = ticket.accountNumber;
    if (!customersMap.has(key)) {
      customersMap.set(key, {
        accountNumber: ticket.accountNumber,
        contactEmail: ticket.contactEmail,
        displayNumber: ticket.displayNumber,
        displayLocation: ticket.displayLocation || "",
        returnAddress: ticket.returnAddress || "",
        firstTicketDate: ticket.createdAt,
        lastTicketDate: ticket.createdAt,
        totalTickets: 0,
        pendingTickets: 0,
        tickets: []
      });
    }
    
    const customer = customersMap.get(key)!;
    customer.tickets.push(ticket);
    customer.totalTickets++;
    if (ticket.status === "pending") {
      customer.pendingTickets++;
    }
    
    // Update dates
    if (new Date(ticket.createdAt) < new Date(customer.firstTicketDate)) {
      customer.firstTicketDate = ticket.createdAt;
    }
    if (new Date(ticket.createdAt) > new Date(customer.lastTicketDate)) {
      customer.lastTicketDate = ticket.createdAt;
    }
  });

  let customers = Array.from(customersMap.values());

  // Filter customers
  if (searchTerm) {
    customers = customers.filter(customer =>
      customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.displayNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort customers
  customers.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.accountNumber.localeCompare(b.accountNumber);
      case "date":
        return new Date(b.lastTicketDate).getTime() - new Date(a.lastTicketDate).getTime();
      case "tickets":
        return b.totalTickets - a.totalTickets;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Lade Kunden...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Kunden-Übersicht</h1>
            <p className="text-gray-600 mt-1">
              {customers.length} Kunden mit insgesamt {tickets.length} Tickets
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Kunden suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "date" | "tickets")}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="date">Nach Datum sortieren</option>
              <option value="name">Nach Name sortieren</option>
              <option value="tickets">Nach Ticket-Anzahl sortieren</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{customers.length}</div>
            <div className="text-sm text-purple-700">Gesamt Kunden</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{tickets.length}</div>
            <div className="text-sm text-blue-700">Gesamt Tickets</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {tickets.filter(t => t.status === "pending").length}
            </div>
            <div className="text-sm text-orange-700">Offene Tickets</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.status === "shipped").length}
            </div>
            <div className="text-sm text-green-700">Versendete Tickets</div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kunde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erste Anfrage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Letzte Anfrage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer, index) => (
                <tr key={customer.accountNumber} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.accountNumber}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.contactEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Monitor className="h-4 w-4 mr-2 text-gray-400" />
                      {customer.displayNumber}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {customer.displayLocation.substring(0, 30)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(customer.firstTicketDate).toLocaleDateString('de-DE')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(customer.firstTicketDate).toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(customer.lastTicketDate).toLocaleDateString('de-DE')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(customer.lastTicketDate).toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {customer.totalTickets}
                      </Badge>
                      {customer.pendingTickets > 0 && (
                        <Badge className="bg-orange-100 text-orange-700">
                          {customer.pendingTickets} offen
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {customer.tickets.map(ticket => (
                        <Badge 
                          key={ticket.id}
                          variant="outline" 
                          className={`text-xs ${
                            ticket.status === 'pending' ? 'border-orange-300 text-orange-700' :
                            ticket.status === 'workshop' ? 'border-blue-300 text-blue-700' :
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {ticket.rmaNumber}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {customers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Keine Kunden gefunden</p>
          </div>
        )}
      </div>
    </div>
  );
}