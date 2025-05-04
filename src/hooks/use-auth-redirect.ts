
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export const useAuthRedirect = (setError: (error: string) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDescription = hashParams.get('error_description');
    const accessToken = hashParams.get('access_token');
    
    if (errorDescription) {
      setError(decodeURIComponent(errorDescription));
      toast({
        title: "Erro na autenticação",
        description: decodeURIComponent(errorDescription),
        variant: "destructive",
      });
    } else if (accessToken) {
      toast({
        title: "Autenticado com sucesso",
        description: "Você será redirecionado para o dashboard.",
        variant: "success",
      });
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  }, [navigate, toast, setError]);
};
