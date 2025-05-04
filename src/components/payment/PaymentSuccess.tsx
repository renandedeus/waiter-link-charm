
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h3 className="text-xl font-medium">Pagamento Concluído!</h3>
      <p className="text-gray-600">
        Seu acesso ao sistema foi liberado com sucesso.
      </p>
      <p className="text-sm text-gray-500">
        Você será redirecionado para o dashboard automaticamente...
      </p>
    </div>
  );
};

export default PaymentSuccess;
