import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { QrCode, UserCheck, UserPlus, Search } from "lucide-react";
import QRScanner from "./qr-scanner";
import { t } from "@/lib/i18n";

interface AttendanceRegistrationProps {
  onSuccess?: () => void;
}

export default function AttendanceRegistration({ onSuccess }: AttendanceRegistrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("manual");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [searchMember, setSearchMember] = useState("");
  const [visitorData, setVisitorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Fetch all events (past and upcoming)
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  // Function to find the best event for current time
  const findBestEventForNow = (eventsList: any[]) => {
    if (!Array.isArray(eventsList) || eventsList.length === 0) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Sort events by date (most recent first)
    const sortedEvents = [...eventsList].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    // First, try to find events happening today
    const todayEvents = sortedEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      return eventDay.getTime() === today.getTime();
    });

    if (todayEvents.length > 0) {
      // Find the event closest to current time
      const currentTime = now.getTime();
      let closestEvent = todayEvents[0];
      let closestTimeDiff = Math.abs(new Date(todayEvents[0].startDate).getTime() - currentTime);

      todayEvents.forEach(event => {
        const eventTime = new Date(event.startDate).getTime();
        const timeDiff = Math.abs(eventTime - currentTime);
        if (timeDiff < closestTimeDiff) {
          closestEvent = event;
          closestTimeDiff = timeDiff;
        }
      });

      return closestEvent;
    }

    // If no events today, return the most recent event
    return sortedEvents[0];
  };

  // Auto-select the best event when events are loaded
  useEffect(() => {
    if (events && !selectedEvent) {
      const bestEvent = findBestEventForNow(Array.isArray(events) ? events : []);
      if (bestEvent) {
        setSelectedEvent(bestEvent.id.toString());
      }
    }
  }, [events, selectedEvent]);

  // Fetch all members
  const { data: members } = useQuery({
    queryKey: ["/api/members"],
  });

  // Fetch existing attendance for selected event
  const { data: eventAttendance } = useQuery({
    queryKey: ["/api/attendance/event", selectedEvent],
    enabled: !!selectedEvent,
    queryFn: async () => {
      const response = await fetch(`/api/attendance/event/${selectedEvent}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
  });

  // Get IDs of members already present
  const presentMemberIds = eventAttendance ? eventAttendance
    .filter((att: any) => att.memberId)
    .map((att: any) => att.memberId) : [];

  // Filter members based on search
  const filteredMembers = Array.isArray(members) ? members.filter((member: any) =>
    member.firstName.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchMember.toLowerCase()) ||
    member.memberCode.toLowerCase().includes(searchMember.toLowerCase())
  ) : [];

  // Check if member is already present
  const isMemberPresent = (memberId: number) => presentMemberIds.includes(memberId);

  const attendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/attendance", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Succès",
        description: "Présence enregistrée avec succès",
      });
      setSelectedMembers([]);
      setVisitorData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMemberToggle = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleMemberAttendance = () => {
    if (!selectedEvent || selectedMembers.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un événement et au moins un membre",
        variant: "destructive",
      });
      return;
    }

    attendanceMutation.mutate({
      eventId: parseInt(selectedEvent),
      memberIds: selectedMembers,
      attendanceMethod: "manual",
    });
  };

  const handleVisitorAttendance = () => {
    if (!selectedEvent || !visitorData.firstName || !visitorData.lastName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive",
      });
      return;
    }

    attendanceMutation.mutate({
      eventId: parseInt(selectedEvent),
      attendanceMethod: "visitor",
      visitorFirstName: visitorData.firstName,
      visitorLastName: visitorData.lastName,
      visitorEmail: visitorData.email,
      visitorPhone: visitorData.phone,
      notes: visitorData.notes,
    });
  };

  const isLoading = attendanceMutation.isPending;

  return (
    <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
      {/* Event Selection */}
      <div className="space-y-2 sticky top-0 bg-background p-4 border-b border-border z-10">
        <Label htmlFor="event">Sélectionner un Événement *</Label>
        <Select value={selectedEvent} onValueChange={setSelectedEvent} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un événement" />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(events) && events
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map((event: any) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title} - {new Date(event.startDate).toLocaleString('fr-FR')}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Attendance Registration Tabs */}
      <div className="px-4 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Membres</span>
          </TabsTrigger>
          <TabsTrigger value="visitor" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Visiteurs</span>
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </TabsTrigger>
        </TabsList>

        {/* Member Registration */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Enregistrement des Membres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member-search">Rechercher un membre</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="member-search"
                    placeholder="Nom, prénom ou code membre..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredMembers.map((member: any) => {
                  const isPresent = isMemberPresent(member.id);
                  const isSelected = selectedMembers.includes(member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className={`p-3 border border-border rounded-lg transition-colors ${
                        isPresent 
                          ? 'bg-green-500/10 border-green-500/20 cursor-not-allowed'
                          : isSelected
                            ? 'bg-primary/10 border-primary/20 cursor-pointer'
                            : 'bg-card hover:bg-muted/50 cursor-pointer'
                      }`}
                      onClick={() => !isPresent && handleMemberToggle(member.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-muted-foreground">{t('byMemberNumber')}</p>
                        </div>
                        <Badge variant={
                          isPresent ? "destructive" : 
                          isSelected ? "default" : "secondary"
                        }>
                          {isPresent ? "Déjà présent" : 
                           isSelected ? "Sélectionné" : "Sélectionner"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedMembers.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedMembers.length} membre(s) sélectionné(s)
                  </p>
                  <Button onClick={handleMemberAttendance} disabled={isLoading || !selectedEvent}>
                    {isLoading ? "Enregistrement..." : "Enregistrer la Présence"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visitor Registration */}
        <TabsContent value="visitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Enregistrement des Visiteurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitor-firstname">Prénom *</Label>
                  <Input
                    id="visitor-firstname"
                    value={visitorData.firstName}
                    onChange={(e) => setVisitorData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitor-lastname">Nom *</Label>
                  <Input
                    id="visitor-lastname"
                    value={visitorData.lastName}
                    onChange={(e) => setVisitorData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visitor-email">Email</Label>
                  <Input
                    id="visitor-email"
                    type="email"
                    value={visitorData.email}
                    onChange={(e) => setVisitorData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visitor-phone">Téléphone</Label>
                  <Input
                    id="visitor-phone"
                    value={visitorData.phone}
                    onChange={(e) => setVisitorData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitor-notes">Notes</Label>
                <Textarea
                  id="visitor-notes"
                  value={visitorData.notes}
                  onChange={(e) => setVisitorData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleVisitorAttendance} disabled={isLoading || !selectedEvent}>
                  {isLoading ? "Enregistrement..." : "Enregistrer le Visiteur"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Registration */}
        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>Scan QR Code</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvent ? (
                <QRScanner 
                  eventId={parseInt(selectedEvent)}
                  onScanSuccess={(memberCode) => {
                    toast({
                      title: "Présence enregistrée",
                      description: `Présence confirmée pour le membre ${memberCode}`,
                    });
                    onSuccess?.();
                  }}
                />
              ) : (
                <div className="text-center p-8">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Veuillez d'abord sélectionner un événement pour utiliser le scanner QR
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}