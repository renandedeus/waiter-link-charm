
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type LoginFormProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  infoMessage: string;
  error: string;
};

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  infoMessage,
  error,
}: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: 'Por favor, preencha todos os campos',
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error details:", error);
        
        // Melhor tratamento para erros comuns
        if (error.message.includes('invalid credentials') || error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email não confirmado",
            description: "Por favor, confirme seu email antes de fazer login ou cadastre-se novamente.",
            variant: "warning",
          });
        } else {
          toast({
            title: "Falha no login",
            description: error.message || 'Ocorreu um erro ao fazer login',
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login bem-sucedido",
          description: "Você será redirecionado para o dashboard",
          variant: "success",
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
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
    <form onSubmit={handleLogin} className="space-y-4">
      {infoMessage && (
        <Alert variant="info" className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{infoMessage}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input 
          id="login-email" 
          type="email" 
          placeholder="seu-email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input 
          id="login-password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Senha"
          required
        />
      </div>
      <Button 
        className="w-full" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};

export default LoginForm;
