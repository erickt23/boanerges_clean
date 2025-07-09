import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMember } from "@/hooks/use-member";
import { useTranslation } from "@/lib/i18n";
import { useRoleProtection } from "@/hooks/use-role-protection";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Camera,
  Mail,
  Phone,
  Calendar,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

interface PreferencesFormData {
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  eventReminders: boolean;
}

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: member } = useMember();
  
  // Cast member data to ensure proper typing
  const typedMember = member as import("@shared/schema").Member | undefined;
  const { isRoleAllowed } = useRoleProtection();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user has access to settings
  const hasSettingsAccess = isRoleAllowed(['super_admin', 'admin', 'member']);

  // Password change form
  const passwordForm = useForm<PasswordFormData>();
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      firstName: typedMember?.firstName || '',
      lastName: typedMember?.lastName || '',
      email: typedMember?.email || '',
      phone: typedMember?.phone || '',
      dateOfBirth: typedMember?.dateOfBirth || '',
    }
  });

  // Password change mutation
  const passwordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('passwordChangedSuccessfully'),
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Profile update mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!typedMember?.id) throw new Error('Member not found');
      const response = await fetch(`/api/members/${typedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('profileUpdatedSuccessfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/members/code'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handlePasswordSubmit = (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: t('error'),
        description: t('passwordsDoNotMatch'),
        variant: 'destructive',
      });
      return;
    }
    if (data.newPassword.length < 6) {
      toast({
        title: t('error'),
        description: t('passwordTooShort'),
        variant: 'destructive',
      });
      return;
    }
    passwordMutation.mutate(data);
  };

  const handleProfileSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  if (!hasSettingsAccess) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header title={t('settings')} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('accessDenied')}</h3>
                  <p className="text-muted-foreground">{t('noAccessToSettings')}</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={t('settings')} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* User Info Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="" alt={typedMember?.firstName} />
                    <AvatarFallback className="text-lg">
                      {typedMember?.firstName?.[0]}{typedMember?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {typedMember?.firstName} {typedMember?.lastName}
                    </h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary">{typedMember?.memberCode}</Badge>
                      <Badge variant="outline" className="capitalize">{user?.role?.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    {t('changePhoto')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{t('profileInformation')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('firstName')}</Label>
                      <Input
                        id="firstName"
                        {...profileForm.register('firstName', { required: true })}
                        disabled={profileMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('lastName')}</Label>
                      <Input
                        id="lastName"
                        {...profileForm.register('lastName', { required: true })}
                        disabled={profileMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('email')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          {...profileForm.register('email')}
                          disabled={profileMutation.isPending}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('phone')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          {...profileForm.register('phone')}
                          disabled={profileMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="pl-10"
                        {...profileForm.register('dateOfBirth')}
                        disabled={profileMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={profileMutation.isPending}
                      className="min-w-32"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {profileMutation.isPending ? t('saving') : t('saveChanges')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>{t('changePassword')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        {...passwordForm.register('currentPassword', { required: true })}
                        disabled={passwordMutation.isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t('newPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          {...passwordForm.register('newPassword', { required: true, minLength: 6 })}
                          disabled={passwordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...passwordForm.register('confirmPassword', { required: true })}
                          disabled={passwordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {t('passwordRequirements')}
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={passwordMutation.isPending}
                      className="min-w-32"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {passwordMutation.isPending ? t('updating') : t('updatePassword')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>{t('preferences')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('language')}</Label>
                      <div className="text-sm text-muted-foreground">
                        {t('chooseLanguagePreference')}
                      </div>
                    </div>
                    <Select defaultValue="fr">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">
                          <div className="flex items-center space-x-2">
                            <span>🇫🇷</span>
                            <span>Français</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="en">
                          <div className="flex items-center space-x-2">
                            <span>🇺🇸</span>
                            <span>English</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('emailNotifications')}</Label>
                      <div className="text-sm text-muted-foreground">
                        {t('receiveEmailNotifications')}
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('eventReminders')}</Label>
                      <div className="text-sm text-muted-foreground">
                        {t('receiveEventReminders')}
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">{t('smsNotifications')}</Label>
                      <div className="text-sm text-muted-foreground">
                        {t('receiveSmsNotifications')}
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    {t('savePreferences')}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}