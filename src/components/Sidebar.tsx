
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, ListChecks, Globe, Settings, MessageSquare, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activePage: 'dashboard' | 'waiters' | 'google' | 'reviews';
  onNavigate: (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

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
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-gray-100 border-r border-gray-200 h-full transition-width duration-300 ease-in-out relative`}>
      <Button 
        variant="outline"
        size="icon" 
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full shadow-sm h-6 w-6 p-0 flex items-center justify-center"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>
      
      <div className="p-4">
        {!collapsed && <h2 className="text-lg font-semibold mb-4">Target Avaliações</h2>}
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-200 ${
                  activePage === 'dashboard' ? 'bg-gray-200 font-medium' : ''
                }`}
                onClick={() => onNavigate('dashboard')}
              >
                <Home className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Painel</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/waiters"
                className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-200 ${
                  activePage === 'waiters' ? 'bg-gray-200 font-medium' : ''
                }`}
                onClick={() => onNavigate('waiters')}
              >
                <ListChecks className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Garçom/Entregador</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/google"
                className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-200 ${
                  activePage === 'google' ? 'bg-gray-200 font-medium' : ''
                }`}
                onClick={() => onNavigate('google')}
              >
                <Globe className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Google</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/reviews"
                className={`flex items-center px-3 py-2 rounded-md hover:bg-gray-200 ${
                  activePage === 'reviews' ? 'bg-gray-200 font-medium' : ''
                }`}
                onClick={() => onNavigate('reviews')}
              >
                <MessageSquare className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Avaliações</span>}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <Link to="/settings" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-200">
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Configurações</span>}
          </Link>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-200 text-left"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
