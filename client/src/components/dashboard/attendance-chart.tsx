import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AttendanceChart() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30days");

  const { data: attendanceData } = useQuery({
    queryKey: ["/api/attendance/stats", period],
    queryFn: async () => {
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case "7days":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "3months":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }
      
      const response = await fetch(`/api/attendance/stats?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch attendance data");
      return response.json();
    },
  });

  return (
    <Card className="shadow-material">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {t('attendanceByGender')}
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">{t('last7Days')}</SelectItem>
              <SelectItem value="30days">{t('last30Days')}</SelectItem>
              <SelectItem value="3months">{t('last3Months')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {attendanceData?.dailyData && attendanceData.dailyData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'present' ? t('present') : t('totalMembers')]} 
                  labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString('fr-FR')}`}
                />
                <Legend />
                <Bar dataKey="present" fill="#3b82f6" name={t('present')} />
                <Bar dataKey="total" fill="#e5e7eb" name={t('totalMembers')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <BarChart3 className="text-muted-foreground text-3xl mb-2 mx-auto" size={48} />
              <p className="text-muted-foreground text-sm">{t('noAttendanceData')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('dataWillAppear')}</p>
            </div>
          </div>
        )}

        {/* Résumé des statistiques */}
        {attendanceData && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 dark:bg-muted/50 rounded-lg">
              <div className="text-sm font-medium text-foreground">{t('totalAttendance')}</div>
              <div className="text-lg font-bold text-foreground">
                {attendanceData.total || 0}
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-muted/50 rounded-lg">
              <div className="text-sm font-medium text-foreground">{t('events')}</div>
              <div className="text-lg font-bold text-foreground">
                {attendanceData.dailyData?.length || 0}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 dark:bg-muted/50 rounded-full"></div>
            <span className="text-sm text-muted-foreground">{t('men')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 dark:bg-muted/50 rounded-full"></div>
            <span className="text-sm text-muted-foreground">{t('women')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 dark:bg-muted/50 rounded-full"></div>
            <span className="text-sm text-muted-foreground">{t('total')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}