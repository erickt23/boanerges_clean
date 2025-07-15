import { useState } from "react";
import { useTranslation } from "@/lib/i18n";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  RefreshCw,
  Edit2,
  Eye,
  User,
  UserX,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
  QrCode,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Member } from "@shared/schema";
import MemberQRCode from "./member-qr-code";

interface AlphabeticalMemberListProps {
  members: Member[];
  isLoading: boolean;
  onRefresh?: () => void;
  onEditMember?: (member: Member) => void;
  onToggleMemberStatus?: (member: Member) => void;
  onDeleteMember?: (member: Member) => void;
  showOnlyActive?: boolean;
}

export default function AlphabeticalMemberList({ 
  members, 
  isLoading, 
  onRefresh,
  onEditMember,
  onToggleMemberStatus,
  onDeleteMember,
  showOnlyActive = true
}: AlphabeticalMemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  // Trier les membres reçus
  const sortedMembers = [...members].sort((a, b) => {
    const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
    const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Filtrage par recherche
  const filteredMembers = sortedMembers.filter(member =>
    `${member.lastName} ${member.firstName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.memberCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getAvatarColor = (gender: string) => {
    switch (gender) {
      case 'M':
        return 'bg-blue-100 text-blue-600';
      case 'F':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const openMemberDetails = (member: Member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
    setShowQRCode(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{t('memberList')} ({filteredMembers.length})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t('refresh')}</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche et contrôles */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchByNameOrCode')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{t('show')}</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">{t('perPage')}</span>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t('page')} {currentPage} {t('of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Liste des membres */}
          {paginatedMembers.length > 0 ? (
            <div className="space-y-3">
              {paginatedMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => openMemberDetails(member)}
                  className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors hover:shadow-md hover:scale-[1.01] ${member.gender === 'M' ? 'bg-blue-50 dark:bg-muted/50' : member.gender === 'F' ? 'bg-pink-50 dark:bg-muted/50' : 'bg-gray-50 dark:bg-muted/50'}`}
                >
                  <Avatar className={`h-12 w-12 ${getAvatarColor(member.gender)}`}>
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {member.lastName}, {member.firstName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Code: {member.memberCode}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className={member.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                      {member.isActive ? t('active') : t('inactive')}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMember?.(member);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMemberStatus?.(member);
                      }}
                      title={member.isActive ? t('deactivateMember') : t('reactivateMember')}
                    >
                      {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    {!member.isActive && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMember?.(member);
                        }}
                        title={t('permanentlyDeleteMember')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? t('noMemberFoundSearch') : showOnlyActive ? t('noActiveMemberFound') : t('noInactiveMemberFound')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails du membre */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{t('memberDetails')}</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {/* Informations personnelles */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">{t('personalInformation')}</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t('fullName')}</Label>
                      <p className="text-foreground mt-1">{selectedMember.firstName} {selectedMember.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t('memberCode')}</Label>
                      <p className="text-foreground mt-1">{selectedMember.memberCode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t('dateOfBirth')}</Label>
                      <p className="text-foreground mt-1">
                        {format(new Date(selectedMember.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t('gender')}</Label>
                      <p className="text-foreground mt-1">{selectedMember.gender === 'M' ? t('male') : t('female')}</p>
                    </div>
                  </div>
                </div>

                {/* Contact et Adresse */}
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-4">{t('contact')}</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t('phone')}</Label>
                      <p className="text-foreground mt-1">{selectedMember.phone || t('notProvided')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">{t('email')}</Label>
                      <p className="text-foreground mt-1">{selectedMember.email || t('notProvided')}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">{t('address')}</Label>
                      <div className="text-foreground mt-1">
                        {(() => {
                          const addressParts = [];
                          if (selectedMember.apartment) addressParts.push(selectedMember.apartment);
                          if (selectedMember.buildingNumber) addressParts.push(selectedMember.buildingNumber);
                          if (selectedMember.street) addressParts.push(selectedMember.street);
                          
                          const streetAddress = addressParts.join(' ');
                          const cityPostal = [selectedMember.city, selectedMember.postalCode].filter(Boolean).join(', ');
                          const fullAddress = [streetAddress, cityPostal, selectedMember.country].filter(Boolean).join(', ');
                          
                          return <p>{fullAddress || t('addressNotProvided')}</p>;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statut et date */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t('status')}</Label>
                    <div className="mt-1">
                      <Badge variant={selectedMember.isActive ? "default" : "secondary"} className={selectedMember.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                        {selectedMember.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">{t('registrationDate')}</Label>
                    <p className="text-foreground mt-1">
                      {format(new Date(selectedMember.createdAt), 'dd MMMM yyyy', { locale: fr })}
                    </p>
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
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="flex items-center space-x-2 w-full sm:w-auto"
                >
                  <QrCode className="h-4 w-4" />
                  <span>{showQRCode ? t('hideQRCode') : t('showQRCode')}</span>
                </Button>
                <Button 
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setShowQRCode(false);
                  }}
                  className="w-full sm:w-auto"
                >
                  {t('close')}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}