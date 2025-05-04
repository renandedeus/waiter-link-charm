
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Review } from '@/types';
import { ReviewsList } from '@/components/ReviewsList';
import AIReviewResponse from '@/components/AIReviewResponse';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

const ReviewsManagement = () => {
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
      
      // Em uma implementação real, isso buscaria do banco de dados
      // Para demonstração, usaremos dados simulados
      
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
  
  const handleSelectReview = (review: Review) => {
    setSelectedReview(review);
  };
  
  const handleResponseGenerated = async (response: string) => {
    if (!selectedReview) return;
    
    try {
      // Em uma implementação real, isso salvaria a resposta no banco de dados
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage={'reviews'} 
        onNavigate={(page) => console.log(page)} 
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <h1 className="text-2xl font-bold">Gerenciamento de Avaliações</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Carregando...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Avaliações dos Clientes</CardTitle>
                      <div className="flex space-x-2">
                        <Badge variant={activeTab === 'all' ? "default" : "outline"} 
                               onClick={() => setActiveTab('all')} 
                               className="cursor-pointer">
                          Todas ({reviews.length})
                        </Badge>
                        <Badge variant={activeTab === 'positive' ? "default" : "outline"} 
                               onClick={() => setActiveTab('positive')} 
                               className="cursor-pointer">
                          Positivas ({reviews.filter(r => r.rating >= 4).length})
                        </Badge>
                        <Badge variant={activeTab === 'negative' ? "default" : "outline"} 
                               onClick={() => setActiveTab('negative')} 
                               className="cursor-pointer">
                          Negativas ({reviews.filter(r => r.rating <= 3).length})
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Clique em uma avaliação para gerar uma resposta com IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredReviews.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                          Nenhuma avaliação encontrada.
                        </p>
                      ) : (
                        filteredReviews.map(review => (
                          <div 
                            key={review.id}
                            onClick={() => handleSelectReview(review)} 
                            className={`p-4 border rounded-md cursor-pointer transition-colors ${
                              selectedReview?.id === review.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{review.author || 'Anônimo'}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.date).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`${
                                      star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    } text-lg`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="mt-2 text-sm">{review.content}</p>
                            
                            {review.response && (
                              <div className="mt-3 bg-gray-50 p-3 rounded-md">
                                <p className="text-xs font-medium text-gray-500 mb-1">Sua resposta:</p>
                                <p className="text-sm">{review.response}</p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                {selectedReview ? (
                  <AIReviewResponse 
                    reviewContent={selectedReview.content || ''} 
                    rating={selectedReview.rating} 
                    onResponseGenerated={handleResponseGenerated} 
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resposta com IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-16">
                        <p className="text-gray-500">
                          Selecione uma avaliação para gerar uma resposta
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsManagement;
