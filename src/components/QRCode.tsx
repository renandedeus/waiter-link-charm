
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface QRCodeProps {
  waiterName: string;
  qrCodeUrl: string;
  trackingLink: string;
}

export const QRCode = ({ waiterName, qrCodeUrl, trackingLink }: QRCodeProps) => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${waiterName.replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">QR Code para {waiterName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <img 
          src={qrCodeUrl} 
          alt={`QR Code para ${waiterName}`} 
          className="w-40 h-40 object-contain mb-4"
        />
        <p className="text-sm text-gray-500 mb-2 text-center">
          {trackingLink}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 flex-wrap">
        <Button variant="outline" onClick={copyLink}>
          {copied ? "Copiado!" : "Copiar Link"}
        </Button>
        <Button onClick={downloadQRCode}>
          Baixar QR Code
        </Button>
      </CardFooter>
    </Card>
  );
};
