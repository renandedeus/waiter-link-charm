
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { logAccess } from '@/contexts/auth/utils';
import { PaymentResponse } from '@/types/payment';
import { useNavigate } from 'react-router-dom';

// Define the Stripe key directly in the module
const STRIPE_PUBLIC_KEY = 'pk_live_51QsRHwQ1OA5iIhkTsFOcfyvuSOLO47x407njqPNpBH2NvJcm8fGzDqeu0c9dnusvYVOdGL41N0plEMMhdznuwjKn00Im4e51uk';

export const usePaymentProcess = (userId: string | undefined) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('mensal');
  const [activeTab, setActiveTab] = useState('select-plan');
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Check if Stripe key is available (for debugging)
  const checkStripeKey = () => {
    if (!STRIPE_PUBLIC_KEY) {
      setDebugInfo('Chave pública do Stripe não encontrada.');
      console.error('Stripe public key not found');
      return false;
    } else {
      console.log('Stripe public key is configured');
      setDebugInfo(null);
      return true;
    }
  };

  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan);
  };

  const handleRetry = () => {
    setError(null);
  };

  const handleCreatePaymentIntent = async () => {
    if (!userId) {
      toast({
        title: "Não autenticado",
        description: "Você precisa estar logado para realizar um pagamento",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Verify Stripe key before proceeding
    if (!checkStripeKey()) {
      setError("Chave pública do Stripe não encontrada. Entre em contato com o suporte.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Iniciando processo de pagamento para plano:', selectedPlan);
      await logAccess('payment_initiated', userId, false);
      
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { planType: selectedPlan }
      });
      
      console.log('Resposta da função create-subscription:', data);
      
      if (error) {
        console.error('Erro na invocação da função:', error);
        throw new Error(error.message || 'Erro ao processar pagamento');
      }
      
      if (data?.clientSecret) {
        setPaymentResponse(data);
        setActiveTab('payment');
        await logAccess('payment_form_displayed', userId, false);
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
      await logAccess('payment_error', userId, false);
      
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
    if (!userId) return;
    
    setIsSuccess(true);
    await logAccess('payment_success', userId, false);
    
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
    if (userId) {
      await logAccess('payment_canceled', userId, false);
    }
    
    setPaymentResponse(null);
    setActiveTab('select-plan');
  };

  return {
    isProcessing,
    isSuccess,
    selectedPlan,
    activeTab,
    paymentResponse,
    error,
    debugInfo,
    setSelectedPlan,
    setActiveTab,
    checkStripeKey,
    handlePlanChange,
    handleRetry,
    handleCreatePaymentIntent,
    handlePaymentSuccess,
    handleCancel
  };
};
