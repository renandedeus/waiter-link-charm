
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { logAccess } from '@/contexts/auth/utils';
import { useAuth } from '@/contexts/auth';

const PaymentRedirect = () => {
  const [paymentCountdown, setPaymentCountdown] = useState(5);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setPaymentCountdown((prev) => prev - 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (paymentCountdown === 0) {
      // Registrar o evento de redirecionamento para pagamento
      const logRedirect = async () => {
        try {
          await logAccess('payment_redirect', user?.id);
        } catch (err) {
          console.error('Erro ao registrar redirecionamento de pagamento:', err);
        }
      };
      
      logRedirect();
      
      toast({
        title: "Redirecionando para pagamento",
        description: "Configurando seu método de pagamento para quando o período gratuito terminar.",
      });
      
      // Redirecionar para a página de pagamento
      navigate("/payment-gateway");
    }
  }, [paymentCountdown, navigate, toast, user]);

  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-300">
        <InfoIcon className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Seu período de teste de <strong>14 dias gratuitos</strong> foi ativado!
        </AlertDescription>
      </Alert>
      <div className="text-center py-4">
        <div className="mb-4 text-xl font-medium">Redirecionando para configuração de pagamento...</div>
        <div className="text-sm text-gray-500 mb-2">
          Para garantir acesso contínuo após o período de teste, configuraremos seu método de pagamento agora.
          Você só será cobrado após os 14 dias gratuitos.
        </div>
        <div className="text-lg font-medium mt-4">Redirecionando em {paymentCountdown}s</div>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="text-sm font-medium mb-2">Detalhes do plano:</div>
        <div className="flex justify-between mb-1">
          <span>Período de teste:</span>
          <span className="font-medium">14 dias</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Valor após período de teste:</span>
          <span className="font-medium">R$49,90/mês</span>
        </div>
        <div className="flex justify-between">
          <span>Cobrança:</span>
          <span className="font-medium">Mensal, automática</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentRedirect;
