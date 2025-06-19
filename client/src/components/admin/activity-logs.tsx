import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, User, Activity, Ticket, Settings, Shield, Search, Brain, TrendingUp, AlertTriangle, Eye, BarChart3, CalendarDays } from "lucide-react";
import { useState, useMemo } from "react";
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

// Anomalie-Erkennungs-Funktionen
const detectAnomalies = (logs: ActivityLog[]) => {
  const anomalies: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high'; count: number }> = [];
  
  // Analyse der letzten 24 Stunden
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentLogs = logs.filter(log => new Date(log.timestamp) > last24Hours);
  
  // Anomalie 1: Ungewöhnlich viele Login-Versuche
  const loginAttempts = recentLogs.filter(log => 
    log.activityType.includes('login') || log.activityType.includes('admin_login')
  );
  if (loginAttempts.length > 50) {
    anomalies.push({
      type: 'login_surge',
      message: `Ungewöhnlich viele Login-Versuche (${loginAttempts.length}) in den letzten 24 Stunden`,
      severity: 'high',
      count: loginAttempts.length
    });
  }
  
  // Anomalie 2: Nächtliche Aktivitäten (22:00 - 06:00)
  const nightActivities = recentLogs.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 22 || hour <= 6;
  });
  if (nightActivities.length > 10) {
    anomalies.push({
      type: 'night_activity',
      message: `Ungewöhnliche nächtliche Aktivitäten (${nightActivities.length}) zwischen 22:00-06:00`,
      severity: 'medium',
      count: nightActivities.length
    });
  }
  
  // Anomalie 3: Viele Ticket-Status-Änderungen von einem Benutzer
  const statusChanges = recentLogs.filter(log => log.activityType === 'status_changed');
  const userStatusChanges = statusChanges.reduce((acc, log) => {
    const user = log.userId || 'unknown';
    acc[user] = (acc[user] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(userStatusChanges).forEach(([user, count]) => {
    if (count > 20) {
      anomalies.push({
        type: 'bulk_status_changes',
        message: `Benutzer ${user} hat ${count} Status-Änderungen in 24h durchgeführt`,
        severity: 'medium',
        count
      });
    }
  });
  
  // Anomalie 4: Schnelle aufeinanderfolgende Aktionen (< 5 Sekunden)
  let rapidActions = 0;
  for (let i = 1; i < recentLogs.length; i++) {
    const timeDiff = new Date(recentLogs[i-1].timestamp).getTime() - new Date(recentLogs[i].timestamp).getTime();
    if (Math.abs(timeDiff) < 5000 && recentLogs[i-1].userId === recentLogs[i].userId) {
      rapidActions++;
    }
  }
  if (rapidActions > 15) {
    anomalies.push({
      type: 'rapid_actions',
      message: `${rapidActions} sehr schnelle aufeinanderfolgende Aktionen erkannt`,
      severity: 'low',
      count: rapidActions
    });
  }
  
  return anomalies;
};

// Benutzer-Aktivitätsheatmap-Daten
const generateActivityHeatmap = (logs: ActivityLog[]) => {
  const heatmapData = {
    hourly: Array(24).fill(0),
    daily: Array(7).fill(0),
    activities: {} as Record<string, number>,
    userActivities: {} as Record<string, number>
  };
  
  logs.forEach(log => {
    const date = new Date(log.timestamp);
    const hour = date.getHours();
    const day = date.getDay();
    
    // Stündliche Aktivität
    heatmapData.hourly[hour]++;
    
    // Tägliche Aktivität (0 = Sonntag)
    heatmapData.daily[day]++;
    
    // Aktivitätstypen
    heatmapData.activities[log.activityType] = (heatmapData.activities[log.activityType] || 0) + 1;
    
    // Benutzer-Aktivitäten
    const user = log.userId || 'system';
    heatmapData.userActivities[user] = (heatmapData.userActivities[user] || 0) + 1;
  });
  
  return heatmapData;
};

export default function ActivityLogs({ sessionId }: ActivityLogsProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("logs");
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
      'employee_login': 'Mitarbeiter-Anmeldung',
      'employee_logout': 'Mitarbeiter-Abmeldung',
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
      'employee': 'Mitarbeiter',
      'system': 'System',
    };
    return translations[userType] || userType;
  };

  // Berechne Anomalien und Heatmap-Daten
  const anomalies = useMemo(() => detectAnomalies(logs), [logs]);
  const heatmapData = useMemo(() => generateActivityHeatmap(logs), [logs]);

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
          <p className="text-gray-600">Vollständige Aktivitätsdokumentation mit erweiterten Analysen</p>
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
                  <SelectItem value="employee_login">Mitarbeiter-Anmeldungen</SelectItem>
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
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
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

      {/* Tabs für verschiedene Ansichten */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Anomalie-Erkennung
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Aktivitäts-Heatmap
          </TabsTrigger>
        </TabsList>

        {/* Activity Logs Tab */}
        <TabsContent value="logs">
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
        </TabsContent>

        {/* Anomalie-Erkennung Tab */}
        <TabsContent value="anomalies">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Automatische Anomalie-Erkennung
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Erkennung ungewöhnlicher Aktivitätsmuster in den letzten 24 Stunden
                </p>
              </CardHeader>
              <CardContent>
                {anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {anomalies.map((anomaly, index) => (
                      <Alert key={index} className={
                        anomaly.severity === 'high' ? 'border-red-200 bg-red-50' :
                        anomaly.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      }>
                        <AlertTriangle className={`h-4 w-4 ${
                          anomaly.severity === 'high' ? 'text-red-600' :
                          anomaly.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className={
                                anomaly.severity === 'high' ? 'text-red-800' :
                                anomaly.severity === 'medium' ? 'text-yellow-800' :
                                'text-blue-800'
                              }>
                                {anomaly.severity === 'high' ? 'Hohe Priorität' :
                                 anomaly.severity === 'medium' ? 'Mittlere Priorität' :
                                 'Niedrige Priorität'}
                              </strong>
                              <p className="text-sm mt-1">{anomaly.message}</p>
                            </div>
                            <Badge variant="secondary" className="ml-4">
                              {anomaly.count}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Anomalien in den letzten 24 Stunden erkannt</p>
                    <p className="text-sm mt-1">Das System arbeitet normal</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aktivitäts-Heatmap Tab */}
        <TabsContent value="heatmap">
          <div className="space-y-6">
            {/* Stündliche Aktivität */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Stündliche Aktivitätsheatmap
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Aktivitätsverteilung über 24 Stunden zur UI-Optimierung
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-12 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const count = heatmapData.hourly[hour];
                    const maxCount = Math.max(...heatmapData.hourly);
                    const intensity = maxCount > 0 ? count / maxCount : 0;
                    
                    return (
                      <div key={hour} className="text-center">
                        <div
                          className={`h-12 w-full rounded mb-2 border ${
                            intensity > 0.7 ? 'bg-purple-600 border-purple-700' :
                            intensity > 0.4 ? 'bg-purple-400 border-purple-500' :
                            intensity > 0.1 ? 'bg-purple-200 border-purple-300' :
                            'bg-gray-100 border-gray-200'
                          }`}
                          title={`${hour}:00 - ${count} Aktivitäten`}
                        />
                        <span className="text-xs text-gray-600">{hour}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <strong>Peak-Zeiten:</strong> {
                    heatmapData.hourly
                      .map((count, hour) => ({ hour, count }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .map(({ hour, count }) => `${hour}:00 (${count})`)
                      .join(', ')
                  }
                </div>
              </CardContent>
            </Card>

            {/* Wöchentliche Aktivität */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Wöchentliche Aktivitätsheatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day, index) => {
                    const count = heatmapData.daily[index];
                    const maxCount = Math.max(...heatmapData.daily);
                    const intensity = maxCount > 0 ? count / maxCount : 0;
                    
                    return (
                      <div key={day} className="text-center">
                        <div
                          className={`h-16 w-full rounded mb-2 border flex items-center justify-center ${
                            intensity > 0.7 ? 'bg-purple-600 border-purple-700 text-white' :
                            intensity > 0.4 ? 'bg-purple-400 border-purple-500 text-white' :
                            intensity > 0.1 ? 'bg-purple-200 border-purple-300' :
                            'bg-gray-100 border-gray-200'
                          }`}
                          title={`${day} - ${count} Aktivitäten`}
                        >
                          <span className="text-lg font-semibold">{count}</span>
                        </div>
                        <span className="text-sm text-gray-600">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Aktivitätstypen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Häufigste Aktivitätstypen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(heatmapData.activities)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 8)
                    .map(([activity, count]) => {
                      const maxCount = Math.max(...Object.values(heatmapData.activities));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={activity} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getActivityIcon(activity)}
                            <span className="text-sm font-medium">
                              {getGermanActivityType(activity)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Benutzer-Aktivitäten */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Benutzer-Aktivitätsheatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(heatmapData.userActivities)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([user, count]) => {
                      const maxCount = Math.max(...Object.values(heatmapData.userActivities));
                      const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={user} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{user}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}