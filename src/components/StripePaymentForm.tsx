
import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logAccess } from '@/contexts/auth/utils';

// Initialize Stripe with the public key directly
// This key is hardcoded to ensure it's always available
const stripePublicKey = 'pk_live_51QsRHwQ1OA5iIhkTsFOcfyvuSOLO47x407njqPNpBH2NvJcm8fGzDqeu0c9dnusvYVOdGL41N0plEMMhdznuwjKn00Im4e51uk';
const stripePromise = loadStripe(stripePublicKey);

interface PaymentFormProps {
  clientSecret: string;
  paymentType: 'payment' | 'subscription';
  amount: number;
  planType: string;
  priceId?: string;
  installments: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ 
  clientSecret, 
  paymentType, 
  amount, 
  planType, 
  priceId,
  installments,
  onPaymentSuccess, 
  onCancel 
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Fetch user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    
    getUserEmail();
  }, []);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }
  }, [stripe, clientSecret]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("O Stripe ainda não está inicializado. Por favor, aguarde um momento.");
      return;
    }

    if (!userEmail) {
      setMessage("Não foi possível obter seu email. Por favor, faça login novamente.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (userId) {
        await logAccess('payment_submission', userId, false);
      }
      
      let result;
      
      if (paymentType === 'payment') {
        result = await stripe.confirmPayment({
          elements,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                email: userEmail
              }
            }
          },
          redirect: 'if_required',
        });
        
        if (result.error) {
          if (userId) {
            await logAccess('payment_error', userId, false);
          }
          
          setMessage(result.error.message || 'Ocorreu um erro ao processar o pagamento.');
          console.error('Erro ao processar pagamento:', result.error);
          setIsLoading(false);
          return;
        }
        
        // Notificar o servidor sobre o pagamento bem-sucedido
        const { data, error } = await supabase.functions.invoke('update-payment-status', {
          body: { 
            paymentIntentId: result.paymentIntent.id, 
            paymentType: 'payment',
            installments
          }
        });
        
        if (error || !data.success) {
          if (userId) {
            await logAccess('payment_verification_error', userId, false);
          }
          
          setMessage('Ocorreu um erro ao verificar o status do pagamento.');
          setIsLoading(false);
          return;
        }
        
        if (userId) {
          await logAccess('payment_success', userId, false);
        }
      } else if (paymentType === 'subscription') {
        result = await stripe.confirmSetup({
          elements,
          confirmParams: {
            payment_method_data: {
              billing_details: {
                email: userEmail
              }
            }
          },
          redirect: 'if_required',
        });
        
        if (result.error) {
          if (userId) {
            await logAccess('subscription_error', userId, false);
          }
          
          setMessage(result.error.message || 'Ocorreu um erro ao configurar o pagamento.');
          console.error('Erro na assinatura:', result.error);
          setIsLoading(false);
          return;
        }
        
        // Notificar o servidor para criar a assinatura
        const { data, error } = await supabase.functions.invoke('update-payment-status', {
          body: { 
            setupIntentId: result.setupIntent.id, 
            paymentType: 'subscription',
            priceId 
          }
        });
        
        if (error || !data.success) {
          if (userId) {
            await logAccess('subscription_verification_error', userId, false);
          }
          
          setMessage('Ocorreu um erro ao ativar a assinatura.');
          setIsLoading(false);
          return;
        }
        
        if (userId) {
          await logAccess('subscription_success', userId, false);
        }
      }

      setIsSuccess(true);
      setMessage('Pagamento processado com sucesso!');
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setMessage('Ocorreu um erro inesperado ao processar o pagamento.');
      
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.id) {
        await logAccess('payment_unexpected_error', userData.user.id, false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Format payment amount to display with installments if applicable
  const formatPaymentAmount = () => {
    const formattedTotal = new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(amount / 100);
    
    if (installments > 1) {
      const installmentAmount = (amount / 100) / installments;
      const formattedInstallment = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(installmentAmount);
      
      return `${installments}x de ${formattedInstallment}`;
    }
    
    return formattedTotal;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{
        layout: {
          type: 'tabs',
          defaultCollapsed: false
        },
        fields: {
          billingDetails: {
            name: 'auto',
            email: 'never'
          }
        }
      }} />
      
      {message && (
        <Alert variant={isSuccess ? "default" : "destructive"} className={isSuccess ? "bg-green-50 border-green-200" : ""}>
          <AlertDescription className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col gap-3">
        <Button 
          type="submit" 
          disabled={!stripe || !elements || isLoading || isSuccess}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pagamento Aprovado
            </>
          ) : (
            `Pagar ${formatPaymentAmount()}`
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isSuccess}
        >
          Voltar
        </Button>
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-4">
        Seus dados de pagamento são processados com segurança pelo Stripe.
      </p>
    </form>
  );
};

interface StripePaymentFormProps {
  clientSecret: string | null;
  paymentType: 'payment' | 'subscription';
  amount: number;
  planType: string;
  priceId?: string;
  installments?: number;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentForm = ({
  clientSecret,
  paymentType,
  amount,
  planType,
  priceId,
  installments = 1,
  onPaymentSuccess,
  onCancel
}: StripePaymentFormProps) => {
  if (!stripePromise) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription className="flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          Erro de configuração: Chave pública do Stripe não encontrada.
        </AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ 
      clientSecret, 
      locale: 'pt-BR',
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#10b981',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#ef4444',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px'
        }
      }
    }}>
      <PaymentForm 
        clientSecret={clientSecret}
        paymentType={paymentType}
        amount={amount}
        planType={planType}
        priceId={priceId}
        installments={installments}
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentForm;
