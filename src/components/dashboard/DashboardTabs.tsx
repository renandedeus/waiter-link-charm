
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stats } from '@/components/Stats';
import { RestaurantForm } from '@/components/RestaurantForm';
import { RestaurantMetrics } from '@/components/RestaurantMetrics';
import { Leaderboard } from '@/components/Leaderboard';
import { ReviewsList } from '@/components/ReviewsList';
import { Restaurant, Review } from '@/types';
import { Waiter } from '@/types';

interface DashboardTabsProps {
  activeTab: 'overview' | 'metrics' | 'leaderboard' | 'reviews';
  setActiveTab: (tab: 'overview' | 'metrics' | 'leaderboard' | 'reviews') => void;
  waiters: Waiter[];
  restaurant: Restaurant;
  onSaveRestaurant: (name: string, googleReviewUrl: string) => Promise<void>;
  onRestaurantUpdate: (restaurant: Restaurant) => void;
  onReviewTranslated: (review: Review) => void;
  subscriptionStatus: any;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  setActiveTab,
  waiters,
  restaurant,
  onSaveRestaurant,
  onRestaurantUpdate,
  onReviewTranslated,
  subscriptionStatus
}) => {
  return (
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
          <RestaurantForm restaurant={restaurant} onSave={onSaveRestaurant} />
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
        <RestaurantMetrics restaurant={restaurant} onUpdate={onRestaurantUpdate} />
      </TabsContent>
      
      <TabsContent value="leaderboard" className="pt-4">
        <Leaderboard />
      </TabsContent>
      
      <TabsContent value="reviews" className="pt-4">
        <ReviewsList 
          reviews={restaurant.recentReviews || []} 
          onReviewTranslated={onReviewTranslated}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
