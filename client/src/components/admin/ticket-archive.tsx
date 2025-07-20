import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Search, Calendar, User, Monitor, MapPin, Clock, Eye, Trash2, Filter, Download, RefreshCw, AlertTriangle, FileText, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface TicketLog {
  id: number;
  ticketId: number;
  rmaNumber: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  description: string;
  editedBy: string;
  createdAt: string;
}

interface TicketArchiveProps {
  sessionId: string;
}

export default function TicketArchive({ sessionId }: TicketArchiveProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [problemFilter, setProblemFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedTicketForLogs, setSelectedTicketForLogs] = useState<SupportTicket | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const { data: allTickets = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/archived-tickets"],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch("/api/admin/archived-tickets", {
        headers: {
          "x-session-id": sessionId,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      return response.json();
    },
  });

  // Get unique values for filter dropdowns
  const uniqueProblems = [...new Set(allTickets.map((t: SupportTicket) => t.errorType))];
  const uniqueAssignees = [...new Set(allTickets.filter((t: SupportTicket) => t.assignedTo).map((t: SupportTicket) => t.assignedTo))];
  const uniquePriorities = [...new Set(allTickets.filter((t: SupportTicket) => t.priorityLevel).map((t: SupportTicket) => t.priorityLevel))];

  // Query for ticket logs
  const { data: ticketLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['/api/admin/tickets', selectedTicketForLogs?.rmaNumber, 'logs'],
    enabled: !!selectedTicketForLogs?.rmaNumber,
    queryFn: async () => {
      const response = await fetch(`/api/admin/tickets/${selectedTicketForLogs?.rmaNumber}/logs`, {
        headers: {
          'x-session-id': sessionId,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch ticket logs');
      }
      return response.json();
    },
  });

  const filteredTickets = allTickets.filter((ticket: SupportTicket) => {
    const matchesSearch = searchTerm === "" || 
      ticket.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().includes(searchTerm.toLowerCase()) ||
      ticket.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.errorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.displayNumber && ticket.displayNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.displayLocation && ticket.displayLocation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.contactEmail && ticket.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.contactPerson && ticket.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.contactTitle && ticket.contactTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.returnAddress && ticket.returnAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.alternativeAddress && ticket.alternativeAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.alternativeCity && ticket.alternativeCity.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.alternativeZip && ticket.alternativeZip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.notes && ticket.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.assignedTo && ticket.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priorityLevel === priorityFilter;
    const matchesProblem = problemFilter === "all" || ticket.errorType === problemFilter;
    const matchesAssignee = assigneeFilter === "all" || ticket.assignedTo === assigneeFilter;
    const matchesArchive = archiveFilter === "all" || 
      (archiveFilter === "active" && !ticket.isArchived) ||
      (archiveFilter === "archived" && ticket.isArchived);
    
    // Date filters
    let matchesDate = true;
    if (dateFilter !== "all") {
      const now = new Date();
      const ticketDate = new Date(ticket.createdAt);
      
      switch (dateFilter) {
        case "today":
          matchesDate = ticketDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = ticketDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = ticketDate >= monthAgo;
          break;
        case "quarter":
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = ticketDate >= quarterAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProblem && matchesAssignee && matchesArchive && matchesDate;
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
        refetch();
      }
    } catch (error) {
      console.error('Test archiving failed:', error);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setProblemFilter("all");
    setAssigneeFilter("all");
    setDateFilter("all");
    setArchiveFilter("all");
  };

  const exportToCSV = () => {
    const headers = ["Ticket-ID", "RMA-Nummer", "Account-Nummer", "Display-Nummer", "Display-Ort", "Rücksendeadresse", "Problem", "Status", "Priorität", "Zugewiesen", "E-Mail", "Ansprechpartner", "Anrede", "Alternative Adresse", "Alternative Stadt", "Alternative PLZ", "Erstellt", "Notizen", "Archiviert"];
    const csvData = filteredTickets.map((ticket: SupportTicket) => [
      ticket.id,
      ticket.rmaNumber,
      ticket.accountNumber,
      ticket.displayNumber || "",
      ticket.displayLocation || "",
      ticket.returnAddress || "",
      ticket.errorType,
      ticket.status,
      ticket.priorityLevel || "",
      ticket.assignedTo || "",
      ticket.contactEmail,
      ticket.contactPerson || "",
      ticket.contactTitle || "",
      ticket.alternativeAddress || "",
      ticket.alternativeCity || "",
      ticket.alternativeZip || "",
      formatDate(ticket.createdAt),
      ticket.notes || "",
      ticket.isArchived ? "Ja" : "Nein"
    ]);
    
    const csvContent = [headers, ...csvData].map(row => 
      row.map(cell => `"${cell}"`).join(",")
    ).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ticket-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openLogsModal = (ticket: SupportTicket) => {
    setSelectedTicketForLogs(ticket);
    setShowLogsModal(true);
  };

  const closeLogsModal = () => {
    setShowLogsModal(false);
    setSelectedTicketForLogs(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket-Datenbank</h1>
          <p className="text-gray-600 mt-1">
            Alle Tickets durchsuchbar und filterbar - vollständige Reparatur-Historie
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="text-purple-600 border-purple-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="text-green-600 border-green-300"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV Export
          </Button>
          <Button
            onClick={handleTestArchive}
            variant="outline"
            className="text-purple-600 border-purple-300"
          >
            Test Archivierung
          </Button>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <Card className="glassmorphism border-0 apple-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Alles durchsuchen: RMA, Ticket-ID, Account, Display-Nr., Standort, Ansprechpartner, Adresse, Notizen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button
                onClick={clearAllFilters}
                variant="outline"
                size="sm"
              >
                Zurücksetzen
              </Button>
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Alle Status</option>
                <option value="pending">Ausstehend</option>
                <option value="workshop">Workshop</option>
                <option value="shipped">Versendet</option>
              </select>
              
              <select
                value={archiveFilter}
                onChange={(e) => setArchiveFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Alle Tickets</option>
                <option value="active">Aktive</option>
                <option value="archived">Archivierte</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Alle Zeiten</option>
                <option value="today">Heute</option>
                <option value="week">Diese Woche</option>
                <option value="month">Dieser Monat</option>
                <option value="quarter">Letztes Quartal</option>
              </select>
            </div>
            
            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
                  <select
                    value={problemFilter}
                    onChange={(e) => setProblemFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Alle Probleme</option>
                    {uniqueProblems.map(problem => (
                      <option key={problem} value={problem}>{problem}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Alle Prioritäten</option>
                    <option value="normal">Normal</option>
                    <option value="high">Hoch</option>
                    <option value="urgent">Dringend</option>
                    {uniquePriorities.filter(p => p && !['normal', 'high', 'urgent'].includes(p)).map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zugewiesen an</label>
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Alle Bearbeiter</option>
                    <option value="">Nicht zugewiesen</option>
                    {uniqueAssignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#6d0df0' }}>
              {allTickets.length}
            </div>
            <div className="text-sm text-gray-600">Gesamt Tickets</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {allTickets.filter((t: SupportTicket) => t.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Ausstehend</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {allTickets.filter((t: SupportTicket) => t.status === 'workshop').length}
            </div>
            <div className="text-sm text-gray-600">Workshop</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {allTickets.filter((t: SupportTicket) => t.status === 'shipped').length}
            </div>
            <div className="text-sm text-gray-600">Versendet</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {allTickets.filter((t: SupportTicket) => t.isArchived).length}
            </div>
            <div className="text-sm text-gray-600">Archiviert</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0 apple-shadow">
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#6d0df0' }}>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Tickets gefunden</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || problemFilter !== "all" || assigneeFilter !== "all" || dateFilter !== "all" || archiveFilter !== "all"
                    ? "Keine Tickets entsprechen Ihren Suchkriterien." 
                    : "Es sind noch keine Tickets vorhanden."}
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
                      <div className="text-xs text-gray-500">ID: #{ticket.id}</div>
                      <div className="text-xs text-gray-400">•</div>
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

                    {ticket.contactPerson && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          {ticket.contactTitle} {ticket.contactPerson}
                        </div>
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
                        Status
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => openLogsModal(ticket)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Logs Modal */}
      <Dialog open={showLogsModal} onOpenChange={setShowLogsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold" style={{ color: '#6d0df0' }}>
                Ticket-Logs: {selectedTicketForLogs?.rmaNumber}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeLogsModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              Vollständige Reparatur-Historie und Änderungen
            </div>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {/* Ticket Info Summary */}
            <Card className="glassmorphism border-0">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Ticket-ID</div>
                    <div className="text-gray-600">#{selectedTicketForLogs?.id}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Account</div>
                    <div className="text-gray-600">{selectedTicketForLogs?.accountNumber}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Status</div>
                    <Badge className={getStatusColor(selectedTicketForLogs?.status || '')}>
                      {selectedTicketForLogs?.status === 'pending' ? 'Ausstehend' :
                       selectedTicketForLogs?.status === 'workshop' ? 'Workshop' :
                       selectedTicketForLogs?.status === 'shipped' ? 'Versendet' : selectedTicketForLogs?.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Problem</div>
                    <div className="text-gray-600">{selectedTicketForLogs?.errorType}</div>
                  </div>
                  {selectedTicketForLogs?.displayNumber && (
                    <div>
                      <div className="font-medium text-gray-700">Display-Nr.</div>
                      <div className="text-gray-600">{selectedTicketForLogs.displayNumber}</div>
                    </div>
                  )}
                  {selectedTicketForLogs?.displayLocation && (
                    <div>
                      <div className="font-medium text-gray-700">Standort</div>
                      <div className="text-gray-600">{selectedTicketForLogs.displayLocation}</div>
                    </div>
                  )}
                  {selectedTicketForLogs?.contactPerson && (
                    <div>
                      <div className="font-medium text-gray-700">Ansprechpartner</div>
                      <div className="text-gray-600">
                        {selectedTicketForLogs.contactTitle} {selectedTicketForLogs.contactPerson}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-700">Erstellt</div>
                    <div className="text-gray-600">
                      {selectedTicketForLogs ? formatDate(selectedTicketForLogs.createdAt) : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logs Section */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Verlauf ({ticketLogs.length} Einträge)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="p-3 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ticketLogs.length > 0 ? (
                      ticketLogs.map((log: TicketLog) => (
                        <Card key={log.id} className="p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {log.description}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <span>von {log.editedBy}</span>
                                <span>•</span>
                                <span>{new Date(log.createdAt).toLocaleString('de-DE')}</span>
                              </div>
                              {log.previousValue && log.newValue && (
                                <div className="mt-2 text-xs">
                                  <span className="text-red-600">Von: {log.previousValue}</span>
                                  <span className="mx-2">→</span>
                                  <span className="text-green-600">Zu: {log.newValue}</span>
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs ml-4">
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <div className="text-sm">Keine Logs verfügbar</div>
                        <div className="text-xs text-gray-400">
                          Logs werden erstellt wenn Änderungen am Ticket vorgenommen werden.
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}