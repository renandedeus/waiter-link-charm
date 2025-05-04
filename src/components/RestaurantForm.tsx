
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Restaurant } from '@/types';
import { useToast } from "@/components/ui/use-toast";

interface RestaurantFormProps {
  restaurant: Restaurant;
  onSave: (name: string, googleReviewUrl: string) => void;
}

export const RestaurantForm = ({ restaurant, onSave }: RestaurantFormProps) => {
  const [name, setName] = useState(restaurant.name);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(restaurant.googleReviewUrl);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    // Simple validation for Google review URL format
    return url.includes('google.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; url?: string } = {};
    
    if (!name) {
      newErrors.name = "Nome do restaurante é obrigatório";
    }
    
    if (!googleReviewUrl) {
      newErrors.url = "URL do Google Review é obrigatório";
    } else if (!validateUrl(googleReviewUrl)) {
      newErrors.url = "Por favor, insira uma URL do Google válida";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(name, googleReviewUrl);
    toast({
      title: "Informações do restaurante salvas",
      description: "Os detalhes do seu restaurante foram atualizados com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Restaurante</CardTitle>
        <CardDescription>
          Adicione os detalhes do seu restaurante e o link de avaliação do Google
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Nome do Restaurante</Label>
            <Input
              id="restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome do restaurante"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review-url">URL do Google Review</Label>
            <Input
              id="review-url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/..."
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
          </div>
          
          <Button type="submit">Salvar Informações</Button>
        </form>
      </CardContent>
    </Card>
  );
};
