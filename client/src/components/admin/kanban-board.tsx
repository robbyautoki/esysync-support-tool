import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Wrench, Truck, Search, ArrowRight, MoreHorizontal, Calendar, User, Monitor, MapPin, Maximize2, Minimize2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket } from "@shared/schema";

interface KanbanBoardProps {
  sessionId: string;
}

const statusConfig = {
  pending: {
    title: "Offen",
    icon: Package,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dotColor: "#8b5cf6"
  },
  workshop: {
    title: "Workshop", 
    icon: Wrench,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dotColor: "#f97316"
  },
  shipped: {
    title: "Versendet",
    icon: Truck,
    color: "bg-green-100 text-green-700 border-green-200",
    dotColor: "#10b981"
  }
};

export default function KanbanBoard({ sessionId }: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/tickets"],
    meta: {
      headers: { "x-session-id": sessionId },
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ rmaNumber, status }: {
      rmaNumber: string;
      status: string;
    }) => {
      const response = await fetch(`/api/admin/tickets/${rmaNumber}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
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
    });
  };

  // Group and filter tickets
  const groupedTickets = {
    pending: tickets.filter(ticket => ticket.status === "pending"),
    workshop: tickets.filter(ticket => ticket.status === "workshop"),
    shipped: tickets.filter(ticket => ticket.status === "shipped"),
  };

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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Lade Tickets...</span>
      </div>
    );
  }

  const kanbanContent = (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">RMA Tickets</h1>
            <p className="text-sm text-gray-500 mt-1">
              {tickets.length} Tickets gesamt
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64 h-9 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="sm"
              className="h-9 px-3"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTickets = filteredGroupedTickets[status as keyof typeof filteredGroupedTickets];
            return (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statusTickets.length}</div>
                <div className="text-sm text-gray-500">{config.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Kanban Columns */}
      <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-1 2xl:grid-cols-3' : 'grid-cols-1 xl:grid-cols-3'}`}>
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusTickets = filteredGroupedTickets[status as keyof typeof filteredGroupedTickets];
          const IconComponent = config.icon;

          return (
            <div key={status} className="bg-white rounded-lg border border-gray-200">
              {/* Column Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.dotColor }}
                    />
                    <h3 className="font-medium text-gray-900">{config.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {statusTickets.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>

              {/* Tickets List */}
              <div className={`p-2 space-y-2 overflow-y-auto ${isFullscreen ? 'max-h-[75vh]' : 'max-h-[600px]'}`}>
                {statusTickets.map((ticket: SupportTicket) => (
                  <div
                    key={ticket.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                  >
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">
                        {ticket.rmaNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        {ticket.accountNumber}
                      </span>
                    </div>
                    
                    {/* Compact Info Grid */}
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{ticket.displayNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{ticket.displayLocation?.substring(0, 30)}...</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {ticket.errorType}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1 mt-3">
                      {status === "pending" && (
                        <Button
                          onClick={() => handleStatusChange(ticket, "workshop")}
                          disabled={updateStatusMutation.isPending}
                          size="sm"
                          className="h-7 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Workshop
                        </Button>
                      )}
                      {status === "workshop" && (
                        <Button
                          onClick={() => handleStatusChange(ticket, "shipped")}
                          disabled={updateStatusMutation.isPending}
                          size="sm"
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Versenden
                        </Button>
                      )}
                      {status !== "pending" && (
                        <Button
                          onClick={() => handleStatusChange(ticket, "pending")}
                          disabled={updateStatusMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                        >
                          Zurück
                        </Button>
                      )}
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(ticket.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                ))}
                
                {statusTickets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Keine Tickets</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {kanbanContent}
        </div>
      </div>
    );
  }

  return kanbanContent;
}