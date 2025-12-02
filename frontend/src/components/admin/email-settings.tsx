import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mail, Clock, Save, AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EmailSettingsProps {
  sessionId: string;
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  daysTrigger: number;
  enabled: boolean;
  type: 'reminder' | 'auto-close';
}

export default function EmailSettings({ sessionId }: EmailSettingsProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      name: "7-Tage Erinnerung",
      subject: "Erinnerung: Ihr RMA-Ticket {{rmaNumber}} - Status Update",
      body: `Liebe/r Kunde/in,

Ihr RMA-Ticket {{rmaNumber}} befindet sich seit 7 Tagen in der Bearbeitung.

Details:
- Account: {{accountNumber}}
- Display: {{displayNumber}}
- Problem: {{errorType}}
- Eingereicht am: {{createdDate}}

Wir arbeiten mit Hochdruck an Ihrem Fall. Falls Sie Fragen haben, kontaktieren Sie uns gerne.

Mit freundlichen Grüßen
Ihr Support-Team`,
      daysTrigger: 7,
      enabled: true,
      type: 'reminder'
    },
    {
      id: 2,
      name: "14-Tage Erinnerung",
      subject: "Wichtig: Ihr RMA-Ticket {{rmaNumber}} - Dringender Status Update",
      body: `Liebe/r Kunde/in,

Ihr RMA-Ticket {{rmaNumber}} befindet sich seit 14 Tagen in der Bearbeitung.

Details:
- Account: {{accountNumber}}
- Display: {{displayNumber}}
- Problem: {{errorType}}
- Eingereicht am: {{createdDate}}

Wir entschuldigen uns für die Verzögerung. Ihr Fall wird prioritär behandelt.

Bitte kontaktieren Sie uns bei Fragen unter support@esysync.com.

Mit freundlichen Grüßen
Ihr Support-Team`,
      daysTrigger: 14,
      enabled: true,
      type: 'reminder'
    },
    {
      id: 3,
      name: "21-Tage Auto-Schließung",
      subject: "Ticket geschlossen: {{rmaNumber}} - Automatische Bearbeitung",
      body: `Liebe/r Kunde/in,

Ihr RMA-Ticket {{rmaNumber}} wurde nach 21 Tagen automatisch geschlossen.

Details:
- Account: {{accountNumber}}
- Display: {{displayNumber}}
- Problem: {{errorType}}
- Eingereicht am: {{createdDate}}
- Geschlossen am: {{closeDate}}

Falls Sie weiterhin Unterstützung benötigen, erstellen Sie bitte ein neues Ticket.

Mit freundlichen Grüßen
Ihr Support-Team`,
      daysTrigger: 21,
      enabled: true,
      type: 'auto-close'
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);
  const [emailConfig, setEmailConfig] = useState({
    reminderDays: [7, 14],
    autoCloseDays: 21,
    fromEmail: "support@esysync.com",
    fromName: "Support Team"
  });

  const { toast } = useToast();

  const handleSaveTemplate = (template: EmailTemplate) => {
    setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    setEditingTemplate(null);
    toast({
      title: "Vorlage gespeichert",
      description: "Die E-Mail-Vorlage wurde erfolgreich aktualisiert.",
    });
  };

  const handleToggleTemplate = (id: number, enabled: boolean) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled } : t));
    toast({
      title: enabled ? "Vorlage aktiviert" : "Vorlage deaktiviert",
      description: `Die E-Mail-Vorlage wurde ${enabled ? 'aktiviert' : 'deaktiviert'}.`,
    });
  };

  const handleSaveConfig = () => {
    toast({
      title: "Konfiguration gespeichert",
      description: "Die E-Mail-Einstellungen wurden erfolgreich gespeichert.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Mail className="w-7 h-7 mr-3" style={{ color: '#6d0df0' }} />
              E-Mail Einstellungen
            </h1>
            <p className="text-gray-600 mt-2">
              Automatische Benachrichtigungen und Ticket-Verwaltung konfigurieren
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* General Configuration */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Settings className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              Allgemeine Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromEmail">Absender E-Mail</Label>
                <Input
                  id="fromEmail"
                  value={emailConfig.fromEmail}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="fromName">Absender Name</Label>
                <Input
                  id="fromName"
                  value={emailConfig.fromName}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Timing-Konfiguration</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reminder1">1. Erinnerung (Tage)</Label>
                  <Input
                    id="reminder1"
                    type="number"
                    value={emailConfig.reminderDays[0]}
                    onChange={(e) => setEmailConfig(prev => ({ 
                      ...prev, 
                      reminderDays: [parseInt(e.target.value), prev.reminderDays[1]]
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="reminder2">2. Erinnerung (Tage)</Label>
                  <Input
                    id="reminder2"
                    type="number"
                    value={emailConfig.reminderDays[1]}
                    onChange={(e) => setEmailConfig(prev => ({ 
                      ...prev, 
                      reminderDays: [prev.reminderDays[0], parseInt(e.target.value)]
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="autoClose">Auto-Schließung (Tage)</Label>
                  <Input
                    id="autoClose"
                    type="number"
                    value={emailConfig.autoCloseDays}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, autoCloseDays: parseInt(e.target.value) }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveConfig}
              className="w-full text-white"
              style={{ backgroundColor: '#6d0df0' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Konfiguration speichern
            </Button>
          </CardContent>
        </Card>

        {/* Available Variables */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <AlertCircle className="w-5 h-5 mr-2" style={{ color: '#6d0df0' }} />
              Verfügbare Variablen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Diese Platzhalter werden automatisch durch echte Werte ersetzt:
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{rmaNumber}}'}</code>
                <span className="text-gray-600">RMA-Nummer</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{accountNumber}}'}</code>
                <span className="text-gray-600">Account-Nummer</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{displayNumber}}'}</code>
                <span className="text-gray-600">Display-Nummer</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{errorType}}'}</code>
                <span className="text-gray-600">Problem-Typ</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{createdDate}}'}</code>
                <span className="text-gray-600">Erstellungsdatum</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{closeDate}}'}</code>
                <span className="text-gray-600">Schließungsdatum</span>
              </div>
              <div className="flex justify-between py-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">{'{{customerEmail}}'}</code>
                <span className="text-gray-600">Kunden E-Mail</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">E-Mail Vorlagen</h2>
        
        {templates.map((template) => (
          <Card key={template.id} className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <CardTitle className="text-lg text-gray-900">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">
                      Wird nach {template.daysTrigger} Tagen ausgelöst
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={template.type === 'auto-close' ? 'destructive' : 'secondary'}>
                    {template.type === 'auto-close' ? 'Auto-Schließung' : 'Erinnerung'}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={template.enabled}
                      onCheckedChange={(enabled) => handleToggleTemplate(template.id, enabled)}
                    />
                    <span className="text-sm text-gray-600">
                      {template.enabled ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingTemplate === template.id ? (
                <TemplateEditor
                  template={template}
                  onSave={handleSaveTemplate}
                  onCancel={() => setEditingTemplate(null)}
                />
              ) : (
                <TemplatePreview
                  template={template}
                  onEdit={() => setEditingTemplate(template.id)}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TemplateEditor({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: EmailTemplate; 
  onSave: (template: EmailTemplate) => void; 
  onCancel: () => void; 
}) {
  const [editedTemplate, setEditedTemplate] = useState(template);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="subject">Betreff</Label>
        <Input
          id="subject"
          value={editedTemplate.subject}
          onChange={(e) => setEditedTemplate(prev => ({ ...prev, subject: e.target.value }))}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="body">E-Mail Text</Label>
        <Textarea
          id="body"
          value={editedTemplate.body}
          onChange={(e) => setEditedTemplate(prev => ({ ...prev, body: e.target.value }))}
          rows={12}
          className="mt-1 font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="daysTrigger">Auslösung nach (Tage)</Label>
        <Input
          id="daysTrigger"
          type="number"
          value={editedTemplate.daysTrigger}
          onChange={(e) => setEditedTemplate(prev => ({ ...prev, daysTrigger: parseInt(e.target.value) }))}
          className="mt-1 w-32"
        />
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={() => onSave(editedTemplate)}
          className="text-white"
          style={{ backgroundColor: '#6d0df0' }}
        >
          <Save className="w-4 h-4 mr-2" />
          Speichern
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline"
        >
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

function TemplatePreview({ 
  template, 
  onEdit 
}: { 
  template: EmailTemplate; 
  onEdit: () => void; 
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Betreff:</h4>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          {template.subject}
        </p>
      </div>
      
      <div>
        <h4 className="font-medium text-gray-900 mb-2">E-Mail Text:</h4>
        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto">
          {template.body}
        </div>
      </div>

      <Button 
        onClick={onEdit}
        variant="outline"
        size="sm"
      >
        Bearbeiten
      </Button>
    </div>
  );
}