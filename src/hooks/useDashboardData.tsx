
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Waiter, Restaurant, Review } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { 
  createWaiter, 
  deleteWaiter, 
  getAllWaiters, 
  getRestaurantInfo,
  setRestaurantInfo,
  initializeSampleData
} from '@/services/waiterService';

export const useDashboardData = () => {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>({ id: '', name: '', googleReviewUrl: '' });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  
  const auth = useAuth();
  const { toast } = useToast();
  
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

  return {
    waiters,
    restaurant,
    isLoading,
    subscriptionStatus,
    handleAddWaiter,
    handleDeleteWaiter,
    handleSaveRestaurant,
    handleRestaurantUpdate,
    handleReviewTranslated,
  };
};
