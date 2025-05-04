
import React from 'react';

const DashboardLoader: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Carregando...</p>
      </div>
    </div>
  );
};

export default DashboardLoader;
