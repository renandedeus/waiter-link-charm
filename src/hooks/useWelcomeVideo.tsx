
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

export const useWelcomeVideo = () => {
  const [searchParams] = useSearchParams();
  const [showWelcomeVideo, setShowWelcomeVideo] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const selectedPlan = searchParams.get('plan');
  
  // Verificar se o usuário está chegando após um pagamento bem-sucedido
  useEffect(() => {
    if (paymentSuccess) {
      setShowWelcomeVideo(true);
      if (selectedPlan) {
        toast({
          title: `Plano ${selectedPlan} ativado com sucesso!`,
          description: "Seu pagamento foi processado com sucesso. Aproveite todos os recursos do Waiter Link!",
          variant: "success",
        });
      }
    }
  }, [paymentSuccess, selectedPlan, toast]);
  
  const handleCloseVideoModal = () => {
    setShowWelcomeVideo(false);
  };

  return {
    showWelcomeVideo,
    handleCloseVideoModal
  };
};
