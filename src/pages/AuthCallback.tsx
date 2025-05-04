
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { logAccess } from '@/contexts/auth/utils';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error || errorDescription) {
          setMessage(`Erro de autenticação: ${errorDescription || error}`);
          toast({
            title: "Erro de autenticação",
            description: errorDescription || "Ocorreu um erro durante a autenticação",
            variant: "destructive",
          });
          
          // Redirecionar para a página inicial após alguns segundos
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Se não houver erro e o usuário estiver autenticado, redirecionar para o dashboard
        if (user) {
          await logAccess('auth_callback_success', user.id);
          setMessage('Autenticação bem-sucedida! Redirecionando...');
          toast({
            title: "Autenticação bem-sucedida",
            description: "Você será redirecionado para o painel",
            variant: "success",
          });
          navigate('/payment-gateway');
        } else {
          // Se o usuário não estiver autenticado, redirecionar para a página inicial
          setMessage('Sessão não detectada. Redirecionando para a página inicial...');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Erro ao processar callback de autenticação:', error);
        setMessage('Ocorreu um erro ao processar a autenticação');
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar a autenticação",
          variant: "destructive",
        });
        
        // Redirecionar para a página inicial após alguns segundos
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processAuthCallback();
  }, [navigate, searchParams, toast, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h1 className="text-2xl font-bold mb-4">Autenticando</h1>
        <p className="text-gray-600 mb-4">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
