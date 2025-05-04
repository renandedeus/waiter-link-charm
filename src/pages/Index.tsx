
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [infoMessage, setInfoMessage] = useState('');
  const [showPaymentRedirect, setShowPaymentRedirect] = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState(5);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for auth redirect/hash parameters in the URL
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
  }, [navigate, toast]);

  // Countdown para redirecionamento após cadastro
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (showPaymentRedirect && paymentCountdown > 0) {
      interval = setInterval(() => {
        setPaymentCountdown((prev) => prev - 1);
      }, 1000);
    } else if (paymentCountdown === 0) {
      // Simular redirecionamento para gateway de pagamento
      // Em produção, este seria um redirect real para o Stripe ou outro gateway
      toast({
        title: "Redirecionando para pagamento",
        description: "Configurando seu método de pagamento para quando o período gratuito terminar.",
      });
      setShowPaymentRedirect(false);
      setPaymentCountdown(5);
      
      // Redirecionar para o dashboard após simular o fluxo de pagamento
      // Em um cenário real, o usuário voltaria do gateway de pagamento
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    
    return () => clearInterval(interval);
  }, [showPaymentRedirect, paymentCountdown, navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setInfoMessage('Por favor, confirme seu email antes de fazer login ou cadastre-se novamente.');
          toast({
            title: "Email não confirmado",
            description: "Por favor, confirme seu email antes de fazer login ou cadastre-se novamente.",
            variant: "warning",
          });
        } else {
          setError(error.message || 'Erro ao fazer login');
          toast({
            title: "Falha no login",
            description: error.message || 'Credenciais inválidas',
            variant: "destructive",
          });
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
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
      console.log("Checking if user exists:", email);
      
      // First try signing up directly
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin,
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
            navigate('/dashboard');
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
            description: "Você tem 14 dias gratuitos. Você será redirecionado para configurar seu método de pagamento.",
            variant: "success",
          });
          
          // Iniciar contagem regressiva para redirecionamento
          setShowPaymentRedirect(true);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Waiter Link</CardTitle>
            <CardDescription className="text-center">
              Gerencie avaliações do seu restaurante e motive seus garçons
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showPaymentRedirect ? (
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
            ) : (
              <>
                {infoMessage && (
                  <Alert variant="info" className="mb-4">
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>{infoMessage}</AlertDescription>
                  </Alert>
                )}
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Cadastro</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          placeholder="restaurant@example.com"
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
                      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                      <Button 
                        className="w-full" 
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? "Entrando..." : "Entrar"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
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
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 mt-4 w-full">
              Impulsione a satisfação dos clientes com avaliações positivas e motive seus garçons
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
