
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardData } from '@/hooks/useDashboardData';
import GoogleAccountStatus from './google/GoogleAccountStatus';
import GoogleLocationForm from './google/GoogleLocationForm';
import ConnectButton from './google/ConnectButton';
import { useGoogleConnection } from '@/hooks/useGoogleConnection';

const GoogleConnectionMenu = () => {
  const { restaurant, handleRestaurantUpdate } = useDashboardData();

  const {
    isConnected,
    isConnecting,
    connectedAccount,
    locationName,
    googleReviewUrl,
    handleConnectGoogle,
    handleDisconnect,
    handleSimulateConnect,
    handleManualEntry,
    setLocationName,
    setGoogleReviewUrl,
    handleSaveLocation
  } = useGoogleConnection(handleRestaurantUpdate, restaurant);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexão com o Google</CardTitle>
        <CardDescription>
          Conecte sua conta do Google para sincronizar as avaliações do seu negócio ou insira dados manualmente
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <GoogleAccountStatus 
            isConnected={isConnected} 
            connectedAccount={connectedAccount} 
          />
          
          {isConnected && (
            <GoogleLocationForm
              connectedAccount={connectedAccount}
              locationName={locationName}
              googleReviewUrl={googleReviewUrl}
              onLocationNameChange={setLocationName}
              onGoogleReviewUrlChange={setGoogleReviewUrl}
              onSaveLocation={handleSaveLocation}
            />
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Você pode conectar sua conta do Google Business Profile ou optar por inserir dados manualmente
              para gerenciar avaliações e métricas do seu negócio.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <ConnectButton
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnect}
          onSimulateConnect={handleSimulateConnect}
          onManualEntry={handleManualEntry}
        />
      </CardFooter>
    </Card>
  );
};

export default GoogleConnectionMenu;
