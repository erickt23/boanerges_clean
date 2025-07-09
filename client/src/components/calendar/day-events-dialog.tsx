import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import EventForm from "./event-form";

interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
}

interface DayEventsDialogProps {
  selectedDay: Date | null;
  events: Event[];
  isOpen: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

export default function DayEventsDialog({ 
  selectedDay, 
  events, 
  isOpen, 
  onClose, 
  onEventAdded 
}: DayEventsDialogProps) {
  const [showEventForm, setShowEventForm] = useState(false);

  if (!selectedDay) return null;

  const handleEventAdded = () => {
    setShowEventForm(false);
    onEventAdded();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Événements du {format(selectedDay, "d MMMM yyyy", { locale: fr })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun événement prévu pour cette date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <Card key={event.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(event.startDate), "HH:mm")} - 
                          {format(new Date(event.endDate), "HH:mm")}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showEventForm ? (
            <div className="border-t pt-4">
              <EventForm 
                onSuccess={handleEventAdded}
                defaultDate={selectedDay}
              />
            </div>
          ) : (
            <Button 
              onClick={() => setShowEventForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un événement
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}