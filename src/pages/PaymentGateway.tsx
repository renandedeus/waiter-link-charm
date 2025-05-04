import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Info, Loader2, CreditCard, AlertTriangle, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StripePaymentForm from '@/components/StripePaymentForm';
import { useAuth } from '@/contexts/auth';
import { logAccess } from '@/contexts/auth/utils';

interface PaymentResponse {
  clientSecret: string;
  customerId: string;
  paymentType: 'payment' | 'subscription';
  priceId?: string;
  amount: number;
}

const PaymentGateway = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('mensal');
  const [activeTab, setActiveTab] = useState('select-plan');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const canceled = searchParams.get('canceled') === 'true';

  // Check if Stripe key is available (for debugging)
  useEffect(() => {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!stripeKey) {
      setDebugInfo('Chave pública do Stripe não encontrada. Verifique a variável de ambiente VITE_STRIPE_PUBLIC_KEY.');
      console.error('Stripe public key not found in environment variables');
    } else {
      console.log('Stripe public key is configured');
      setDebugInfo(null);
    }
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar logado para acessar esta página",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      // Log payment page access
      await logAccess('payment_page_accessed', user.id);
    };
    
    checkUser();
  }, [navigate, toast, user]);

  useEffect(() => {
    if (canceled) {
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento. Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
    }
  }, [canceled, toast]);

  const handleCreatePaymentIntent = async (planType: string) => {
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para realizar um pagamento",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Iniciando processo de pagamento para plano:', planType);
      await logAccess('payment_initiated', user.id, false);
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planType }
      });
      
      console.log('Resposta da função create-subscription:', data);
      
      if (error) {
        console.error('Erro na invocação da função:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }
      
      if (data?.clientSecret) {
        setPaymentResponse(data);
        setActiveTab('payment');
        await logAccess('payment_form_displayed', user.id, false);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Não foi possível obter os dados de pagamento');
      }
    } catch (error: any) {
      console.error('Erro ao criar intent de pagamento:', error);
      let errorMessage = "Ocorreu um erro ao processar sua solicitação de pagamento";
      
      // Melhorar mensagens de erro para o usuário
      if (error.message.includes('autenticação') || error.message.includes('login')) {
        errorMessage = "Erro de autenticação. Por favor, faça login novamente.";
      } else if (error.message.includes('STRIPE_SECRET_KEY')) {
        errorMessage = "Erro de configuração do servidor. Entre em contato com o suporte.";
      } else if (error.message.includes('Edge Function')) {
        errorMessage = "Erro de comunicação com o servidor. Tente novamente em alguns instantes.";
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      await logAccess('payment_error', user?.id, false);
      
      toast({
        title: "Erro no processamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    
    setIsSuccess(true);
    await logAccess('payment_success', user.id, false);
    
    toast({
      title: "Pagamento bem-sucedido",
      description: "Seu acesso foi liberado! Você será redirecionado para o dashboard.",
      variant: "default",
    });
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleCancel = async () => {
    if (user) {
      await logAccess('payment_canceled', user.id, false);
    }
    
    setPaymentResponse(null);
    setActiveTab('select-plan');
  };

  const handleRetry = () => {
    setError(null);
    // Para casos em que quisermos tentar novamente sem mudar o plano
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
            <CardTitle className="text-xl font-bold text-center">Selecione seu plano</CardTitle>
            <CardDescription className="text-center">
              Escolha o plano que melhor atende às suas necessidades
            </CardDescription>
            {debugInfo && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm text-yellow-800">
                <AlertTriangle className="inline-block w-4 h-4 mr-1" /> 
                {debugInfo}
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="text-xl font-medium">Pagamento Concluído!</h3>
                <p className="text-gray-600">
                  Seu acesso ao sistema foi liberado com sucesso.
                </p>
                <p className="text-sm text-gray-500">
                  Você será redirecionado para o dashboard automaticamente...
                </p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="select-plan" disabled={activeTab === 'payment'}>
                    Escolher Plano
                  </TabsTrigger>
                  <TabsTrigger value="payment" disabled={!paymentResponse || activeTab !== 'payment'}>
                    Pagamento
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="select-plan" className="space-y-4 mt-4">
                  {error && (
                    <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-6">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-red-800">
                            <strong>Erro no processamento:</strong> {error}
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            Por favor, tente novamente ou entre em contato com o suporte.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 text-xs" 
                            onClick={handleRetry}
                          >
                            Tentar novamente
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                
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
                      <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>Importante:</strong> O acesso ao sistema será liberado imediatamente após a confirmação do pagamento.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-md p-3">
                    <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-800">
                      Pagamento seguro processado pela Stripe
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => handleCreatePaymentIntent(selectedPlan)} 
                    className="w-full mt-6" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Continuar para o Pagamento
                      </>
                    )}
                  </Button>
                </TabsContent>
                
                <TabsContent value="payment" className="space-y-4 mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800">
                          <strong>Pagamento Seguro:</strong> Seus dados de cartão são criptografados e processados diretamente pelo Stripe, não armazenamos informações sensíveis.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">
                      {selectedPlan === 'mensal' ? 'Plano Mensal' : 
                       selectedPlan === 'semestral' ? 'Plano Semestral' : 'Plano Anual'}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-6">
                      {selectedPlan === 'mensal' 
                        ? 'Pagamento mensal recorrente de R$ 97,00'
                        : selectedPlan === 'semestral'
                        ? 'Pagamento único em 6x de R$ 87,00 (R$ 522,00)'
                        : 'Pagamento único em 6x de R$ 49,90 (R$ 299,40)'}
                    </p>
                    
                    {paymentResponse && (
                      <StripePaymentForm
                        clientSecret={paymentResponse.clientSecret}
                        paymentType={paymentResponse.paymentType}
                        amount={paymentResponse.amount}
                        planType={selectedPlan}
                        priceId={paymentResponse.priceId}
                        onPaymentSuccess={handlePaymentSuccess}
                        onCancel={handleCancel}
                      />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="flex items-center space-x-2">
              <img 
                src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/1x1/br.svg" 
                alt="Brazil flag" 
                className="w-5 h-5" 
              />
              <p className="text-xs text-gray-500">Pagamento processado em Real Brasileiro (BRL)</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGateway;
