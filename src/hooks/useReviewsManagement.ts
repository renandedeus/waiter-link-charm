import { useState, useEffect } from 'react';
import { Review } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useReviewsManagement = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'positive' | 'negative'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to ensure it matches the Review type
      const reviewsWithDate = (data || []).map(review => ({
        ...review,
        date: review.created_at, // Ensure date field exists using created_at
        translated_content: review.translated_content || "",
        translatedContent: review.translated_content || "" // Add camelCase version for compatibility
      }));
      
      setReviews(reviewsWithDate);
      
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addManualReview = async (review: Omit<Review, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          author: review.author,
          rating: review.rating,
          content: review.content,
          restaurant_id: review.restaurantId
        })
        .select();
        
      if (error) throw error;
      
      // Refresh reviews list
      await fetchReviews();
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar avaliação manual:", error);
      return false;
    }
  };
  
  const handleSelectReview = (review: Review) => {
    setSelectedReview(review);
  };
  
  const handleResponseGenerated = async (response: string) => {
    if (!selectedReview) return;
    
    try {
      console.log("Resposta gerada:", response);
      
      // Atualizar a avaliação localmente
      const updatedReviews = reviews.map(rev => 
        rev.id === selectedReview.id 
          ? { ...rev, response } 
          : rev
      );
      
      setReviews(updatedReviews);
      
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
    }
  };
  
  // Filtrar avaliações com base na tab ativa
  const filteredReviews = reviews.filter(review => {
    if (activeTab === 'all') return true;
    if (activeTab === 'positive') return review.rating >= 4;
    if (activeTab === 'negative') return review.rating <= 3;
    return true;
  });

  return {
    reviews,
    selectedReview,
    activeTab,
    isLoading,
    filteredReviews,
    setActiveTab,
    handleSelectReview,
    handleResponseGenerated,
    addManualReview,
    fetchReviews
  };
};
