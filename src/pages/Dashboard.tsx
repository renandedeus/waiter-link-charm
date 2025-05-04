import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { RestaurantForm } from '@/components/RestaurantForm';
import { WaiterForm } from '@/components/WaiterForm';
import { WaiterList } from '@/components/WaiterList';
import { Stats } from '@/components/Stats';
import { Leaderboard } from '@/components/Leaderboard';
import { RestaurantMetrics } from '@/components/RestaurantMetrics';
import { ReviewsList } from '@/components/ReviewsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { Waiter, Restaurant, Review } from '@/types';
import { useToast } from "@/components/ui/use-toast";
import WelcomeVideoModal from '@/components/WelcomeVideoModal';
import GoogleConnectionMenu from '@/components/GoogleConnectionMenu';
import { 
  createWaiter, 
  deleteWaiter, 
  getAllWaiters, 
  getRestaurantInfo,
  setRestaurantInfo,
  initializeSampleData
} from '@/services/waiterService';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [activePage, setActivePage] = useState<'dashboard' | 'waiters' | 'google' | 'reviews'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'leaderboard' | 'reviews'>('overview');
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>({ id: '', name: '', googleReviewUrl: '' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState<boolean>(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  
  const auth = useAuth();
  const { toast } = useToast();
  
  const paymentSuccess = searchParams.get('payment_success') === 'true';
  const selectedPlan = searchParams.get('plan');
  
  // Verificar se o usuário está chegando após um pagamento bem-sucedido
  useEffect(() => {
    if (paymentSuccess) {
      setShowWelcomeVideo(true);
      if (selectedPlan) {
        toast({
          title: `Plano ${selectedPlan} ativado com sucesso!`,
          description: "Seu pagamento foi processado com sucesso. Aproveite todos os recursos do Waiter Link!",
          variant: "success",
        });
      }
    }
  }, [paymentSuccess, selectedPlan, toast]);
  
  useEffect(() => {
    // Inicializar dados de exemplo para desenvolvimento
    const initData = async () => {
      try {
        setIsLoading(true);
        await initializeSampleData();
        
        // Carregar dados iniciais
        const fetchedWaiters = await getAllWaiters();
        setWaiters(fetchedWaiters);
        
        const fetchedRestaurant = await getRestaurantInfo();
        setRestaurant(fetchedRestaurant);
        
        // Verificar status da assinatura
        if (auth.user) {
          const { data, error } = await supabase.functions.invoke('check-subscription');
          if (!error && data) {
            setSubscriptionStatus(data);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Usando dados locais para continuar.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [toast, auth.user]);

  const handleAddWaiter = async (name: string, email: string, whatsapp: string): Promise<Waiter> => {
    try {
      const newWaiter = await createWaiter(name, email, whatsapp);
      setWaiters(prev => [...prev, newWaiter]);
      return newWaiter;
    } catch (error) {
      console.error("Erro ao adicionar garçom:", error);
      toast({
        title: "Erro ao adicionar garçom",
        description: "Ocorreu um erro ao adicionar o garçom. Por favor, tente novamente.",
        variant: "destructive",
      });
      throw error; // Re-throw para que a UI possa lidar com o erro
    }
  };

  const handleDeleteWaiter = async (id: string) => {
    try {
      await deleteWaiter(id);
      setWaiters(waiters.filter(w => w.id !== id));
    } catch (error) {
      console.error("Erro ao excluir garçom:", error);
      toast({
        title: "Erro ao excluir garçom",
        description: "Ocorreu um erro ao excluir o garçom. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRestaurant = async (name: string, googleReviewUrl: string) => {
    try {
      const updatedRestaurant = await setRestaurantInfo(name, googleReviewUrl);
      setRestaurant(updatedRestaurant);
      toast({
        title: "Informações salvas",
        description: "As informações do restaurante foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar informações do restaurante:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as informações. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleRestaurantUpdate = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
  };
  
  const handleReviewTranslated = (updatedReview: Review) => {
    // Atualizar o estado do restaurante com a avaliação traduzida
    setRestaurant(current => {
      const updatedReviews = current.recentReviews?.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      );
      
      return {
        ...current,
        recentReviews: updatedReviews
      };
    });
  };
  
  const handleCloseVideoModal = () => {
    setShowWelcomeVideo(false);
  };

  const handleNavigate = (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => {
    setActivePage(page);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <h1 className="text-2xl font-bold">
            {activePage === 'dashboard' ? 'Painel' : activePage === 'waiters' ? 'Gerenciar Garçons' : 'Conexão Google'}
          </h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Carregando...</p>
              </div>
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                      <TabsTrigger value="metrics">Métricas</TabsTrigger>
                      <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
                      <TabsTrigger value="reviews">Avaliações</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="pt-4">
                      <Stats waiters={waiters} restaurant={restaurant} />
                      <div className="mt-6">
                        <RestaurantForm restaurant={restaurant} onSave={handleSaveRestaurant} />
                      </div>
                      
                      {restaurant.name && restaurant.googleReviewUrl && (
                        <div className="mt-6">
                          <h2 className="text-lg font-medium mb-2">Link de Avaliação do Restaurante</h2>
                          <div className="bg-white p-4 rounded-md border">
                            <p className="break-all">{restaurant.googleReviewUrl}</p>
                          </div>
                        </div>
                      )}
                      
                      {subscriptionStatus && (
                        <div className="mt-6">
                          <h2 className="text-lg font-medium mb-2">Status da Assinatura</h2>
                          <div className={`bg-white p-4 rounded-md border ${
                            subscriptionStatus.isSubscribed ? 'border-green-300' : 'border-yellow-300'
                          }`}>
                            <p className="font-medium">
                              {subscriptionStatus.isSubscribed ? 'Assinatura Ativa' : 'Sem Assinatura Ativa'}
                            </p>
                            {subscriptionStatus.plan && (
                              <p className="text-sm text-gray-600">
                                Plano: {subscriptionStatus.plan === 'mensal' ? 'Mensal' : 
                                        subscriptionStatus.plan === 'semestral' ? 'Semestral' : 'Anual'}
                              </p>
                            )}
                            {subscriptionStatus.ends_at && (
                              <p className="text-sm text-gray-600">
                                Válido até: {new Date(subscriptionStatus.ends_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="metrics" className="pt-4">
                      <RestaurantMetrics restaurant={restaurant} onUpdate={handleRestaurantUpdate} />
                    </TabsContent>
                    
                    <TabsContent value="leaderboard" className="pt-4">
                      <Leaderboard />
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="pt-4">
                      <ReviewsList 
                        reviews={restaurant.recentReviews || []} 
                        onReviewTranslated={handleReviewTranslated}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              )}
              
              {activePage === 'waiters' && (
                <>
                  <WaiterForm onSave={handleAddWaiter} />
                  <div className="mt-6">
                    <h2 className="text-lg font-medium mb-4">Seus Garçons</h2>
                    <WaiterList waiters={waiters} onDelete={handleDeleteWaiter} />
                  </div>
                </>
              )}
              
              {activePage === 'google' && (
                <div className="mt-6">
                  <GoogleConnectionMenu />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <WelcomeVideoModal 
        videoId="Z26ueJM-EGM" 
        isOpen={showWelcomeVideo} 
        onClose={handleCloseVideoModal} 
      />
    </div>
  );
};

export default Dashboard;
