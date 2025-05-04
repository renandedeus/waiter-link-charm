
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ListChecks, Globe, Settings } from 'lucide-react';

interface SidebarProps {
  activePage: 'dashboard' | 'waiters' | 'google' | 'reviews';
  onNavigate: (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Waiter Link</h2>
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
                <ListChecks className="mr-2 h-4 w-4" />
                Avaliações
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link to="/admin/settings" className="flex items-center px-3 py-2 rounded-md hover:bg-gray-200">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </div>
      </div>
    </div>
  );
};
