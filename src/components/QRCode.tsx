
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode as QrCodeIcon } from "lucide-react";

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
    // Cria um canvas para gerar a imagem com texto e QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Configura o tamanho do canvas
      canvas.width = 600;
      canvas.height = 800;
      
      if (ctx) {
        // Preenche o fundo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Adiciona texto principal
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Avalie meu atendimento', canvas.width / 2, 80);
        
        // Adiciona nome do garçom
        ctx.font = 'bold 28px Arial';
        ctx.fillText(waiterName, canvas.width / 2, 130);
        
        // Desenha o QR Code
        ctx.drawImage(img, (canvas.width - 400) / 2, 180, 400, 400);
        
        // Adiciona instruções
        ctx.font = '24px Arial';
        ctx.fillText('Aponte sua câmera para o QR code', canvas.width / 2, 630);
        ctx.fillText('ou acesse:', canvas.width / 2, 670);
        
        // Adiciona o link
        ctx.font = '20px Arial';
        ctx.fillText(trackingLink, canvas.width / 2, 710);
        
        // Converte o canvas em imagem PNG
        const dataUrl = canvas.toDataURL('image/png');
        
        // Cria link para download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${waiterName.replace(/\s+/g, '-').toLowerCase()}-avaliacao.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    
    img.src = qrCodeUrl;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">QR Code para {waiterName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative bg-white p-4 rounded-lg shadow-sm border mb-4">
          <div className="text-center font-bold mb-2">Avalie meu atendimento</div>
          <img 
            src={qrCodeUrl} 
            alt={`QR Code para ${waiterName}`} 
            className="w-40 h-40 object-contain"
          />
          <div className="text-center text-sm mt-2">{waiterName}</div>
        </div>
        <p className="text-sm text-gray-500 mb-2 text-center">
          {trackingLink}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 flex-wrap">
        <Button variant="outline" onClick={copyLink}>
          {copied ? "Copiado!" : "Copiar Link"}
        </Button>
        <Button onClick={downloadQRCode}>
          <QrCodeIcon className="h-4 w-4 mr-2" />
          Baixar Imagem de Avaliação
        </Button>
      </CardFooter>
    </Card>
  );
};
