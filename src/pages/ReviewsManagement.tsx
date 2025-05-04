
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import AIReviewResponse from '@/components/AIReviewResponse';
import { Card } from "@/components/ui/card";
import ReviewsListSection from '@/components/reviews/ReviewsListSection';
import { useReviewsManagement } from '@/hooks/useReviewsManagement';
import DashboardLoader from '@/components/dashboard/DashboardLoader';

const ReviewsManagement = () => {
  const {
    reviews,
    selectedReview,
    activeTab,
    isLoading,
    filteredReviews,
    setActiveTab,
    handleSelectReview,
    handleResponseGenerated
  } = useReviewsManagement();

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
            <DashboardLoader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <ReviewsListSection
                    reviews={reviews}
                    filteredReviews={filteredReviews}
                    selectedReview={selectedReview}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onSelectReview={handleSelectReview}
                  />
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
                    <div className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Resposta com IA</h2>
                      <div className="text-center py-16">
                        <p className="text-gray-500">
                          Selecione uma avaliação para gerar uma resposta
                        </p>
                      </div>
                    </div>
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
