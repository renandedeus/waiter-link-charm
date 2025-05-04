
import { useEffect, useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Inicialize o Stripe com a chave pública
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      let result;
      
      if (paymentType === 'payment') {
        result = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });
        
        if (result.error) {
          setMessage(result.error.message || 'Ocorreu um erro ao processar o pagamento.');
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
          setMessage('Ocorreu um erro ao verificar o status do pagamento.');
          setIsLoading(false);
          return;
        }
      } else if (paymentType === 'subscription') {
        result = await stripe.confirmSetup({
          elements,
          redirect: 'if_required',
        });
        
        if (result.error) {
          setMessage(result.error.message || 'Ocorreu um erro ao configurar o pagamento.');
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
          setMessage('Ocorreu um erro ao ativar a assinatura.');
          setIsLoading(false);
          return;
        }
      }

      setIsSuccess(true);
      setMessage('Pagamento processado com sucesso!');
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    } catch (error) {
      setMessage('Ocorreu um erro inesperado ao processar o pagamento.');
      console.error('Erro ao processar pagamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
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
            `Pagar ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / 100)}`
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
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const StripePaymentForm = ({
  clientSecret,
  paymentType,
  amount,
  planType,
  priceId,
  onPaymentSuccess,
  onCancel
}: StripePaymentFormProps) => {
  if (!clientSecret) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: 'pt-BR' }}>
      <PaymentForm 
        clientSecret={clientSecret}
        paymentType={paymentType}
        amount={amount}
        planType={planType}
        priceId={priceId}
        onPaymentSuccess={onPaymentSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripePaymentForm;
