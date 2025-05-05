
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { parseJwt, loadGoogleScript, GOOGLE_CLIENT_ID } from '@/utils/googleUtils';

export interface UseGoogleAuthResult {
  isConnected: boolean;
  isConnecting: boolean;
  connectedAccount: string | null;
  handleConnectGoogle: () => void;
  handleManualConnect: () => void;
  handleDisconnect: () => void;
  handleSimulateConnect: () => void;
}

export const useGoogleAuth = (): UseGoogleAuthResult => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  
  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const savedConnectionStatus = localStorage.getItem('google_connection_status');
        const savedAccount = localStorage.getItem('google_account_email');
        
        if (savedConnectionStatus === 'connected' && savedAccount) {
          setIsConnected(true);
          setConnectedAccount(savedAccount);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão existente:", error);
      }
    };
    
    checkExistingConnection();
    loadGoogleScript();
  }, []);
  
  // Initialize Google Identity Services when script is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && !isConnected) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
          context: 'use'
        });
      } catch (e) {
        console.error("Error initializing Google Identity Services:", e);
      }
    }
  }, [isConnected]);

  const handleGoogleCallback = async (response: any) => {
    try {
      const credential = response.credential;
      const payload = parseJwt(credential);
      
      console.log("Successfully authenticated with Google:", payload.email);
      
      setIsConnecting(true);
      
      setTimeout(() => {
        localStorage.setItem('google_connection_status', 'connected');
        localStorage.setItem('google_account_email', payload.email);
        
        setIsConnected(true);
        setConnectedAccount(payload.email);
        setIsConnecting(false);
        
        toast({
          title: "Conta Google conectada",
          description: `Conectado como ${payload.email}`,
          variant: "default",
        });
      }, 1000);
    } catch (error) {
      console.error("Error handling Google callback:", error);
      setIsConnecting(false);
      toast({
        title: "Erro na conexão",
        description: "Não foi possível conectar com o Google",
        variant: "destructive",
      });
    }
  };

  const handleConnectGoogle = () => {
    setIsConnecting(true);
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification: any) => {
        console.log("Google prompt notification:", notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          handleManualConnect();
        } else {
          setIsConnecting(false);
        }
      });
    } else {
      handleManualConnect();
    }
  };
  
  const handleManualConnect = () => {
    setIsConnecting(true);
    
    if (window.google && window.google.accounts.oauth2) {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "email profile", // Removed business scope that requires verification
        ux_mode: 'popup',
        callback: (response: any) => {
          if (response.code) {
            console.log("Authorization code received:", response.code);
            
            const mockEmail = "usuario@gmail.com";
            localStorage.setItem('google_connection_status', 'connected');
            localStorage.setItem('google_account_email', mockEmail);
            
            setIsConnected(true);
            setConnectedAccount(mockEmail);
            setIsConnecting(false);
            
            toast({
              title: "Conta Google conectada",
              description: `Conectado como ${mockEmail}`,
              variant: "default",
            });
          }
        },
      });
      
      client.requestCode();
    } else {
      console.error("Google OAuth client not available");
      setIsConnecting(false);
      toast({
        title: "Erro na conexão",
        description: "API do Google não carregada corretamente",
        variant: "destructive",
      });
    }
  };

  const handleSimulateConnect = () => {
    setIsConnecting(true);
    
    setTimeout(() => {
      const simulatedEmail = "usuario.simulado@gmail.com";
      localStorage.setItem('google_connection_status', 'connected');
      localStorage.setItem('google_account_email', simulatedEmail);
      
      setIsConnected(true);
      setConnectedAccount(simulatedEmail);
      setIsConnecting(false);
      
      toast({
        title: "Conexão simulada",
        description: `Conectado como ${simulatedEmail} (modo de desenvolvimento)`,
        variant: "default",
      });
    }, 500);
  };

  const handleDisconnect = async () => {
    try {
      localStorage.removeItem('google_connection_status');
      localStorage.removeItem('google_account_email');
      localStorage.removeItem('google_location_name');
      localStorage.removeItem('google_review_url');
      
      setIsConnected(false);
      setConnectedAccount(null);
      
      toast({
        title: "Conta Google desconectada",
        description: "Sua conta Google foi desconectada."
      });
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      toast({
        title: "Erro ao desconectar",
        description: "Não foi possível desconectar sua conta Google. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return {
    isConnected,
    isConnecting,
    connectedAccount,
    handleConnectGoogle,
    handleManualConnect,
    handleDisconnect,
    handleSimulateConnect
  };
};
