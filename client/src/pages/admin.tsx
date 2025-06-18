import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Edit, Settings, LogOut, BarChart3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ErrorType } from "@shared/schema";
import logoPath from "@assets/logo.png";
import KanbanBoard from "@/components/admin/kanban-board";

const iconOptions = [
  { value: "Monitor", label: "Monitor" },
  { value: "BarChart3", label: "BarChart3" },
  { value: "PauseCircle", label: "PauseCircle" },
  { value: "Unlink", label: "Unlink" },
  { value: "AlertTriangle", label: "AlertTriangle" },
  { value: "Zap", label: "Zap" },
  { value: "Wifi", label: "Wifi" },
  { value: "Volume", label: "Volume" },
  { value: "RotateCcw", label: "RotateCcw" },
  { value: "FileX", label: "FileX" },
  { value: "Settings", label: "Settings" },
  { value: "WifiOff", label: "WifiOff" },
  { value: "ShieldAlert", label: "ShieldAlert" },
  { value: "Package", label: "Package" },
  { value: "Lightbulb", label: "Lightbulb" },
  { value: "Battery", label: "Battery" },
  { value: "Smartphone", label: "Smartphone" },
  { value: "Shield", label: "Shield" },
  { value: "Power", label: "Power" },
  { value: "Router", label: "Router" },
];

export default function AdminPage() {
  const [sessionId, setSessionId] = useState<string | null>(
    localStorage.getItem("adminSessionId")
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [newErrorType, setNewErrorType] = useState({
    errorId: "",
    title: "",
    description: "",
    iconName: "Monitor",
    videoUrl: "",
    instructions: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: errorTypes, isLoading } = useQuery({
    queryKey: ["/api/admin/error-types"],
    enabled: !!sessionId,
    meta: {
      headers: { "x-session-id": sessionId },
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      localStorage.setItem("adminSessionId", data.sessionId);
      toast({
        title: "Erfolgreich angemeldet",
        description: "Willkommen im Admin-Dashboard",
      });
    },
    onError: () => {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: "Benutzername oder Passwort falsch",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (errorType: typeof newErrorType) => {
      const response = await fetch("/api/admin/error-types", {
        method: "POST",
        body: JSON.stringify(errorType),
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to create error type");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/error-types"] });
      setNewErrorType({ errorId: "", title: "", description: "", iconName: "Monitor", videoUrl: "", instructions: "" });
      toast({
        title: "Problem hinzugefügt",
        description: "Das neue Problem wurde erfolgreich erstellt",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/error-types/${id}`, {
        method: "DELETE",
        headers: { "x-session-id": sessionId! },
      });
      if (!response.ok) {
        throw new Error("Failed to delete error type");
      }
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/error-types"] });
      toast({
        title: "Problem gelöscht",
        description: "Das Problem wurde erfolgreich entfernt",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    setSessionId(null);
    localStorage.removeItem("adminSessionId");
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet",
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newErrorType.errorId || !newErrorType.title || !newErrorType.description) {
      toast({
        title: "Unvollständige Eingaben",
        description: "Bitte füllen Sie alle Felder aus",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newErrorType);
  };

  const handleDelete = (id: number) => {
    if (confirm("Sind Sie sicher, dass Sie dieses Problem löschen möchten?")) {
      deleteMutation.mutate(id);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="glassmorphism rounded-3xl p-8 apple-shadow w-full max-w-md">
          <div className="text-center mb-8">
            <Settings className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin-Anmeldung</h1>
            <p className="text-gray-600">Melden Sie sich an, um das Dashboard zu verwalten</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="mt-1"
                placeholder="admin"
              />
            </div>

            <div>
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="mt-1"
                placeholder="admin123"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-white rounded-xl py-3"
              style={{ backgroundColor: '#6d0df0' }}
            >
              {loginMutation.isPending ? "Anmelden..." : "Anmelden"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo-Zugangsdaten:</p>
            <p>Benutzername: <code>admin</code></p>
            <p>Passwort: <code>admin123</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glassmorphism rounded-3xl p-6 apple-shadow mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={logoPath} 
                alt="Logo" 
                className="h-10 w-auto mr-6"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin-Dashboard</h1>
                <p className="text-gray-600">Verwalten Sie Display-Probleme für die Support-Seite</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="px-4 py-2 border border-red-300 text-red-600 rounded-xl hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>

        <Tabs defaultValue="problems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="problems" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Problem-Verwaltung
            </TabsTrigger>
            <TabsTrigger value="kanban" className="flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Kanban Board
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problems">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add New Problem */}
              <Card className="glassmorphism border-0 apple-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Plus className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                    Neues Problem hinzufügen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                  <Label htmlFor="errorId">Problem-ID</Label>
                  <Input
                    id="errorId"
                    value={newErrorType.errorId}
                    onChange={(e) => setNewErrorType(prev => ({ ...prev, errorId: e.target.value }))}
                    placeholder="z.B. display-flicker"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={newErrorType.title}
                    onChange={(e) => setNewErrorType(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="z.B. Display flackert"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Input
                    id="description"
                    value={newErrorType.description}
                    onChange={(e) => setNewErrorType(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="z.B. Bildschirm zeigt flackernde Linien"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="iconName">Symbol</Label>
                  <select
                    id="iconName"
                    value={newErrorType.iconName}
                    onChange={(e) => setNewErrorType(prev => ({ ...prev, iconName: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video-URL (optional)</Label>
                  <Input
                    id="videoUrl"
                    value={newErrorType.videoUrl}
                    onChange={(e) => setNewErrorType(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="z.B. https://example.com/video.mp4"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Anleitung (optional)</Label>
                  <textarea
                    id="instructions"
                    value={newErrorType.instructions}
                    onChange={(e) => setNewErrorType(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Schritt-für-Schritt Anleitung für die Problemlösung..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent min-h-[100px] resize-vertical"
                    style={{ '--tw-ring-color': '#6d0df0' } as any}
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full text-white rounded-xl py-3"
                  style={{ backgroundColor: '#6d0df0' }}
                >
                  {createMutation.isPending ? "Wird hinzugefügt..." : "Problem hinzufügen"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Problems */}
          <Card className="glassmorphism border-0 apple-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Edit className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                Vorhandene Probleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="pulse-loading">Lade Probleme...</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Array.isArray(errorTypes) && errorTypes.map((errorType: ErrorType) => (
                    <div
                      key={errorType.id}
                      className="glassmorphism-strong rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{errorType.title}</h3>
                        <p className="text-sm text-gray-600">{errorType.description}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <span>ID: {errorType.errorId}</span>
                          <span className="mx-2">•</span>
                          <span>Symbol: {errorType.iconName}</span>
                        </div>
                        {errorType.videoUrl && (
                          <div className="mt-2 text-xs" style={{ color: '#6d0df0' }}>
                            <span>📹 Video verfügbar</span>
                          </div>
                        )}
                        {errorType.instructions && (
                          <div className="mt-1 text-xs text-green-600">
                            <span>📋 Anleitung verfügbar ({errorType.instructions.split('\n').length} Schritte)</span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDelete(errorType.id)}
                        disabled={deleteMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {Array.isArray(errorTypes) && errorTypes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Noch keine Probleme erstellt
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard sessionId={sessionId!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}