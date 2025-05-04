
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Users, LogOut, Menu } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activePage: 'dashboard' | 'waiters';
  onNavigate: (page: 'dashboard' | 'waiters') => void;
}

export const Sidebar = ({ activePage, onNavigate }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-gray-200 transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center p-4">
        {!collapsed && <h1 className="text-xl font-bold flex-1">Target Avaliações</h1>}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          <li>
            <Button
              variant={activePage === 'dashboard' ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center"
              )}
              onClick={() => onNavigate('dashboard')}
            >
              <Home className="h-5 w-5 mr-2" />
              {!collapsed && <span>Dashboard</span>}
            </Button>
          </li>
          <li>
            <Button
              variant={activePage === 'waiters' ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                collapsed && "justify-center"
              )}
              onClick={() => onNavigate('waiters')}
            >
              <Users className="h-5 w-5 mr-2" />
              {!collapsed && <span>Garçons</span>}
            </Button>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start",
            collapsed && "justify-center"
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  );
};
