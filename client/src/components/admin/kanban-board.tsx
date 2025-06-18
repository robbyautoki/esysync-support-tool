import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Wrench, Truck, Maximize2, Minimize2, X, Clock, CheckCircle, AlertCircle, ArrowRight, Filter, Search, MoreVertical, Calendar, User, MapPin, Mail } from "lucide-react";
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
    bgGradient: "bg-gradient-to-br from-purple-50/90 to-purple-100/90",
    iconColor: "#8b5cf6",
    accentColor: "rgba(139, 92, 246, 0.15)",
    borderGlow: "shadow-purple-300/30"
  },
  workshop: {
    title: "Eingänge im Workshop", 
    icon: Wrench,
    color: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 border-amber-300/50",
    bgGradient: "bg-gradient-to-br from-amber-50/90 to-amber-100/90",
    iconColor: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.15)",
    borderGlow: "shadow-amber-300/30"
  },
  shipped: {
    title: "Versand zum Kunden",
    icon: Truck,
    color: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300/50",
    bgGradient: "bg-gradient-to-br from-emerald-50/90 to-emerald-100/90", 
    iconColor: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.15)",
    borderGlow: "shadow-emerald-300/30"
  }
};

export default function KanbanBoard({ sessionId }: KanbanBoardProps) {
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
        method: "PUT",
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
        description: "Der Ticket-Status wurde erfolgreich geändert.",
      });
    },
  });

  const handleStatusChange = (ticket: SupportTicket, newStatus: string) => {
    updateStatusMutation.mutate({
      rmaNumber: ticket.rmaNumber,
      status: newStatus,
      statusDetails,
      trackingNumber,
    });
  };

  // Group tickets by status
  const groupedTickets = {
    pending: tickets.filter(ticket => ticket.status === "pending"),
    workshop: tickets.filter(ticket => ticket.status === "workshop"),
    shipped: tickets.filter(ticket => ticket.status === "shipped"),
  };

  // Filter tickets based on search
  const filteredGroupedTickets = Object.keys(groupedTickets).reduce((acc, status) => {
    acc[status as keyof typeof groupedTickets] = groupedTickets[status as keyof typeof groupedTickets].filter(ticket =>
      ticket.rmaNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.errorType.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return acc;
  }, {} as typeof groupedTickets);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glassmorphism rounded-3xl p-8 apple-shadow backdrop-blur-2xl">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="text-lg font-medium text-gray-700">Lade RMA-Tickets...</span>
          </div>
        </div>
      </div>
    );
  }

  const kanbanContent = (
    <div className="space-y-8 min-h-screen">
      {/* Ultra-Modern Header */}
      <div className="glassmorphism rounded-3xl p-8 apple-shadow backdrop-blur-3xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-purple-900 bg-clip-text text-transparent mb-3">
              RMA Ticket Kanban Board
            </h1>
            <p className="text-xl text-gray-600 font-medium">Verwalten Sie den Status aller RMA-Tickets mit modernster Technologie</p>
          </div>
          
          {/* Advanced Control Panel */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <Input
                placeholder="Tickets durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 w-80 glassmorphism-strong border-white/40 rounded-2xl focus:border-purple-400 transition-all duration-300 text-gray-700 placeholder-gray-500"
              />
            </div>
            
            <Button
              variant="outline"
              className="px-6 py-3 rounded-2xl glassmorphism-strong border-white/40 hover:bg-white/30 transition-all duration-300 group font-medium"
            >
              <Filter className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" style={{ color: '#6d0df0' }} />
              Filter
            </Button>
            
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              className="px-6 py-3 rounded-2xl glassmorphism-strong border-white/40 hover:bg-white/30 transition-all duration-300 group font-medium"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" style={{ color: '#6d0df0' }} />
                  Minimieren
                </>
              ) : (
                <>
                  <Maximize2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" style={{ color: '#6d0df0' }} />
                  Vollbild
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTickets = filteredGroupedTickets[status as keyof typeof filteredGroupedTickets];
            return (
              <div 
                key={status} 
                className="glassmorphism-strong rounded-2xl p-6 text-center group hover:scale-105 transition-all duration-500 border border-white/30 hover:border-white/50"
                style={{ background: config.accentColor }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <config.icon className="w-8 h-8" style={{ color: config.iconColor }} />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 mb-2">{statusTickets.length}</div>
                <p className="text-sm text-gray-700 font-semibold uppercase tracking-wide">{config.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revolutionary Kanban Columns */}
      <div className={`grid gap-8 ${isFullscreen ? 'grid-cols-1 2xl:grid-cols-3' : 'grid-cols-1 xl:grid-cols-3'}`}>
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusTickets = filteredGroupedTickets[status as keyof typeof filteredGroupedTickets];
          const IconComponent = config.icon;

          return (
            <div 
              key={status} 
              className="relative group overflow-hidden"
            >
              {/* Column Container with Advanced Glassmorphism */}
              <div 
                className="backdrop-blur-3xl rounded-3xl border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-2 overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${config.accentColor} 0%, rgba(255,255,255,0.1) 100%)`,
                }}
              >
                {/* Column Header */}
                <div className="p-6 border-b border-white/30 bg-gradient-to-r from-white/10 to-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500">
                        <IconComponent className="w-7 h-7" style={{ color: config.iconColor }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                          {config.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {statusTickets.length} {statusTickets.length === 1 ? 'Ticket' : 'Tickets'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge 
                        className={`${config.color} px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm`}
                      >
                        {statusTickets.length}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-3 rounded-2xl hover:bg-white/30 transition-all duration-300"
                      >
                        <MoreVertical className="w-5 h-5" style={{ color: config.iconColor }} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Tickets Container */}
                <div className={`p-6 space-y-6 overflow-y-auto ${isFullscreen ? 'max-h-[80vh]' : 'max-h-[700px]'}`}>
                  {statusTickets.map((ticket: SupportTicket, index: number) => (
                    <div
                      key={ticket.id}
                      className="group/ticket relative glassmorphism-strong rounded-3xl p-6 space-y-5 hover:bg-white/50 transition-all duration-500 border border-white/40 hover:border-white/60 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden"
                      style={{
                        animation: `slideInUp 0.6s ease-out ${index * 0.15}s both`,
                        backdropFilter: 'blur(20px)',
                      }}
                    >
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.iconColor }}></div>
                          <h4 className="font-black text-lg text-gray-900 group-hover/ticket:text-gray-800 transition-colors">
                            {ticket.rmaNumber}
                          </h4>
                        </div>
                        <Badge 
                          className="px-3 py-1 rounded-full text-xs font-bold bg-white/30 text-gray-700 backdrop-blur-sm"
                        >
                          {ticket.accountNumber}
                        </Badge>
                      </div>
                      
                      {/* Ticket Details */}
                      <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center space-x-3">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Account:</span>
                            <span className="text-gray-600">{ticket.accountNumber}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Display:</span>
                            <span className="text-gray-600">{ticket.displayNumber}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Problem:</span>
                            <span className="text-gray-600">{ticket.errorType}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Standort:</span>
                            <span className="text-gray-600 truncate">{ticket.displayLocation?.substring(0, 40)}...</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Email:</span>
                            <span className="text-gray-600">{ticket.contactEmail}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Versand:</span>
                            <span className="text-gray-600">{ticket.shippingMethod}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold text-gray-700">Erstellt:</span>
                            <span className="text-gray-600">{new Date(ticket.createdAt).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>

                        {/* Status Details */}
                        {ticket.statusDetails && (
                          <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Details:</p>
                            <p className="text-sm text-gray-600">{ticket.statusDetails}</p>
                          </div>
                        )}
                        
                        {ticket.trackingNumber && (
                          <div className="p-4 rounded-2xl bg-white/30 backdrop-blur-sm">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Tracking:</p>
                            <p className="text-sm text-gray-600 font-mono">{ticket.trackingNumber}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/30">
                        {status === "pending" && (
                          <Button
                            onClick={() => handleStatusChange(ticket, "workshop")}
                            disabled={updateStatusMutation.isPending}
                            size="sm"
                            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 transition-all duration-300"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            → Workshop
                          </Button>
                        )}
                        {status === "workshop" && (
                          <Button
                            onClick={() => handleStatusChange(ticket, "shipped")}
                            disabled={updateStatusMutation.isPending}
                            size="sm"
                            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 transition-all duration-300"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            → Versenden
                          </Button>
                        )}
                        {status !== "pending" && (
                          <Button
                            onClick={() => handleStatusChange(ticket, "pending")}
                            disabled={updateStatusMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold px-4 py-2 rounded-xl border-white/40 hover:bg-white/30 transition-all duration-300"
                          >
                            ← Zurück
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {statusTickets.length === 0 && (
                    <div className="text-center py-16">
                      <div className="glassmorphism-strong rounded-3xl p-8 border border-white/30">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/30 flex items-center justify-center">
                          <IconComponent className="w-8 h-8" style={{ color: config.iconColor }} />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">Keine Tickets in diesem Status</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-gray-50/98 to-white/95 backdrop-blur-2xl p-8 overflow-auto">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-purple-900 bg-clip-text text-transparent mb-2">
                RMA Ticket Kanban Board - Vollbild
              </h2>
              <p className="text-xl text-gray-600 font-medium">Verwalten Sie den Status aller RMA-Tickets</p>
            </div>
            <Button
              onClick={() => setIsFullscreen(false)}
              variant="outline"
              className="px-6 py-3 rounded-2xl glassmorphism-strong border-white/40 hover:bg-white/30 transition-all duration-300 group"
            >
              <X className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" style={{ color: '#6d0df0' }} />
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