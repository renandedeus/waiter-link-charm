
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import GoogleConnectionMenu from '@/components/GoogleConnectionMenu';

const Google = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'waiters' | 'google' | 'reviews'>('google');

  const handleNavigate = (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => {
    setActivePage(page);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <h1 className="text-2xl font-bold">Google</h1>
          <p className="text-gray-600 mb-6">
            Conecte sua conta Google para sincronizar informações do seu negócio e simplificar o processo de avaliações.
          </p>
          
          <div className="max-w-2xl">
            <GoogleConnectionMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Google;
