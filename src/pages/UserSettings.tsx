
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { LogOut } from "lucide-react";

const UserSettings = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'waiters' | 'google' | 'reviews'>('waiters');
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Mock data - in a real app, this would come from an API call
  const subscription = {
    plan: "Premium",
    status: "active",
    nextBillingDate: "2025-06-04",
    amount: "R$ 49,90"
  };

  const handleNavigate = (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => {
    setActivePage(page);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Configurações</h1>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Informações do usuário</CardTitle>
              <CardDescription>Detalhes da sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm text-gray-700">{user?.email || 'Não disponível'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">ID do usuário</p>
                  <p className="text-sm text-gray-700">{user?.id || 'Não disponível'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assinatura</CardTitle>
              <CardDescription>Detalhes do seu plano atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Plano atual</p>
                  <Badge>{subscription.plan}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={subscription.status === 'active' ? 'secondary' : 'destructive'}>
                    {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Próxima cobrança</p>
                  <p className="text-sm">{subscription.nextBillingDate}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Valor</p>
                  <p className="text-sm font-semibold">{subscription.amount}</p>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full">Gerenciar assinatura</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
