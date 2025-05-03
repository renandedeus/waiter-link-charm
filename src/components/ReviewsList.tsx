
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Review } from '@/types';
import { translateReview } from '@/services/waiterService';
import { Star, Languages } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface ReviewsListProps {
  reviews: Review[];
  onReviewTranslated: (updatedReview: Review) => void;
}

export const ReviewsList = ({ reviews, onReviewTranslated }: ReviewsListProps) => {
  const { toast } = useToast();

  const handleTranslate = (reviewId: string) => {
    const translatedReview = translateReview(reviewId);
    if (translatedReview) {
      onReviewTranslated(translatedReview);
      toast({
        title: "Translation complete",
        description: "The review has been translated.",
      });
    }
  };

  // Render stars based on rating (1-5)
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
        <CardDescription>Latest customer feedback from Google</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">No reviews available.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{review.author || "Anonymous"}</p>
                      <div className="flex items-center mt-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <p className="text-sm">{review.content}</p>
                    
                    {review.translated && review.translatedContent && (
                      <div className="mt-2 pt-2 border-t text-sm">
                        <p className="text-gray-600">{review.translatedContent}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {!review.translated && (
                  <CardFooter className="pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTranslate(review.id)}
                      className="text-xs flex items-center"
                    >
                      <Languages className="h-3 w-3 mr-1" />
                      Translate
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
