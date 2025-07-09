import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { useRoleProtection } from "@/hooks/use-role-protection";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AlphabeticalMemberList from "@/components/members/alphabetical-member-list";
import MemberForm from "@/components/members/member-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";
import type { Member } from "@shared/schema";

// Main component for managing members
// This component allows admins to view, add, edit, and delete members
// It uses React Query for data fetching and state management
// It also includes role-based access control to restrict certain actions to admins and super admins
export default function Members() {
  const { t } = useTranslation();
  const { isRoleAllowed } = useRoleProtection();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [limit] = useState(50);
  const [offset] = useState(0);
  const { toast } = useToast();

  // Fetch members with pagination
  // Using a limit of 50 and offset of 0 for initial load
  // You can adjust these values based on your needs
  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ["/api/members", { limit, offset }],
    queryFn: async () => {
      const response = await fetch(`/api/members?limit=${limit}&offset=${offset}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    },
  });

  // Mutation to toggle member status (active/inactive)
  const toggleMemberStatusMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const res = await apiRequest("PATCH", `/api/members/${memberId}/toggle-status`);
      return await res.json();
    },
    // On success, invalidate the members query to refresh the list
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({
        title: t('success'),
        description: t('memberStatusUpdated'),
      });
    },
    // On error, show a toast notification
    onError: () => {
      toast({
        title: t('error'),
        description: t('cannotUpdateMemberStatus'),
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a member
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const res = await apiRequest("DELETE", `/api/members/${memberId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
      toast({
        title: t('success'),
        description: t('memberDeletedSuccessfully'),
      });
    },
    onError: () => {
      toast({
        title: t('error'),
        description: t('cannotDeleteMember'),
        variant: "destructive",
      });
    },
  });

  // Function to handle member addition
  const handleMemberAdded = () => {
    setIsDialogOpen(false);
    refetch();
  };

  // Function to handle member edit
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  // Function to handle member update
  const handleMemberUpdated = () => {
    setIsEditDialogOpen(false);
    setEditingMember(null);
    refetch();
  };

  // Function to toggle member status
  const handleToggleMemberStatus = (member: Member) => {
    toggleMemberStatusMutation.mutate(member.id);
  };

  // Function to handle member deletion
  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
    setDeleteConfirmOpen(true);
  };

  // Function to confirm member deletion
  const confirmDeleteMember = () => {
    if (memberToDelete) {
      deleteMemberMutation.mutate(memberToDelete.id);
    }
  };

  // Check if user has permission to manage members
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={t('members')} 
          action={
            isRoleAllowed(['super_admin', 'admin']) ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4" />
                    <span>{t('addMemberTitle')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t('addMemberTitle')}</DialogTitle>
                  </DialogHeader>
                  <MemberForm onSuccess={handleMemberAdded} />
                </DialogContent>
              </Dialog>
            ) : undefined
          }
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">{t('activeMembers')}</TabsTrigger>
              <TabsTrigger value="inactive">{t('inactiveMembers')}</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">
              <AlphabeticalMemberList 
                members={members?.filter((member: any) => member.isActive) || []} 
                isLoading={isLoading}
                onRefresh={refetch}
                onEditMember={isRoleAllowed(['super_admin', 'admin']) ? handleEditMember : undefined}
                onToggleMemberStatus={isRoleAllowed(['super_admin', 'admin']) ? handleToggleMemberStatus : undefined}
                onDeleteMember={isRoleAllowed(['super_admin', 'admin']) ? handleDeleteMember : undefined}
                showOnlyActive={true}
              />
            </TabsContent>
            <TabsContent value="inactive" className="mt-4">
              <AlphabeticalMemberList 
                members={members?.filter((member: any) => !member.isActive) || []} 
                isLoading={isLoading}
                onRefresh={refetch}
                onEditMember={isRoleAllowed(['super_admin', 'admin']) ? handleEditMember : undefined}
                onToggleMemberStatus={isRoleAllowed(['super_admin', 'admin']) ? handleToggleMemberStatus : undefined}
                onDeleteMember={isRoleAllowed(['super_admin', 'admin']) ? handleDeleteMember : undefined}
                showOnlyActive={false}
              />
            </TabsContent>
          </Tabs>
          
          {/* Dialog de modification */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t('editMemberTitle')}</DialogTitle>
              </DialogHeader>
              {editingMember && (
                <MemberForm 
                  member={editingMember}
                  onSuccess={handleMemberUpdated} 
                />
              )}
            </DialogContent>
          </Dialog>

          {/* Dialog de confirmation de suppression */}
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('confirmPermanentDeletion')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('confirmDeleteMemberMessage')} "{memberToDelete?.firstName} {memberToDelete?.lastName}" ? 
                  {t('actionIsIrreversible')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDeleteMember}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {t('deletePermanently')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}
