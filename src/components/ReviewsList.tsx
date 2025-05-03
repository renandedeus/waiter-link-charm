
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Review } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { translateReview } from '@/services/waiterService';

interface ReviewsListProps {
  reviews: Review[];
  onReviewTranslated: (review: Review) => void;
}

export const ReviewsList = ({ reviews, onReviewTranslated }: ReviewsListProps) => {
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());

  const handleTranslate = async (review: Review) => {
    try {
      // Add to translating state
      setTranslatingIds(prev => new Set(prev).add(review.id));
      
      // Translate the review
      const translatedReview = await translateReview(review.id);
      
      // Notify parent component
      onReviewTranslated(translatedReview);
      
      // Remove from translating state
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(review.id);
        return next;
      });
    } catch (error) {
      console.error('Error translating review:', error);
      setTranslatingIds(prev => {
        const next = new Set(prev);
        next.delete(review.id);
        return next;
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateStr;
    }
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>What your customers are saying</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Customer Reviews ({reviews.length})</h2>
      
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{review.author || 'Anonymous'}</CardTitle>
                <CardDescription>{formatDate(review.date)}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
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
                <Badge>{review.rating}/5</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{review.content}</p>
            
            {review.translated && review.translatedContent && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600 mb-1 font-medium">Translation:</p>
                <p className="text-sm">{review.translatedContent}</p>
              </div>
            )}
            
            {!review.translated && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleTranslate(review)}
                disabled={translatingIds.has(review.id)}
              >
                {translatingIds.has(review.id) ? 'Translating...' : 'Translate'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
