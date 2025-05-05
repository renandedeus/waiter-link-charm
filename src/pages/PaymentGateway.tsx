
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth';
import { logAccess } from '@/contexts/auth/utils';
import DebugInfo from '@/components/payment/DebugInfo';
import PlanSelector from '@/components/payment/PlanSelector';
import PaymentSummary from '@/components/payment/PaymentSummary';
import PaymentSuccess from '@/components/payment/PaymentSuccess';
import { usePaymentProcess } from '@/hooks/usePaymentProcess';

const PaymentGateway = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const canceled = searchParams.get('canceled') === 'true';

  const {
    isProcessing,
    isSuccess,
    selectedPlan,
    activeTab,
    paymentResponse,
    error,
    debugInfo,
    handlePlanChange,
    handleRetry,
    handleCreatePaymentIntent,
    handlePaymentSuccess,
    handleCancel,
    checkStripeKey
  } = usePaymentProcess(user?.id);

  // Check if Stripe key is available
  useEffect(() => {
    // Ensure key is available - the constant is hardcoded in the hook
    checkStripeKey();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-4xl">
        <Card className="shadow-md border-slate-200 bg-white">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-800 text-center">Selecione seu plano</CardTitle>
            <CardDescription className="text-center text-slate-600">
              Escolha o plano que melhor atende às suas necessidades
            </CardDescription>
            <DebugInfo message={debugInfo} />
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <PaymentSuccess />
            ) : (
              <Tabs value={activeTab} onValueChange={(value) => activeTab !== 'payment' && value !== 'payment'}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                  <TabsTrigger 
                    value="select-plan" 
                    disabled={activeTab === 'payment'}
                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600"
                  >
                    Escolher Plano
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payment" 
                    disabled={!paymentResponse || activeTab !== 'payment'}
                    className="data-[state=active]:bg-white data-[state=active]:text-teal-600"
                  >
                    Pagamento
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="select-plan">
                  <PlanSelector 
                    selectedPlan={selectedPlan}
                    onPlanChange={handlePlanChange}
                    onContinue={handleCreatePaymentIntent}
                    isProcessing={isProcessing}
                    error={error}
                    onRetry={handleRetry}
                  />
                </TabsContent>
                
                <TabsContent value="payment">
                  <PaymentSummary
                    selectedPlan={selectedPlan}
                    paymentResponse={paymentResponse}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCancel={handleCancel}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-100 bg-slate-50">
            <div className="flex items-center space-x-2">
              <img 
                src="https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/1x1/br.svg" 
                alt="Brazil flag" 
                className="w-5 h-5" 
              />
              <p className="text-xs text-slate-500">Pagamento processado em Real Brasileiro (BRL)</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGateway;
