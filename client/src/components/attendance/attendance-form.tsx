import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertAttendanceSchema, type InsertAttendance } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, QrCode, Users, Search } from "lucide-react";
import { z } from "zod";

const attendanceFormSchema = insertAttendanceSchema.omit({ recordedBy: true });

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  onSuccess?: () => void;
}

export default function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [attendanceMethod, setAttendanceMethod] = useState<"manual" | "qr_code" | "visitor">("manual");

  const { data: events } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  const { data: searchResults } = useQuery({
    queryKey: ["/api/members", { search: memberSearchTerm }],
    enabled: memberSearchTerm.length > 2 && attendanceMethod !== "visitor",
    queryFn: async () => {
      const response = await fetch(`/api/members?search=${memberSearchTerm}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to search members");
      return response.json();
    },
  });

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      eventId: 0,
      memberId: undefined,
      visitorFirstName: "",
      visitorLastName: "",
      attendanceMethod: "manual",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AttendanceFormData) => {
      const res = await apiRequest("POST", "/api/attendance", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({
        title: "Succès",
        description: "Présence enregistrée avec succès",
      });
      form.reset();
      setSelectedMember(null);
      setMemberSearchTerm("");
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

  const onSubmit = (data: AttendanceFormData) => {
    if (attendanceMethod === "visitor") {
      if (!data.visitorFirstName || !data.visitorLastName) {
        toast({
          title: "Erreur",
          description: "Veuillez renseigner le nom et prénom du visiteur",
          variant: "destructive",
        });
        return;
      }
      data.memberId = undefined;
    } else {
      if (!data.memberId) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un membre",
          variant: "destructive",
        });
        return;
      }
      data.visitorFirstName = "";
      data.visitorLastName = "";
    }

    data.attendanceMethod = attendanceMethod;
    createMutation.mutate(data);
  };

  const handleMemberSelect = (member: any) => {
    setSelectedMember(member);
    form.setValue("memberId", member.id);
    setMemberSearchTerm(`${member.firstName} ${member.lastName} (${member.memberCode})`);
  };

  const isLoading = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Selection */}
        <FormField
          control={form.control}
          name="eventId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Événement *</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un événement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {events?.map((event: any) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title} - {new Date(event.startDate).toLocaleDateString('fr-FR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attendance Method Tabs */}
        <div className="space-y-4">
          <Label>Méthode d'Enregistrement</Label>
          <Tabs value={attendanceMethod} onValueChange={(value) => setAttendanceMethod(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <UserCheck size={16} />
                <span>Manuel</span>
              </TabsTrigger>
              <TabsTrigger value="qr_code" className="flex items-center space-x-2">
                <QrCode size={16} />
                <span>QR Code</span>
              </TabsTrigger>
              <TabsTrigger value="visitor" className="flex items-center space-x-2">
                <Users size={16} />
                <span>Visiteur</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recherche Manuelle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Rechercher par nom, prénom ou code membre..."
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>

                  {searchResults && searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {searchResults.slice(0, 5).map((member: any) => (
                        <div
                          key={member.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleMemberSelect(member)}
                        >
                          <div className="font-medium">{member.firstName} {member.lastName}</div>
                          <div className="text-sm text-gray-500">{member.memberCode}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedMember && (
                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-md">
                      <div className="font-medium text-primary-900">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </div>
                      <div className="text-sm text-primary-700">
                        Code: {selectedMember.memberCode}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr_code" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Scanner QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Scanner le QR code du membre</p>
                    <Button variant="outline" disabled>
                      Ouvrir le Scanner
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Fonctionnalité à implémenter avec la librairie QR scanner
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visitor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informations Visiteur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="visitorFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="visitorLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer Présence"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
