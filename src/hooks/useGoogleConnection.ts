
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface UseGoogleConnectionResult {
  isConnected: boolean;
  isConnecting: boolean;
  connectedAccount: string | null;
  locationName: string | null;
  handleConnectGoogle: () => void;
  handleManualConnect: () => void;
  handleDisconnect: () => void;
  setLocationName: (name: string) => void;
  handleSaveLocation: () => void;
}

export const useGoogleConnection = (
  onRestaurantUpdate: (updatedRestaurant: any) => void, 
  restaurant: any
): UseGoogleConnectionResult => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  
  // Helper to decode JWT token
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error parsing JWT:", e);
      return {};
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const savedConnectionStatus = localStorage.getItem('google_connection_status');
        const savedAccount = localStorage.getItem('google_account_email');
        const savedLocationName = localStorage.getItem('google_location_name');
        
        if (savedConnectionStatus === 'connected' && savedAccount) {
          setIsConnected(true);
          setConnectedAccount(savedAccount);
          setLocationName(savedLocationName);
        }
      } catch (error) {
        console.error("Erro ao verificar conexão existente:", error);
      }
    };
    
    checkExistingConnection();
    
    // Load Google API script
    const loadGoogleScript = () => {
      if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };
    
    loadGoogleScript();
  }, []);
  
  // Initialize Google Identity Services when script is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && !isConnected) {
      try {
        // Use the updated client ID that's properly configured in Google Cloud Console
        window.google.accounts.id.initialize({
          // Use a client ID that's properly configured in Google Cloud Console
          client_id: "756239846791-b9stmenfmnkanlk7ik614ockbpbt9t58.apps.googleusercontent.com",
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
      // Process the credential
      const credential = response.credential;
      const payload = parseJwt(credential);
      
      console.log("Successfully authenticated with Google:", payload.email);
      
      // For real implementation, you would send this token to your backend
      setIsConnecting(true);
      
      // Simulate API call to get business locations
      setTimeout(() => {
        // Save connection info
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
          // Try manual OAuth flow if One Tap doesn't work
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
    
    // Initialize OAuth client
    if (window.google && window.google.accounts.oauth2) {
      const client = window.google.accounts.oauth2.initCodeClient({
        // Use the updated client ID that's properly configured in Google Cloud Console
        client_id: "756239846791-b9stmenfmnkanlk7ik614ockbpbt9t58.apps.googleusercontent.com",
        scope: "email profile https://www.googleapis.com/auth/business.manage",
        ux_mode: 'popup',
        callback: (response: any) => {
          if (response.code) {
            // Here you would exchange the code for tokens on your backend
            console.log("Authorization code received:", response.code);
            
            // Mock success for now
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

  const handleDisconnect = async () => {
    try {
      // Clear connection data from localStorage
      localStorage.removeItem('google_connection_status');
      localStorage.removeItem('google_account_email');
      localStorage.removeItem('google_location_name');
      localStorage.removeItem('google_review_url');
      
      setIsConnected(false);
      setConnectedAccount(null);
      setLocationName(null);
      
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
  
  const handleSaveLocation = () => {
    // Save the location info
    if (locationName) {
      localStorage.setItem('google_location_name', locationName);
      
      // Update the restaurant info
      const updatedRestaurant = {
        ...restaurant,
        name: locationName,
        // In a real implementation, we would pull these from the Google API
        googleReviewUrl: "https://g.page/r/review-link-for-" + locationName.replace(/\s+/g, '-').toLowerCase(),
        google_review_url: "https://g.page/r/review-link-for-" + locationName.replace(/\s+/g, '-').toLowerCase(),
      };
      
      onRestaurantUpdate(updatedRestaurant);
      
      toast({
        title: "Local salvo",
        description: `${locationName} foi configurado como seu negócio principal.`,
        variant: "default",
      });
    }
  };

  return {
    isConnected,
    isConnecting,
    connectedAccount,
    locationName,
    handleConnectGoogle,
    handleManualConnect,
    handleDisconnect,
    setLocationName,
    handleSaveLocation
  };
};
