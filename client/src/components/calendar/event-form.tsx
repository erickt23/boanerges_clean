import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface EventFormProps {
  onSuccess?: () => void;
  event?: any;
  defaultDate?: Date;
}

export default function EventForm({ onSuccess, event, defaultDate }: EventFormProps) {
  const isEditing = !!event;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getDefaultStartDate = () => {
    if (event?.startDate) return new Date(event.startDate).toISOString().slice(0, 16);
    if (defaultDate) {
      const date = new Date(defaultDate);
      date.setHours(10, 0); // Default to 10:00 AM
      return date.toISOString().slice(0, 16);
    }
    return "";
  };

  const getDefaultEndDate = () => {
    if (event?.endDate) return new Date(event.endDate).toISOString().slice(0, 16);
    if (defaultDate) {
      const date = new Date(defaultDate);
      date.setHours(11, 0); // Default to 11:00 AM (1 hour after start)
      return date.toISOString().slice(0, 16);
    }
    return "";
  };

  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    eventType: event?.eventType || "service",
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    location: event?.location || "",
    isRecurring: event?.isRecurring || false,
    recurringPattern: event?.recurringPattern || "",
    showOnLandingPage: event?.showOnLandingPage || false,
    isSpecial: event?.isSpecial || false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      };
      const res = await apiRequest("POST", "/api/events", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
      toast({
        title: "Succès",
        description: "Événement créé avec succès",
      });
      setFormData({
        title: "",
        description: "",
        eventType: "service",
        startDate: "",
        endDate: "",
        location: "",
        isRecurring: false,
        recurringPattern: "",
        showOnLandingPage: false,
        isSpecial: false,
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      };
      const res = await apiRequest("PUT", `/api/events/${event.id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
      toast({
        title: "Succès",
        description: "Événement modifié avec succès",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) {
      toast({
        title: "Erreur",
        description: "Le titre et la date de début sont requis",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isLoading = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Informations de l'Événement</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventType">Type d'Événement *</Label>
            <Select value={formData.eventType} onValueChange={(value) => handleInputChange("eventType", value)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="meeting">Réunion</SelectItem>
                <SelectItem value="activity">Activité</SelectItem>
                <SelectItem value="retreat">Retraite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSpecial"
              checked={formData.isSpecial}
              onChange={(e) => handleInputChange("isSpecial", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <Label htmlFor="isSpecial" className="flex items-center space-x-2">
              <span>Événement spécial</span>
              <span className="text-sm text-gray-500">(s'affichera en orange avec une étoile)</span>
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Date et Heure de Début *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Date et Heure de Fin</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Section Récurrence */}
        <div className="border rounded-lg p-4 space-y-4 bg-slate-50">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRecurring"
              checked={formData.isRecurring}
              onChange={(e) => handleInputChange("isRecurring", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="isRecurring" className="font-medium">
              Événement récurrent
            </Label>
          </div>
          
          {formData.isRecurring && (
            <div className="space-y-3 pl-6 border-l-2 border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="recurringPattern">Fréquence de récurrence</Label>
                <Select
                  value={formData.recurringPattern}
                  onValueChange={(value) => handleInputChange("recurringPattern", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir la fréquence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-700">
                  <strong>Information :</strong> Les événements récurrents seront générés automatiquement selon la fréquence choisie. Chaque occurrence peut être modifiée ou supprimée individuellement.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showOnLandingPage"
            checked={formData.showOnLandingPage}
            onChange={(e) => handleInputChange("showOnLandingPage", e.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="showOnLandingPage" className="text-sm font-medium">
            Afficher sur la page d'accueil publique
          </label>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : (isEditing ? "Mettre à jour" : "Créer l'événement")}
          </Button>
        </div>
      </div>
    </form>
  );
}