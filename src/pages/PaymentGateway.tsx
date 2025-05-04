
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('mensal');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const canceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    if (canceled) {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento. Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
    }
  }, [canceled, toast]);

  const handleStripeCheckout = async (planType) => {
    setIsProcessing(true);
    
    try {
      console.log('Iniciando checkout para plano:', planType);
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planType }
      });
      
      if (error) {
        console.error('Erro na invocação da função:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }
      
      console.log('Resposta da função create-subscription:', data);
      
      if (data?.url) {
        setIsRedirecting(true);
        console.log('Redirecionando para URL:', data.url);
        // Pequeno delay antes do redirecionamento para garantir que o estado seja atualizado
        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        throw new Error('Não foi possível obter o link de pagamento');
      }
    } catch (error) {
      console.error('Erro ao redirecionar para o Stripe:', error);
      toast({
        title: "Erro no processamento",
        description: error.message || "Ocorreu um erro ao processar sua solicitação de pagamento",
        variant: "destructive",
      });
      setIsProcessing(false);
      setIsRedirecting(false);
    }
  };

  const planDetails = [
    {
      id: 'mensal',
      name: 'Plano Mensal',
      price: 'R$ 97,00',
      billingCycle: 'por mês',
      description: 'Pagamento mensal recorrente',
      recommended: false
    },
    {
      id: 'semestral',
      name: 'Plano Semestral',
      price: 'R$ 87,00',
      billingCycle: '6x de R$ 87,00 no cartão',
      description: 'Pagamento único de R$ 522,00',
      recommended: false
    },
    {
      id: 'anual',
      name: 'Plano Anual',
      price: 'R$ 49,90',
      billingCycle: '6x de R$ 49,90 no cartão',
      description: 'Pagamento único de R$ 299,40',
      recommended: true
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">Configuração de Pagamento</CardTitle>
            <CardDescription className="text-center">
              Escolha seu plano e configure seu pagamento
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
                  Seu método de pagamento foi configurado com sucesso.
                </p>
                <p className="text-sm text-gray-500">
                  Você será redirecionado para o dashboard automaticamente...
                </p>
              </div>
            ) : isRedirecting ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
                <h3 className="text-xl font-medium">Redirecionando para o checkout...</h3>
                <p className="text-gray-600">
                  Você está sendo redirecionado para nossa plataforma de pagamento segura.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Escolha seu plano</h3>
                  <RadioGroup 
                    defaultValue="mensal" 
                    value={selectedPlan}
                    onValueChange={setSelectedPlan} 
                    className="grid gap-4 grid-cols-1 md:grid-cols-3"
                  >
                    {planDetails.map(plan => (
                      <div key={plan.id} className={`relative rounded-lg border p-4 ${plan.recommended ? 'ring-2 ring-primary' : ''}`}>
                        {plan.recommended && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs py-1 px-3 rounded-full">
                            Mais popular
                          </div>
                        )}
                        <RadioGroupItem 
                          value={plan.id} 
                          id={plan.id}
                          className="absolute right-4 top-4"
                        />
                        <div className="mb-2">
                          <h4 className="font-medium">{plan.name}</h4>
                          <div className="mt-1">
                            <span className="text-2xl font-bold">{plan.price}</span>
                            <span className="text-gray-500 text-sm"> {plan.billingCycle}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> Você será redirecionado para o nosso gateway de pagamento seguro para finalizar sua transação.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleStripeCheckout(selectedPlan)} 
                  className="w-full mt-6" 
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processando..." : "Continuar para o Pagamento"}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Suas informações de pagamento estão seguras e criptografadas.
                </p>
              </>
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
