
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { stripePromise, getStripeElementsOptions } from '@/utils/stripeUtils';
import PaymentForm from './PaymentForm';

interface StripePaymentFormProps {
  clientSecret: string;
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
  // Get the elements options with the client secret
  const options = getStripeElementsOptions(clientSecret);

  return (
    <Elements stripe={stripePromise} options={options}>
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
