import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Plus, Eye, Grid, List, Download, Edit, BarChart3, Star, UserCheck, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import EventForm from "@/components/calendar/event-form";
import { useAuth } from "@/hooks/use-auth";

export default function Calendar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDayDialogOpen, setIsDayDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedEventAnalytics, setSelectedEventAnalytics] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  // Mutation pour supprimer un événement
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'événement');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
      toast({
        title: "Succès",
        description: "Événement supprimé avec succès",
      });
      setIsDeleteDialogOpen(false);
      setEventToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression de l'événement",
        variant: "destructive",
      });
    },
  });

  // Fonction pour ouvrir le dialogue de suppression
  const handleDeleteEvent = (event: any) => {
    setEventToDelete(event);
    setIsDeleteDialogOpen(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
    }
  };

  // Fetch events for the current month
  const { data: events } = useQuery({
    queryKey: ["/api/events", { 
      startDate: startOfMonth(currentDate).toISOString(),
      endDate: endOfMonth(currentDate).toISOString()
    }],
    queryFn: async ({ queryKey }) => {
      const params = queryKey[1] as { startDate: string; endDate: string };
      const response = await fetch(`/api/events?startDate=${params.startDate}&endDate=${params.endDate}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  // Generate calendar grid with proper week alignment (Sunday first)
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const startOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday = 0
  const endOfCalendar = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });
  
  const monthDays = eachDayOfInterval({
    start: startOfCalendar,
    end: endOfCalendar,
  });

  const getEventsForDay = (day: Date) => {
    return events?.filter((event: any) => 
      isSameDay(new Date(event.startDate), day)
    ) || [];
  };

  const handleEventAdded = () => {
    setIsDialogOpen(false);
  };

  const handleEventUpdated = () => {
    setIsEditDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsDayDialogOpen(true);
  };

  const handleDayDialogClose = () => {
    setIsDayDialogOpen(false);
    setSelectedDay(null);
  };

  // Fonction pour générer et télécharger un fichier ICS
  const downloadICS = (event: any) => {
    const formatDateForICS = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mission Évangélique Boanergès//Calendar//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@mission-boanerges.com`,
      `DTSTART:${formatDateForICS(startDate)}`,
      `DTEND:${formatDateForICS(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || 'Mission Évangélique Boanergès, 906 rue King Ouest, Sherbrooke'}`,
      `CREATED:${formatDateForICS(new Date(event.createdAt))}`,
      `LAST-MODIFIED:${formatDateForICS(new Date())}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Rappel événement',
      'TRIGGER:-PT15M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={t('activityCalendar')} 
          action={
            <div className="flex items-center space-x-2">
              <div className="flex rounded-lg border">
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>{t('newEvent')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('createEvent')}</DialogTitle>
                  </DialogHeader>
                  <EventForm onSuccess={handleEventAdded} />
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {/* Dialog pour les événements d'un jour spécifique */}
        <Dialog open={isDayDialogOpen} onOpenChange={handleDayDialogClose}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDay && `Événements du ${format(selectedDay, "d MMMM yyyy", { locale: fr })}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedDay && getEventsForDay(selectedDay).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun événement prévu pour cette date</p>
                </div>
              ) : (
                selectedDay && getEventsForDay(selectedDay).map((event: any) => (
                  <Card key={event.id} className={`border-l-4 ${
                    event.isSpecial ? 'border-l-orange-500' : 'border-l-green-500'
                  }`}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground flex items-center space-x-2">
                        <span>{event.title}</span>
                        {event.isSpecial && <span className="text-orange-600">⭐</span>}
                      </h4>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(event.startDate), "HH:mm")} - 
                            {format(new Date(event.endDate), "HH:mm")}
                          </span>
                          {event.location && <span>{event.location}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadICS(event);
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
{t('addEvent')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('createEvent')}</DialogTitle>
                  </DialogHeader>
                  <EventForm 
                    onSuccess={() => {
                      handleEventAdded();
                      handleDayDialogClose();
                    }} 
                    defaultDate={selectedDay || undefined}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>{format(currentDate, 'MMMM yyyy', { locale: fr })}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  >
                    <span>{t('previous')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    <span>{t('today')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  >
                    <span>{t('next')}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'month' ? (
                <div className="grid grid-cols-7 gap-1">
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded">
                      {day}
                    </div>
                  ))}
                  {monthDays.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        className={`min-h-[100px] p-2 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                          isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                        } ${isToday ? 'ring-2 ring-primary' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event: any) => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className={`text-xs p-1 rounded truncate flex items-center space-x-1 hover:opacity-80 cursor-pointer ${
                                event.isSpecial 
                                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' 
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              }`}
                            >
                              {event.isSpecial && <span className="text-orange-600">⭐</span>}
                              <span>{event.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} {t('others')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {events && events.length > 0 ? (
                    events.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                            event.isSpecial 
                              ? 'bg-orange-100 dark:bg-orange-900/30' 
                              : 'bg-green-100 dark:bg-green-900/30'
                          }`}>
                            <span className={`text-xs font-medium ${
                              event.isSpecial ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
                            }`}>
                              {format(new Date(event.startDate), 'MMM', { locale: fr })}
                            </span>
                            <span className={`text-sm font-bold ${
                              event.isSpecial ? 'text-orange-700 dark:text-orange-300' : 'text-green-700 dark:text-green-300'
                            }`}>
                              {format(new Date(event.startDate), 'd')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                              <span>{event.title}</span>
                              {event.isSpecial && <span className="text-orange-600 dark:text-orange-400">⭐</span>}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {format(new Date(event.startDate), 'HH:mm')} - {event.location}
                            </p>
                            {event.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadICS(event);
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEventClick(event)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteEvent(event)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEventClick(event)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun événement ce mois-ci</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Dialog pour éditer un événement */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'Événement</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              event={selectedEvent}
              onSuccess={handleEventUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Event Analytics Dialog */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Event Analytics
            </DialogTitle>
          </DialogHeader>
          {selectedEventAnalytics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Interested
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">{selectedEventAnalytics.interested.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedEventAnalytics.interested.unique} unique
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      Attending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold">{selectedEventAnalytics.attending.total}</div>
                    <p className="text-xs text-muted-foreground">
                      {selectedEventAnalytics.attending.unique} unique
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Download className="h-4 w-4 text-blue-500" />
                    .ics Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{selectedEventAnalytics.downloads.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {selectedEventAnalytics.downloads.unique} unique downloads
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer l'événement "{eventToDelete?.title}" ?
            </p>
            {eventToDelete?.isRecurring && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-700 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Événement récurrent
                </div>
                <p className="text-sm text-orange-600">
                  Cet événement fait partie d'une série récurrente. Sa suppression n'affectera que cette occurrence spécifique.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteEventMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteEvent}
                disabled={deleteEventMutation.isPending}
                className="flex items-center gap-2"
              >
                {deleteEventMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
