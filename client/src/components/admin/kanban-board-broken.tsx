import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Wrench, Truck, Maximize2, Minimize2, X, Clock, CheckCircle, AlertCircle, ArrowRight, Filter, Search, MoreVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket } from "@shared/schema";

interface KanbanBoardProps {
  sessionId: string;
}

const statusConfig = {
  pending: {
    title: "Offene Einsendungen",
    icon: Package,
    color: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 border-purple-300/50",
    bgGradient: "bg-gradient-to-br from-purple-50/80 to-purple-100/80",
    iconColor: "#8b5cf6",
    accentColor: "rgba(139, 92, 246, 0.1)",
    borderGlow: "shadow-purple-200/50"
  },
  workshop: {
    title: "Eingänge im Workshop", 
    icon: Wrench,
    color: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 border-amber-300/50",
    bgGradient: "bg-gradient-to-br from-amber-50/80 to-amber-100/80",
    iconColor: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.1)",
    borderGlow: "shadow-amber-200/50"
  },
  shipped: {
    title: "Versand zum Kunden",
    icon: Truck,
    color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300/50",
    bgGradient: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/80", 
    iconColor: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.1)",
    borderGlow: "shadow-emerald-200/50"
  }
};

export default function KanbanBoard({ sessionId }: KanbanBoardProps) {
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [draggedTicket, setDraggedTicket] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/tickets"],
    meta: {
      headers: { "x-session-id": sessionId },
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ rmaNumber, status, statusDetails, trackingNumber }: {
      rmaNumber: string;
      status: string;
      statusDetails?: string;
      trackingNumber?: string;
    }) => {
      const response = await fetch(`/api/admin/tickets/${rmaNumber}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ status, statusDetails, trackingNumber }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      setEditingTicket(null);
      setStatusDetails("");
      setTrackingNumber("");
      toast({
        title: "Status aktualisiert",
        description: "Ticket-Status wurde erfolgreich geändert",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (ticket: SupportTicket, newStatus: string) => {
    if (newStatus === "shipped") {
      setEditingTicket(ticket.rmaNumber);
    } else {
      updateStatusMutation.mutate({
        rmaNumber: ticket.rmaNumber,
        status: newStatus,
      });
    }
  };

  const handleSaveShipping = () => {
    if (editingTicket) {
      updateStatusMutation.mutate({
        rmaNumber: editingTicket,
        status: "shipped",
        statusDetails,
        trackingNumber,
      });
    }
  };

  const groupedTickets = {
    pending: tickets.filter((t) => t.status === "pending"),
    workshop: tickets.filter((t) => t.status === "workshop"),
    shipped: tickets.filter((t) => t.status === "shipped"),
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderBottomColor: '#6d0df0' }}></div>
        <p className="text-gray-600 mt-4">Lade Tickets...</p>
      </div>
    );
  }

  const kanbanContent = (
    <div className="space-y-8">
      {/* Header with Advanced Controls */}
      <div className="glassmorphism rounded-2xl p-6 apple-shadow backdrop-blur-xl bg-white/10 border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              RMA Ticket Kanban Board
            </h2>
            <p className="text-gray-600 text-lg">Verwalten Sie den Status aller RMA-Tickets mit modernster Technologie</p>
          </div>
          
          {/* Advanced Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tickets durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 glassmorphism-strong border-white/30 rounded-xl"
              />
            </div>
            
            {/* Filter */}
            <Button
              variant="outline"
              className="px-4 py-2 rounded-xl glassmorphism-strong border-white/30 hover:bg-white/20 transition-all duration-300"
            >
              <Filter className="w-4 h-4 mr-2" style={{ color: '#6d0df0' }} />
              Filter
            </Button>
            
            {/* Fullscreen Toggle */}
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              className="px-4 py-2 rounded-xl glassmorphism-strong border-white/30 hover:bg-white/20 transition-all duration-300 group"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" style={{ color: '#6d0df0' }} />
                  Minimieren
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" style={{ color: '#6d0df0' }} />
                  Vollbild
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTickets = groupedTickets[status as keyof typeof groupedTickets];
            return (
              <div key={status} className="glassmorphism-strong rounded-xl p-4 text-center group hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center mb-2">
                  <config.icon className="w-5 h-5 mr-2" style={{ color: config.iconColor }} />
                  <span className="font-medium text-gray-900">{statusTickets.length}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium">{config.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-1 2xl:grid-cols-3' : 'grid-cols-1 xl:grid-cols-3'}`}>
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusTickets = groupedTickets[status as keyof typeof groupedTickets];
          const IconComponent = config.icon;

          return (
            <div 
              key={status} 
              className={`relative group ${config.bgGradient} backdrop-blur-2xl rounded-3xl border border-white/30 ${config.borderGlow} shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1`}
              style={{ 
                background: `linear-gradient(135deg, ${config.accentColor} 0%, rgba(255,255,255,0.1) 100%)`,
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Column Header */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6" style={{ color: config.iconColor }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                        {config.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium">
                        {statusTickets.length} {statusTickets.length === 1 ? 'Ticket' : 'Tickets'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={`${config.color} px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm`}
                    >
                      {statusTickets.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
                    >
                      <MoreVertical className="w-4 h-4" style={{ color: config.iconColor }} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tickets Container */}
              <div className={`p-4 space-y-4 overflow-y-auto ${isFullscreen ? 'max-h-[75vh]' : 'max-h-[600px]'}`}>
                {statusTickets.map((ticket: SupportTicket, index: number) => (
                  <div
                    key={ticket.id}
                    className="group/ticket relative glassmorphism-strong rounded-2xl p-5 space-y-4 hover:bg-white/40 transition-all duration-300 border border-white/30 hover:border-white/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                    style={{
                      animation: `slideInUp 0.3s ease-out ${index * 0.1}s both`,
                      backdropFilter: 'blur(15px)',
                    }}
                  >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {ticket.rmaNumber}
                        </h3>
                        <Badge className={config.color} variant="outline">
                          {ticket.accountNumber}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <p><strong>Account:</strong> {ticket.accountNumber}</p>
                        <p><strong>Display:</strong> {ticket.displayNumber}</p>
                        <p><strong>Problem:</strong> {ticket.errorType}</p>
                        <p><strong>Standort:</strong> {ticket.displayLocation?.substring(0, 50)}...</p>
                        <p><strong>Email:</strong> {ticket.contactEmail}</p>
                        <p><strong>Versand:</strong> {ticket.shippingMethod}</p>
                        <p><strong>Erstellt:</strong> {new Date(ticket.createdAt).toLocaleDateString('de-DE')}</p>
                        {ticket.statusDetails && (
                          <p><strong>Details:</strong> {ticket.statusDetails}</p>
                        )}
                        {ticket.trackingNumber && (
                          <p><strong>Tracking:</strong> {ticket.trackingNumber}</p>
                        )}
                      </div>

                      {editingTicket === ticket.rmaNumber ? (
                        <div className="space-y-2 pt-2 border-t">
                          <Input
                            placeholder="Versanddetails (optional)"
                            value={statusDetails}
                            onChange={(e) => setStatusDetails(e.target.value)}
                            className="text-xs"
                          />
                          <Input
                            placeholder="Tracking-Nummer"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="text-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={handleSaveShipping}
                              disabled={updateStatusMutation.isPending}
                              size="sm"
                              className="text-xs"
                              style={{ backgroundColor: '#6d0df0' }}
                            >
                              Speichern
                            </Button>
                            <Button
                              onClick={() => setEditingTicket(null)}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-1 pt-2 border-t">
                          {status === "pending" && (
                            <Button
                              onClick={() => handleStatusChange(ticket, "workshop")}
                              disabled={updateStatusMutation.isPending}
                              size="sm"
                              className="text-xs"
                              style={{ backgroundColor: '#6d0df0' }}
                            >
                              → Workshop
                            </Button>
                          )}
                          {status === "workshop" && (
                            <Button
                              onClick={() => handleStatusChange(ticket, "shipped")}
                              disabled={updateStatusMutation.isPending}
                              size="sm"
                              className="text-xs"
                              style={{ backgroundColor: '#6d0df0' }}
                            >
                              → Versenden
                            </Button>
                          )}
                          {status !== "pending" && (
                            <Button
                              onClick={() => handleStatusChange(ticket, "pending")}
                              disabled={updateStatusMutation.isPending}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              ← Zurück
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {statusTickets.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Keine Tickets in diesem Status</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50/95 backdrop-blur-xl p-8">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">RMA Ticket Kanban Board - Vollbild</h2>
              <p className="text-gray-600">Verwalten Sie den Status aller RMA-Tickets</p>
            </div>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="outline"
              className="px-4 py-2 rounded-xl glassmorphism-strong border-white/30 hover:bg-white/20 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" style={{ color: '#6d0df0' }} />
              Schließen
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {kanbanContent}
          </div>
        </div>
      </div>
    );
  }

  return kanbanContent;
}