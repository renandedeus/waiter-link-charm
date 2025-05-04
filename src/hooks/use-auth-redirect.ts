
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAuthRedirect = (setError: (error: string) => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for authentication in URL (both hash and query params)
    const handleAuthRedirect = async () => {
      // First check for hash parameters (implicit grant flow)
      if (window.location.hash) {
        console.log('[Auth Debug] Hash detected in URL, processing...');
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorDescription = hashParams.get('error_description');
        
        if (errorDescription) {
          console.error('[Auth Debug] Auth error from hash:', decodeURIComponent(errorDescription));
          setError(decodeURIComponent(errorDescription));
          toast({
            title: "Erro na autenticação",
            description: decodeURIComponent(errorDescription),
            variant: "destructive",
          });
          
          // Clean up the URL
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
        
        if (accessToken) {
          console.log('[Auth Debug] Access token found in URL hash, setting session');
          
          try {
            // Set the session with the tokens from the URL
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (error) {
              console.error('[Auth Debug] Error setting session from hash:', error);
              toast({
                title: "Erro ao finalizar login",
                description: error.message,
                variant: "destructive",
              });
              return;
            }
            
            console.log('[Auth Debug] Session set successfully from hash');
            toast({
              title: "Autenticado com sucesso",
              description: "Você será redirecionado para o dashboard.",
              variant: "success",
            });
            
            // Remove hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Redirect after a short delay
            setTimeout(() => navigate('/dashboard'), 1000);
          } catch (err) {
            console.error('[Auth Debug] Unexpected error during hash auth:', err);
            setError('Erro inesperado durante a autenticação');
          }
          return;
        }
      }
      
      // Also check for query parameters (code flow)
      const queryParams = new URLSearchParams(window.location.search);
      const code = queryParams.get('code');
      const error = queryParams.get('error');
      const errorDescription = queryParams.get('error_description');
      
      if (error || errorDescription) {
        console.error('[Auth Debug] Auth error from query:', errorDescription);
        setError(errorDescription || error || 'Erro desconhecido na autenticação');
        toast({
          title: "Erro na autenticação",
          description: errorDescription || error || 'Erro desconhecido',
          variant: "destructive",
        });
        
        // Clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
        return;
      }
      
      if (code) {
        console.log('[Auth Debug] Auth code found in URL, exchanging for session');
        // The Supabase client will automatically exchange the code for a session
        
        // Clean up the URL
        window.history.replaceState(null, '', window.location.pathname);
        
        // Check if we got a valid session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth Debug] Error getting session after code exchange:', error);
          return;
        }
        
        if (data.session) {
          console.log('[Auth Debug] Session established after code exchange');
          toast({
            title: "Autenticado com sucesso",
            description: "Você será redirecionado para o dashboard.",
            variant: "success",
          });
          
          // Redirect after a short delay
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      }
    };

    handleAuthRedirect();
  }, [navigate, toast, setError]);
};
