
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface GoogleLocationFormProps {
  connectedAccount: string | null;
  locationName: string | null;
  googleReviewUrl?: string | null;
  onLocationNameChange: (name: string) => void;
  onGoogleReviewUrlChange?: (url: string) => void;
  onSaveLocation: () => void;
}

const GoogleLocationForm: React.FC<GoogleLocationFormProps> = ({
  connectedAccount,
  locationName,
  googleReviewUrl,
  onLocationNameChange,
  onGoogleReviewUrlChange,
  onSaveLocation
}) => {
  const isManualMode = connectedAccount?.includes('manual');
  
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium">{isManualMode ? 'Inserir dados manualmente' : 'Configurar local do negócio'}</h3>
      
      <div className="space-y-2">
        <Label htmlFor="business-name">Nome do negócio</Label>
        <Input
          id="business-name"
          value={locationName || ''}
          onChange={(e) => onLocationNameChange(e.target.value)}
          placeholder="Nome do seu negócio"
        />
      </div>
      
      {isManualMode && onGoogleReviewUrlChange && (
        <div className="space-y-2">
          <Label htmlFor="google-review-url">URL de avaliações do Google</Label>
          <Input
            id="google-review-url"
            value={googleReviewUrl || ''}
            onChange={(e) => onGoogleReviewUrlChange(e.target.value)}
            placeholder="https://g.page/r/CdSwPJZk5Ty6EBM/review"
          />
          <p className="text-xs text-gray-500">
            Exemplo: https://g.page/r/CdSwPJZk5Ty6EBM/review
          </p>
        </div>
      )}
      
      <Button 
        onClick={onSaveLocation}
        disabled={!locationName}
      >
        Salvar
      </Button>
    </div>
  );
};

export default GoogleLocationForm;
