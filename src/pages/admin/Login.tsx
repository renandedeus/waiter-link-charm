
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader } from 'lucide-react';
import TestCredentials from '@/components/TestCredentials';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState('');
  const { signIn, checkAdminStatus, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if already logged in as admin
  useEffect(() => {
    const checkExistingAuth = async () => {
      setIsChecking(true);
      if (user) {
        try {
          console.log('[Admin] Checking if existing user is admin:', user.email);
          const isAdmin = await checkAdminStatus();
          if (isAdmin) {
            console.log('[Admin] User is admin, redirecting to admin dashboard');
            navigate('/admin');
          } else {
            console.log('[Admin] User is not admin, staying on login page');
          }
        } catch (err) {
          console.error('[Admin] Error checking admin status:', err);
        }
      }
      setIsChecking(false);
    };
    
    checkExistingAuth();
  }, [user, navigate, checkAdminStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("[Admin] Attempting admin login for:", email);
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        console.error("[Admin] Admin login error details:", signInError);
        
        // Better error handling
        if (signInError.message.includes('invalid credentials') || signInError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
        } else {
          setError(`Erro no login: ${signInError.message}`);
          toast({
            title: "Erro no login",
            description: signInError.message || "Ocorreu um erro durante o login",
            variant: "destructive",
          });
        }
      } else {
        // Check if the user is an administrator
        const isAdmin = await checkAdminStatus();
        
        if (isAdmin) {
          console.log('[Admin] User confirmed as admin, redirecting to dashboard');
          toast({
            title: "Login bem-sucedido",
            description: "Bem-vindo ao painel administrativo!",
            variant: "success",
          });
          navigate('/admin');
        } else {
          console.log('[Admin] User is not an admin, showing error');
          toast({
            title: "Acesso negado",
            description: "Você não tem permissões de administrador.",
            variant: "destructive",
          });
          
          setError("Você não tem permissões de administrador.");
        }
      }
    } catch (err) {
      console.error('[Admin] Error during admin login:', err);
      setError('Ocorreu um erro ao tentar fazer login');
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando credenciais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mb-8">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Painel Administrativo
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@targetavaliacoes.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  className="w-full mt-6" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 mt-4 w-full">
              Este é um painel restrito para a equipe administrativa
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="w-full max-w-md">
        <TestCredentials />
      </div>
    </div>
  );
};

export default AdminLogin;
