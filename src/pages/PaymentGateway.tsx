
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard } from 'lucide-react';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do cartão",
        variant: "destructive",
      });
      return;
    }
    
    // Simulação de processamento de pagamento
    setIsProcessing(true);
    
    // Simulando uma chamada de API
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      toast({
        title: "Cartão configurado com sucesso!",
        description: "Seu método de pagamento foi configurado para quando o período gratuito terminar.",
        variant: "success",
      });
      
      // Redirecionamento para o dashboard após sucesso
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 2000);
  };
  
  // Formatação do número do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Formatação da data de expiração
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">Configuração de Pagamento</CardTitle>
            <CardDescription className="text-center">
              Configure seu cartão para quando o período gratuito de 14 dias terminar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-xl font-medium">Pagamento Configurado!</h3>
                <p className="text-gray-600">
                  Seu método de pagamento foi configurado com sucesso para quando seu período gratuito terminar.
                </p>
                <p className="text-sm text-gray-500">
                  Você será redirecionado para o dashboard automaticamente...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Você só será cobrado após os 14 dias de teste.
                    Valor mensal: R$49,90
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número do Cartão</Label>
                  <div className="relative">
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="pl-10"
                    />
                    <CreditCard className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cardholder">Nome no Cartão</Label>
                  <Input
                    id="cardholder"
                    placeholder="Nome como está no cartão"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processando..." : "Confirmar Cartão"}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-2">
                  Suas informações de pagamento estão seguras e criptografadas.
                  <br />Você não será cobrado até que o período gratuito termine.
                </p>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-auto">
                <img src="/placeholder.svg" alt="Secure Payment" className="h-full" />
              </div>
              <p className="text-xs text-gray-500">Pagamento seguro e criptografado</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGateway;
