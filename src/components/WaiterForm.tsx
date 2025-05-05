
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { QRCode } from './QRCode';
import { Waiter } from '@/types';

interface WaiterFormProps {
  onSave: (name: string, email: string, whatsapp: string) => Promise<Waiter | undefined>;
  googleReviewUrl?: string;
}

export const WaiterForm = ({ onSave, googleReviewUrl }: WaiterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; whatsapp?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newWaiter, setNewWaiter] = useState<Waiter | null>(null);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateWhatsApp = (phone: string) => {
    // Simple validation for phone number format
    return phone.length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; email?: string; whatsapp?: string } = {};
    
    if (!name) {
      newErrors.name = "Nome do garçom é obrigatório";
    }
    
    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor, insira um email válido";
    }
    
    if (!whatsapp) {
      newErrors.whatsapp = "Número do WhatsApp é obrigatório";
    } else if (!validateWhatsApp(whatsapp)) {
      newErrors.whatsapp = "Por favor, insira um número válido";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const createdWaiter = await onSave(name, email, whatsapp);
      
      if (createdWaiter) {
        // Exibir o QR code do garçom recém-criado
        setNewWaiter(createdWaiter);
        
        toast({
          title: "Garçom adicionado com sucesso",
          description: "O garçom foi adicionado à sua lista e o QR Code de avaliação foi gerado.",
        });
        
        // Reset form fields
        setName('');
        setEmail('');
        setWhatsapp('');
      }
    } catch (error) {
      console.error('Error saving waiter:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o garçom.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseQrCode = () => {
    setNewWaiter(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Garçom</CardTitle>
          <CardDescription>
            Insira as informações do garçom para gerar seu link de rastreamento e QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="waiter-name">Nome Completo</Label>
              <Input
                id="waiter-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Insira o nome completo do garçom"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waiter-email">Email</Label>
              <Input
                id="waiter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="garcom@exemplo.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="waiter-whatsapp">WhatsApp</Label>
              <Input
                id="waiter-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+5511999999999"
              />
              {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar Garçom"}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {newWaiter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-4">
              <QRCode 
                waiterName={newWaiter.name}
                qrCodeUrl={newWaiter.qrCodeUrl}
                trackingLink={newWaiter.trackingLink}
                googleReviewUrl={googleReviewUrl}
              />
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button variant="ghost" onClick={handleCloseQrCode}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
