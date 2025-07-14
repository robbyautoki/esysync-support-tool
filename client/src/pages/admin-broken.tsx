import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, Plus, List, Edit2, Trash2, Save, X, 
  LogOut, BarChart3, Users, Mail, Activity, 
  UserPlus, Video, CheckCircle, XCircle, AlertTriangle,
  MonitorSpeaker, WifiOff, RotateCcw, Zap, Monitor, 
  Smartphone, Tv, Square, Camera, MessageCircle, 
  Bug, AlertCircle, HelpCircle, Power, Pause
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import KanbanBoard from "@/components/admin/kanban-board";
import CustomersOverview from "@/components/admin/customers-overview";
import EmailSettings from "@/components/admin/email-settings";
import Statistics from "@/components/admin/statistics";
import ActivityLogs from "@/components/admin/activity-logs";
import Employees from "@/components/admin/employees";
import { ErrorType } from "@/shared/schema";

export default function AdminPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("admin");
  const [activeTab, setActiveTab] = useState("problems");
  
  // Session validation
  useEffect(() => {
    const validateSession = async () => {
      const storedSessionId = localStorage.getItem("adminSessionId");
      if (storedSessionId) {
        try {
          const response = await fetch("/api/admin/validate", {
            headers: {
              "x-session-id": storedSessionId,
            },
          });
          if (response.ok) {
            setSessionId(storedSessionId);
            // Get user role
            const userResponse = await fetch("/api/admin/user", {
              headers: {
                "x-session-id": storedSessionId,
              },
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
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
  const [showNewProblemForm, setShowNewProblemForm] = useState(false);
  const [newErrorType, setNewErrorType] = useState({
    errorId: "",
    title: "",
    description: "",
    iconName: "Monitor",
    videoUrl: "",
    videoEnabled: true,
    instructions: "",
  });
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
      setShowNewProblemForm(false);
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
        body: JSON.stringify({ videoEnabled: !videoEnabled }),
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
        description: "Die Video-Tutorial-Einstellungen wurden erfolgreich gespeichert.",
      });
    },
  });

  const iconOptions = [
    { value: "Monitor", label: "Monitor" },
    { value: "MonitorSpeaker", label: "Monitor mit Ton" },
    { value: "WifiOff", label: "Verbindungsproblem" },
    { value: "RotateCcw", label: "Neustart" },
    { value: "Zap", label: "Stromversorgung" },
    { value: "Smartphone", label: "Mobile Anzeige" },
    { value: "Tv", label: "TV-Display" },
    { value: "Square", label: "Pixel-Problem" },
    { value: "Camera", label: "Kamera" },
    { value: "MessageCircle", label: "App-Problem" },
    { value: "Bug", label: "Software-Bug" },
    { value: "AlertCircle", label: "Warnung" },
    { value: "HelpCircle", label: "Unbekannt" },
    { value: "Power", label: "Power" },
    { value: "Pause", label: "Pause/Freeze" }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newErrorType);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: editingData });
    }
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

  const handleVideoToggle = (id: number, currentVideoEnabled: boolean) => {
    videoToggleMutation.mutate({ id, videoEnabled: currentVideoEnabled });
  };

  const getVideoStatus = (errorType: ErrorType) => {
    const videoEnabled = (errorType as any).videoEnabled ?? true;
    if (!videoEnabled) {
      return { icon: XCircle, color: "bg-red-100 text-red-700", text: "Deaktiviert" };
    } else if (errorType.videoUrl) {
      return { icon: CheckCircle, color: "bg-green-100 text-green-700", text: "Aktiv" };
    } else {
      return { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700", text: "Kein Video" };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSessionId");
    setSessionId(null);
    setUserRole("admin");
    setActiveTab("problems");
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md glassmorphism border-0 apple-shadow">
          <CardHeader>
            <CardTitle className="text-center text-gray-900">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              loginMutation.mutate(loginForm);
            }} className="space-y-4">
              <div>
                <Label htmlFor="username">Benutzername</Label>
                <Input
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  className="mt-1"
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Left Sidebar */}
      <div className="fixed inset-y-0 left-0 w-80 glassmorphism border-r border-white/20 p-6 z-10">
        <div className="h-full flex flex-col">
          {/* Navigation */}
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("problems")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "problems" 
                  ? "bg-white/30 text-gray-900 apple-shadow" 
                  : "text-gray-700 hover:bg-white/20"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Display-Probleme
            </button>
            
            <button
              onClick={() => setActiveTab("kanban")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "kanban" 
                  ? "bg-white/30 text-gray-900 apple-shadow" 
                  : "text-gray-700 hover:bg-white/20"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Ticket-Verwaltung
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "customers" 
                  ? "bg-white/30 text-gray-900 apple-shadow" 
                  : "text-gray-700 hover:bg-white/20"
              }`}
            >
              <Users className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Kunden-Übersicht
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "email" 
                  ? "bg-white/30 text-gray-900 apple-shadow" 
                  : "text-gray-700 hover:bg-white/20"
              }`}
            >
              <Mail className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              E-Mail-Einstellungen
            </button>

            <button
              onClick={() => setActiveTab("statistics")}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === "statistics" 
                  ? "bg-white/30 text-gray-900 apple-shadow" 
                  : "text-gray-700 hover:bg-white/20"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
              Statistiken
            </button>

            {userRole === "admin" && (
              <button
                onClick={() => setActiveTab("logs")}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === "logs" 
                    ? "bg-white/30 text-gray-900 apple-shadow" 
                    : "text-gray-700 hover:bg-white/20"
                }`}
              >
                <Activity className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
                Logs
              </button>
            )}

            {userRole === "admin" && (
              <button
                onClick={() => setActiveTab("employees")}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === "employees" 
                    ? "bg-white/30 text-gray-900 apple-shadow" 
                    : "text-gray-700 hover:bg-white/20"
                }`}
              >
                <UserPlus className="w-5 h-5 mr-3" style={{ color: '#6d0df0' }} />
                Mitarbeiter
              </button>
            )}
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
          <div className="space-y-8">
            {/* Add New Problem Button */}
            {!showNewProblemForm && (
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowNewProblemForm(true)}
                  className="px-8 py-4 text-white rounded-xl apple-shadow hover:shadow-lg transition-all duration-200 text-lg"
                  style={{ backgroundColor: '#6d0df0' }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Neues Problem hinzufügen
                </Button>
              </div>
            )}

            {/* Add New Problem Form */}
            {showNewProblemForm && (
              <Card className="glassmorphism border-0 apple-shadow max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900">
                      <Plus className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
                      Neues Problem hinzufügen
                    </CardTitle>
                    <Button
                      onClick={() => {
                        setShowNewProblemForm(false);
                        setNewErrorType({
                          errorId: "",
                          title: "",
                          description: "",
                          iconName: "Monitor",
                          videoUrl: "",
                          videoEnabled: true,
                          instructions: "",
                        });
                      }}
                      variant="outline"
                      size="sm"
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
                      <Input
                        id="instructions"
                        value={newErrorType.instructions}
                        onChange={(e) => setNewErrorType(prev => ({ ...prev, instructions: e.target.value }))}
                        placeholder="Schritt-für-Schritt Anweisungen"
                        className="mt-1"
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
                  Bestehende Probleme
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
                  <div className="space-y-4 max-h-96 overflow-y-auto">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
                            <Input
                              value={editingData.instructions}
                              onChange={(e) => setEditingData(prev => ({ ...prev, instructions: e.target.value }))}
                              placeholder="Lösungsschritte"
                              className="text-sm"
                            />
                            <div className="flex space-x-2">
                              <Button type="submit" size="sm" style={{ backgroundColor: '#6d0df0', color: 'white' }}>
                                <Save className="w-3 h-3 mr-1" />
                                Speichern
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setEditingId(null)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Abbrechen
                              </Button>
                            </div>
                          </form>
                        ) : (
                          // View Mode
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">{errorType.title}</h3>
                              <div className="flex space-x-1">
                                <Button
                                  onClick={() => handleEdit(errorType)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteMutation.mutate(errorType.id)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">{errorType.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>ID: {errorType.errorId}</span>
                              <span>Icon: {errorType.iconName}</span>
                            </div>
                            
                            {/* Video Management Section */}
                            <div className="border-t pt-2 mt-2">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
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
          <KanbanBoard sessionId={sessionId!} />
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