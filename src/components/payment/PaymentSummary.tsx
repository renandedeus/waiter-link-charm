
import { Info } from 'lucide-react';
import { PaymentResponse } from '@/types/payment';
import StripePaymentForm from '@/components/payment/StripePaymentForm';

interface PaymentSummaryProps {
  selectedPlan: string;
  paymentResponse: PaymentResponse | null;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentSummary = ({ 
  selectedPlan, 
  paymentResponse, 
  onPaymentSuccess, 
  onCancel 
}: PaymentSummaryProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="bg-teal-50 border border-teal-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-teal-800">
              <strong>Pagamento Seguro:</strong> Seus dados de cartão são criptografados e processados diretamente pelo Stripe, não armazenamos informações sensíveis.
            </p>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-slate-800">
          {selectedPlan === 'mensal' ? 'Plano Mensal' : 
           selectedPlan === 'semestral' ? 'Plano Semestral' : 'Plano Anual'}
        </h3>
        
        <p className="text-sm text-slate-600 mb-6">
          {selectedPlan === 'mensal' 
            ? 'Pagamento mensal recorrente de R$ 97,00'
            : selectedPlan === 'semestral'
            ? 'Pagamento único em 6x de R$ 87,00 (R$ 522,00)'
            : 'Pagamento único em 12x de R$ 67,00 (R$ 804,00)'}
        </p>
        
        {paymentResponse && (
          <StripePaymentForm
            clientSecret={paymentResponse.clientSecret}
            paymentType={paymentResponse.paymentType}
            amount={paymentResponse.amount}
            planType={selectedPlan}
            priceId={paymentResponse.priceId}
            onPaymentSuccess={onPaymentSuccess}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSummary;
