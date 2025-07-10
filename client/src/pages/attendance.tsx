import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AttendanceForm from "@/components/attendance/attendance-form";
import AttendanceRegistration from "@/components/attendance/attendance-registration";
import AttendanceReport from "@/components/attendance/attendance-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, QrCode, Users, FileText, BarChart3 } from "lucide-react";

export default function Attendance() {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: events } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ["/api/attendance/stats"],
  });

  const handleAttendanceRecorded = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={t('attendanceTitle')} 
          action={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>{t('recordAttendanceTitle')}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{t('recordAttendanceTitle')}</DialogTitle>
                </DialogHeader>
                <AttendanceRegistration onSuccess={handleAttendanceRecorded} />
              </DialogContent>
            </Dialog>
          }
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>{t('statistics')}</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{t('reports')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-green-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('totalAttendance')}</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6 h-[120px] lg:h-[120px]">
                <div className="text-2xl sm:text-3xl font-bold">
                  {attendanceStats && typeof attendanceStats === 'object' && 'total' in attendanceStats ? (attendanceStats as any).total : 0}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {t('recentPeriod')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('men')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6 h-[120px] lg:h-[120px]">
                <div className="text-2xl sm:text-3xl font-bold">
                  {(attendanceStats as any)?.byGender?.find((g: any) => g.gender === 'M')?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-pink-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('women')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-6 h-[120px] lg:h-[120px]">
                <div className="text-2xl sm:text-3xl font-bold">
                  {(attendanceStats as any)?.byGender?.find((g: any) => g.gender === 'F')?.count || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('recordingMethods')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">{t('manualEntry')}</h3>
                      <p className="text-sm text-muted-foreground">{t('byMemberNumber')}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                    {t('use')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <QrCode className="h-8 w-8 text-secondary-600" />
                    <div>
                      <h3 className="font-medium">{t('scanQrCode')}</h3>
                      <p className="text-sm text-gray-600">{t('scanMemberCode')}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    {t('scan')}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Users className="h-8 w-8 text-accent-600" />
                    <div>
                      <h3 className="font-medium">{t('visitors')}</h3>
                      <p className="text-sm text-gray-600">{t('guestRegistration')}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    {t('addGuest')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('upcomingEventsTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                {events && Array.isArray(events) && events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          {t('select')}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">{t('noUpcomingEvents')}</p>
                )}
              </CardContent>
            </Card>
          </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <AttendanceReport />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
