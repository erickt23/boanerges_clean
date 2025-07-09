import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Globe, Moon, Sun, Settings, LogOut, User } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMember } from "@/hooks/use-member";
import { useTranslation } from "@/lib/i18n";
import type { Member } from "@/../../shared/schema";

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function Header({ title, action }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { t, language, changeLanguage } = useTranslation();
  const { data: member } = useMember();
  
  // Type the member data properly
  const typedMember = member as Member | undefined;
  
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    // Check if dark mode is stored in localStorage
    const storedTheme = localStorage.getItem('theme');
    const isDarkMode = storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleGoToPublicSite = () => {
    // Open landing page in new incognito-like window to bypass auth redirect
    const newWindow = window.open('/', '_blank');
    // Alternative: use a dedicated public route
    if (newWindow) {
      newWindow.location.href = '/landing?public=true';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex-1 min-w-0 pr-4 pl-12 lg:pl-0">
          <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 capitalize truncate">{currentDate}</p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Landing Page Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:flex"
                  onClick={handleGoToPublicSite}
                >
                  <Globe size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('publicSite')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Language Selector */}
          <div className="hidden md:block">
            <Select value={language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-18 justify-center">
                <span>{language === 'fr' ? '🇫🇷' : '🇺🇸'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDark ? t('lightMode') : t('darkMode')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Action Button */}
          {action}
          
          {/* User Information - Always Last Item */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                  {user.role === 'member' && typedMember ? typedMember.firstName : user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex-col items-start">
                  <div className="font-medium">
                    {user.role === 'member' && typedMember 
                      ? `${typedMember.firstName} ${typedMember.lastName}` 
                      : user.username
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.role === 'member' && typedMember 
                      ? typedMember.memberCode 
                      : user.role?.replace('_', ' ')
                    }
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
