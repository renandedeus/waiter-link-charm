
import { Info } from 'lucide-react';
import { PaymentResponse } from '@/types/payment';
import StripePaymentForm from '@/components/StripePaymentForm';

interface PaymentSummaryProps {
  selectedPlan: string;
  paymentResponse: PaymentResponse | null;
  onPaymentSuccess: () => void;
  onCancel: () => void;
  installments?: number;
}

const PaymentSummary = ({ 
  selectedPlan, 
  paymentResponse, 
  onPaymentSuccess, 
  onCancel,
  installments = 1
}: PaymentSummaryProps) => {
  // Calculate installment amount and total
  let totalAmount = 0;
  let installmentAmount = 0;
  
  if (selectedPlan === 'semestral') {
    totalAmount = 522;
  } else if (selectedPlan === 'anual') {
    totalAmount = 804;
  } else {
    totalAmount = 97;
  }
  
  installmentAmount = installments > 0 ? totalAmount / installments : totalAmount;
  
  return (
    <div className="space-y-4 mt-4">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Pagamento Seguro:</strong> Seus dados de cartão são criptografados e processados diretamente pelo Stripe, não armazenamos informações sensíveis.
            </p>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">
          {selectedPlan === 'mensal' ? 'Plano Mensal' : 
           selectedPlan === 'semestral' ? 'Plano Semestral' : 'Plano Anual'}
        </h3>
        
        <div className="space-y-4 mb-6">
          {selectedPlan === 'mensal' ? (
            <p className="text-sm text-gray-600">
              Pagamento mensal recorrente de R$ 97,00
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                {selectedPlan === 'semestral' ? 'Pagamento único de R$ 522,00' : 'Pagamento único de R$ 804,00'}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-md border">
                <p className="text-sm font-medium">
                  Forma de pagamento: {installments === 1 ? 'À vista' : `Parcelado em ${installments}x`}
                </p>
                {installments > 1 && (
                  <p className="text-sm text-gray-600">
                    {installments}x de R$ {installmentAmount.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
        
        {paymentResponse && (
          <StripePaymentForm
            clientSecret={paymentResponse.clientSecret}
            paymentType={paymentResponse.paymentType}
            amount={paymentResponse.amount}
            planType={selectedPlan}
            priceId={paymentResponse.priceId}
            installments={installments}
            onPaymentSuccess={onPaymentSuccess}
            onCancel={onCancel}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentSummary;
