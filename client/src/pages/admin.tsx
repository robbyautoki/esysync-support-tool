import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, BarChart3, LogOut, Plus, List, Edit, Trash2, Users, Mail, TrendingUp, FileText, UserPlus, Video, Play, Pause, Archive } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import EnhancedKanbanBoard from "@/components/admin/enhanced-kanban-board";
import CustomersOverview from "@/components/admin/customers-overview";
import EmailSettings from "@/components/admin/email-settings";
import Statistics from "@/components/admin/statistics";
import ActivityLogs from "@/components/admin/activity-logs";
import Employees from "@/components/admin/employees";

import type { ErrorType } from "@shared/schema";
import logoPath from "@assets/logo.png";

const iconOptions = [
  { value: "Monitor", label: "Monitor" },
  { value: "Zap", label: "Zap" },
  { value: "Wifi", label: "Wifi" },
  { value: "HardDrive", label: "HardDrive" },
  { value: "AlertTriangle", label: "AlertTriangle" },
  { value: "Power", label: "Power" },
  { value: "Router", label: "Router" },
];

export default function AdminPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("problems");
  const [userRole, setUserRole] = useState<string>("admin");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Restore session from localStorage and validate it
  useEffect(() => {
    const validateSession = async () => {
      const savedSessionId = localStorage.getItem("adminSessionId");
      if (savedSessionId) {
        // Test if session is still valid
        try {
          const response = await fetch("/api/admin/error-types", {
            headers: {
              "x-session-id": savedSessionId,
            },
          });
          if (response.ok) {
            setSessionId(savedSessionId);
            // Get user info to determine role
            const userResponse = await fetch("/api/admin/user", {
              headers: {
                "x-session-id": savedSessionId,
              },
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setCurrentUser(userData);
              setUserRole(userData.role || "admin");
              // Set default tab based on role
              if (userData.role === "employee") {
                setActiveTab("kanban");
              }
            }
          } else {
            // Session invalid, clear it
            localStorage.removeItem("adminSessionId");
            setSessionId(null);
          }
        } catch (error) {
          localStorage.removeItem("adminSessionId");
          setSessionId(null);
        }
      }
    };
    
    validateSession();
  }, []);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [newErrorType, setNewErrorType] = useState({
    errorId: "",
    title: "",
    description: "",
    iconName: "Monitor",
    videoUrl: "",
    videoEnabled: true,
    instructions: "",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState({
    errorId: "",
    title: "",
    description: "",
    iconName: "Monitor",
    videoUrl: "",
    videoEnabled: true,
    instructions: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: errorTypes, isLoading } = useQuery({
    queryKey: ["/api/admin/error-types"],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch("/api/admin/error-types", {
        headers: {
          "x-session-id": sessionId!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch error types");
      }
      return response.json();
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
      setUserRole(data.role || "admin");
      localStorage.setItem("adminSessionId", data.sessionId);
      // Set default tab based on role
      if (data.role === "employee") {
        setActiveTab("kanban");
      }
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
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      setNewErrorType({
        errorId: "",
        title: "",
        description: "",
        iconName: "Monitor",
        videoUrl: "",
        videoEnabled: true,
        instructions: "",
      });
      setShowCreateForm(false);
      toast({
        title: "Problem erstellt",
        description: "Das neue Problem wurde erfolgreich erstellt.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; updates: typeof editingData }) => {
      const response = await fetch(`/api/admin/error-types/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update error type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      setEditingId(null);
      toast({
        title: "Problem aktualisiert",
        description: "Das Problem wurde erfolgreich aktualisiert.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/error-types/${id}`, {
        method: "DELETE",
        headers: {
          "x-session-id": sessionId!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete error type");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      toast({
        title: "Problem gelöscht",
        description: "Das Problem wurde erfolgreich gelöscht.",
      });
    },
  });

  const videoToggleMutation = useMutation({
    mutationFn: async ({ id, videoEnabled }: { id: number; videoEnabled: boolean }) => {
      const response = await fetch(`/api/admin/error-types/${id}/video`, {
        method: "PATCH",
        body: JSON.stringify({ videoEnabled }),
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId!,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update video settings");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      toast({
        title: "Video-Einstellungen aktualisiert",
        description: "Die Video-Tutorial-Einstellungen wurden gespeichert.",
      });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleLogout = () => {
    setSessionId(null);
    localStorage.removeItem("adminSessionId");
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newErrorType);
  };

  const handleEdit = (errorType: ErrorType) => {
    setEditingId(errorType.id);
    setEditingData({
      errorId: errorType.errorId,
      title: errorType.title,
      description: errorType.description,
      iconName: errorType.iconName,
      videoUrl: errorType.videoUrl || "",
      videoEnabled: (errorType as any).videoEnabled ?? true,
      instructions: errorType.instructions || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: editingData });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData({
      errorId: "",
      title: "",
      description: "",
      iconName: "Monitor",
      videoUrl: "",
      videoEnabled: true,
      instructions: "",
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Sind Sie sicher, dass Sie dieses Problem löschen möchten?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleVideoToggle = (id: number, currentVideoEnabled: boolean) => {
    videoToggleMutation.mutate({ id, videoEnabled: !currentVideoEnabled });
  };

  const getVideoStatus = (errorType: ErrorType) => {
    if (!(errorType as any).videoEnabled) {
      return { text: "Deaktiviert", color: "bg-red-100 text-red-800", icon: Pause };
    }
    if (!errorType.videoUrl) {
      return { text: "Kein Video", color: "bg-yellow-100 text-yellow-800", icon: Video };
    }
    return { text: "Aktiv", color: "bg-green-100 text-green-800", icon: Play };
  };

  // Login screen
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="glassmorphism rounded-3xl p-8 apple-shadow max-w-md w-full">
          <div className="text-center mb-8">
            <img 
              src={logoPath} 
              alt="Logo" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin-Anmeldung</h1>
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Left Sidebar Navigation */}
      <div className="w-80 fixed left-0 top-0 h-full glassmorphism apple-shadow border-r border-white/20 p-6 z-10">
        {/* Logo and Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <img 
              src={logoPath} 
              alt="Logo" 
              className="h-8 w-auto mr-3"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Display Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-1 gap-2">
            <button
              onClick={() => setActiveTab("problems")}
              className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                activeTab === "problems" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Problem-Verwaltung
            </button>
            <button
              onClick={() => setActiveTab("kanban")}
              className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                activeTab === "kanban" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                activeTab === "customers" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
              }`}
            >
              <Users className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Kunden
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                activeTab === "email" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
              }`}
            >
              <Mail className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              E-Mail Einstellungen
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                activeTab === "statistics" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
              }`}
            >
              <TrendingUp className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Statistiken
            </button>
            {userRole === "admin" && (
              <button
                onClick={() => setActiveTab("logs")}
                className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                  activeTab === "logs" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
                }`}
              >
                <FileText className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
                Logs
              </button>
            )}
            {userRole === "admin" && (
              <button
                onClick={() => setActiveTab("employees")}
                className={`w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left ${
                  activeTab === "employees" ? "bg-white/40 shadow-lg" : "hover:bg-white/20"
                }`}
              >
                <UserPlus className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
                Mitarbeiter
              </button>
            )}
            <button
              onClick={() => window.location.href = '/archive'}
              className="w-full justify-start px-4 py-3 rounded-xl glassmorphism-strong transition-all duration-200 flex items-center text-left hover:bg-white/20"
            >
              <Archive className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Ticket-Archiv
            </button>
          </div>

          {/* Logout Button */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 glassmorphism-strong"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-80 p-8">
        {activeTab === "problems" && (
          <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Problem-Verwaltung</h1>
                <p className="text-gray-600">Verwalten Sie alle Display-Probleme und deren Lösungsanleitungen</p>
              </div>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 text-white rounded-xl apple-shadow"
                style={{ backgroundColor: '#6d0df0' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Neues Problem erstellen
              </Button>
            </div>

            {/* Create Form Modal/Card */}
            {showCreateForm && (
              <Card className="glassmorphism border-0 apple-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900">
                      <Plus className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                      Neues Problem hinzufügen
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Abbrechen
                    </Button>
                  </div>
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
                      placeholder="Detaillierte Beschreibung des Problems"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="iconName">Icon</Label>
                    <select
                      id="iconName"
                      value={newErrorType.iconName}
                      onChange={(e) => setNewErrorType(prev => ({ ...prev, iconName: e.target.value }))}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {iconOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      checked={newErrorType.videoEnabled}
                      onCheckedChange={(checked) => setNewErrorType(prev => ({ ...prev, videoEnabled: checked }))}
                    />
                    <Label className="text-sm font-medium">Video-Tutorial aktiviert</Label>
                  </div>

                  <div>
                    <Label htmlFor="videoUrl">Video URL (YouTube)</Label>
                    <Input
                      id="videoUrl"
                      value={newErrorType.videoUrl}
                      onChange={(e) => setNewErrorType(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="mt-1"
                      disabled={!newErrorType.videoEnabled}
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Lösungsschritte</Label>
                    <textarea
                      id="instructions"
                      value={newErrorType.instructions}
                      onChange={(e) => setNewErrorType(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Schritt-für-Schritt Anweisungen"
                      rows={4}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full text-white rounded-xl py-3"
                    style={{ backgroundColor: '#6d0df0' }}
                  >
                    {createMutation.isPending ? "Erstellen..." : "Problem erstellen"}
                  </Button>
                </form>
                </CardContent>
              </Card>
            )}

            {/* Existing Problems */}
            <Card className="glassmorphism border-0 apple-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <List className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                  Bestehende Probleme ({Array.isArray(errorTypes) ? errorTypes.length : 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="glassmorphism-strong rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {Array.isArray(errorTypes) && errorTypes.map((errorType: ErrorType) => (
                      <div key={errorType.id} className="glassmorphism-strong rounded-xl p-4 space-y-2">
                        {editingId === errorType.id ? (
                          // Edit Mode
                          <form onSubmit={handleUpdate} className="space-y-3">
                            <Input
                              value={editingData.errorId}
                              onChange={(e) => setEditingData(prev => ({ ...prev, errorId: e.target.value }))}
                              placeholder="Problem-ID"
                              className="text-sm"
                            />
                            <Input
                              value={editingData.title}
                              onChange={(e) => setEditingData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Titel"
                              className="text-sm"
                            />
                            <Input
                              value={editingData.description}
                              onChange={(e) => setEditingData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Beschreibung"
                              className="text-sm"
                            />
                            <select
                              value={editingData.iconName}
                              onChange={(e) => setEditingData(prev => ({ ...prev, iconName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                            >
                              {iconOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                              <Switch
                                checked={editingData.videoEnabled}
                                onCheckedChange={(checked) => setEditingData(prev => ({ ...prev, videoEnabled: checked }))}
                              />
                              <Label className="text-sm">Video-Tutorial aktiviert</Label>
                            </div>
                            <Input
                              value={editingData.videoUrl}
                              onChange={(e) => setEditingData(prev => ({ ...prev, videoUrl: e.target.value }))}
                              placeholder="Video URL"
                              className="text-sm"
                              disabled={!editingData.videoEnabled}
                            />
                            <textarea
                              value={editingData.instructions}
                              onChange={(e) => setEditingData(prev => ({ ...prev, instructions: e.target.value }))}
                              placeholder="Lösungsschritte"
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm resize-none"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="flex-1 text-white rounded-xl py-2"
                                style={{ backgroundColor: '#6d0df0' }}
                              >
                                {updateMutation.isPending ? "Speichern..." : "Speichern"}
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCancelEdit}
                                variant="outline"
                                className="flex-1 rounded-xl py-2"
                              >
                                Abbrechen
                              </Button>
                            </div>
                          </form>
                        ) : (
                          // Display Mode
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                  {errorType.title}
                                </h3>
                                <p className="text-xs text-gray-600 mb-1">
                                  ID: {errorType.errorId}
                                </p>
                                <p className="text-xs text-gray-600 mb-1">
                                  {errorType.description}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEdit(errorType)}
                                  variant="outline"
                                  size="sm"
                                  className="px-3 py-1 text-xs rounded-lg"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Bearbeiten
                                </Button>
                                <Button
                                  onClick={() => handleDelete(errorType.id)}
                                  variant="outline"
                                  size="sm"
                                  className="px-3 py-1 text-xs rounded-lg border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Löschen
                                </Button>
                              </div>
                            </div>
                            
                            {/* Video Management Section */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4 text-gray-600" />
                                  <span className="text-xs font-medium text-gray-700">Video-Tutorial</span>
                                  {(() => {
                                    const status = getVideoStatus(errorType);
                                    const StatusIcon = status.icon;
                                    return (
                                      <Badge className={`${status.color} text-xs`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {status.text}
                                      </Badge>
                                    );
                                  })()}
                                </div>
                                <Switch
                                  checked={(errorType as any).videoEnabled ?? true}
                                  onCheckedChange={() => handleVideoToggle(errorType.id, (errorType as any).videoEnabled ?? true)}
                                  disabled={videoToggleMutation.isPending}
                                />
                              </div>
                              {(errorType as any).videoEnabled && errorType.videoUrl && (
                                <div className="text-xs text-gray-600">
                                  <p className="break-all">{errorType.videoUrl}</p>
                                </div>
                              )}
                              {(errorType as any).videoEnabled && !errorType.videoUrl && (
                                <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                                  ⚠️ Video aktiviert, aber keine URL konfiguriert
                                </div>
                              )}
                            </div>
                          </div>
                        )}
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
        )}

        {activeTab === "kanban" && (
          <EnhancedKanbanBoard sessionId={sessionId!} currentUser={currentUser} />
        )}

        {activeTab === "customers" && (
          <CustomersOverview sessionId={sessionId!} />
        )}

        {activeTab === "email" && (
          <EmailSettings sessionId={sessionId!} />
        )}

        {activeTab === "statistics" && (
          <Statistics sessionId={sessionId!} />
        )}

        {activeTab === "logs" && userRole === "admin" && (
          <ActivityLogs sessionId={sessionId!} />
        )}

        {activeTab === "employees" && userRole === "admin" && (
          <Employees sessionId={sessionId!} />
        )}
      </div>
    </div>
  );
}