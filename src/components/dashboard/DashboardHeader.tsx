
import React from 'react';

interface DashboardHeaderProps {
  activePage: 'dashboard' | 'waiters' | 'google' | 'reviews';
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ activePage }) => {
  return (
    <h1 className="text-2xl font-bold">
      {activePage === 'dashboard' ? 'Painel' : 
       activePage === 'waiters' ? 'Gerenciar Garçons' : 
       activePage === 'google' ? 'Conexão Google' : 'Avaliações'}
    </h1>
  );
};

export default DashboardHeader;
