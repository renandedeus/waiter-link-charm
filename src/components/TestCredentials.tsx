
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Mail, User } from 'lucide-react';

// Esse componente existe apenas para fins de teste e não deve ser usado em produção
const TestCredentials = () => {
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
            <div><strong>Email:</strong> admin@waiterlink.com</div>
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
            <div><strong>Senha:</strong> senha123</div>
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
    </Card>
  );
};

export default TestCredentials;

// Nota: Para criar os usuários reais, é necessário registrá-los através da interface de registro
// ou através do painel administrativo do Supabase.
