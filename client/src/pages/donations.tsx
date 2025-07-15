import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/lib/i18n";
import { useRoleProtection } from "@/hooks/use-role-protection";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import DonationForm from "@/components/donations/donation-form";
import DonationReports from "@/components/donations/donation-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  HandHeart,
  TrendingUp,
  DollarSign,
  FileText,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Donations() {
  const { t } = useTranslation();
  const { isRoleAllowed } = useRoleProtection();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if user has permission to access donations
  if (!isRoleAllowed(["super_admin", "admin"])) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header title={t("donations")} />
          <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <HandHeart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t('donationsAccessRestrictedTitle')}
                </h2>
                <p className="text-muted-foreground">
                  {t('donationsAccessRestrictedMessage')}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Calculer les dates du mois courant
  const currentDate = new Date();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  // Fetch donation stats for the current month
  const { data: donationStats } = useQuery({
    queryKey: [
      "/api/donations/stats",
      firstDay.toISOString(),
      lastDay.toISOString(),
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: firstDay.toISOString().split("T")[0],
        endDate: lastDay.toISOString().split("T")[0],
      });
      const response = await fetch(`/api/donations/stats?${params}`);
      if (!response.ok) throw new Error("Failed to fetch donation stats");
      return response.json();
    },
  });

  // Fetch recent donations
  const { data: recentDonations } = useQuery({
    queryKey: ["/api/donations/recent"],
  });

  // Function to handle donation recording success
  const handleDonationRecorded = () => {
    setIsDialogOpen(false);
  };

  // Component to display recent donations
  const RecentDonationsList = () => {
    if (
      !recentDonations ||
      !Array.isArray(recentDonations) ||
      recentDonations.length === 0
    ) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-sm">{t("noRecentDonations")}</p>
        </div>
      );
    }

    // Sort donations by date in descending order
    return (
      <div className="space-y-3">
        {recentDonations.slice(0, 5).map((donation: any) => (
          <div
            key={donation.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    donation.donationType === "tithe"
                      ? "default"
                      : donation.donationType === "offering"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {donation.donationType === "tithe"
                    ? t("tithes")
                    : donation.donationType === "offering"
                      ? t("offerings")
                      : t("generalDonation")}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {donation.isAnonymous
                    ? t("anonymous")
                    : `${donation.memberFirstName} ${donation.memberLastName}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(new Date(donation.donationDate), "dd MMMM yyyy", {
                  locale: fr,
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                ${parseFloat(donation.amount).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render the main donations page
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          title={t("donationManagement")}
          action={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <HandHeart className="h-4 w-4" />
                  <span>{t("recordDonation")}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("recordDonationTitle")}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh]">
                  <DonationForm onSuccess={handleDonationRecorded} />
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Donation Stats */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-blue-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("totalThisMonth")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {donationStats?.total
                    ? parseFloat(donationStats.total).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>

            {/* Tithes */}
            <Card className="bg-green-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("tithes")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {donationStats?.byType?.find(
                    (t: any) => t.donationType === "tithe",
                  )?.total
                    ? parseFloat(
                        donationStats.byType.find(
                          (t: any) => t.donationType === "tithe",
                        ).total,
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>

            {/* Offerings */}
            <Card className="bg-yellow-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("offerings")}
                </CardTitle>
                <HandHeart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {donationStats?.byType?.find(
                    (t: any) => t.donationType === "offering",
                  )?.total
                    ? parseFloat(
                        donationStats.byType.find(
                          (t: any) => t.donationType === "offering",
                        ).total,
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>
            
            {/* General Donations */}
            <Card className="bg-purple-50 dark:bg-card shadow-material hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("generalDonations")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {donationStats?.byType?.find(
                    (t: any) => t.donationType === "general",
                  )?.total
                    ? parseFloat(
                        donationStats.byType.find(
                          (t: any) => t.donationType === "general",
                        ).total,
                      ).toFixed(2)
                    : "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Donation Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("donationType")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">{t("tithes")}</h3>
                      <p className="text-sm text-gray-600">{t('tithesDescription')}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    {t("record")}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <HandHeart className="h-8 w-8 text-secondary-600" />
                    <div>
                      <h3 className="font-medium">{t("offerings")}</h3>
                      <p className="text-sm text-gray-600">{t('offeringsDescription')}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    {t("record")}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-8 w-8 text-accent-600" />
                    <div>
                      <h3 className="font-medium">{t("generalDonation")}</h3>
                      <p className="text-sm text-gray-600">
                        {t("specialProjects")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    {t("record")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Donation Reports */}
            <DonationReports />

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle>{t("recentDonations")}</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentDonationsList />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
