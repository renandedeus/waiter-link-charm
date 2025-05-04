
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
          setInfoMessage('Cadastro realizado! Verifique seu email para confirmar sua conta ou tente fazer login diretamente.');
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar sua conta ou tente fazer login diretamente.",
            variant: "success",
          });
          setActiveTab('login');
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
                </form>
              </TabsContent>
            </Tabs>
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
