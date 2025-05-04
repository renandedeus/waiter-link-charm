
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ListChecks, Globe, Settings, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/components/ui/use-toast';

interface SidebarProps {
  activePage: 'dashboard' | 'waiters' | 'google' | 'reviews';
  onNavigate: (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const { signOut } = useAuth();
  const { toast } = useToast();

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
    <div className="w-64 bg-gray-100 border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Target Avaliações</h2>
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
                <Home className="mr-2 h-4 w-4" />
                Painel
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
                <ListChecks className="mr-2 h-4 w-4" />
                Garçons
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
                <Globe className="mr-2 h-4 w-4" />
                Google
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
                <MessageSquare className="mr-2 h-4 w-4" />
                Avaliações
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <Link to="/settings" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-200">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-gray-200 text-left"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};
