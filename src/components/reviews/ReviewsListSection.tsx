
import React from 'react';
import { Review } from '@/types';
import ReviewFilterTabs from './ReviewFilterTabs';
import ReviewItem from './ReviewItem';
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewsListSectionProps {
  reviews: Review[];
  filteredReviews: Review[];
  selectedReview: Review | null;
  activeTab: 'all' | 'positive' | 'negative';
  setActiveTab: (tab: 'all' | 'positive' | 'negative') => void;
  onSelectReview: (review: Review) => void;
}

const ReviewsListSection: React.FC<ReviewsListSectionProps> = ({
  reviews,
  filteredReviews,
  selectedReview,
  activeTab,
  setActiveTab,
  onSelectReview
}) => {
  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Avaliações dos Clientes</CardTitle>
          <ReviewFilterTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            reviews={reviews} 
          />
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
              <ReviewItem 
                key={review.id}
                review={review}
                isSelected={selectedReview?.id === review.id}
                onClick={() => onSelectReview(review)}
              />
            ))
          )}
        </div>
      </CardContent>
    </>
  );
};

export default ReviewsListSection;
