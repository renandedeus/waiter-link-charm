
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessLocation } from '@/hooks/useGoogleLocation';

interface GoogleLocationFormProps {
  connectedAccount: string | null;
  locationName: string | null;
  selectedLocation: BusinessLocation | null;
  businessLocations: BusinessLocation[];
  onLocationNameChange: (name: string) => void;
  onLocationSelect: (location: BusinessLocation) => void;
  onSaveLocation: () => void;
}

const GoogleLocationForm: React.FC<GoogleLocationFormProps> = ({
  connectedAccount,
  locationName,
  selectedLocation,
  businessLocations,
  onLocationNameChange,
  onLocationSelect,
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
      
      {businessLocations.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="google-business">Empresa do Google</Label>
          <Select 
            value={selectedLocation?.id || ""}
            onValueChange={(value) => {
              const location = businessLocations.find(loc => loc.id === value);
              if (location) {
                onLocationSelect(location);
              }
            }}
          >
            <SelectTrigger id="google-business" className="w-full">
              <SelectValue placeholder="Selecione uma empresa do Google" />
            </SelectTrigger>
            <SelectContent>
              {businessLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} - {location.address}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Selecione qual empresa do Google será conectada ao sistema
          </p>
        </div>
      )}
      
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
