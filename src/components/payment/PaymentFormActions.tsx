
import React from 'react';
import { Button } from '../ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/stripeUtils';

interface PaymentFormActionsProps {
  isLoading: boolean;
  isSuccess: boolean;
  amount: number;
  onCancel: () => void;
  isStripeReady: boolean;
}

const PaymentFormActions = ({ 
  isLoading, 
  isSuccess, 
  amount, 
  onCancel, 
  isStripeReady 
}: PaymentFormActionsProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Button 
        type="submit" 
        disabled={!isStripeReady || isLoading || isSuccess}
        className="w-full bg-teal-600 hover:bg-teal-700"
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
          `Pagar ${formatCurrency(amount)}`
        )}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isLoading || isSuccess}
        className="border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        Voltar
      </Button>
      
      <p className="text-xs text-center text-slate-500 mt-4">
        Seus dados de pagamento são processados com segurança pelo Stripe.
      </p>
    </div>
  );
};

export default PaymentFormActions;
