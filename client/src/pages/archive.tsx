import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, FileText, Archive } from "lucide-react";
import type { SupportTicket } from "@shared/schema";

export default function ArchivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: archivedTickets = [], isLoading } = useQuery({
    queryKey: ['/api/admin/tickets/archived'],
  });

  const filteredTickets = archivedTickets.filter((ticket: SupportTicket) => {
    const matchesSearch = 
      ticket.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.errorType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'workshop': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-purple-600">Lade archivierte Tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Archive className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Ticket-Archiv</h1>
          </div>
          <p className="text-gray-600">
            Archivierte Tickets nach 30 Tagen - durchsuchbar und filterbar
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
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
                className="px-3 py-2 border border-gray-300 rounded-md"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{archivedTickets.length}</div>
              <div className="text-sm text-gray-600">Archivierte Tickets</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {archivedTickets.filter((t: SupportTicket) => t.status === 'shipped').length}
              </div>
              <div className="text-sm text-gray-600">Erfolgreich versendet</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {archivedTickets.filter((t: SupportTicket) => t.status === 'workshop').length}
              </div>
              <div className="text-sm text-gray-600">In Workshop archiviert</div>
            </CardContent>
          </Card>
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {filteredTickets.length}
              </div>
              <div className="text-sm text-gray-600">Gefilterte Ergebnisse</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket: SupportTicket) => (
            <Card key={ticket.id} className="backdrop-blur-sm bg-white/80 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-purple-600 font-semibold">
                    {ticket.rmaNumber}
                  </CardTitle>
                  <div className="flex gap-2">
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
                <div>
                  <div className="text-sm font-medium text-gray-700">Account-Nummer</div>
                  <div className="text-sm text-gray-600">{ticket.accountNumber}</div>
                </div>
                
                {ticket.displayNumber && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Display-Nummer</div>
                    <div className="text-sm text-gray-600">{ticket.displayNumber}</div>
                  </div>
                )}

                {ticket.displayLocation && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Standort</div>
                    <div className="text-sm text-gray-600">{ticket.displayLocation}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-700">Problem</div>
                  <div className="text-sm text-gray-600">{ticket.errorType}</div>
                </div>

                {ticket.assignedTo && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Zuständig</div>
                    <div className="text-sm text-gray-600">{ticket.assignedTo}</div>
                  </div>
                )}

                {ticket.processor && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Bearbeiter</div>
                    <div className="text-sm text-gray-600">{ticket.processor}</div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Calendar className="h-3 w-3" />
                  <span>Erstellt: {new Date(ticket.createdAt).toLocaleDateString('de-DE')}</span>
                </div>

                {ticket.archivedAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Archive className="h-3 w-3" />
                    <span>Archiviert: {new Date(ticket.archivedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                )}

                {ticket.notes && (
                  <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <div className="text-xs font-medium text-blue-700 mb-1">Notizen</div>
                    <div className="text-xs text-blue-600">{ticket.notes}</div>
                  </div>
                )}

                {ticket.repairDetails && (
                  <div className="mt-3 p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <div className="text-xs font-medium text-green-700 mb-1">Reparatur-Details</div>
                    <div className="text-xs text-green-600">{ticket.repairDetails}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine archivierten Tickets gefunden</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                  : 'Tickets werden automatisch nach 30 Tagen archiviert.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}