
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthRedirect = (setError: (error: string) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar parâmetros de URL após redirecionamento de autenticação
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
      // Salvar o token na sessão do Supabase
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || '',
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao definir sessão:', error);
          toast({
            title: "Erro ao finalizar login",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Autenticado com sucesso",
            description: "Você será redirecionado para o dashboard.",
            variant: "success",
          });
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      });
    }
  }, [navigate, toast, setError]);
};
