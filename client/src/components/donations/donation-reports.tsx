import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar, Download, FileText, DollarSign, TrendingUp, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
// Using browser print API instead of jsPDF for better compatibility
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import logoPath from "@assets/logo_boanerges_ico.jpg";

interface DonationReportsProps {
  className?: string;
}

export default function DonationReports({ className }: DonationReportsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Get current year and month for reports
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Calculate date ranges based on selected year and month
  const getYearRange = (year: number) => ({
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31, 23, 59, 59)
  });
  
  // Get the start and end dates for the selected month
  const getMonthRange = (year: number, month: number) => ({
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0, 23, 59, 59)
  });
  
  // Define year and month ranges based on selected values
  const yearRange = getYearRange(selectedYear);
  const monthRange = getMonthRange(selectedYear, selectedMonth);
  
  // Generate year options (current year and 5 years back)
  const getYearOptions = () => {
    const years = [];
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };
  
  // Generate month options
  const getMonthOptions = () => [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" }
  ];

  // Fetch all donations for comprehensive reporting
  const { data: allDonations } = useQuery({
    queryKey: ["/api/donations/all"],
    queryFn: async () => {
      const response = await fetch("/api/donations/recent?limit=1000", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch donations");
      return response.json();
    },
  });

  // Fetch monthly donations based on selected month/year
  const { data: monthlyDonations } = useQuery({
    queryKey: ["/api/donations/monthly", monthRange.start.toISOString(), monthRange.end.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: monthRange.start.toISOString(),
        endDate: monthRange.end.toISOString(),
      });
      const response = await fetch(`/api/donations/stats?${params}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch monthly donations");
      return response.json();
    },
  });

  // Fetch members for selection dropdown
  const { data: members } = useQuery({
    queryKey: ["/api/members"],
    queryFn: async () => {
      const response = await fetch("/api/members", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json();
    },
  });

  // Filter donations by selected member
  const filterDonationsByMember = (donations: any[]) => {
    if (selectedMember === "all") {
      return donations;
    }
    return donations.filter((donation: any) => {
      const memberKey = donation.isAnonymous ? 'anonymous' : `${donation.memberFirstName || ''} ${donation.memberLastName || ''}`.trim();
      return memberKey === selectedMember;
    });
  };

  // Generate HTML report for fiscal reports with signature
  const generateFiscalHTMLReport = (title: string, content: string, memberFilter?: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    }
    
    const memberFilterText = memberFilter && memberFilter !== "all" 
      ? `<div class="member-filter">Rapport pour: ${memberFilter}</div>`
      : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
            .church-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #2563eb; }
            .church-subtitle { font-size: 14px; color: #666; margin-bottom: 5px; }
            .church-registration { font-size: 12px; color: #666; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .date { font-size: 14px; color: #666; }
            .member-filter { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .content { margin: 20px 0; }
            .section { margin: 20px 0; }
            .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-weight: bold; font-size: 18px; color: #2563eb; }
            .signature-section { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 30px; }
            .signature-line { border-bottom: 1px solid #333; width: 300px; margin: 20px auto; }
            .signature-label { text-align: center; margin-top: 10px; font-size: 12px; color: #666; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            @media print {
              .print-button { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoPath}" alt="Logo Mission Évangélique Boanergès" class="logo" />
            <div class="church-name">Mission Évangélique Boanergès</div>
            <div class="church-subtitle">Sherbrooke, Québec</div>
            <div class="church-registration">Numéro d'enregistrement: 1167158-7</div>
            <div class="title">${title}</div>
            <div class="date">Généré le: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}</div>
            ${memberFilterText}
          </div>
          ${content}
          <div class="signature-section">
            <p style="text-align: center; margin-bottom: 30px; font-weight: bold;">Attestation Officielle</p>
            <p style="text-align: center; margin-bottom: 40px;">Je certifie que les informations contenues dans ce rapport fiscal sont exactes et conformes aux registres de la Mission Évangélique Boanergès.</p>
            <div class="signature-line"></div>
            <div class="signature-label">Signature du Pasteur</div>
            <div style="text-align: center; margin-top: 20px; font-size: 14px;">
              <strong>Pasteur Eric Kouadio Tanoh</strong><br>
              Mission Évangélique Boanergès
            </div>
          </div>
          <div class="footer">
            <p>Mission Évangélique Boanergès - Rapport généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}</p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <button class="print-button" onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimer / Sauvegarder en PDF
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // Generate HTML report for printing as PDF (for other reports)
  const generateHTMLReport = (title: string, content: string, memberFilter?: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
    }
    
    const memberFilterText = memberFilter && memberFilter !== "all" 
      ? `<div class="member-filter">Rapport pour: ${memberFilter}</div>`
      : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
            .church-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #2563eb; }
            .church-subtitle { font-size: 14px; color: #666; margin-bottom: 5px; }
            .church-registration { font-size: 12px; color: #666; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .date { font-size: 14px; color: #666; }
            .member-filter { font-size: 16px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .content { margin: 20px 0; }
            .section { margin: 20px 0; }
            .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .total { font-weight: bold; font-size: 18px; color: #2563eb; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
            @media print {
              .print-button { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoPath}" alt="Logo Mission Évangélique Boanergès" class="logo" />
            <div class="church-name">Mission Évangélique Boanergès</div>
            <div class="church-subtitle">Sherbrooke, Québec</div>
            <div class="church-registration">Numéro d'enregistrement: 1167158-7</div>
            <div class="title">${title}</div>
            <div class="date">Généré le: ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}</div>
            ${memberFilterText}
          </div>
          ${content}
          <div class="footer">
            <p>Mission Évangélique Boanergès - Rapport généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}</p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <button class="print-button" onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimer / Sauvegarder en PDF
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // Generate Fiscal Donation Report (PDF)
  const generateFiscalReport = async () => {
    console.log("Starting fiscal report generation...");
    
    if (!allDonations || allDonations.length === 0) {
      toast({
        title: t("noDataFound"),
        description: t("noDonationsForReport"),
        variant: "destructive",
      });
      return;
    }

    // Validate selected year
    setIsGenerating(true);
    try {
      // Filter donations for selected fiscal year
      let fiscalYearDonations = allDonations.filter((donation: any) => {
        try {
          const donationDate = new Date(donation.donationDate);
          return donationDate >= yearRange.start && donationDate <= yearRange.end;
        } catch (e) {
          console.error("Error parsing donation date:", donation.donationDate, e);
          return false;
        }
      });

      // Apply member filter if specific member selected
      fiscalYearDonations = filterDonationsByMember(fiscalYearDonations);

      // Group by member and calculate totals
      const memberTotals: { [key: string]: { name: string; total: number; count: number } } = {};
      
      fiscalYearDonations.forEach((donation: any) => {
        const memberKey = donation.isAnonymous ? 'Anonyme' : `${donation.memberFirstName || ''} ${donation.memberLastName || ''}`.trim();
        if (!memberTotals[memberKey]) {
          memberTotals[memberKey] = { name: memberKey, total: 0, count: 0 };
        }
        const amount = parseFloat(donation.amount || 0);
        if (!isNaN(amount)) {
          memberTotals[memberKey].total += amount;
          memberTotals[memberKey].count += 1;
        }
      });

      const totalAmount = Object.values(memberTotals).reduce((sum, member) => sum + member.total, 0);
      const totalDonations = fiscalYearDonations.length;

      // Get selected member name for display
      const selectedMemberName = selectedMember === "all" ? t('allMembers') : selectedMember;

      // Generate HTML content
      const content = `
        <div class="summary">
          <h3>Résumé Fiscal ${selectedYear}</h3>
          <p><strong>Total des donations:</strong> <span class="total">$${totalAmount.toFixed(2)}</span></p>
          <p><strong>Nombre de donations:</strong> ${totalDonations}</p>
          <p><strong>Nombre de donateurs:</strong> ${Object.keys(memberTotals).length}</p>
        </div>
        
        <div class="section">
          <h3>Détail par Donateur</h3>
          <table>
            <thead>
              <tr>
                <th>Donateur</th>
                <th>Nombre de Donations</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(memberTotals).map(member => `
                <tr>
                  <td>${member.name || 'Non spécifié'}</td>
                  <td>${member.count}</td>
                  <td>$${member.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      generateFiscalHTMLReport("Rapport Fiscal des Donations", content, selectedMemberName);
      
      toast({
        title: t("reportGenerated"),
        description: t("fiscalReportDownloaded"),
      });
    } catch (error) {
      console.error("Fiscal report generation error:", error);
      toast({
        title: t("error"),
        description: `${t("reportGenerationError")}: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Monthly Donations Report (PDF)
  const generateMonthlyReport = async () => {
    if (!allDonations || allDonations.length === 0) {
      toast({
        title: t("noDataFound"),
        description: t("noDonationsForReport"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Filter donations for selected month
      let monthlyDonationsList = allDonations.filter((donation: any) => {
        const donationDate = new Date(donation.donationDate);
        return donationDate >= monthRange.start && donationDate <= monthRange.end;
      });

      // Apply member filter if specific member selected
      monthlyDonationsList = filterDonationsByMember(monthlyDonationsList);

      // Calculate statistics
      const totalAmount = monthlyDonationsList.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount || 0), 0);
      const byType = monthlyDonationsList.reduce((acc: any, donation: any) => {
        const amount = parseFloat(donation.amount || 0);
        if (!isNaN(amount)) {
          acc[donation.donationType] = (acc[donation.donationType] || 0) + amount;
        }
        return acc;
      }, {});

      // Generate HTML content
      const content = `
        <div class="summary">
          <h3>Rapport Mensuel - ${format(monthRange.start, 'MMMM yyyy', { locale: fr })}</h3>
          <p><strong>Total du mois:</strong> <span class="total">$${totalAmount.toFixed(2)}</span></p>
          <p><strong>Nombre de donations:</strong> ${monthlyDonationsList.length}</p>
        </div>
        
        <div class="section">
          <h3>Répartition par Type</h3>
          <table>
            <thead>
              <tr>
                <th>Type de Donation</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(byType).map(([type, amount]: [string, any]) => {
                const typeLabel = type === 'tithe' ? 'Dîmes' : type === 'offering' ? 'Offrandes' : 'Général';
                return `
                  <tr>
                    <td>${typeLabel}</td>
                    <td>$${amount.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>Détail des Donations</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donateur</th>
                <th>Type</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyDonationsList.map((donation: any) => `
                <tr>
                  <td>${format(new Date(donation.donationDate), 'dd/MM/yyyy')}</td>
                  <td>${donation.isAnonymous ? 'Anonyme' : `${donation.memberFirstName || ''} ${donation.memberLastName || ''}`.trim()}</td>
                  <td>${donation.donationType === 'tithe' ? 'Dîme' : donation.donationType === 'offering' ? 'Offrande' : 'Général'}</td>
                  <td>$${parseFloat(donation.amount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      // Generate HTML report with member filter
      const selectedMemberName = selectedMember === "all" ? t('allMembers') : selectedMember;
      generateHTMLReport("Rapport Mensuel des Donations", content, selectedMemberName);
      
      toast({
        title: t("reportGenerated"),
        description: t("monthlyReportDownloaded"),
      });
    } catch (error) {
      console.error("Monthly report generation error:", error);
      toast({
        title: t("error"),
        description: t("reportGenerationError"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Donations History (PDF)
  const generateHistoryReport = async () => {
    if (!allDonations || allDonations.length === 0) {
      toast({
        title: t("noDataFound"),
        description: t("noDonationsForReport"),
        variant: "destructive",
      });
      return;
    }

    // Validate selected year
    setIsGenerating(true);
    try {
      // Filter donations by selected year first
      let yearFilteredDonations = allDonations.filter((donation: any) => {
        try {
          const donationDate = new Date(donation.donationDate);
          return donationDate >= yearRange.start && donationDate <= yearRange.end;
        } catch (e) {
          console.error("Error parsing donation date:", donation.donationDate, e);
          return false;
        }
      });

      // Sort donations by date (most recent first)
      let sortedDonations = [...yearFilteredDonations].sort((a, b) => 
        new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime()
      );

      // Apply member filter if specific member selected
      sortedDonations = filterDonationsByMember(sortedDonations);

      // Calculate total statistics
      const totalAmount = sortedDonations.reduce((sum: number, donation: any) => sum + parseFloat(donation.amount || 0), 0);
      const totalCount = sortedDonations.length;
      const firstDonation = sortedDonations[sortedDonations.length - 1];
      const lastDonation = sortedDonations[0];

      // Generate HTML content
      const content = `
        <div class="summary">
          <h3>Historique des Donations ${selectedYear}</h3>
          <p><strong>Total général:</strong> <span class="total">$${totalAmount.toFixed(2)}</span></p>
          <p><strong>Nombre total de donations:</strong> ${totalCount}</p>
          ${firstDonation && lastDonation ? `
            <p><strong>Période:</strong> ${format(new Date(firstDonation.donationDate), 'dd/MM/yyyy')} - ${format(new Date(lastDonation.donationDate), 'dd/MM/yyyy')}</p>
          ` : ''}
        </div>
        
        <div class="section">
          <h3>Historique Détaillé</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Donateur</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Reçu #</th>
              </tr>
            </thead>
            <tbody>
              ${sortedDonations.map((donation: any) => `
                <tr>
                  <td>${format(new Date(donation.donationDate), 'dd/MM/yyyy')}</td>
                  <td>${donation.isAnonymous ? 'Anonyme' : `${donation.memberFirstName || ''} ${donation.memberLastName || ''}`.trim()}</td>
                  <td>${donation.donationType === 'tithe' ? 'Dîme' : donation.donationType === 'offering' ? 'Offrande' : 'Général'}</td>
                  <td>$${parseFloat(donation.amount || 0).toFixed(2)}</td>
                  <td>${donation.receiptNumber || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      const selectedMemberName = selectedMember === "all" ? t('allMembers') : selectedMember;
      generateHTMLReport("Historique Complet des Donations", content, selectedMemberName);
      
      toast({
        title: t("reportGenerated"),
        description: t("historyReportDownloaded"),
      });
    } catch (error) {
      console.error("History report generation error:", error);
      toast({
        title: t("error"),
        description: t("reportGenerationError"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Export Donations Data (Excel)
  const exportToExcel = async () => {
    if (!allDonations || allDonations.length === 0) {
      toast({
        title: t("noDataFound"),
        description: t("noDonationsForReport"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Apply member filter if specific member selected
      const filteredDonations = filterDonationsByMember(allDonations);
      
      // Prepare data for Excel
      const excelData = filteredDonations.map((donation: any) => ({
        'Date': format(new Date(donation.donationDate), 'dd/MM/yyyy'),
        'Donateur': donation.isAnonymous ? 'Anonyme' : `${donation.memberFirstName} ${donation.memberLastName}`,
        'Type de donation': donation.donationType === 'tithe' ? 'Dîme' : donation.donationType === 'offering' ? 'Offrande' : 'Général',
        'Montant': parseFloat(donation.amount),
        'Numéro de reçu': donation.receiptNumber || '',
        'Anonyme': donation.isAnonymous ? 'Oui' : 'Non',
        'Notes': donation.notes || '',
        'Date d\'enregistrement': format(new Date(donation.createdAt), 'dd/MM/yyyy HH:mm')
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Main data sheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Donations");

      // Summary sheet
      const summaryData = [
        { 'Statistique': 'Total des donations', 'Valeur': `$${filteredDonations.reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0).toFixed(2)}` },
        { 'Statistique': 'Nombre de donations', 'Valeur': filteredDonations.length },
        { 'Statistique': 'Dîmes', 'Valeur': `$${filteredDonations.filter((d: any) => d.donationType === 'tithe').reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0).toFixed(2)}` },
        { 'Statistique': 'Offrandes', 'Valeur': `$${filteredDonations.filter((d: any) => d.donationType === 'offering').reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0).toFixed(2)}` },
        { 'Statistique': 'Donations générales', 'Valeur': `$${filteredDonations.filter((d: any) => d.donationType === 'general').reduce((sum: number, d: any) => sum + parseFloat(d.amount), 0).toFixed(2)}` },
        { 'Statistique': 'Filtre appliqué', 'Valeur': selectedMember === "all" ? t('allMembers') : selectedMember },
        { 'Statistique': 'Rapport généré le', 'Valeur': format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr }) }
      ];
      
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Résumé");

      // Export to file with year and member info in filename
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const memberSuffix = selectedMember === "all" ? "tous-membres" : selectedMember.replace(/\s+/g, '-').toLowerCase();
      const filename = `donations-export-${selectedYear}-${memberSuffix}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      saveAs(data, filename);
      
      toast({
        title: t("dataExported"),
        description: t("dataExportedSuccessfully"),
      });
    } catch (error) {
      console.error("Excel export error:", error);
      toast({
        title: t("error"),
        description: t("reportGenerationError"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate unique member list from donations and members data
  const getMemberOptions = () => {
    const memberOptions = [
      { value: "all", label: t('allMembers') },
      { value: "anonymous", label: t('anonymousDonations') }
    ];

    if (members && Array.isArray(members)) {
      const membersList = members.map((member: any) => ({
        value: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        label: `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.memberCode
      }));
      memberOptions.push(...membersList);
    }

    return memberOptions;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('donationActions')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Member Selection */}
        <div className="space-y-2">
          <Label htmlFor="member-select" className="text-sm font-medium">
            {t('filterByMember')}
          </Label>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger id="member-select">
              <SelectValue placeholder={t('selectAMember')} />
            </SelectTrigger>
            <SelectContent>
              {getMemberOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Selection */}
        <div className="space-y-2">
          <Label htmlFor="year-select" className="text-sm font-medium">
            {t('year')}
          </Label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger id="year-select">
              <SelectValue placeholder={t('selectAYear')} />
            </SelectTrigger>
            <SelectContent>
              {getYearOptions().map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Selection (for monthly reports) */}
        <div className="space-y-2">
          <Label htmlFor="month-select" className="text-sm font-medium">
            {t('monthForMonthlyReport')}
          </Label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger id="month-select">
              <SelectValue placeholder={t('selectAMonth')} />
            </SelectTrigger>
            <SelectContent>
              {getMonthOptions().map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="border-t pt-4 space-y-4">
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            onClick={generateFiscalReport}
            disabled={isGenerating}
          >
            <FileText className="h-4 w-4 mr-2" />
            {t("generateFiscalReport")} ({selectedYear})
          </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline" 
          onClick={generateMonthlyReport}
          disabled={isGenerating}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          {t("monthlyReport")} ({getMonthOptions().find(m => m.value === selectedMonth)?.label} {selectedYear})
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline" 
          onClick={generateHistoryReport}
          disabled={isGenerating}
        >
          <Calendar className="h-4 w-4 mr-2" />
          {t("donationHistory")} ({selectedYear})
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline" 
          onClick={exportToExcel}
          disabled={isGenerating}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("exportData")}
        </Button>
        </div>
      </CardContent>
    </Card>
  );
}