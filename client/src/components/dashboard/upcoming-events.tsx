import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

export default function UpcomingEvents() {
  const { t } = useTranslation();
  const { data: events } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  return (
    <Card className="shadow-material">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
{t('upcomingEventsTitle')}
          </CardTitle>
          <Link href="/calendar">
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t('viewCalendar')}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events && Array.isArray(events) && events.length > 0 ? (
            events.slice(0, 3).map((event: any) => {
              const eventDate = new Date(event.startDate);
              return (
                <div key={event.id} className="flex items-center space-x-4 p-3 hover:bg-muted transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {format(eventDate, 'MMM', { locale: fr }).toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {format(eventDate, 'd')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(eventDate, 'HH:mm')} - {event.location || t('locationTbd')}
                    </p>
                  </div>
                  <ChevronRight className="text-muted-foreground text-sm" size={16} />
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">{t('noUpcomingEvents')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
