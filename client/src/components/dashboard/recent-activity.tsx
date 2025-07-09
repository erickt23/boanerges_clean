import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, HandHeart, Calendar as CalendarIcon, UserCheck } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    {
      type: "member_added",
      title: t('newMemberAdded'),
      description: "Marie Dubois (MEB150301)",
      time: `Il y a 2 ${t('hoursAgo')}`,
      icon: UserPlus,
      bgColor: "bg-secondary-100",
      iconColor: "text-secondary-600",
    },
    {
      type: "donation",
      title: t('donationReceived'),
      description: "€150.00 - Offrande",
      time: `Il y a 3 ${t('hoursAgo')}`,
      icon: HandHeart,
      bgColor: "bg-accent-100",
      iconColor: "text-accent-600",
    },
    {
      type: "event_created",
      title: t('eventCreated'),
      description: "Retraite Spirituelle - 25 Jan",
      time: `Il y a 5 ${t('hoursAgo')}`,
      icon: CalendarIcon,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      type: "attendance",
      title: t('attendanceRecorded'),
      description: "Service du dimanche - 245 présents",
      time: `Il y a 1 ${t('dayAgo')}`,
      icon: UserCheck,
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
  ];

  return (
    <Card className="shadow-material">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          {t('recentActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`${activity.iconColor} text-sm`} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-primary-600 hover:text-primary-700">
          {t('viewAllActivity')}
        </Button>
      </CardContent>
    </Card>
  );
}
