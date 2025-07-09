import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AttendanceReportProps {
  eventId?: number;
}

export default function AttendanceReport({ eventId }: AttendanceReportProps) {
  const [selectedEvent, setSelectedEvent] = useState(eventId?.toString() || "");

  // Fetch events for selection
  const { data: events } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  // Fetch attendance data when event is selected
  const { data: attendanceData, isLoading } = useQuery({
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

  // Get event details
  const selectedEventData = Array.isArray(events) ? events.find((e: any) => e.id.toString() === selectedEvent) : null;

  // Prepare report data
  const prepareReportData = () => {
    if (!attendanceData || !selectedEventData) return null;

    const members = attendanceData.filter((att: any) => att.memberId);
    const visitors = attendanceData.filter((att: any) => !att.memberId);
    
    // Calculate gender statistics for members only
    const menCount = members.filter((att: any) => att.member?.gender === 'M').length;
    const womenCount = members.filter((att: any) => att.member?.gender === 'F').length;

    return {
      event: selectedEventData,
      totalAttendance: attendanceData.length,
      membersCount: members.length,
      visitorsCount: visitors.length,
      menCount,
      womenCount,
      members: members,
      visitors: visitors,
    };
  };

  const generatePDF = () => {
    const data = prepareReportData();
    if (!data) return;

    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.text("Mission Évangélique Boanergès", 20, 20);
    doc.setFontSize(16);
    doc.text("906 rue King Ouest, Sherbrooke", 20, 30);
    
    // Titre du rapport
    doc.setFontSize(18);
    doc.text("Rapport de Présences", 20, 50);
    
    // Informations de l'événement
    doc.setFontSize(12);
    doc.text(`Événement: ${data.event.title}`, 20, 70);
    doc.text(`Date: ${format(new Date(data.event.startDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 20, 80);
    doc.text(`Lieu: ${data.event.location}`, 20, 90);
    if (data.event.isSpecial) {
      doc.text("⭐ Événement spécial", 20, 100);
    }
    
    // Statistiques
    doc.setFontSize(14);
    doc.text("Statistiques de présence", 20, 120);
    doc.setFontSize(12);
    doc.text(`Total des présences: ${data.totalAttendance}`, 20, 135);
    doc.text(`Membres: ${data.membersCount}`, 20, 145);
    doc.text(`  - Hommes: ${data.menCount}`, 25, 155);
    doc.text(`  - Femmes: ${data.womenCount}`, 25, 165);
    doc.text(`Visiteurs: ${data.visitorsCount}`, 20, 175);
    
    // Table des membres présents
    if (data.members.length > 0) {
      autoTable(doc, {
        startY: 190,
        head: [['Code Membre', 'Heure d\'arrivée']],
        body: data.members.map((att: any) => [
          att.member?.memberCode || '',
          format(new Date(att.recordedAt), 'HH:mm', { locale: fr })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 }
      });
    }
    
    // Table des visiteurs si présents
    if (data.visitors.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 170;
      
      doc.setFontSize(14);
      doc.text("Visiteurs", 20, finalY + 20);
      
      autoTable(doc, {
        startY: finalY + 30,
        head: [['Prénom', 'Nom', 'Email', 'Téléphone', 'Heure d\'arrivée']],
        body: data.visitors.map((att: any) => [
          att.visitorFirstName || '',
          att.visitorLastName || '',
          att.visitorEmail || '',
          att.visitorPhone || '',
          format(new Date(att.recordedAt), 'HH:mm', { locale: fr })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] },
        styles: { fontSize: 10 }
      });
    }
    
    // Pied de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text(`Généré le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, 20, pageHeight - 20);
    
    // Télécharger le PDF
    const fileName = `rapport-presences-${data.event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${format(new Date(data.event.startDate), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
  };

  const currentReportData = prepareReportData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Sélectionner un Événement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-select">Événement</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un événement..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(events) && events.map((event: any) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.title} - {format(new Date(event.startDate), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      {event.isSpecial && " ⭐"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {currentReportData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Rapport de Présences</span>
              </CardTitle>
              <Button onClick={generatePDF} className="flex items-center space-x-2">
                <FileDown className="h-4 w-4" />
                <span>Exporter PDF</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations de l'événement */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg flex items-center space-x-2">
                <span>{currentReportData.event.title}</span>
                {currentReportData.event.isSpecial && <span className="text-orange-600">⭐</span>}
              </h3>
              <p className="text-gray-600">
                {format(new Date(currentReportData.event.startDate), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </p>
              <p className="text-gray-600">{currentReportData.event.location}</p>
              {currentReportData.event.description && (
                <p className="text-gray-600 mt-2">{currentReportData.event.description}</p>
              )}
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentReportData.totalAttendance}</div>
                <div className="text-sm text-blue-600">Total Présences</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentReportData.membersCount}</div>
                <div className="text-sm text-green-600">Membres</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{currentReportData.menCount}</div>
                <div className="text-sm text-purple-600">Hommes</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{currentReportData.womenCount}</div>
                <div className="text-sm text-pink-600">Femmes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{currentReportData.visitorsCount}</div>
                <div className="text-sm text-orange-600">Visiteurs</div>
              </div>
            </div>

            {/* Liste des membres présents */}
            {currentReportData.members.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Membres Présents ({currentReportData.membersCount})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code Membre</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Heure d'arrivée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReportData.members.map((attendance: any) => (
                      <TableRow key={attendance.id}>
                        <TableCell>{attendance.member?.memberCode}</TableCell>
                        <TableCell>{attendance.member?.lastName}</TableCell>
                        <TableCell>{attendance.member?.firstName}</TableCell>
                        <TableCell>
                          {format(new Date(attendance.recordedAt), 'HH:mm', { locale: fr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Liste des visiteurs */}
            {currentReportData.visitors.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Visiteurs ({currentReportData.visitorsCount})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prénom</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Heure d'arrivée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReportData.visitors.map((attendance: any) => (
                      <TableRow key={attendance.id}>
                        <TableCell>{attendance.visitorFirstName}</TableCell>
                        <TableCell>{attendance.visitorLastName}</TableCell>
                        <TableCell>{attendance.visitorEmail}</TableCell>
                        <TableCell>{attendance.visitorPhone}</TableCell>
                        <TableCell>
                          {format(new Date(attendance.recordedAt), 'HH:mm', { locale: fr })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {currentReportData.totalAttendance === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucune présence enregistrée pour cet événement
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}