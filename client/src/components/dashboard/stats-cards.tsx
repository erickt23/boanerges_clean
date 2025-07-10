import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, HandHeart, Calendar, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

interface StatsCardsProps {
  stats?: any;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { t } = useTranslation();
  
  // Helper function to format percentage change
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  // Helper function to get change description
  const getChangeText = (change: number, type: string) => {
    if (type === 'members') {
      return `${stats?.monthlyAttendanceChange ? formatChange(stats.monthlyAttendanceChange) : '0%'} ${stats?.currentMonthName || t('thisMonth')}`;
    }
    if (type === 'attendance') {
      return `${change ? formatChange(change) : '0%'} ${t('vsPreviousSunday')}`;
    }
    if (type === 'donations') {
      return `${change ? formatChange(change) : '0%'} ${t('vsPreviousMonth')}`;
    }
    if (type === 'events') {
      return `${stats?.currentMonthName || 'Ce mois'}`;
    }
    return '';
  };
  
  const cards = [
    {
      title: t('totalMembers'),
      value: stats?.totalMembers || 0,
      change: getChangeText(stats?.monthlyAttendanceChange, 'members'),
      icon: Users,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      link: "/members",
    },
    {
      title: t('sundayAttendance'),
      value: stats?.sundayAttendance || 0,
      change: getChangeText(stats?.attendanceChange, 'attendance'),
      icon: UserCheck,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
      link: "/attendance",
    },
    {
      title: t('monthlyDonations'),
      value: `${(stats?.monthlyDonations || 0).toFixed(2)}`,
      change: getChangeText(stats?.donationChange, 'donations'),
      icon: HandHeart,
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500",
      link: "/donations",
    },
    {
      title: t('upcomingEvents'),
      value: stats?.upcomingEvents || 0,
      change: getChangeText(0, 'events'),
      icon: Calendar,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      link: "/calendar",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Link key={index} href={card.link}>
            <Card className={`${index === 0 ? 'bg-blue-50 dark:bg-card' : index === 1 ? 'bg-green-50 dark:bg-card' : index === 2 ? 'bg-yellow-50 dark:bg-card' : 'bg-purple-50 dark:bg-card'} shadow-material hover:shadow-lg transition-shadow cursor-pointer`}>
              <CardContent className="pt-6 h-[120px] lg:h-[120px]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{card.value}</p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="truncate">{card.change}</span>
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`${card.iconColor} text-xl`} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
