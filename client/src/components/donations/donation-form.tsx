import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertDonationSchema, type InsertDonation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, DollarSign } from "lucide-react";
import { z } from "zod";

const donationFormSchema = z.object({
  donationType: z.enum(["tithe", "offering", "general"]),
  amount: z.string().min(1, "Le montant est requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Le montant doit être un nombre positif",
  }),
  donationDate: z.string(),
  isAnonymous: z.boolean(),
  memberId: z.number().optional(),
  notes: z.string().optional(),
});

type DonationFormData = z.infer<typeof donationFormSchema>;

interface DonationFormProps {
  onSuccess?: () => void;
}

export default function DonationForm({ onSuccess }: DonationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const { data: allMembers } = useQuery({
    queryKey: ["/api/members"],
  });

  // Filter members based on search term
  const searchResults = memberSearchTerm.length > 0 && allMembers
    ? (allMembers || []).filter((member: any) => {
        const searchLower = memberSearchTerm.toLowerCase();
        return (
          member.firstName.toLowerCase().includes(searchLower) ||
          member.lastName.toLowerCase().includes(searchLower) ||
          member.memberCode.toLowerCase().includes(searchLower) ||
          `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchLower)
        );
      })
    : [];

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donationType: "offering",
      amount: "",
      donationDate: new Date().toISOString().split('T')[0],
      isAnonymous: false,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DonationFormData) => {
      const formattedData = {
        donationType: data.donationType,
        amount: data.amount, // Keep as string for decimal conversion
        donationDate: data.donationDate,
        isAnonymous: data.isAnonymous,
        memberId: data.isAnonymous ? null : data.memberId,
        notes: data.notes || null,
      };
      const res = await apiRequest("POST", "/api/donations", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({
        title: "Succès",
        description: "Don enregistré avec succès",
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

  const onSubmit = (data: DonationFormData) => {
    createMutation.mutate(data);
  };

  const handleMemberSelect = (member: any) => {
    setSelectedMember(member);
    form.setValue("memberId", member.id);
    setMemberSearchTerm("");
  };

  const clearMemberSelection = () => {
    setSelectedMember(null);
    form.setValue("memberId", undefined);
    setMemberSearchTerm("");
  };

  const isLoading = createMutation.isPending;
  const isAnonymous = form.watch("isAnonymous");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Donation Type and Amount */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="donationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de Don *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tithe">Dîme</SelectItem>
                    <SelectItem value="offering">Offrande</SelectItem>
                    <SelectItem value="general">Don Général</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant ($) *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01" 
                      min="0"
                      className="pl-10"
                      disabled={isLoading} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date */}
        <FormField
          control={form.control}
          name="donationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date du Don *</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Anonymous Switch */}
        <FormField
          control={form.control}
          name="isAnonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Don Anonyme</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Ce don ne sera pas associé à un membre spécifique
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Member Selection - Only show if not anonymous */}
        {!isAnonymous && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <User size={16} />
                <span>Associer à un Membre</span>
              </CardTitle>
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

              <div className="text-xs text-gray-500">
                Associer ce don à un membre permet la génération automatique de reçus fiscaux
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optionnel)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Commentaires ou informations supplémentaires..."
                  rows={3}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer Don"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
