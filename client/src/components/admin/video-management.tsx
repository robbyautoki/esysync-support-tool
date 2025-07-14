import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Video, Play, Pause, Settings, Save, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";

interface VideoManagementProps {
  sessionId: string;
}

interface ErrorType {
  id: number;
  errorId: string;
  title: string;
  description: string;
  iconName: string;
  videoUrl: string | null;
  videoEnabled: boolean;
  instructions: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function VideoManagement({ sessionId }: VideoManagementProps) {
  const { toast } = useToast();
  const [editingVideo, setEditingVideo] = useState<number | null>(null);
  const [videoFormData, setVideoFormData] = useState({
    videoUrl: "",
    videoEnabled: true,
  });

  const { data: errorTypes = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/error-types"],
    queryFn: async () => {
      const response = await fetch("/api/admin/error-types", {
        headers: {
          'X-Session-ID': sessionId,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch error types');
      }
      
      return response.json();
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, videoData }: { id: number; videoData: { videoUrl?: string; videoEnabled: boolean } }) => {
      return apiRequest(`/api/admin/error-types/${id}/video`, {
        method: "PATCH",
        headers: {
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify(videoData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/error-types"] });
      toast({
        title: "Video-Einstellungen aktualisiert",
        description: "Die Video-Tutorial-Einstellungen wurden erfolgreich gespeichert.",
      });
      setEditingVideo(null);
      setVideoFormData({ videoUrl: "", videoEnabled: true });
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Video-Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
      console.error("Error updating video settings:", error);
    },
  });

  const toggleVideoEnabled = (errorType: ErrorType) => {
    updateVideoMutation.mutate({
      id: errorType.id,
      videoData: {
        videoEnabled: !errorType.videoEnabled,
      },
    });
  };

  const startEditingVideo = (errorType: ErrorType) => {
    setEditingVideo(errorType.id);
    setVideoFormData({
      videoUrl: errorType.videoUrl || "",
      videoEnabled: errorType.videoEnabled,
    });
  };

  const saveVideoSettings = (errorTypeId: number) => {
    updateVideoMutation.mutate({
      id: errorTypeId,
      videoData: videoFormData,
    });
  };

  const cancelEditing = () => {
    setEditingVideo(null);
    setVideoFormData({ videoUrl: "", videoEnabled: true });
  };

  const getVideoStatus = (errorType: ErrorType) => {
    if (!errorType.videoEnabled) {
      return { status: "disabled", color: "bg-red-100 text-red-800", icon: Pause };
    }
    if (!errorType.videoUrl) {
      return { status: "no_video", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
    }
    return { status: "active", color: "bg-green-100 text-green-800", icon: Play };
  };

  const getVideoStatusText = (status: string) => {
    switch (status) {
      case "disabled":
        return "Deaktiviert";
      case "no_video":
        return "Kein Video";
      case "active":
        return "Aktiv";
      default:
        return "Unbekannt";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
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
          <h1 className="text-2xl font-bold text-gray-900">Video-Tutorial Verwaltung</h1>
          <p className="text-gray-600">Aktivieren oder deaktivieren Sie Video-Anleitungen für jeden Problemtyp</p>
        </div>
        <Button onClick={() => refetch()} size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Video className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gesamt</p>
                <p className="text-xl font-semibold">{errorTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktive Videos</p>
                <p className="text-xl font-semibold">
                  {errorTypes.filter((et: ErrorType) => et.videoEnabled && et.videoUrl).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Pause className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deaktiviert</p>
                <p className="text-xl font-semibold">
                  {errorTypes.filter((et: ErrorType) => !et.videoEnabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ohne Video</p>
                <p className="text-xl font-semibold">
                  {errorTypes.filter((et: ErrorType) => et.videoEnabled && !et.videoUrl).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {errorTypes.map((errorType: ErrorType) => {
          const videoStatus = getVideoStatus(errorType);
          const StatusIcon = videoStatus.icon;
          const isEditing = editingVideo === errorType.id;

          return (
            <Card key={errorType.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{errorType.title}</CardTitle>
                  <Badge className={videoStatus.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {getVideoStatusText(videoStatus.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{errorType.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Video Enable/Disable Switch */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-4 w-4 text-gray-600" />
                    <Label htmlFor={`video-${errorType.id}`} className="text-sm font-medium">
                      Video-Tutorial aktiviert
                    </Label>
                  </div>
                  <Switch
                    id={`video-${errorType.id}`}
                    checked={errorType.videoEnabled}
                    onCheckedChange={() => toggleVideoEnabled(errorType)}
                    disabled={updateVideoMutation.isPending}
                  />
                </div>

                {/* Video URL Management */}
                {errorType.videoEnabled && (
                  <div className="space-y-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`url-${errorType.id}`} className="text-sm font-medium">
                            Video-URL
                          </Label>
                          <Input
                            id={`url-${errorType.id}`}
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={videoFormData.videoUrl}
                            onChange={(e) => 
                              setVideoFormData({ ...videoFormData, videoUrl: e.target.value })
                            }
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => saveVideoSettings(errorType.id)}
                            disabled={updateVideoMutation.isPending}
                            size="sm"
                            className="flex-1"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Speichern
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {errorType.videoUrl ? (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Eye className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">Aktuelle Video-URL:</span>
                            </div>
                            <p className="text-xs text-blue-700 break-all">{errorType.videoUrl}</p>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              <span className="text-sm text-yellow-800">Kein Video konfiguriert</span>
                            </div>
                          </div>
                        )}
                        
                        <Button
                          onClick={() => startEditingVideo(errorType)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          {errorType.videoUrl ? "Video bearbeiten" : "Video hinzufügen"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}