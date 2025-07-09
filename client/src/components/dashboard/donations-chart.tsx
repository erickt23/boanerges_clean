import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { DollarSign } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DonationsChart() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30days");

  const { data: donationData } = useQuery({
    queryKey: ["/api/donations/stats", period],
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
      
      const response = await fetch(`/api/donations/stats?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch donation data");
      return response.json();
    },
  });

  // Préparer les données pour le graphique circulaire (par type)
  const pieData = donationData?.byType ? donationData.byType.map((item: any) => ({
    name: item.donationType === 'tithe' ? t('tithe') : 
          item.donationType === 'offering' ? t('offering') : t('general'),
    value: parseFloat(item.total),
    donationType: item.donationType
  })) : [];

  return (
    <Card className="shadow-material">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {t('donationsByType')}
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
        {pieData && pieData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <div className="text-center">
              <DollarSign className="text-muted-foreground text-3xl mb-2 mx-auto" size={48} />
              <p className="text-muted-foreground text-sm">{t('noDonationData')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('dataWillAppear')}</p>
            </div>
          </div>
        )}

        {/* Résumé */}
        {donationData && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 dark:bg-muted/50 rounded-lg">
              <div className="text-sm font-medium textforeground">{t('total')}</div>
              <div className="text-lg font-bold textforeground">
                ${donationData.total ? parseFloat(donationData.total).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-muted/50 rounded-lg">
              <div className="text-sm font-medium textforeground">{t('average')}</div>
              <div className="text-lg font-bold textforeground">
                ${donationData.average ? parseFloat(donationData.average).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-muted/50 rounded-lg">
              <div className="text-sm font-medium textforeground">{t('numDonations')}</div>
              <div className="text-lg font-bold textforeground">
                {donationData.count || 0}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}