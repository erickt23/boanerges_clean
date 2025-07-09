import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";

export default function PersonalDonations() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Get the member data to find memberId (for members, username is their memberCode)
  const { data: members } = useQuery({
    queryKey: ["/api/members"],
    enabled: !!user?.username && user?.role === 'member',
  });

  // Find the current member using username as memberCode
  const currentMember = Array.isArray(members) 
    ? members.find((member: any) => member.memberCode === user?.username)
    : null;

  // Fetch member's personal donations
  const { data: donations, isLoading } = useQuery({
    queryKey: ["/api/donations/member", currentMember?.id],
    enabled: !!currentMember?.id,
    queryFn: async () => {
      const response = await fetch(`/api/donations/member/${currentMember.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch donations");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{t('myDonations')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>{t('myDonations')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">{t('memberNotFound')}</p>
        </CardContent>
      </Card>
    );
  }

  const donationsList = Array.isArray(donations) ? donations : [];
  const totalDonations = donationsList.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>{t('myDonations')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total donations */}
        <div className="bg-primary/10 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ${totalDonations.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('totalDonations')}
            </div>
          </div>
        </div>

        {/* Recent donations */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">{t('recentDonations')}</h4>
          {donationsList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">{t('noDonationsYet')}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {donationsList.slice(0, 5).map((donation: any) => (
                <div key={donation.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="font-medium text-sm">
                        ${donation.amount}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(donation.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    donation.donationType === 'tithe' ? 'default' :
                    donation.donationType === 'offering' ? 'secondary' : 'outline'
                  }>
                    {donation.donationType === 'tithe' ? t('tithe') :
                     donation.donationType === 'offering' ? t('offering') : t('general')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}