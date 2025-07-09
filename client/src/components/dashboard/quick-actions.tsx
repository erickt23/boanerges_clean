import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, QrCode, HandHeart, Calendar, RotateCcw } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function QuickActions() {
  const { t } = useTranslation();
  
  const quickActions = [
    {
      title: t('addMember'),
      icon: UserPlus,
      bgColor: "hover:border-primary hover:bg-primary/10",
      iconBgColor: "bg-primary/10 group-hover:bg-primary/20",
      iconColor: "text-primary",
      textColor: "group-hover:text-primary",
    },
    {
      title: t('scanQr'),
      icon: QrCode,
      bgColor: "hover:border-secondary hover:bg-secondary/10",
      iconBgColor: "bg-secondary/10 group-hover:bg-secondary/20",
      iconColor: "text-secondary",
      textColor: "group-hover:text-secondary",
    },
    {
      title: t('recordDonation'),
      icon: HandHeart,
      bgColor: "hover:border-accent hover:bg-accent/10",
      iconBgColor: "bg-accent/10 group-hover:bg-accent/20",
      iconColor: "text-accent",
      textColor: "group-hover:text-accent",
    },
    {
      title: t('createEvent'),
      icon: Calendar,
      bgColor: "hover:border-purple-500 hover:bg-purple-500/10",
      iconBgColor: "bg-purple-500/10 group-hover:bg-purple-500/20",
      iconColor: "text-purple-500",
      textColor: "group-hover:text-purple-500",
    },
  ];

  const handleQuickAction = (actionTitle: string) => {
    // In real implementation, these would open appropriate modals or navigate to forms
    console.log(`Quick action triggered: ${actionTitle}`);
  };

  return (
    <Card className="shadow-material">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg transition-colors group ${action.bgColor}`}
                onClick={() => handleQuickAction(action.title)}
              >
                <div className={`w-10 h-10 ${action.iconBgColor} rounded-full flex items-center justify-center mb-2`}>
                  <Icon className={action.iconColor} size={20} />
                </div>
                <span className={`text-sm font-medium text-foreground ${action.textColor}`}>
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Member QR Code Section */}
        <div className="p-4 bg-dashboard-light-blue rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-2">{t('qrCodeOfDay')}</h3>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-background border-2 border-border rounded-lg flex items-center justify-center">
              <QrCode className="text-2xl text-muted-foreground" size={32} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t('qrCodeForSundayService')}</p>
              <p className="text-xs text-muted-foreground">{t('expiresAt')} 14:00</p>
              <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80 p-0 h-auto mt-1">
                <RotateCcw size={12} className="mr-1" />
                {t('regenerate')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
