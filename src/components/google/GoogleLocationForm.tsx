
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GoogleLocationFormProps {
  connectedAccount: string | null;
  locationName: string | null;
  onLocationNameChange: (name: string) => void;
  onSaveLocation: () => void;
}

const GoogleLocationForm: React.FC<GoogleLocationFormProps> = ({
  connectedAccount,
  locationName,
  onLocationNameChange,
  onSaveLocation
}) => {
  return (
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
          onChange={(e) => onLocationNameChange(e.target.value)}
          placeholder="Digite o nome do seu estabelecimento"
        />
      </div>
      
      <Button onClick={onSaveLocation}>Salvar</Button>
    </div>
  );
};

export default GoogleLocationForm;
