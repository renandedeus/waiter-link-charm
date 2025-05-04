
import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface GoogleAccountStatusProps {
  isConnected: boolean;
  connectedAccount: string | null;
}

const GoogleAccountStatus: React.FC<GoogleAccountStatusProps> = ({ isConnected, connectedAccount }) => {
  if (isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
        <div>
          <h4 className="text-sm font-medium text-green-900">Conta Google conectada</h4>
          <p className="text-sm text-green-700 mt-1">
            {connectedAccount}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
      <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
      <div>
        <h4 className="text-sm font-medium text-yellow-900">Conta Google não conectada</h4>
        <p className="text-sm text-yellow-700 mt-1">
          Conecte sua conta do Google para acessar as avaliações do seu negócio.
        </p>
      </div>
    </div>
  );
};

export default GoogleAccountStatus;
