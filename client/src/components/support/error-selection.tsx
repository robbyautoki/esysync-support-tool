import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, BarChart3, PauseCircle, Unlink, ArrowLeft, ArrowRight, AlertTriangle, Zap, Wifi, Volume, RotateCcw, FileX, Settings, WifiOff, ShieldAlert, Package, Lightbulb, Battery, Smartphone, Shield, Power, Router } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SupportFormData } from "@/pages/support";
import type { ErrorType } from "@shared/schema";

interface ErrorSelectionProps {
  formData: SupportFormData;
  updateFormData: (updates: Partial<SupportFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const iconMap = {
  Monitor,
  BarChart3,
  PauseCircle,
  Unlink,
  AlertTriangle,
  Zap,
  Wifi,
  Volume,
  RotateCcw,
  FileX,
  Settings,
  WifiOff,
  ShieldAlert,
  Package,
  Lightbulb,
  Battery,
  Smartphone,
  Shield,
  Power,
  Router,
};

const categories = [
  {
    id: "hardware",
    title: "Hardware-Probleme",
    description: "Physische Defekte am Display oder Hardware-Komponenten",
    icon: "Monitor",
    color: "bg-red-500"
  },
  {
    id: "software", 
    title: "Software-Probleme",
    description: "Bootloop, Apps, Android-Fehler und System-Probleme",
    icon: "Smartphone",
    color: "bg-blue-500"
  },
  {
    id: "network",
    title: "Netzwerk-Probleme", 
    description: "Verbindungs-, Update- und Konnektivitätsprobleme",
    icon: "Wifi",
    color: "bg-green-500"
  }
];

export default function ErrorSelection({ formData, updateFormData, onNext, onPrev }: ErrorSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const canContinue = formData.selectedError && formData.restartConfirmed;

  const { data: errorTypes, isLoading } = useQuery({
    queryKey: ["/api/error-types"],
  });

  const filteredErrorTypes = Array.isArray(errorTypes) ? errorTypes.filter((error: ErrorType) => 
    !selectedCategory || error.category === selectedCategory
  ) : [];

  const selectError = (errorId: string) => {
    updateFormData({ selectedError: errorId });
  };

  const toggleRestartConfirmed = (checked: boolean) => {
    updateFormData({ restartConfirmed: checked });
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset selected error when changing category
    updateFormData({ selectedError: null });
  };

  return (
    <section className="fade-in">
      <div className="glassmorphism rounded-3xl p-8 apple-shadow mb-8">
        {!selectedCategory ? (
          // Category Selection Step
          <>
            <h2 className="text-3xl font-light text-gray-800 mb-2 text-center">
              Wählen Sie die Problem-Kategorie
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Wählen Sie zuerst die Hauptkategorie Ihres Problems aus
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap];
                return (
                  <Card 
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-300"
                    onClick={() => selectCategory(category.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-800 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          // Problem Selection Step  
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-light text-gray-800 mb-2">
                  Wählen Sie das spezifische Problem
                </h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    {categories.find(c => c.id === selectedCategory)?.title}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedCategory("")}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Kategorie ändern
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-gray-600">Lade Problemtypen...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {filteredErrorTypes?.map((error: ErrorType) => {
                  const IconComponent = iconMap[error.iconName as keyof typeof iconMap];
                  const isSelected = formData.selectedError === error.errorId;
                  
                  return (
                    <div
                      key={error.errorId}
                      className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "bg-purple-50 border-2 border-purple-300 apple-shadow"
                          : "bg-white/70 border border-gray-200 hover:border-purple-200 hover:bg-purple-25"
                      }`}
                      onClick={() => selectError(error.errorId)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl ${isSelected ? "bg-purple-100" : "bg-gray-100"}`}>
                          <IconComponent className={`h-6 w-6 ${isSelected ? "text-purple-600" : "text-gray-600"}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium mb-2 ${isSelected ? "text-purple-800" : "text-gray-800"}`}>
                            {error.title}
                          </h3>
                          <p className={`text-sm ${isSelected ? "text-purple-600" : "text-gray-600"}`}>
                            {error.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Restart Confirmation */}
        {selectedCategory && formData.selectedError && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-orange-800 mb-2">
                  Wichtiger Hinweis vor dem Support
                </h3>
                <p className="text-orange-700 text-sm mb-4">
                  Bitte bestätigen Sie, dass Sie das Display bereits neu gestartet haben, bevor Sie den Support kontaktieren.
                </p>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="restart-confirmed"
                    checked={formData.restartConfirmed}
                    onCheckedChange={toggleRestartConfirmed}
                  />
                  <label
                    htmlFor="restart-confirmed"
                    className="text-sm font-medium text-orange-800 cursor-pointer"
                  >
                    Ja, ich habe das Display neu gestartet
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onPrev}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Zurück</span>
          </Button>

          <Button
            onClick={onNext}
            disabled={!canContinue}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-300"
          >
            <span>Weiter</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
