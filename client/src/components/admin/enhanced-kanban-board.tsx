import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Edit, 
  Save, 
  Clock, 
  User, 
  AlertTriangle, 
  FileText,
  Download,
  History,
  Archive,
  Users
} from "lucide-react";
import type { SupportTicket, TicketLog } from "@shared/schema";
import jsPDF from 'jspdf';

interface EnhancedKanbanBoardProps {
  sessionId: string;
}

export default function EnhancedKanbanBoard({ sessionId }: EnhancedKanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Partial<SupportTicket>>({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['/api/admin/tickets'],
  });

  const { data: ticketLogs = [] } = useQuery({
    queryKey: ['/api/admin/tickets', selectedTicket?.rmaNumber, 'logs'],
    enabled: !!selectedTicket?.rmaNumber,
  });

  const updateTicketMutation = useMutation({
    mutationFn: async (data: { rmaNumber: string; updates: Partial<SupportTicket> }) => {
      return await apiRequest(`/api/admin/tickets/${data.rmaNumber}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
      setShowEditDialog(false);
      toast({
        title: "Ticket aktualisiert",
        description: "Das Ticket wurde erfolgreich bearbeitet.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Ticket konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  });

  const statusChangeMutation = useMutation({
    mutationFn: async (data: { rmaNumber: string; status: string }) => {
      return await apiRequest(`/api/admin/tickets/${data.rmaNumber}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: data.status }),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tickets'] });
    }
  });

  const filteredTickets = tickets.filter((ticket: SupportTicket) =>
    ticket.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.errorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.processor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusTickets = (status: string) => 
    filteredTickets.filter((ticket: SupportTicket) => ticket.status === status);

  const getTicketPriorityColor = (ticket: SupportTicket) => {
    const priority = ticket.priorityLevel || 'normal';
    const workshopDays = ticket.workshopEntryDate 
      ? Math.floor((Date.now() - new Date(ticket.workshopEntryDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Red if in workshop for more than 7 days
    if (ticket.status === 'workshop' && workshopDays > 7) {
      return 'border-l-4 border-l-red-500 bg-red-50';
    }

    switch (priority) {
      case 'urgent': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-l-orange-500 bg-orange-50';
      default: return 'border-l-4 border-l-gray-300 bg-white';
    }
  };

  const handleStatusChange = (ticket: SupportTicket, newStatus: string) => {
    statusChangeMutation.mutate({ rmaNumber: ticket.rmaNumber, status: newStatus });
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setShowEditDialog(true);
  };

  const handleSaveTicket = () => {
    if (editingTicket.rmaNumber) {
      updateTicketMutation.mutate({
        rmaNumber: editingTicket.rmaNumber,
        updates: editingTicket
      });
    }
  };

  const generateRepairPDF = (ticket: SupportTicket) => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(18);
    pdf.text('Reparatur-Bericht', 105, 30, { align: 'center' });
    
    // Ticket Info
    let y = 50;
    pdf.setFontSize(12);
    pdf.text(`RMA-Nummer: ${ticket.rmaNumber}`, 20, y);
    y += 10;
    pdf.text(`Account-Nummer: ${ticket.accountNumber}`, 20, y);
    y += 10;
    pdf.text(`Problem: ${ticket.errorType}`, 20, y);
    y += 10;
    pdf.text(`Status: ${ticket.status}`, 20, y);
    y += 15;

    if (ticket.assignedTo) {
      pdf.text(`Zuständig: ${ticket.assignedTo}`, 20, y);
      y += 10;
    }

    if (ticket.processor) {
      pdf.text(`Bearbeiter: ${ticket.processor}`, 20, y);
      y += 10;
    }

    y += 10;
    pdf.text('Reparatur-Details:', 20, y);
    y += 10;
    
    if (ticket.repairDetails) {
      const lines = pdf.splitTextToSize(ticket.repairDetails, 170);
      pdf.text(lines, 20, y);
      y += lines.length * 6;
    } else {
      pdf.text('Keine Reparatur-Details verfügbar', 20, y);
      y += 10;
    }

    if (ticket.repairLog) {
      y += 10;
      pdf.text('Reparatur-Log:', 20, y);
      y += 10;
      const logLines = pdf.splitTextToSize(ticket.repairLog, 170);
      pdf.text(logLines, 20, y);
    }

    pdf.save(`Reparatur-${ticket.rmaNumber}.pdf`);
  };

  const getWorkshopDays = (ticket: SupportTicket) => {
    if (!ticket.workshopEntryDate) return 0;
    return Math.floor((Date.now() - new Date(ticket.workshopEntryDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-600">Lade Tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tickets durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => window.location.href = '/archive'}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          Archiv
        </Button>
      </div>

      {/* Enhanced Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['pending', 'workshop', 'shipped'].map((status) => {
          const statusTickets = getStatusTickets(status);
          const statusTitle = status === 'pending' ? 'Ausstehend' : 
                             status === 'workshop' ? 'Workshop' : 'Versendet';
          
          return (
            <Card key={status} className="min-h-[500px]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {statusTitle}
                    <Badge variant="secondary">{statusTickets.length}</Badge>
                  </span>
                  {status === 'workshop' && (
                    <AlertTriangle className="h-4 w-4 text-orange-500" title="Überwachung aktiv" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusTickets.map((ticket: SupportTicket) => {
                  const workshopDays = getWorkshopDays(ticket);
                  const isOverdue = status === 'workshop' && workshopDays > 7;
                  
                  return (
                    <Card
                      key={ticket.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${getTicketPriorityColor(ticket)}`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-purple-600 text-sm">
                              {ticket.rmaNumber}
                            </div>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                {workshopDays}d
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-600">
                            <div>Account: {ticket.accountNumber}</div>
                            <div className="truncate">{ticket.errorType}</div>
                          </div>

                          {ticket.assignedTo && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <User className="h-3 w-3" />
                              {ticket.assignedTo}
                            </div>
                          )}

                          {ticket.processor && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Users className="h-3 w-3" />
                              {ticket.processor}
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString('de-DE')}
                          </div>

                          <div className="flex gap-1 flex-wrap">
                            {status !== 'shipped' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus = status === 'pending' ? 'workshop' : 'shipped';
                                  handleStatusChange(ticket, nextStatus);
                                }}
                              >
                                {status === 'pending' ? '→ Workshop' : '→ Versand'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTicket(ticket);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ticket Details - {selectedTicket.rmaNumber}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="repair">Reparatur</TabsTrigger>
                <TabsTrigger value="logs">Verlauf</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Account-Nummer</Label>
                    <Input value={selectedTicket.accountNumber} readOnly />
                  </div>
                  <div>
                    <Label>Display-Nummer</Label>
                    <Input value={selectedTicket.displayNumber || ''} readOnly />
                  </div>
                  <div>
                    <Label>Problem</Label>
                    <Input value={selectedTicket.errorType} readOnly />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={
                      selectedTicket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedTicket.status === 'workshop' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {selectedTicket.status === 'pending' ? 'Ausstehend' :
                       selectedTicket.status === 'workshop' ? 'Workshop' :
                       'Versendet'}
                    </Badge>
                  </div>
                </div>
                
                {selectedTicket.notes && (
                  <div>
                    <Label>Notizen</Label>
                    <Textarea value={selectedTicket.notes} readOnly />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="repair" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Zuständig</Label>
                    <Input value={selectedTicket.assignedTo || ''} readOnly />
                  </div>
                  <div>
                    <Label>Bearbeiter</Label>
                    <Input value={selectedTicket.processor || ''} readOnly />
                  </div>
                </div>
                
                {selectedTicket.repairDetails && (
                  <div>
                    <Label>Reparatur-Details</Label>
                    <Textarea value={selectedTicket.repairDetails} readOnly rows={4} />
                  </div>
                )}
                
                {selectedTicket.repairLog && (
                  <div>
                    <Label>Reparatur-Log</Label>
                    <Textarea value={selectedTicket.repairLog} readOnly rows={4} />
                  </div>
                )}
                
                <Button
                  onClick={() => generateRepairPDF(selectedTicket)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Reparatur-PDF generieren
                </Button>
              </TabsContent>
              
              <TabsContent value="logs" className="space-y-4">
                <div className="space-y-2">
                  {ticketLogs.map((log: TicketLog) => (
                    <Card key={log.id} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{log.description}</div>
                          <div className="text-xs text-gray-500">
                            von {log.editedBy} • {new Date(log.createdAt).toLocaleString('de-DE')}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                  {ticketLogs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Keine Logs verfügbar
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Ticket Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket bearbeiten - {editingTicket.rmaNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedTo">Zuständig</Label>
                <Input
                  id="assignedTo"
                  value={editingTicket.assignedTo || ''}
                  onChange={(e) => setEditingTicket(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Name des Zuständigen"
                />
              </div>
              <div>
                <Label htmlFor="processor">Bearbeiter</Label>
                <Input
                  id="processor"
                  value={editingTicket.processor || ''}
                  onChange={(e) => setEditingTicket(prev => ({ ...prev, processor: e.target.value }))}
                  placeholder="Name des Bearbeiters"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="priorityLevel">Priorität</Label>
              <Select
                value={editingTicket.priorityLevel || 'normal'}
                onValueChange={(value) => setEditingTicket(prev => ({ ...prev, priorityLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={editingTicket.notes || ''}
                onChange={(e) => setEditingTicket(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Interne Notizen zum Ticket"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="repairDetails">Reparatur-Details</Label>
              <Textarea
                id="repairDetails"
                value={editingTicket.repairDetails || ''}
                onChange={(e) => setEditingTicket(prev => ({ ...prev, repairDetails: e.target.value }))}
                placeholder="Was wurde repariert/gemacht?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="repairLog">Reparatur-Log</Label>
              <Textarea
                id="repairLog"
                value={editingTicket.repairLog || ''}
                onChange={(e) => setEditingTicket(prev => ({ ...prev, repairLog: e.target.value }))}
                placeholder="Chronologischer Verlauf der Reparatur"
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveTicket} disabled={updateTicketMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}