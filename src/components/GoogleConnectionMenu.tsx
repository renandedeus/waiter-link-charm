
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardData } from '@/hooks/useDashboardData';

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  placeId: string;
  reviewUrl: string;
}

// In a real app, this should come from environment variables
const GOOGLE_CLIENT_ID = "877489276615-pi7nt2a4c8uhuhal4ta2hf3he3md73nd.apps.googleusercontent.com";

const GoogleConnectionMenu = () => {
  const { toast } = useToast();
  const { restaurant, handleRestaurantUpdate } = useDashboardData();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  
  // Verificar se já existe uma conexão salva
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
      // Process the credential
      const credential = response.credential;
      const payload = parseJwt(credential);
      
      // In a real implementation, you would send this token to your backend
      console.log("Successfully authenticated with Google:", payload.email);
      
      // For demo, we'll simulate account connection
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

  const handleConnectGoogle = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Try the Google popup approach instead
          handleManualConnect();
        }
      });
    } else {
      handleManualConnect();
    }
  };
  
  const handleManualConnect = () => {
    setIsConnecting(true);
    
    // Simulate connection for demo purposes
    setTimeout(() => {
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
    }, 1500);
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
      
      handleRestaurantUpdate(updatedRestaurant);
      
      toast({
        title: "Local salvo",
        description: `${locationName} foi configurado como seu negócio principal.`,
        variant: "default",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexão com o Google</CardTitle>
        <CardDescription>
          Conecte sua conta do Google para sincronizar as avaliações do seu negócio
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {isConnected ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">Conta Google conectada</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {connectedAccount}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-account">Conta Google</Label>
                  <Input 
                    id="google-account" 
                    value={connectedAccount || ""} 
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="google-location">Local do Google</Label>
                  <Input 
                    id="google-location" 
                    value={locationName || ""} 
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Digite o nome do seu estabelecimento"
                  />
                </div>
                
                <Button onClick={handleSaveLocation}>Salvar</Button>
              </div>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Conta Google não conectada</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Conecte sua conta do Google para acessar as avaliações do seu negócio.
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Ao conectar sua conta do Google, você permite que acessemos as informações do seu negócio 
              no Google Business Profile, incluindo avaliações e métricas.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {isConnected ? (
          <Button variant="outline" onClick={handleDisconnect}>
            Desconectar conta
          </Button>
        ) : (
          <Button 
            onClick={handleConnectGoogle} 
            disabled={isConnecting}
            className="flex items-center space-x-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            <span>{isConnecting ? "Conectando..." : "Conectar conta Google"}</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoogleConnectionMenu;
