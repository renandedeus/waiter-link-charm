
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Review } from '@/types';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { translateReview } from '@/services/waiterService';
import { Star, MessageSquare, Globe } from "lucide-react";

interface ReviewsListProps {
  reviews: Review[];
  onReviewTranslated: (review: Review) => void;
}

export const ReviewsList = ({ reviews, onReviewTranslated }: ReviewsListProps) => {
  const [translating, setTranslating] = useState<string | null>(null);
  const { toast } = useToast();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch (e) {
      return dateStr;
    }
  };

  const handleTranslate = async (review: Review) => {
    if (!review.content) return;
    
    setTranslating(review.id);
    try {
      const translatedContent = await translateReview(review.id, review.content);
      
      // Create a new review object with the translated content
      const updatedReview: Review = {
        ...review,
        translated: true,
        translatedContent
      };
      
      onReviewTranslated(updatedReview);
      
      toast({
        title: "Avaliação traduzida",
        description: "A tradução foi concluída com sucesso.",
      });
    } catch (error) {
      console.error('Error translating review:', error);
      toast({
        title: "Erro ao traduzir",
        description: "Ocorreu um erro ao traduzir a avaliação.",
        variant: "destructive",
      });
    } finally {
      setTranslating(null);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Avaliações Recentes</h2>
      
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Nenhuma avaliação encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {review.author || 'Cliente Anônimo'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.date || review.created_at)}
                    </div>
                  </div>
                  {renderRatingStars(review.rating)}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {review.content && (
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 mr-2 mt-0.5 text-gray-400" />
                      <p className="text-gray-700">{review.content}</p>
                    </div>
                    
                    {review.translated && review.translatedContent && (
                      <div className="flex items-start bg-gray-50 p-3 rounded-md">
                        <Globe className="h-5 w-5 mr-2 mt-0.5 text-blue-500" />
                        <div>
                          <div className="flex items-center">
                            <Badge variant="outline" className="mb-1">Traduzido</Badge>
                          </div>
                          <p className="text-gray-700">{review.translatedContent}</p>
                        </div>
                      </div>
                    )}
                    
                    {!review.translated && (
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleTranslate(review)}
                          disabled={translating === review.id}
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          {translating === review.id ? 'Traduzindo...' : 'Traduzir'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {!review.content && (
                  <p className="text-gray-500 italic">O cliente não deixou comentários.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
