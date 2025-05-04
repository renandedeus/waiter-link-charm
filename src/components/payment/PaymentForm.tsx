
import { useEffect, useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { logAccess } from '@/contexts/auth/utils';
import PaymentFormStatus from './PaymentFormStatus';
import PaymentFormActions from './PaymentFormActions';

interface PaymentFormProps {
  clientSecret: string;
  paymentType: 'payment' | 'subscription';
  amount: number;
  planType: string;
  priceId?: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({ 
  clientSecret, 
  paymentType, 
  amount, 
  planType, 
  priceId,
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
            paymentType: 'payment' 
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
      
      <PaymentFormStatus message={message} isSuccess={isSuccess} />
      
      <PaymentFormActions 
        isLoading={isLoading}
        isSuccess={isSuccess}
        amount={amount}
        onCancel={onCancel}
        isStripeReady={Boolean(stripe && elements)}
      />
    </form>
  );
};

export default PaymentForm;
