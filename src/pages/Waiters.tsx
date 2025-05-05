
import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Sidebar } from '@/components/Sidebar';
import WaiterManagement from '@/components/dashboard/WaiterManagement';
import { Waiter } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { createWaiter, deleteWaiter, getWaiters, getRestaurantInfo, setRestaurantInfo } from '@/services/waiterService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const Waiters = () => {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>('');
  const [isSettingReviewUrl, setIsSettingReviewUrl] = useState<boolean>(false);
  const [newReviewUrl, setNewReviewUrl] = useState<string>('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          setLoading(true);
          
          // Fetch waiters
          const fetchedWaiters = await getWaiters(user.id);
          setWaiters(fetchedWaiters);
          
          // Fetch restaurant info to get Google review URL
          const restaurant = await getRestaurantInfo(user.id);
          if (restaurant && restaurant.googleReviewUrl) {
            setGoogleReviewUrl(restaurant.googleReviewUrl);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um problema ao carregar as informações.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleAddWaiter = async (name: string, email: string, whatsapp: string): Promise<Waiter> => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const newWaiter = await createWaiter({
        name,
        email,
        whatsapp,
        restaurantId: user.id
      });
      
      setWaiters(prev => [...prev, newWaiter]);
      toast({
        title: "Garçom adicionado",
        description: "O garçom foi adicionado com sucesso.",
      });
      
      return newWaiter;
    } catch (error) {
      console.error('Erro ao adicionar garçom:', error);
      toast({
        title: "Erro ao adicionar garçom",
        description: "Ocorreu um problema ao tentar adicionar o garçom.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteWaiter = async (id: string) => {
    try {
      await deleteWaiter(id);
      setWaiters(prev => prev.filter(waiter => waiter.id !== id));
      toast({
        title: "Garçom removido",
        description: "O garçom foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir garçom:', error);
      throw error;
    }
  };

  const handleSetReviewUrl = async () => {
    try {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      await setRestaurantInfo(
        'Seu Restaurante', // Default name if not available
        newReviewUrl,
        0, // totalReviews
        0, // initialRating
        0  // currentRating
      );

      setGoogleReviewUrl(newReviewUrl);
      setIsSettingReviewUrl(false);
      
      toast({
        title: "Link de avaliações atualizado",
        description: "O link de avaliações do Google foi atualizado com sucesso.",
        variant: "success",
      });
    } catch (error) {
      console.error('Erro ao definir link de avaliações:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um problema ao salvar o link de avaliações.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage="waiters" 
        onNavigate={() => {}} 
      />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Gerenciamento de Garçons</h1>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {!googleReviewUrl && !isSettingReviewUrl && (
                <Card className="mb-6 border-l-4 border-l-amber-400 bg-amber-50">
                  <CardHeader>
                    <CardTitle>Configuração Necessária</CardTitle>
                    <CardDescription>
                      Para usar os QR Codes de avaliação, você precisa definir o link do Google Review do seu restaurante.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      onClick={() => setIsSettingReviewUrl(true)}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      Definir Link de Avaliações
                    </Button>
                  </CardFooter>
                </Card>
              )}
              
              {isSettingReviewUrl && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Definir Link de Avaliações do Google</CardTitle>
                    <CardDescription>
                      Cole o link de avaliações do seu estabelecimento no Google para vincular aos QR Codes dos garçons.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <Input
                        placeholder="Ex: https://g.page/r/CdSwPJZk5Ty6EBM/review"
                        value={newReviewUrl}
                        onChange={(e) => setNewReviewUrl(e.target.value)}
                      />
                      <p className="text-sm text-gray-500">
                        Você pode obter este link na sua página do Google Meu Negócio ou acessando seu perfil no Google Maps.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsSettingReviewUrl(false)}>Cancelar</Button>
                    <Button onClick={handleSetReviewUrl}>Salvar Link</Button>
                  </CardFooter>
                </Card>
              )}
              
              {googleReviewUrl && !isSettingReviewUrl && (
                <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium">Link de Avaliações Google:</p>
                    <a 
                      href={googleReviewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center"
                    >
                      {googleReviewUrl.length > 50 ? googleReviewUrl.substring(0, 50) + "..." : googleReviewUrl}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsSettingReviewUrl(true)}
                  >
                    Alterar
                  </Button>
                </div>
              )}

              <WaiterManagement 
                waiters={waiters}
                onAddWaiter={handleAddWaiter}
                onDeleteWaiter={handleDeleteWaiter}
                googleReviewUrl={googleReviewUrl}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Waiters;
