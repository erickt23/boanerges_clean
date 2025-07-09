import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface RolePermissions {
  [key: string]: string[];
}

const rolePermissions: RolePermissions = {
  "/dashboard": ["super_admin", "admin", "user", "member"],
  "/members": ["super_admin", "admin", "user"],
  "/attendance": ["super_admin", "admin", "user"],
  "/donations": ["super_admin", "admin"],
  "/calendar": ["super_admin", "admin", "user", "member"],
  "/forum": ["super_admin", "admin", "user", "member"],
  "/about": ["super_admin", "admin", "user", "member"],
  "/gallery": ["super_admin", "admin", "user", "member"],
  "/resources": ["super_admin", "admin", "user"],
  "/settings": ["super_admin", "admin", "member"],
  "/users": ["super_admin", "admin"],
};

export function useRoleProtection() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user) return;

    const allowedRoles = rolePermissions[location];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to dashboard if user doesn't have permission
      setLocation("/dashboard");
    }
  }, [user, location, setLocation]);

  const hasPermission = (path: string): boolean => {
    if (!user) return false;
    const allowedRoles = rolePermissions[path];
    return !allowedRoles || allowedRoles.includes(user.role);
  };

  const isRoleAllowed = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (module: string, action?: string): boolean => {
    if (!user) return false;
    
    // For now, we use path-based permissions, but this can be extended for action-specific permissions
    const path = `/${module}`;
    const allowedRoles = rolePermissions[path];
    if (!allowedRoles) return false;
    
    const hasModuleAccess = allowedRoles.includes(user.role);
    
    // For specific actions, check additional permissions
    if (action === "delete" || action === "edit") {
      return hasModuleAccess && ["super_admin", "admin"].includes(user.role);
    }
    
    return hasModuleAccess;
  };

  return {
    hasPermission,
    isRoleAllowed,
    canAccess,
    userRole: user?.role,
  };
}