
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Home, Edit, Users, LogOut } from 'lucide-react';

interface SidebarProps {
  activePage: 'dashboard' | 'waiters' | 'google';
  onNavigate: (page: 'dashboard' | 'waiters' | 'google') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Waiter Link</h2>
        <p className="text-sm text-gray-500">Gerencie avaliações e desempenho</p>
      </div>
      <div className="p-4 flex-1">
        <nav className="space-y-2">
          <Button
            variant={activePage === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onNavigate('dashboard')}
          >
            <Home className="mr-2 h-4 w-4" />
            Painel
          </Button>
          <Button
            variant={activePage === 'waiters' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onNavigate('waiters')}
          >
            <Users className="mr-2 h-4 w-4" />
            Garçons
          </Button>
          <Button
            variant={activePage === 'google' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onNavigate('google')}
          >
            <Edit className="mr-2 h-4 w-4" />
            Conexão Google
          </Button>
        </nav>
      </div>
      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
