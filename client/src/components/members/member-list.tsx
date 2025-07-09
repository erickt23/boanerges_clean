import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import MemberForm from "./member-form";
import { Search, Edit, Eye, QrCode, Users, UserX } from "lucide-react";
import { type Member } from "@shared/schema";
import MemberQRCode from "./member-qr-code";

interface MemberListProps {
  members?: Member[];
  isLoading: boolean;
}

export default function MemberList({ members, isLoading }: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const filteredMembers = members?.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleView = (member: Member) => {
    setSelectedMember(member);
    setIsViewDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedMember(null);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste des Membres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Liste des Membres ({filteredMembers.length})</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? "Aucun membre trouvé pour cette recherche" : "Aucun membre enregistré"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead>
                    <TableHead>Code Membre</TableHead>
                    <TableHead>Date de Naissance</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary-100 text-primary-700">
                              {getInitials(member.firstName, member.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.gender === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono">
                            {member.memberCode}
                          </Badge>
                          <Button size="sm" variant="ghost" className="p-1">
                            <QrCode size={16} className="text-gray-400" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(member.dateOfBirth)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {member.email && (
                            <div className="text-gray-900">{member.email}</div>
                          )}
                          {member.phone && (
                            <div className="text-gray-500">{member.phone}</div>
                          )}
                          {!member.email && !member.phone && (
                            <span className="text-gray-400">Non renseigné</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? "default" : "secondary"}>
                          {member.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(member)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le Membre</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <MemberForm
              member={selectedMember}
              isEditing={true}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du Membre</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* Member Header */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xl">
                    {getInitials(selectedMember.firstName, selectedMember.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-gray-600">Code: {selectedMember.memberCode}</p>
                  <Badge variant={selectedMember.isActive ? "default" : "secondary"}>
                    {selectedMember.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date de Naissance</Label>
                  <p className="text-gray-900">{formatDate(selectedMember.dateOfBirth)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Sexe</Label>
                  <p className="text-gray-900">{selectedMember.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Téléphone</Label>
                  <p className="text-gray-900">{selectedMember.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-gray-900">{selectedMember.email || 'Non renseigné'}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Adresse</Label>
                <div className="text-gray-900 mt-1">
                  {(() => {
                    const addressParts = [];
                    if (selectedMember.apartment) addressParts.push(selectedMember.apartment);
                    if (selectedMember.buildingNumber) addressParts.push(selectedMember.buildingNumber);
                    if (selectedMember.street) addressParts.push(selectedMember.street);
                    
                    const streetAddress = addressParts.join(' ');
                    const cityPostal = [selectedMember.city, selectedMember.postalCode].filter(Boolean).join(', ');
                    
                    return (
                      <>
                        <p>{streetAddress || 'Adresse non renseignée'}</p>
                        <p>{cityPostal || 'Ville et code postal non renseignés'}</p>
                        <p>{selectedMember.country || 'Pays non renseigné'}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* QR Code Section */}
              {showQRCode && (
                <div className="border-t pt-4">
                  <div className="flex justify-center">
                    <MemberQRCode member={selectedMember} />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center space-x-2"
                >
                  <QrCode className="h-4 w-4" />
                  <span>{showQRCode ? "Masquer QR Code" : "Afficher QR Code"}</span>
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  setShowQRCode(false);
                }}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
