
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/auth';
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
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize data for development
    const initData = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          await initializeSampleData(user.id);
          
          // Load initial data
          const fetchedWaiters = await getAllWaiters(user.id);
          setWaiters(fetchedWaiters);
          
          const fetchedRestaurant = await getRestaurantInfo(user.id);
          
          // Transform data from snake_case (database) to camelCase (app)
          setRestaurant({
            id: fetchedRestaurant.id,
            name: fetchedRestaurant.name,
            googleReviewUrl: fetchedRestaurant.google_review_url || fetchedRestaurant.googleReviewUrl || '',
            google_review_url: fetchedRestaurant.google_review_url,
            responsible_name: fetchedRestaurant.responsible_name,
            responsible_email: fetchedRestaurant.responsible_email,
            responsible_phone: fetchedRestaurant.responsible_phone,
            totalReviews: fetchedRestaurant.total_reviews || fetchedRestaurant.totalReviews,
            total_reviews: fetchedRestaurant.total_reviews,
            initialRating: fetchedRestaurant.initial_rating || fetchedRestaurant.initialRating,
            initial_rating: fetchedRestaurant.initial_rating,
            currentRating: fetchedRestaurant.current_rating || fetchedRestaurant.currentRating,
            current_rating: fetchedRestaurant.current_rating,
            positiveFeedback: fetchedRestaurant.positive_feedback || fetchedRestaurant.positiveFeedback,
            positive_feedback: fetchedRestaurant.positive_feedback,
            negativeFeedback: fetchedRestaurant.negative_feedback || fetchedRestaurant.negativeFeedback,
            negative_feedback: fetchedRestaurant.negative_feedback,
            plan_status: fetchedRestaurant.plan_status,
            plan_expiry_date: fetchedRestaurant.plan_expiry_date,
            created_at: fetchedRestaurant.created_at,
            updated_at: fetchedRestaurant.updated_at
          });
          
          // Check subscription status
          try {
            const { data, error } = await supabase.functions.invoke('check-subscription');
            if (!error && data) {
              setSubscriptionStatus(data);
            }
          } catch (subError) {
            console.error('Error checking subscription:', subError);
          }
        }
      } catch (error) {
        console.error('Error initializing data:', error);
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
  }, [toast, user]);

  const handleAddWaiter = async (name: string, email: string, whatsapp: string): Promise<Waiter> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }
    
    try {
      const newWaiter = await createWaiter({
        name,
        email,
        whatsapp,
        restaurantId: user.id
      });
      
      setWaiters(prev => [...prev, newWaiter]);
      return newWaiter;
    } catch (error) {
      console.error("Error adding waiter:", error);
      toast({
        title: "Erro ao adicionar garçom",
        description: "Ocorreu um erro ao adicionar o garçom. Por favor, tente novamente.",
        variant: "destructive",
      });
      throw error; // Re-throw for UI to handle
    }
  };

  const handleDeleteWaiter = async (id: string) => {
    try {
      await deleteWaiter(id);
      setWaiters(waiters.filter(w => w.id !== id));
    } catch (error) {
      console.error("Error deleting waiter:", error);
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
      
      // Transform data from snake_case (database) to camelCase (app)
      const restaurant = {
        id: updatedRestaurant.id,
        name: updatedRestaurant.name,
        googleReviewUrl: updatedRestaurant.google_review_url,
        google_review_url: updatedRestaurant.google_review_url,
        responsible_name: updatedRestaurant.responsible_name,
        responsible_email: updatedRestaurant.responsible_email,
        responsible_phone: updatedRestaurant.responsible_phone,
        totalReviews: updatedRestaurant.total_reviews,
        total_reviews: updatedRestaurant.total_reviews,
        initialRating: updatedRestaurant.initial_rating,
        initial_rating: updatedRestaurant.initial_rating,
        currentRating: updatedRestaurant.current_rating,
        current_rating: updatedRestaurant.current_rating,
        positiveFeedback: updatedRestaurant.positive_feedback,
        positive_feedback: updatedRestaurant.positive_feedback,
        negativeFeedback: updatedRestaurant.negative_feedback,
        negative_feedback: updatedRestaurant.negative_feedback,
        plan_status: updatedRestaurant.plan_status,
        plan_expiry_date: updatedRestaurant.plan_expiry_date,
        created_at: updatedRestaurant.created_at,
        updated_at: updatedRestaurant.updated_at
      };
      
      setRestaurant(restaurant);
      
      toast({
        title: "Informações salvas",
        description: "As informações do restaurante foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error saving restaurant info:", error);
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
    // Update restaurant state with translated review
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
