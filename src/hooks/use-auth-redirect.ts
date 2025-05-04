
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthRedirect = (setError: (error: string) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Parse hash parameters for authentication redirects
    const parseHashParams = () => {
      if (!window.location.hash) return null;
      
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const params: Record<string, string> = {};
      
      for (const [key, value] of hashParams.entries()) {
        params[key] = value;
      }
      
      // Log params for debugging (excluding sensitive values)
      console.log('[Auth Debug] Hash params found:', 
        Object.keys(params).length > 0 ? 
        Object.keys(params).filter(k => !k.includes('token')) : 
        'none');
      
      return params;
    };

    const handleAuthRedirect = async () => {
      const params = parseHashParams();
      
      if (!params) return;
      
      const errorDescription = params.error_description;
      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      
      if (errorDescription) {
        console.error('[Auth Debug] Auth error:', decodeURIComponent(errorDescription));
        setError(decodeURIComponent(errorDescription));
        toast({
          title: "Erro na autenticação",
          description: decodeURIComponent(errorDescription),
          variant: "destructive",
        });
        
        // Clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
      } else if (accessToken) {
        console.log('[Auth Debug] Access token found in URL, setting session');
        
        try {
          // Set the session with the tokens from the URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error('[Auth Debug] Error setting session:', error);
            toast({
              title: "Erro ao finalizar login",
              description: error.message,
              variant: "destructive",
            });
          } else {
            console.log('[Auth Debug] Session set successfully');
            toast({
              title: "Autenticado com sucesso",
              description: "Você será redirecionado para o dashboard.",
              variant: "success",
            });
            
            // Remove hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect after a short delay
            setTimeout(() => navigate('/dashboard'), 1000);
          }
        } catch (err) {
          console.error('[Auth Debug] Unexpected error during auth:', err);
          setError('Erro inesperado durante a autenticação');
        }
      }
    };

    handleAuthRedirect();
  }, [navigate, toast, setError]);
};
