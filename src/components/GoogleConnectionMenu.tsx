
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ExternalLink, Save } from "lucide-react";
import { useDashboardData } from '@/hooks/useDashboardData';
import { setRestaurantInfo } from '@/services/waiterService';
import { useAuth } from '@/contexts/auth';

const GoogleConnectionMenu = () => {
  const { restaurant, handleRestaurantUpdate } = useDashboardData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [googleReviewUrl, setGoogleReviewUrl] = useState(restaurant?.googleReviewUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const validateGoogleUrl = (url: string) => {
    return url.includes('google.com') || url.includes('g.page') || url.includes('maps.google');
  };

  const handleSave = async () => {
    if (!googleReviewUrl.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o link de avaliações do Google.",
        variant: "destructive",
      });
      return;
    }

    if (!validateGoogleUrl(googleReviewUrl)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um link válido do Google (deve conter google.com, g.page ou maps.google).",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      
      await setRestaurantInfo(
        restaurant?.name || user.email || 'Seu Restaurante',
        googleReviewUrl,
        restaurant?.totalReviews || 0,
        restaurant?.initialRating || 0,
        restaurant?.currentRating || 0
      );

      // Update local state
      handleRestaurantUpdate({
        ...restaurant,
        googleReviewUrl
      });

      toast({
        title: "Link salvo com sucesso!",
        description: "Agora todos os QR codes dos seus garçons redirecionarão para este link de avaliações.",
        variant: "default",
      });
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o link. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testLink = () => {
    if (googleReviewUrl) {
      window.open(googleReviewUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link de Avaliações do Google</CardTitle>
        <CardDescription>
          Configure o link direto para as avaliações da sua empresa no Google. 
          Todos os QR codes dos garçons redirecionarão para este link.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="google-url">Link de Avaliações do Google</Label>
          <Input
            id="google-url"
            placeholder="Ex: https://g.page/r/CdSwPJZk5Ty6EBM/review"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Cole aqui o link direto para avaliações da sua empresa no Google Maps ou Google Meu Negócio.
          </p>
        </div>

        {googleReviewUrl && validateGoogleUrl(googleReviewUrl) && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Link válido detectado</p>
                <p className="text-xs text-green-600">
                  {googleReviewUrl.length > 50 ? googleReviewUrl.substring(0, 50) + "..." : googleReviewUrl}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testLink}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Testar
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Como obter o link:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Acesse o Google Maps e procure sua empresa</li>
            <li>2. Clique em "Avaliar" ou "Escrever uma avaliação"</li>
            <li>3. Copie o link da página que abrir</li>
            <li>4. Cole o link no campo acima</li>
          </ol>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !googleReviewUrl.trim()}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Salvando...' : 'Salvar Link de Avaliações'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleConnectionMenu;
