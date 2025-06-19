import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, Activity, Ticket, Settings, Shield, Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface ActivityLogsProps {
  sessionId: string;
}

interface ActivityLog {
  id: number;
  timestamp: string;
  activityType: string;
  userType: string;
  userId: string | null;
  description: string;
  entityType: string | null;
  entityId: string | null;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export default function ActivityLogs({ sessionId }: ActivityLogsProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/logs", filterType, filterUser, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", logsPerPage.toString());
      params.append("offset", ((currentPage - 1) * logsPerPage).toString());
      
      if (filterType !== "all") {
        params.append("type", filterType);
      }
      if (filterUser !== "all") {
        params.append("userType", filterUser);
      }

      const response = await fetch(`/api/admin/logs?${params}`, {
        headers: {
          'X-Session-ID': sessionId,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      return response.json();
    },
  });

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'ticket_created':
      case 'ticket_updated':
      case 'status_changed':
        return <Ticket className="h-4 w-4" />;
      case 'admin_login':
      case 'admin_logout':
        return <Shield className="h-4 w-4" />;
      case 'error_type_created':
      case 'error_type_updated':
      case 'error_type_deleted':
        return <Settings className="h-4 w-4" />;
      case 'customer_created':
      case 'customer_updated':
        return <User className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (activityType: string, userType: string) => {
    if (userType === 'admin') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (activityType.includes('created')) return 'bg-green-100 text-green-800 border-green-200';
    if (activityType.includes('updated') || activityType.includes('status_changed')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (activityType.includes('deleted')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getGermanActivityType = (activityType: string) => {
    const translations: Record<string, string> = {
      'ticket_created': 'Ticket erstellt',
      'ticket_updated': 'Ticket aktualisiert',
      'status_changed': 'Status geändert',
      'admin_login': 'Admin-Anmeldung',
      'admin_logout': 'Admin-Abmeldung',
      'error_type_created': 'Fehlertyp erstellt',
      'error_type_updated': 'Fehlertyp aktualisiert',
      'error_type_deleted': 'Fehlertyp gelöscht',
      'customer_created': 'Kunde erstellt',
      'customer_updated': 'Kunde aktualisiert',
      'customer_validated': 'Kunde validiert',
      'system_startup': 'System gestartet',
      'system_shutdown': 'System heruntergefahren',
    };
    return translations[activityType] || activityType;
  };

  const getGermanUserType = (userType: string) => {
    const translations: Record<string, string> = {
      'customer': 'Kunde',
      'admin': 'Administrator',
      'system': 'System',
    };
    return translations[userType] || userType;
  };

  const filteredLogs = logs.filter((log: ActivityLog) => {
    const matchesSearch = searchTerm === "" || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.entityId && log.entityId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System-Logs</h1>
          <p className="text-gray-600">Vollständige Aktivitätsdokumentation</p>
        </div>
        <Button onClick={() => refetch()} size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Aktivitätstyp
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktivitäten</SelectItem>
                  <SelectItem value="ticket_created">Tickets erstellt</SelectItem>
                  <SelectItem value="status_changed">Status geändert</SelectItem>
                  <SelectItem value="admin_login">Admin-Anmeldungen</SelectItem>
                  <SelectItem value="error_type_created">Fehlertypen erstellt</SelectItem>
                  <SelectItem value="customer_created">Kunden erstellt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Benutzertyp
              </label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Benutzer</SelectItem>
                  <SelectItem value="customer">Kunden</SelectItem>
                  <SelectItem value="admin">Administratoren</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Suche
              </label>
              <Input
                placeholder="RMA-Nummer, Beschreibung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aktivitätsverlauf ({filteredLogs.length} Einträge)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredLogs.map((log: ActivityLog) => (
                <div key={log.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${getActivityColor(log.activityType, log.userType)}`}>
                    {getActivityIcon(log.activityType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getActivityColor(log.activityType, log.userType)}>
                        {getGermanActivityType(log.activityType)}
                      </Badge>
                      <Badge variant="secondary">
                        {getGermanUserType(log.userType)}
                      </Badge>
                      {log.entityId && (
                        <Badge variant="outline" className="text-xs">
                          {log.entityId}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-1">{log.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss', { locale: de })}</span>
                      {log.userId && (
                        <span>Benutzer: {log.userId}</span>
                      )}
                      {log.ipAddress && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                    </div>
                    
                    {log.metadata && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                          Zusätzliche Details
                        </summary>
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Aktivitäten gefunden</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}