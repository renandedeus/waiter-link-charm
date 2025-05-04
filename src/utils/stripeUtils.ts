
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key directly
// This key is hardcoded to ensure it's always available
const stripePublicKey = 'pk_live_51QsRHwQ1OA5iIhkTsFOcfyvuSOLO47x407njqPNpBH2NvJcm8fGzDqeu0c9dnusvYVOdGL41N0plEMMhdznuwjKn00Im4e51uk';
export const stripePromise = loadStripe(stripePublicKey);

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / 100);
};

export const getStripeElementsOptions = (clientSecret: string) => {
  return {
    clientSecret,
    locale: 'pt-BR',
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#ff4800',
        colorBackground: '#ffffff',
        colorText: '#16142a',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px'
      }
    }
  };
};
