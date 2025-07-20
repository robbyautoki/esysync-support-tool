import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Search, Calendar, User, Monitor, MapPin, Clock, Eye, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SupportTicket {
  id: number;
  rmaNumber: string;
  accountNumber: string;
  displayNumber?: string;
  displayLocation?: string;
  returnAddress?: string;
  contactEmail: string;
  contactPerson?: string;
  contactTitle?: string;
  alternativeShipping?: boolean;
  alternativeAddress?: string;
  alternativeCity?: string;
  alternativeZip?: string;
  errorType: string;
  shippingMethod: string;
  restartConfirmed: boolean;
  status: string;
  assignedTo?: string;
  priorityLevel?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  isArchived: boolean;
}

interface TicketArchiveProps {
  sessionId: string;
}

export default function TicketArchive({ sessionId }: TicketArchiveProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: archivedTickets = [], isLoading } = useQuery({
    queryKey: ["/api/admin/archived-tickets"],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch("/api/admin/archived-tickets", {
        headers: {
          "x-session-id": sessionId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch archived tickets");
      }
      return response.json();
    },
  });

  const filteredTickets = archivedTickets.filter((ticket: SupportTicket) => {
    const matchesSearch = searchTerm === "" || 
      ticket.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.errorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.displayNumber && ticket.displayNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.displayLocation && ticket.displayLocation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTestArchive = async () => {
    try {
      const response = await fetch('/api/admin/test-archive', {
        method: 'POST',
        headers: {
          'x-session-id': sessionId,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Test archiving failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket-Archiv</h1>
          <p className="text-gray-600 mt-1">
            Archivierte Tickets nach 30 Tagen - durchsuchbar und filterbar
          </p>
        </div>
        <Button
          onClick={handleTestArchive}
          variant="outline"
          className="text-purple-600 border-purple-300"
        >
          Test Archivierung
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="glassmorphism border-0 apple-shadow">
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="RMA-Nummer, Account-Nummer oder Problem suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Alle Status</option>
              <option value="pending">Ausstehend</option>
              <option value="workshop">Workshop</option>
              <option value="shipped">Versendet</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#6d0df0' }}>
              {archivedTickets.length}
            </div>
            <div className="text-sm text-gray-600">Archivierte Tickets</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {archivedTickets.filter((t: SupportTicket) => t.status === 'shipped').length}
            </div>
            <div className="text-sm text-gray-600">Erfolgreich versendet</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {archivedTickets.filter((t: SupportTicket) => t.status === 'workshop').length}
            </div>
            <div className="text-sm text-gray-600">In Workshop archiviert</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {filteredTickets.length}
            </div>
            <div className="text-sm text-gray-600">Gefilterte Ergebnisse</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="glassmorphism border-0 apple-shadow animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Tickets Grid */}
          {filteredTickets.length === 0 ? (
            <Card className="glassmorphism border-0 apple-shadow">
              <CardContent className="p-12 text-center">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine archivierten Tickets gefunden</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" 
                    ? "Keine Tickets entsprechen Ihren Suchkriterien." 
                    : "Es sind noch keine Tickets archiviert worden."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTickets.map((ticket: SupportTicket) => (
                <Card key={ticket.id} className="glassmorphism border-0 apple-shadow hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold" style={{ color: '#6d0df0' }}>
                        {ticket.rmaNumber}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status === 'pending' ? 'Ausstehend' :
                           ticket.status === 'workshop' ? 'Workshop' :
                           ticket.status === 'shipped' ? 'Versendet' : ticket.status}
                        </Badge>
                        {ticket.priorityLevel && ticket.priorityLevel !== 'normal' && (
                          <Badge className={getPriorityColor(ticket.priorityLevel)}>
                            {ticket.priorityLevel === 'urgent' ? 'Dringend' :
                             ticket.priorityLevel === 'high' ? 'Hoch' : ticket.priorityLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-600">{ticket.accountNumber}</div>
                    </div>
                    
                    {ticket.displayNumber && (
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">{ticket.displayNumber}</div>
                      </div>
                    )}

                    {ticket.displayLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">{ticket.displayLocation}</div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">Problem</div>
                      <div className="text-sm text-gray-600">{ticket.errorType}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</div>
                      </div>
                      {ticket.assignedTo && (
                        <div className="text-xs text-gray-500">
                          Zugewiesen: {ticket.assignedTo}
                        </div>
                      )}
                    </div>

                    {ticket.notes && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-1">Notizen</div>
                        <div className="text-sm text-gray-600 truncate">{ticket.notes}</div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => window.open(`/track/${ticket.rmaNumber}`, '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}