import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";

interface RecentAttendanceProps {
  memberOnly?: boolean;
}

export default function RecentAttendance({ memberOnly = false }: RecentAttendanceProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Fetch all events to find the latest one with attendance
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  // Fetch attendance stats to get events with attendance
  const { data: attendanceStats } = useQuery({
    queryKey: ["/api/attendance/stats"],
  });

  // Find the latest event with attendance data
  const eventWithAttendance = React.useMemo(() => {
    if (!events || !Array.isArray(events)) return null;
    
    // Sort events by date (most recent first)
    const sortedEvents = [...events].sort((a: any, b: any) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    // Return the most recent event (current or past)
    return sortedEvents[0] || null;
  }, [events]);

  // Fetch attendance for the latest event with attendance
  const { data: attendance } = useQuery({
    queryKey: ["/api/attendance/event", eventWithAttendance?.id],
    enabled: !!eventWithAttendance?.id,
    queryFn: async () => {
      const response = await fetch(`/api/attendance/event/${eventWithAttendance.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
  });

  if (!eventWithAttendance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{t('recentAttendance')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">{t('noEventsWithAttendance')}</p>
        </CardContent>
      </Card>
    );
  }

  const attendanceList = Array.isArray(attendance) ? attendance : [];
  
  // Filter attendance for member-only view (for members, username is their memberCode)
  const filteredAttendance = memberOnly && user?.role === 'member' 
    ? attendanceList.filter(att => 
        att.memberId && att.memberCode === user.username
      )
    : attendanceList;
  
  const membersPresent = filteredAttendance.filter(att => att.memberId);
  const visitorsPresent = filteredAttendance.filter(att => !att.memberId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>{t('recentEventAttendance')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations de l'événement */}
        <div className="bg-blue-50 dark:bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center space-x-2">
                <span>{eventWithAttendance.title}</span>
                {eventWithAttendance.isSpecial && <span className="text-orange-600">⭐</span>}
              </h4>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(eventWithAttendance.startDate), 'dd MMM yyyy', { locale: fr })}</span>
              </p>
              <p className="text-sm text-muted-foreground flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(eventWithAttendance.startDate), 'HH:mm', { locale: fr })}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{attendanceList.length}</div>
              <div className="text-xs text-muted-foreground">{t('total')}</div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-green-50 dark:bg-muted/50 rounded">
            <div className="font-semibold text-foreground">{membersPresent.length}</div>
            <div className="text-xs textforeground">{t('members')}</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-muted/50 rounded">
            <div className="font-semibold text-foreground">{visitorsPresent.length}</div>
            <div className="text-xs text-foreground">{t('visitors')}</div>
          </div>
        </div>

        {/* Liste des présences récentes */}
        {attendanceList.length > 0 ? (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">{t('lastArrivals')}</h5>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {attendanceList
                .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
                .slice(0, 6)
                .map((att) => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-card border border-border rounded text-sm">
                    <div>
                      {att.memberId ? (
                        <div>
                          <span className="font-medium">{att.member?.firstName} {att.member?.lastName}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {att.member?.memberCode}
                          </Badge>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium">{att.visitorFirstName} {att.visitorLastName}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t('visitor')}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(att.recordedAt), 'HH:mm', { locale: fr })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">{t('noAttendanceRecorded')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}