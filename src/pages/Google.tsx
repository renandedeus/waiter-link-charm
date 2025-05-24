
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
          <h1 className="text-2xl font-bold">Configuração do Google</h1>
          <p className="text-gray-600 mb-6">
            Configure o link direto para as avaliações da sua empresa no Google. 
            Todos os QR codes dos garçons redirecionarão automaticamente para este link.
          </p>
          
          <div className="max-w-2xl">
            <GoogleConnectionMenu />
          </div>
          
          <div className="max-w-2xl mt-8">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-lg font-medium text-green-900 mb-2">Como funciona agora:</h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Configure uma única vez o link de avaliações do Google da sua empresa</li>
                <li>• Todos os QR codes dos garçons redirecionarão automaticamente para este link</li>
                <li>• O sistema registra quantos cliques cada garçom gerou</li>
                <li>• Não é necessário autenticação complexa ou APIs do Google</li>
                <li>• Funciona imediatamente após a configuração</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Google;
