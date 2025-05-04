
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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
      console.log("Attempting signup with email:", email);
      console.log("Using redirect URL:", getSiteURL());
      
      // First try signing up directly
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: getSiteURL(),
        },
      });
      
      if (error) {
        // If error is not because user already exists
        if (!error.message.includes('already been registered')) {
          setError(error.message || 'Erro ao criar conta');
          toast({
            title: "Falha no cadastro",
            description: error.message || 'Não foi possível criar sua conta',
            variant: "destructive",
          });
        } else {
          // User already exists, try logging in
          const { error: signInError } = await signIn(email, password);
          
          if (signInError) {
            // If can't login, probably needs to confirm email
            setActiveTab('login');
            setInfoMessage('Este email já está registrado. Por favor, confirme seu email para fazer login.');
            toast({
              title: "Email já registrado",
              description: "Este email já está registrado. Por favor, confirme seu email para fazer login.",
              variant: "info",
            });
          } else {
            // Login successful
            toast({
              title: "Login realizado com sucesso",
              description: "Você será redirecionado para escolher um plano",
              variant: "success",
            });
            navigate('/payment-gateway');
          }
        }
      } else if (data?.user) {
        // If signup was successful
        if (data.user.identities?.length === 0) {
          toast({
            title: "Email já registrado",
            description: "Este email já está registrado. Por favor, faça login.",
            variant: "info",
          });
          setActiveTab('login');
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Você será redirecionado para escolher seu plano.",
            variant: "success",
          });
          
          // Redirect directly to payment page
          navigate('/payment-gateway');
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
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
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Ao criar uma conta, você concorda com os nossos termos e condições.
        Será cobrada uma assinatura mensal de R$49,90 após a confirmação do pagamento.
      </p>
    </form>
  );
};

export default SignupForm;
