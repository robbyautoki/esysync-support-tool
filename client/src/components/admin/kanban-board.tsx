import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Wrench, Truck } from "lucide-react";
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
    color: "bg-blue-100 text-blue-800",
    borderColor: "border-blue-300"
  },
  workshop: {
    title: "Eingänge im Workshop",
    icon: Wrench,
    color: "bg-yellow-100 text-yellow-800",
    borderColor: "border-yellow-300"
  },
  shipped: {
    title: "Versand zum Kunden",
    icon: Truck,
    color: "bg-green-100 text-green-800",
    borderColor: "border-green-300"
  }
};

export default function KanbanBoard({ sessionId }: KanbanBoardProps) {
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">RMA Ticket Kanban Board</h2>
        <p className="text-gray-600">Verwalten Sie den Status aller RMA-Tickets</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusTickets = groupedTickets[status as keyof typeof groupedTickets];
          const IconComponent = config.icon;

          return (
            <Card key={status} className={`glassmorphism border-0 apple-shadow ${config.borderColor} border-2`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-gray-900 text-lg">
                  <IconComponent className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                  {config.title}
                  <Badge variant="secondary" className="ml-auto">
                    {statusTickets.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {statusTickets.map((ticket: SupportTicket) => (
                    <div
                      key={ticket.id}
                      className="glassmorphism-strong rounded-xl p-4 space-y-2"
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
}