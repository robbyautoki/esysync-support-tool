import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calendar, Monitor, AlertCircle, Package, Users, Clock, Download, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SupportTicket } from "@shared/schema";

interface StatisticsProps {
  sessionId: string;
}

interface ProblemStats {
  errorType: string;
  count: number;
  percentage: number;
  avgResolutionDays: number;
  lastOccurrence: string;
}

interface TimeStats {
  period: string;
  ticketCount: number;
  resolvedCount: number;
  avgResolutionTime: number;
}

export default function Statistics({ sessionId }: StatisticsProps) {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days");

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/tickets"],
    meta: {
      headers: { "x-session-id": sessionId },
    },
  });

  // Filter tickets based on time range
  const getFilteredTickets = () => {
    if (timeRange === "all") return tickets;
    
    const now = new Date();
    const daysBack = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return tickets.filter(ticket => new Date(ticket.createdAt) >= cutoffDate);
  };

  const filteredTickets = getFilteredTickets();

  // Calculate problem statistics
  const problemStats: ProblemStats[] = filteredTickets.reduce((acc: any[], ticket) => {
    const existing = acc.find(stat => stat.errorType === ticket.errorType);
    const createdDate = new Date(ticket.createdAt);
    const resolutionDays = ticket.status === "shipped" ? 
      Math.ceil((new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    if (existing) {
      existing.count++;
      existing.resolutionDays.push(resolutionDays);
      if (createdDate > new Date(existing.lastOccurrence)) {
        existing.lastOccurrence = ticket.createdAt;
      }
    } else {
      acc.push({
        errorType: ticket.errorType,
        count: 1,
        resolutionDays: [resolutionDays],
        lastOccurrence: ticket.createdAt
      });
    }
    return acc;
  }, [])
  .map(stat => ({
    errorType: stat.errorType,
    count: stat.count,
    percentage: Math.round((stat.count / filteredTickets.length) * 100),
    avgResolutionDays: stat.resolutionDays.length > 0 ? 
      Math.round(stat.resolutionDays.reduce((a: number, b: number) => a + b, 0) / stat.resolutionDays.length) : 0,
    lastOccurrence: stat.lastOccurrence
  }))
  .sort((a, b) => b.count - a.count);

  // Calculate general statistics
  const totalTickets = filteredTickets.length;
  const resolvedTickets = filteredTickets.filter(t => t.status === "shipped").length;
  const pendingTickets = filteredTickets.filter(t => t.status === "pending").length;
  const workshopTickets = filteredTickets.filter(t => t.status === "workshop").length;
  const tutorialResolvedTickets = filteredTickets.filter(t => t.resolvedViaTutorial === true).length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
  const tutorialResolutionRate = totalTickets > 0 ? Math.round((tutorialResolvedTickets / totalTickets) * 100) : 0;

  // Calculate average resolution time
  const avgResolutionTime = resolvedTickets > 0 ? 
    Math.round(filteredTickets
      .filter(t => t.status === "shipped")
      .reduce((acc, ticket) => {
        const days = Math.ceil((new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0) / resolvedTickets) : 0;

  // Get unique customers
  const uniqueCustomers = new Set(filteredTickets.map(t => t.accountNumber)).size;

  // Calculate daily statistics for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyStats = last7Days.map(date => {
    const dayTickets = tickets.filter(t => new Date(t.createdAt).toISOString().startsWith(date));
    return {
      date,
      count: dayTickets.length,
      resolved: dayTickets.filter(t => t.status === "shipped").length
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Lade Statistiken...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-7 h-7 mr-3" style={{ color: '#6d0df0' }} />
              Statistiken & Auswertungen
            </h1>
            <p className="text-gray-600 mt-2">
              Detaillierte Analyse der Support-Tickets und Problem-Häufigkeiten
            </p>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="7days">Letzte 7 Tage</option>
              <option value="30days">Letzte 30 Tage</option>
              <option value="90days">Letzte 90 Tage</option>
              <option value="all">Alle Zeit</option>
            </select>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Gesamt Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lösungsrate</p>
                <p className="text-2xl font-bold text-gray-900">{resolutionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ø Lösungszeit</p>
                <p className="text-2xl font-bold text-gray-900">{avgResolutionTime} Tage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Kunden</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <Monitor className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tutorial-Lösungen</p>
                <p className="text-2xl font-bold text-gray-900">{tutorialResolvedTickets}</p>
                <p className="text-xs text-green-600 font-medium">{tutorialResolutionRate}% der Fälle</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Problem Frequency Analysis */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <AlertCircle className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              Problem-Häufigkeiten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {problemStats.map((stat, index) => (
                <div key={stat.errorType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{stat.errorType}</h4>
                        <p className="text-sm text-gray-500">
                          Letzte Anfrage: {new Date(stat.lastOccurrence).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{stat.count} Tickets</Badge>
                        <Badge style={{ backgroundColor: '#6d0df0', color: 'white' }}>
                          {stat.percentage}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Ø {stat.avgResolutionDays} Tage Bearbeitung
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${stat.percentage}%`,
                        background: `linear-gradient(90deg, #6d0df0 0%, #9d4edd ${stat.percentage}%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {problemStats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Keine Daten für den ausgewählten Zeitraum</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Monitor className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              Status-Verteilung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Status Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span className="font-medium text-gray-900">Offen</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{pendingTickets}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({totalTickets > 0 ? Math.round((pendingTickets / totalTickets) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-gray-900">Workshop</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{workshopTickets}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({totalTickets > 0 ? Math.round((workshopTickets / totalTickets) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="font-medium text-gray-900">Versendet</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{resolvedTickets}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* 7-Day Trend */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-4">7-Tage Trend</h4>
                <div className="space-y-2">
                  {dailyStats.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(day.date).toLocaleDateString('de-DE', { 
                          weekday: 'short', 
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-900">{day.count} neue</span>
                        <span className="text-green-600">{day.resolved} gelöst</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}