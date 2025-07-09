import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useMember } from "@/hooks/use-member";

export default function PersonalAttendance() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: member } = useMember();

  // Fetch member's attendance history - only past events
  const { data: memberAttendance, isLoading } = useQuery({
    queryKey: ["/api/attendance/member", member?.id],
    enabled: !!member?.id,
    queryFn: async () => {
      const response = await fetch(`/api/attendance/member/${member.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch member attendance");
      return response.json();
    },
  });

  // Filter to only show past events
  const pastAttendance = React.useMemo(() => {
    if (!memberAttendance || !Array.isArray(memberAttendance)) return [];
    
    const now = new Date();
    return memberAttendance.filter(attendance => {
      const eventDate = new Date(attendance.event?.startDate);
      return eventDate < now; // Only past events
    });
  }, [memberAttendance]);

  // Group attendance by month for better visualization
  const attendanceByMonth = React.useMemo(() => {
    const grouped = pastAttendance.reduce((acc: any, attendance: any) => {
      const eventDate = new Date(attendance.event?.startDate);
      const monthKey = format(eventDate, 'yyyy-MM');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(attendance);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a)) // Sort by month descending
      .slice(0, 6); // Show last 6 months
  }, [pastAttendance]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{t('myPastAttendance')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!member) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{t('myPastAttendance')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">{t('memberNotFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>{t('myPastAttendance')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Attendance Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('myTotalAttendance')}</h4>
              <p className="text-sm text-muted-foreground">{t('pastEventsAttended')}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{pastAttendance.length}</div>
              <div className="text-xs text-muted-foreground">{t('events')}</div>
            </div>
          </div>
        </div>

        {/* Monthly Attendance Breakdown */}
        {attendanceByMonth.length > 0 ? (
          <div className="space-y-3">
            <h5 className="font-medium text-sm">{t('recentMonths')}</h5>
            <div className="space-y-2">
              {attendanceByMonth.map(([monthKey, attendances]: [string, any[]]) => (
                <div key={monthKey} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(monthKey + '-01'), 'MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {attendances.length} {attendances.length === 1 ? t('event') : t('events')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {attendances.length}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm">{t('noPastAttendance')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('attendEventsToSeeHistory')}</p>
          </div>
        )}

        {/* Recent Events Attended */}
        {pastAttendance.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-sm">{t('recentEventsAttended')}</h5>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {pastAttendance
                .sort((a: any, b: any) => new Date(b.event?.startDate).getTime() - new Date(a.event?.startDate).getTime())
                .slice(0, 8)
                .map((attendance: any) => (
                  <div key={attendance.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{attendance.event?.title}</span>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(attendance.event?.startDate), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(attendance.recordedAt), 'HH:mm', { locale: fr })}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}