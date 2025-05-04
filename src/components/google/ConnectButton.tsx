
import React from 'react';
import { Button } from "@/components/ui/button";

interface ConnectButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ 
  isConnected, 
  isConnecting, 
  onConnect, 
  onDisconnect 
}) => {
  if (isConnected) {
    return (
      <Button variant="outline" onClick={onDisconnect}>
        Desconectar conta
      </Button>
    );
  }

  return (
    <Button 
      onClick={onConnect} 
      disabled={isConnecting}
      className="flex items-center space-x-2"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
      <span>{isConnecting ? "Conectando..." : "Conectar conta Google"}</span>
    </Button>
  );
};

export default ConnectButton;
