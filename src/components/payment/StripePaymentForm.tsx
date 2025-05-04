
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, XCircle } from 'lucide-react';
import { stripePromise, getStripeElementsOptions } from '@/utils/stripeUtils';
import PaymentForm from './PaymentForm';

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
    <Elements stripe={stripePromise} options={getStripeElementsOptions(clientSecret)}>
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
