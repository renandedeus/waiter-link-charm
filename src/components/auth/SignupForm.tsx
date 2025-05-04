
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logAccess } from '@/contexts/auth/utils';

type SignupFormProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  setShowPaymentRedirect: (show: boolean) => void;
  setActiveTab: (tab: string) => void;
  error: string;
  setError: (error: string) => void;
  setInfoMessage: (message: string) => void;
};

const SignupForm = ({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  setShowPaymentRedirect,
  setActiveTab,
  error,
  setError,
  setInfoMessage,
}: SignupFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get current site URL for redirects
  const getSiteURL = () => {
    return window.location.origin;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!email || !password || !name) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Tentando registro com email:", email);
      console.log("URL de redirecionamento:", getSiteURL());
      
      // Primeiro tentamos registrar o usuário diretamente
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${getSiteURL()}/auth-callback`,
        },
      });
      
      if (error) {
        // Se o erro não for porque o usuário já existe
        if (!error.message.includes('already been registered')) {
          setError(error.message || 'Erro ao criar conta');
          toast({
            title: "Falha no cadastro",
            description: error.message || 'Não foi possível criar sua conta',
            variant: "destructive",
          });
        } else {
          // Usuário já existe, tentar fazer login
          const { error: signInError } = await signIn(email, password);
          
          if (signInError) {
            // Se não conseguir fazer login, provavelmente precisa confirmar o email
            setActiveTab('login');
            setInfoMessage('Este email já está registrado. Por favor, confirme seu email para fazer login.');
            toast({
              title: "Email já registrado",
              description: "Este email já está registrado. Por favor, confirme seu email para fazer login.",
              variant: "info",
            });
          } else {
            // Login bem-sucedido, registre este acesso
            try {
              await logAccess('login_existing_user');
              
              // Redirecionar para o processo de escolha de plano
              toast({
                title: "Login realizado com sucesso",
                description: "Você será redirecionado para escolher um plano",
                variant: "success",
              });
              
              // Redirecionamento direto para a página de pagamento
              setTimeout(() => {
                navigate('/payment-gateway');
              }, 1500);
            } catch (logError) {
              console.error("Erro ao registrar acesso:", logError);
            }
          }
        }
      } else if (data?.user) {
        // Se o registro foi bem-sucedido
        if (data.user.identities?.length === 0) {
          toast({
            title: "Email já registrado",
            description: "Este email já está registrado. Por favor, faça login.",
            variant: "info",
          });
          setActiveTab('login');
        } else {
          // Registrar o acesso do novo usuário
          try {
            await logAccess('signup_success', data.user.id);
          } catch (logError) {
            console.error("Erro ao registrar acesso de signup:", logError);
          }
          
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Você tem 14 dias gratuitos. Você será redirecionado para configurar seu método de pagamento.",
            variant: "success",
          });
          
          // Iniciar contagem regressiva para redirecionamento
          setShowPaymentRedirect(true);
        }
      }
    } catch (err) {
      console.error('Erro no signup:', err);
      setError('Ocorreu um erro inesperado');
      toast({
        title: "Erro",
        description: 'Ocorreu um erro ao processar sua solicitação',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <Alert className="bg-green-50 border-green-300 mb-4">
        <InfoIcon className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700">
          Experimente grátis por <strong>14 dias</strong>! Cadastre-se agora.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nome</Label>
        <Input 
          id="signup-name" 
          type="text" 
          placeholder="Nome do responsável"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nome"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="restaurant@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input 
          id="signup-password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Senha"
          required
        />
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <Button 
        className="w-full" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Criando conta..." : "Criar Conta e Ativar 14 Dias Grátis"}
      </Button>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Ao criar uma conta, você concorda com os nossos termos e condições.
        Após o período de teste, será cobrada uma assinatura mensal de R$49,90.
      </p>
    </form>
  );
};

export default SignupForm;
