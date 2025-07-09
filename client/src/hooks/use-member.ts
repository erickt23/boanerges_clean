import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type { Member } from "@shared/schema";

export function useMember() {
  const { user } = useAuth();
  
  // For members, use their username as memberCode since that's how they log in
  const memberCode = user?.role === "member" ? user.username : null;
  
  return useQuery<Member>({
    queryKey: [`/api/members/code/${memberCode}`],
    enabled: !!user && !!memberCode && user.role === "member",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}