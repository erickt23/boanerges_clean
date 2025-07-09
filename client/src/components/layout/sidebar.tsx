import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMember } from "@/hooks/use-member";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Church, BarChart3, Users, UserCheck, HandHeart, 
  Calendar, LayersIcon, Images, DoorOpen, Settings, LogOut, Menu, X, ChevronDown, MessageSquare
} from "lucide-react";

import { TranslationKey } from "@/lib/i18n";

const getNavigationItems = (t: (key: TranslationKey) => string, userRole?: string) => {
  const allItems = [
    { path: "/dashboard", label: t("dashboard"), icon: BarChart3, roles: ["super_admin", "admin", "user", "member"] },
    { path: "/members", label: t("members"), icon: Users, roles: ["super_admin", "admin", "user"] },
    { path: "/attendance", label: t("attendance"), icon: UserCheck, roles: ["super_admin", "admin", "user"] },
    { path: "/donations", label: t("donations"), icon: HandHeart, roles: ["super_admin", "admin"] },
    { path: "/calendar", label: t("calendar"), icon: Calendar, roles: ["super_admin", "admin", "user", "member"] },
    { path: "/forum", label: t("forum"), icon: MessageSquare, roles: ["super_admin", "admin", "user", "member"] },
    { path: "/about", label: t("about"), icon: Church, roles: ["super_admin", "admin", "user", "member"] },
    { path: "/gallery", label: t("gallery"), icon: Images, roles: ["super_admin", "admin", "user", "member"] },
  ];

  // Filter items based on user role
  if (!userRole) return allItems;
  
  return allItems.filter(item => item.roles.includes(userRole));
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { data: member } = useMember();
  
  // Cast member data to ensure proper typing
  const typedMember = member as import("@shared/schema").Member | undefined;
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navigationItems = getNavigationItems(t, user?.role);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const SidebarContent = ({ navigationItems }: { navigationItems: ReturnType<typeof getNavigationItems> }) => (
    <>
      {/* Logo Section */}
      <div className={`${isCollapsed ? 'px-2' : 'px-6'} py-6 border-b border-sidebar-border bg-sidebar-background transition-all duration-300`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border">
              <img 
                src="/logo.jpg" 
                alt="Logo Mission Évangélique Boanergès" 
                className="h-8 w-8 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-bold text-sidebar-foreground">Mission Évangélique Boanergès</p>
                {/* <p className="text-sm text-sidebar-foreground/70">Boanergès</p> */}
              </div>
            )}
          </div>
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-lg hover:bg-sidebar-accent transition-colors ${isCollapsed ? 'w-full flex justify-center' : ''}`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 rotate-90" />
            ) : (
              <ChevronDown className="w-4 h-4 -rotate-90" />
            )}
          </button>
        </div>
      </div>



      {/* Navigation Menu */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-6 space-y-2 bg-sidebar-background overflow-y-auto transition-all duration-300`}>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          // Couleurs différentes pour chaque lien
          const colors = [
            { bg: "bg-blue-500", text: "text-blue-600", hover: "hover:bg-blue-50" },
            { bg: "bg-green-500", text: "text-green-600", hover: "hover:bg-green-50" },
            { bg: "bg-purple-500", text: "text-purple-600", hover: "hover:bg-purple-50" },
            { bg: "bg-orange-500", text: "text-orange-600", hover: "hover:bg-orange-50" },
            { bg: "bg-pink-500", text: "text-pink-600", hover: "hover:bg-pink-50" },
            { bg: "bg-indigo-500", text: "text-indigo-600", hover: "hover:bg-indigo-50" },
            { bg: "bg-red-500", text: "text-red-600", hover: "hover:bg-red-50" },
            { bg: "bg-teal-500", text: "text-teal-600", hover: "hover:bg-teal-50" },
            { bg: "bg-cyan-500", text: "text-cyan-600", hover: "hover:bg-cyan-50" },
          ];
          
          const color = colors[index % colors.length];
          
          return (
            <Link key={item.path} href={item.path}>
              {isCollapsed ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`group flex items-center justify-center px-2 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
                          isActive
                            ? `${color.bg} text-white shadow-lg`
                            : `text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent`
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon
                          className={`transition-colors ${
                            isActive ? "text-white" : color.text
                          }`}
                          size={20}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
                    isActive
                      ? `${color.bg} text-white shadow-lg`
                      : `text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent`
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon
                    className={`mr-4 transition-colors ${
                      isActive ? "text-white" : color.text
                    }`}
                    size={20}
                  />
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className={`flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} bg-sidebar-background border-r border-sidebar-border shadow-sm transition-all duration-300`}>
          <SidebarContent navigationItems={navigationItems} />
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background dark:bg-card shadow-md"
        >
          {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-sidebar-background backdrop-blur-sm shadow-xl">
            <SidebarContent navigationItems={navigationItems} />
          </div>
        </div>
      )}
    </>
  );
}
