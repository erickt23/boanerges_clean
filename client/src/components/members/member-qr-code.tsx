import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Member } from "@shared/schema";

interface MemberQRCodeProps {
  member: Member;
}

export default function MemberQRCode({ member }: MemberQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const qrData = JSON.stringify({
    memberId: member.id,
    memberCode: member.memberCode,
    type: 'attendance'
  });

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch((error) => {
        console.error('Error generating QR code:', error);
      });
    }
  }, [qrData]);

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${member.memberCode}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
        title: "QR Code téléchargé",
        description: `QR code pour ${member.firstName} ${member.lastName} téléchargé`,
      });
    }
  };

  return (
    <Card className="w-fit">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>QR Code</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {member.firstName} {member.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          Code: {member.memberCode}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef}
            className="border rounded-lg"
          />
        </div>
        <Button 
          onClick={downloadQRCode}
          variant="outline" 
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </CardContent>
    </Card>
  );
}