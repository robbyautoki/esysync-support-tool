import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, Wrench, Truck, Calendar, User, Monitor, MapPin, Mail, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SupportTicket } from "@shared/schema";
import logoPath from "@assets/logo.png";

export default function TrackStatus() {
  const [rmaNumber, setRmaNumber] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);

  const { data: ticket, isLoading, error } = useQuery<SupportTicket>({
    queryKey: [`/api/track/${rmaNumber}`],
    enabled: !!rmaNumber && searchAttempted,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchAttempted(true);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Package,
          label: "Eingegangen",
          color: "bg-purple-100 text-purple-700 border-purple-200",
          description: "Ihr RMA-Ticket wurde eingereicht und wird bearbeitet."
        };
      case "workshop":
        return {
          icon: Wrench,
          label: "Im Workshop",
          color: "bg-orange-100 text-orange-700 border-orange-200",
          description: "Ihr Display wird in unserem Workshop repariert."
        };
      case "shipped":
        return {
          icon: Truck,
          label: "Versendet",
          color: "bg-green-100 text-green-700 border-green-200",
          description: "Ihr repariertes Display wurde versendet."
        };
      default:
        return {
          icon: AlertCircle,
          label: "Unbekannt",
          color: "bg-gray-100 text-gray-700 border-gray-200",
          description: "Status unbekannt."
        };
    }
  };

  const getStatusProgress = (status: string, shippingMethod: string) => {
    // Different progress based on shipping method
    if (shippingMethod === "complete-replacement") {
      // Kompletttausch: direkter Versand ohne Workshop
      switch (status) {
        case "pending": return 50;
        case "shipped": return 100;
        default: return 0;
      }
    } else if (shippingMethod === "technician") {
      // Techniker-Abholung: erweiterte Schritte
      switch (status) {
        case "pending": return 25;
        case "workshop": return 50;
        case "technician-scheduled": return 75;
        case "shipped": return 100;
        default: return 0;
      }
    } else {
      // Standard Versand (own-package, avantor-box)
      switch (status) {
        case "pending": return 33;
        case "workshop": return 66;
        case "shipped": return 100;
        default: return 0;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 glassmorphism apple-shadow border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <img 
              src={logoPath} 
              alt="Logo" 
              className="h-8 w-auto mr-3"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">RMA Status Tracking</h1>
              <p className="text-sm text-gray-600">Verfolgen Sie den Status Ihres Support-Tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Section */}
          <Card className="glassmorphism border-0 apple-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Status Ihres RMA-Tickets verfolgen
              </CardTitle>
              <p className="text-gray-600">
                Geben Sie Ihre RMA-Nummer ein, um den aktuellen Status Ihres Tickets zu sehen
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <Input
                    placeholder="RMA-2025-XXXXXX"
                    value={rmaNumber}
                    onChange={(e) => setRmaNumber(e.target.value.toUpperCase())}
                    className="text-center font-mono"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!rmaNumber.trim() || isLoading}
                  className="text-white px-6"
                  style={{ backgroundColor: '#6d0df0' }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isLoading ? "Suchen..." : "Suchen"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Section */}
          {searchAttempted && (
            <>
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      RMA-Ticket nicht gefunden
                    </h3>
                    <p className="text-red-600">
                      Die eingegebene RMA-Nummer konnte nicht gefunden werden. 
                      Bitte überprüfen Sie die Nummer und versuchen Sie es erneut.
                    </p>
                  </CardContent>
                </Card>
              )}

              {ticket && (
                <div className="space-y-6">
                  {/* Status Overview */}
                  <Card className="glassmorphism border-0 apple-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-gray-900">
                          RMA-Ticket: {ticket.rmaNumber}
                        </CardTitle>
                        <Badge className={getStatusConfig(ticket.status).color}>
                          {getStatusConfig(ticket.status).label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Fortschritt</span>
                          <span>{getStatusProgress(ticket.status, ticket.shippingMethod)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${getStatusProgress(ticket.status, ticket.shippingMethod)}%`,
                              background: `linear-gradient(90deg, #6d0df0 0%, #9d4edd 100%)`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Status Description */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {(() => {
                            const StatusIcon = getStatusConfig(ticket.status).icon;
                            return <StatusIcon className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />;
                          })()}
                          <h4 className="font-semibold text-gray-900">
                            Aktueller Status: {getStatusConfig(ticket.status).label}
                          </h4>
                        </div>
                        <p className="text-gray-700">
                          {getStatusConfig(ticket.status).description}
                        </p>
                      </div>

                      {/* Dynamic Status Timeline based on shipping method */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Status-Verlauf</h4>
                        <div className="space-y-3">
                          {/* Always show: Ticket eingereicht */}
                          <div className="flex items-center p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">Ticket eingereicht</p>
                              <p className="text-sm text-gray-600">
                                {new Date(ticket.createdAt).toLocaleDateString('de-DE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Conditional steps based on shipping method */}
                          {ticket.shippingMethod === "complete-replacement" ? (
                            // Kompletttausch: Direkt zur Lieferung
                            <div className={`flex items-center p-3 rounded-lg ${ticket.status === "shipped" ? "bg-green-50 border border-green-200" : "bg-gray-100 opacity-50"}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === "shipped" ? "bg-green-500" : "bg-gray-300"}`}>
                                {ticket.status === "shipped" ? (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                ) : (
                                  <Clock className="w-4 h-4 text-white" />
                                )}
                              </div>
                              <div className="ml-4">
                                <p className="font-medium text-gray-900">Ersatzgerät versendet</p>
                                <p className="text-sm text-gray-600">
                                  {ticket.status === "shipped" ? "Kompletttausch abgeschlossen" : "Wird vorbereitet"}
                                </p>
                              </div>
                            </div>
                          ) : ticket.shippingMethod === "technician" ? (
                            // Techniker-Abholung: Erweiterte Schritte
                            <>
                              <div className={`flex items-center p-3 rounded-lg ${ticket.status === "workshop" ? "bg-orange-50 border border-orange-200" : ticket.status === "shipped" ? "bg-gray-50" : "bg-gray-100 opacity-50"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === "workshop" ? "bg-orange-500" : ticket.status === "shipped" ? "bg-green-500" : "bg-gray-300"}`}>
                                  {ticket.status === "workshop" ? (
                                    <Wrench className="w-4 h-4 text-white" />
                                  ) : ticket.status === "shipped" ? (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900">Workshop-Bearbeitung</p>
                                  <p className="text-sm text-gray-600">
                                    {ticket.status === "workshop" || ticket.status === "shipped" ? "In Bearbeitung" : "Ausstehend"}
                                  </p>
                                </div>
                              </div>

                              <div className={`flex items-center p-3 rounded-lg ${ticket.status === "technician-scheduled" ? "bg-blue-50 border border-blue-200" : "bg-gray-100 opacity-50"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === "technician-scheduled" ? "bg-blue-500" : "bg-gray-300"}`}>
                                  {ticket.status === "technician-scheduled" ? (
                                    <User className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900">Techniker-Termin geplant</p>
                                  <p className="text-sm text-gray-600">
                                    {ticket.status === "technician-scheduled" ? "Termin vereinbart" : "Ausstehend"}
                                  </p>
                                </div>
                              </div>

                              <div className={`flex items-center p-3 rounded-lg ${ticket.status === "shipped" ? "bg-green-50 border border-green-200" : "bg-gray-100 opacity-50"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === "shipped" ? "bg-green-500" : "bg-gray-300"}`}>
                                  {ticket.status === "shipped" ? (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900">Installation abgeschlossen</p>
                                  <p className="text-sm text-gray-600">
                                    {ticket.status === "shipped" ? "Techniker-Service beendet" : "Ausstehend"}
                                  </p>
                                </div>
                              </div>
                            </>
                          ) : (
                            // Standard Versand (own-package, avantor-box)
                            <>
                              <div className={`flex items-center p-3 rounded-lg ${ticket.status === "workshop" ? "bg-orange-50 border border-orange-200" : ticket.status === "shipped" ? "bg-gray-50" : "bg-gray-100 opacity-50"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === "workshop" ? "bg-orange-500" : ticket.status === "shipped" ? "bg-green-500" : "bg-gray-300"}`}>
                                  {ticket.status === "workshop" ? (
                                    <Wrench className="w-4 h-4 text-white" />
                                  ) : ticket.status === "shipped" ? (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900">Workshop-Bearbeitung</p>
                                  <p className="text-sm text-gray-600">
                                    {ticket.status === "workshop" || ticket.status === "shipped" ? "Display wird repariert" : "Warten auf Eingang"}
                                  </p>
                                </div>
                              </div>

                              <div className={`flex items-center p-3 rounded-lg ${ticket.status === "shipped" ? "bg-green-50 border border-green-200" : "bg-gray-100 opacity-50"}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ticket.status === "shipped" ? "bg-green-500" : "bg-gray-300"}`}>
                                  {ticket.status === "shipped" ? (
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div className="ml-4">
                                  <p className="font-medium text-gray-900">Repariertes Display versendet</p>
                                  <p className="text-sm text-gray-600">
                                    {ticket.status === "shipped" ? "Rückversand abgeschlossen" : "Ausstehend"}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ticket Details */}
                  <Card className="glassmorphism border-0 apple-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">Ticket-Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Account-Nummer</p>
                              <p className="text-gray-600">{ticket.accountNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Monitor className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Display-Nummer</p>
                              <p className="text-gray-600">{ticket.displayNumber}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Problem</p>
                              <p className="text-gray-600">{ticket.errorType}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Kontakt E-Mail</p>
                              <p className="text-gray-600">{ticket.contactEmail}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Display Standort</p>
                              <p className="text-gray-600">{ticket.displayLocation}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Truck className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Versandart</p>
                              <p className="text-gray-600">{ticket.shippingMethod}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      {ticket.statusDetails && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Zusätzliche Informationen</h4>
                          <p className="text-blue-800">{ticket.statusDetails}</p>
                        </div>
                      )}

                      {ticket.trackingNumber && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Tracking-Nummer</h4>
                          <p className="text-green-800 font-mono">{ticket.trackingNumber}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Help Section */}
          <Card className="glassmorphism border-0 apple-shadow">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Benötigen Sie Hilfe?
              </h3>
              <p className="text-gray-600 mb-4">
                Falls Sie Fragen zu Ihrem RMA-Ticket haben, kontaktieren Sie uns gerne.
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  support@esysync.com
                </Button>
                <Button 
                  className="text-white"
                  style={{ backgroundColor: '#6d0df0' }}
                  onClick={() => window.location.href = '/'}
                >
                  Neues Ticket erstellen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}