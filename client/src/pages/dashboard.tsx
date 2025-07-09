import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import AttendanceChart from "@/components/dashboard/attendance-chart";
import DonationsChart from "@/components/dashboard/donations-chart";
import RecentAttendance from "@/components/dashboard/recent-attendance";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import PersonalDonations from "@/components/dashboard/personal-donations";
import PersonalAttendance from "@/components/dashboard/personal-attendance";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { useAuth } from "@/hooks/use-auth";

import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isRoleAllowed } = useRoleProtection();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Check if user is a member (lowest privilege level)
  const isMember = user?.role === 'member';
  const isAdminOrHigher = isRoleAllowed(['super_admin', 'admin']);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={t('dashboard')} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-4 lg:p-8">
          {/* Stats Cards - Only for admin and above */}
          {isAdminOrHigher && <StatsCards stats={stats} isLoading={isLoading} />}
          
          {/* Charts - Only for admin and above */}
          {isAdminOrHigher && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <AttendanceChart />
              </div>
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <DonationsChart />
              </div>
            </div>
          )}

          {/* Data Display - Different for members vs admins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              {isMember ? (
                <PersonalAttendance />
              ) : (
                <RecentAttendance memberOnly={false} />
              )}
            </div>
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <UpcomingEvents />
            </div>
          </div>

          {/* Personal Donations for Members */}
          {isMember && (
            <div className="grid grid-cols-1 gap-8 mt-8">
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <PersonalDonations />
              </div>
            </div>
          )}


        </main>
      </div>
    </div>
  );
}
