
import React from 'react';
import { Button } from "@/components/ui/button";

interface ConnectButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSimulateConnect?: () => void;
  onManualEntry?: () => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ 
  isConnected, 
  isConnecting, 
  onConnect, 
  onDisconnect,
  onSimulateConnect,
  onManualEntry
}) => {
  if (isConnected) {
    return (
      <Button variant="outline" onClick={onDisconnect}>
        Desconectar conta
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button 
        onClick={onConnect} 
        disabled={isConnecting}
        className="flex items-center space-x-2"
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
        <span>{isConnecting ? "Conectando..." : "Conectar conta Google"}</span>
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onManualEntry}
        className="mt-2 sm:mt-0"
      >
        Inserir dados manualmente
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onSimulateConnect}
        className="mt-2 sm:mt-0"
      >
        Simular conexão (modo de desenvolvimento)
      </Button>
    </div>
  );
};

export default ConnectButton;
