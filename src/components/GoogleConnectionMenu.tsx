
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  placeId: string;
  reviewUrl: string;
}

const GoogleConnectionMenu = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  
  const form = useForm();

  // Verificar se já existe uma conexão salva
  useEffect(() => {
    const checkExistingConnection = async () => {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('google_connection_status, google_location_id')
          .single();
        
        if (restaurant && restaurant.google_connection_status === 'connected' && restaurant.google_location_id) {
          setIsConnected(true);
          setSelectedBusiness(restaurant.google_location_id);
          
          // Carregar as informações do negócio se estiver conectado
          loadBusinessData();
        }
      } catch (error) {
        console.error("Erro ao verificar conexão existente:", error);
      }
    };
    
    checkExistingConnection();
  }, []);
  
  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      // Em uma implementação real, aqui seria iniciado o fluxo OAuth do Google
      // Para fins de demonstração, vamos simular o processo
      
      // Simular autenticação OAuth
      setTimeout(() => {
        // Simular dados retornados após autenticação
        const mockLocations: BusinessLocation[] = [
          { id: '1', name: 'Restaurante Principal', address: 'Av. Paulista, 1000', placeId: 'ChIJ1234567890abc', reviewUrl: 'https://g.page/r/CdSwPJZk5Ty6EBM/review' },
          { id: '2', name: 'Restaurante Filial', address: 'Rua Augusta, 500', placeId: 'ChIJabcdef1234567', reviewUrl: 'https://g.page/r/CanotherReviewLink' },
          { id: '3', name: 'Café Especial', address: 'Alameda Santos, 300', placeId: 'ChIJ7890abcdef1234', reviewUrl: 'https://g.page/r/CyetAnotherReviewLink' }
        ];
        
        setBusinessLocations(mockLocations);
        setIsConnecting(false);
        
        toast({
          title: "Autenticação Google concluída",
          description: "Selecione qual empresa você deseja conectar ao sistema.",
          variant: "success"
        });
        
      }, 2000);
    } catch (error) {
      console.error("Erro ao conectar com o Google:", error);
      setIsConnecting(false);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar com a conta Google. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleSelectBusiness = async (businessId: string) => {
    setIsLoading(true);
    setSelectedBusiness(businessId);
    
    try {
      // Encontrar o negócio selecionado
      const selectedLocation = businessLocations.find(loc => loc.id === businessId);
      
      if (!selectedLocation) {
        throw new Error("Negócio não encontrado");
      }
      
      // Em uma implementação real, aqui seria feita a integração com a API do Google My Business
      // Para fins de demonstração, vamos simular o processo
      
      // Simular dados obtidos da API do Google
      const mockBusinessData = {
        name: selectedLocation.name,
        reviewCount: 42,
        initialRating: 4.2,
        currentRating: 4.7,
        reviewUrl: selectedLocation.reviewUrl,
        recentReviews: [
          {
            id: "rev1",
            author: "Maria Silva",
            rating: 5,
            content: "Excelente atendimento e comida maravilhosa!",
            date: new Date().toISOString(),
            restaurant_id: "123",
            created_at: new Date().toISOString()
          },
          {
            id: "rev2",
            author: "João Pereira",
            rating: 4,
            content: "Muito bom, mas o tempo de espera poderia ser menor.",
            date: new Date().toISOString(),
            restaurant_id: "123",
            created_at: new Date().toISOString()
          }
        ]
      };
      
      // Atualizar os dados do restaurante no banco de dados
      // Em uma implementação real, isso seria feito em uma função Edge do Supabase
      await supabase.from('restaurants').update({
        name: selectedLocation.name,
        google_review_url: mockBusinessData.reviewUrl,
        google_connection_status: 'connected',
        google_location_id: selectedLocation.id,
        total_reviews: mockBusinessData.reviewCount,
        initial_rating: mockBusinessData.initialRating,
        current_rating: mockBusinessData.currentRating,
        updated_at: new Date().toISOString()
      }).eq('id', '123');
      
      // Adicionar as avaliações ao banco de dados
      for (const review of mockBusinessData.recentReviews) {
        await supabase.from('reviews').upsert({
          id: review.id,
          restaurant_id: review.restaurant_id,
          content: review.content,
          rating: review.rating,
          author: review.author,
          date: review.date,
          created_at: review.created_at
        });
      }
      
      setIsConnected(true);
      setIsLoading(false);
      
      toast({
        title: "Empresa conectada com sucesso",
        description: `${selectedLocation.name} foi conectada ao sistema. As avaliações foram importadas.`,
        variant: "success"
      });
      
    } catch (error) {
      console.error("Erro ao selecionar negócio:", error);
      setIsLoading(false);
      toast({
        title: "Erro ao conectar empresa",
        description: "Não foi possível obter os dados da empresa. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  const loadBusinessData = async () => {
    // Em uma implementação real, aqui seriam carregados os dados da empresa do Google
    // Por enquanto, vamos apenas exibir uma mensagem de sucesso
    console.log("Carregando dados do negócio...");
  };

  const handleDisconnect = async () => {
    try {
      // Em uma implementação real, revogaríamos o acesso OAuth
      await supabase.from('restaurants').update({
        google_connection_status: 'disconnected',
        google_location_id: null,
        updated_at: new Date().toISOString()
      }).eq('id', '123');
      
      setIsConnected(false);
      setSelectedBusiness(null);
      setBusinessLocations([]);
      
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conexão com o Google</CardTitle>
        <CardDescription>
          Conecte sua conta do Google para acessar as avaliações do seu negócio no Google
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isConnected ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Conta Google conectada</h4>
                <p className="text-sm text-green-700 mt-1">
                  Sua conta está conectada e podemos acessar as avaliações do seu negócio.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Conta Google não conectada</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Conecte sua conta do Google para que possamos acessar as avaliações do seu negócio.
                </p>
              </div>
            </div>
          )}
          
          {!isConnected && businessLocations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Selecione sua empresa:</h3>
              <Form {...form}>
                <FormField
                  name="businessLocation"
                  render={({ field }) => (
                    <FormItem>
                      <Select 
                        onValueChange={(value) => handleSelectBusiness(value)} 
                        value={selectedBusiness || undefined}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name} - {location.address}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </Form>
            </div>
          )}
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Ao conectar sua conta do Google, você permite que acessemos as avaliações do seu negócio no Google My Business.
              Isso nos permite mostrar métricas e tendências de avaliações ao longo do tempo.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {isConnected ? (
          <Button variant="outline" onClick={handleDisconnect}>
            Desconectar conta
          </Button>
        ) : businessLocations.length > 0 ? (
          <div className="flex flex-col w-full space-y-2">
            <Button 
              onClick={() => handleConnect()} 
              disabled={isConnecting} 
              variant="outline"
            >
              Conectar outra conta
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleConnect} 
            disabled={isConnecting} 
          >
            {isConnecting ? "Conectando..." : "Conectar conta Google"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default GoogleConnectionMenu;
