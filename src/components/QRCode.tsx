
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode as QrCodeIcon, Download, Copy, Link } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QRCodeProps {
  waiterName: string;
  qrCodeUrl: string;
  trackingLink: string;
  googleReviewUrl?: string;
}

export const QRCode = ({ waiterName, qrCodeUrl, trackingLink, googleReviewUrl }: QRCodeProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyLink = () => {
    navigator.clipboard.writeText(trackingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  const downloadQRCode = () => {
    // Cria um canvas para gerar a imagem com texto e QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Configura o tamanho do canvas (10x4 aspect ratio)
      canvas.width = 600;
      canvas.height = 1500;
      
      if (ctx) {
        // Preenche o fundo
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Adiciona o cabeçalho com as cores do Google
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, "#4285F4"); // Google Blue
        gradient.addColorStop(0.25, "#DB4437"); // Google Red
        gradient.addColorStop(0.5, "#F4B400"); // Google Yellow
        gradient.addColorStop(0.75, "#0F9D58"); // Google Green
        gradient.addColorStop(1, "#4285F4"); // Back to Blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, 150);
        
        // Texto Google Review
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AVALIAÇÃO GOOGLE', canvas.width / 2, 90);
        
        // Adiciona texto principal
        ctx.fillStyle = '#4285F4'; // Google Blue
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Como foi seu atendimento?', canvas.width / 2, 220);
        
        // Adiciona nome do garçom
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(waiterName, canvas.width / 2, 300);
        
        // Desenha o QR Code (maior)
        ctx.drawImage(img, (canvas.width - 400) / 2, 350, 400, 400);
        
        // Adiciona instruções
        ctx.font = '28px Arial';
        ctx.fillStyle = '#757575';
        ctx.fillText('Aponte sua câmera para o', canvas.width / 2, 820);
        ctx.fillText('QR code acima e avalie', canvas.width / 2, 860);
        ctx.fillText('nosso atendimento', canvas.width / 2, 900);
        
        // Adiciona o link
        ctx.font = '22px Arial';
        ctx.fillStyle = '#4285F4';
        ctx.fillText(trackingLink, canvas.width / 2, 980);
        
        // Adiciona rodapé
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - 150, canvas.width, 150);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Sua opinião é muito importante!', canvas.width / 2, canvas.height - 80);
        
        // Converte o canvas em imagem PNG
        const dataUrl = canvas.toDataURL('image/png');
        
        // Cria link para download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${waiterName.replace(/\s+/g, '-').toLowerCase()}-avaliacao.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "QR Code baixado",
          description: "O cartão de avaliação foi baixado com sucesso.",
        });
      }
    };
    
    img.src = qrCodeUrl;
  };

  return (
    <Card className="overflow-hidden border-2 border-[#4285F4]">
      <CardHeader className="bg-gradient-to-r from-[#4285F4] via-[#DB4437] to-[#0F9D58] text-white">
        <CardTitle className="text-xl font-medium text-center">Cartão de Avaliação para {waiterName}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center p-6">
        <div className="relative bg-white p-4 rounded-lg shadow-md border mb-4">
          <div className="text-center font-bold text-xl mb-2 text-[#4285F4]">Como foi seu atendimento?</div>
          <img 
            src={qrCodeUrl} 
            alt={`QR Code para ${waiterName}`} 
            className="w-60 h-60 object-contain"
          />
          <div className="text-center font-bold text-lg mt-2">{waiterName}</div>
        </div>
        <p className="text-sm text-gray-500 mb-4 text-center">
          {trackingLink}
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 flex-wrap bg-gray-50 p-4">
        <Button variant="outline" onClick={copyLink} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          {copied ? "Copiado!" : "Copiar Link"}
        </Button>
        <Button onClick={downloadQRCode} className="flex items-center gap-2 bg-[#4285F4]">
          <Download className="h-4 w-4" />
          Baixar Cartão
        </Button>
      </CardFooter>
    </Card>
  );
};
