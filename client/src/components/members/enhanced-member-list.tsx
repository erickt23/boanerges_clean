import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, QrCode, Edit, User, MoreVertical, Grid, List,
  ChevronLeft, ChevronRight, Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MemberForm from "@/components/members/member-form";

interface MemberListProps {
  members: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function EnhancedMemberList({ members = [], isLoading, onRefresh }: MemberListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Display preferences
  const [viewMode, setViewMode] = useState<'comfort' | 'simple'>('comfort');
  const [itemsPerPage, setItemsPerPage] = useState(viewMode === 'comfort' ? 10 : 25);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter members based on search
  const filteredMembers = members.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  // Update items per page when view mode changes
  const handleViewModeChange = (mode: 'comfort' | 'simple') => {
    setViewMode(mode);
    setItemsPerPage(mode === 'comfort' ? 10 : 25);
    setCurrentPage(1);
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingMember(null);
    onRefresh();
    toast({
      title: "Succès",
      description: "Membre mis à jour avec succès",
    });
  };

  // Generate avatar based on gender
  const getAvatarIcon = (gender: string) => {
    return <User className={`h-full w-full ${gender === 'F' ? 'text-pink-500' : 'text-blue-500'}`} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, prénom ou code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'comfort' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('comfort')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4 mr-1" />
              Confort
            </Button>
            <Button
              variant={viewMode === 'simple' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('simple')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4 mr-1" />
              Simple
            </Button>
          </div>

          {/* Items per page */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Par page:</span>
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Member List */}
      {viewMode === 'comfort' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {getAvatarIcon(member.gender)}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 font-mono">{member.memberCode}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Membre</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Statut</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {getAvatarIcon(member.gender)}
                          </div>
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm">{member.memberCode}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <Button size="sm" variant="outline">
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredMembers.length)} sur {filteredMembers.length} membres
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Membre</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <MemberForm
              member={editingMember}
              onSuccess={handleEditSuccess}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre trouvé</h3>
          <p className="text-gray-600">
            {searchTerm ? "Aucun membre ne correspond à votre recherche." : "Commencez par ajouter des membres à votre église."}
          </p>
        </div>
      )}
    </div>
  );
}