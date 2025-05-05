
import { loadStripe } from '@stripe/stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';

// Initialize Stripe with the public key directly
// This key is hardcoded to ensure it's always available
const stripePublicKey = 'pk_live_51QsRHwQ1OA5iIhkTsFOcfyvuSOLO47x407njqPNpBH2NvJcm8fGzDqeu0c9dnusvYVOdGL41N0plEMMhdznuwjKn00Im4e51uk';
export const stripePromise = loadStripe(stripePublicKey);

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / 100);
};

export const getStripeElementsOptions = (clientSecret: string): StripeElementsOptions => {
  return {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#14b8a6', // teal-500
        colorBackground: '#ffffff',
        colorText: '#334155', // slate-700
        colorDanger: '#ef4444', // red-500
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px'
      }
    },
    clientSecret
  };
};
