
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
    selectedLocation,
    businessLocations,
    handleConnectGoogle,
    handleDisconnect,
    handleSimulateConnect,
    setLocationName,
    handleSaveLocation,
    handleLocationSelect
  } = useGoogleConnection(handleRestaurantUpdate, restaurant);

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
          <GoogleAccountStatus 
            isConnected={isConnected} 
            connectedAccount={connectedAccount} 
          />
          
          {isConnected && (
            <GoogleLocationForm
              connectedAccount={connectedAccount}
              locationName={locationName}
              selectedLocation={selectedLocation}
              businessLocations={businessLocations}
              onLocationNameChange={setLocationName}
              onLocationSelect={handleLocationSelect}
              onSaveLocation={handleSaveLocation}
            />
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
        <ConnectButton
          isConnected={isConnected}
          isConnecting={isConnecting}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnect}
          onSimulateConnect={handleSimulateConnect}
        />
      </CardFooter>
    </Card>
  );
};

export default GoogleConnectionMenu;
