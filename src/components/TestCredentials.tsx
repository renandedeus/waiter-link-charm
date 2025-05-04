
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Mail, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Esse componente existe apenas para fins de teste e não deve ser usado em produção
const TestCredentials = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateTestUsers = async () => {
    setIsCreating(true);
    
    try {
      // Chave administrativa para a função (normalmente seria armazenada de forma segura)
      // Em um ambiente de produção, esse botão não estaria disponível
      const adminKey = 'desenvolvimento-apenas';
      
      // Chamar a função Edge Function para criar usuários de teste
      const { data, error } = await supabase.functions.invoke('create-test-users', {
        body: { adminKey }
      });
      
      if (error) {
        console.error('Erro ao criar usuários de teste:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar os usuários de teste.',
          variant: 'destructive',
        });
      } else {
        console.log('Usuários de teste criados:', data);
        toast({
          title: 'Sucesso',
          description: 'Usuários de teste criados com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao processar a requisição.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Credenciais de Teste</CardTitle>
        <CardDescription>
          Use essas credenciais para testar as diferentes interfaces do aplicativo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="font-medium flex items-center">
            <User className="mr-2 h-4 w-4" />
            Administrador (Dono do App)
          </div>
          <div className="pl-6 text-sm">
            <div><strong>Email:</strong> admin@targetavaliacoes.com</div>
            <div><strong>Senha:</strong> admin123</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="font-medium flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            Dono do Restaurante
          </div>
          <div className="pl-6 text-sm">
            <div><strong>Email:</strong> restaurante@teste.com</div>
            <div><strong>Senha:</strong> teste123</div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="font-medium flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Cartão de Teste do Stripe
          </div>
          <div className="pl-6 text-sm">
            <div><strong>Número:</strong> 4242 4242 4242 4242</div>
            <div><strong>Validade:</strong> Qualquer data futura</div>
            <div><strong>CVV:</strong> Qualquer 3 dígitos</div>
            <div><strong>CEP:</strong> Qualquer 5 dígitos</div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2" 
          onClick={handleCreateTestUsers}
          disabled={isCreating}
        >
          {isCreating ? 'Criando usuários...' : 'Criar usuários de teste'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestCredentials;
