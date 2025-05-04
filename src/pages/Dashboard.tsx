
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RestaurantForm } from '@/components/RestaurantForm';
import { WaiterForm } from '@/components/WaiterForm';
import { WaiterList } from '@/components/WaiterList';
import { Stats } from '@/components/Stats';
import { Leaderboard } from '@/components/Leaderboard';
import { RestaurantMetrics } from '@/components/RestaurantMetrics';
import { ReviewsList } from '@/components/ReviewsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { Waiter, Restaurant, Review } from '@/types';
import { 
  createWaiter, 
  deleteWaiter, 
  getAllWaiters, 
  getRestaurantInfo,
  setRestaurantInfo,
  initializeSampleData
} from '@/services/waiterService';

const Dashboard = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'waiters'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'leaderboard' | 'reviews'>('overview');
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>({ id: '', name: '', googleReviewUrl: '' });
  const auth = useAuth();
  
  useEffect(() => {
    // Initialize sample data for development
    const initData = async () => {
      await initializeSampleData();
      
      // Load initial data
      const fetchedWaiters = await getAllWaiters();
      setWaiters(fetchedWaiters);
      
      const fetchedRestaurant = await getRestaurantInfo();
      setRestaurant(fetchedRestaurant);
    };

    initData();
  }, []);

  const handleAddWaiter = async (name: string, email: string, whatsapp: string) => {
    const newWaiter = await createWaiter(name, email, whatsapp);
    setWaiters([...waiters, newWaiter]);
  };

  const handleDeleteWaiter = async (id: string) => {
    await deleteWaiter(id);
    setWaiters(waiters.filter(w => w.id !== id));
  };

  const handleSaveRestaurant = async (name: string, googleReviewUrl: string) => {
    const updatedRestaurant = await setRestaurantInfo(name, googleReviewUrl);
    setRestaurant({
      ...updatedRestaurant,
      googleReviewUrl: updatedRestaurant.google_review_url || googleReviewUrl
    });
  };
  
  const handleRestaurantUpdate = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
  };
  
  const handleReviewTranslated = (updatedReview: Review) => {
    // Update the restaurant state with the translated review
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage} 
        onNavigate={setActivePage} 
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <h1 className="text-2xl font-bold">
            {activePage === 'dashboard' ? 'Dashboard' : 'Manage Waiters'}
          </h1>
          
          {activePage === 'dashboard' && (
            <>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="pt-4">
                  <Stats waiters={waiters} restaurant={restaurant} />
                  <div className="mt-6">
                    <RestaurantForm restaurant={restaurant} onSave={handleSaveRestaurant} />
                  </div>
                  
                  {restaurant.name && restaurant.googleReviewUrl && (
                    <div className="mt-6">
                      <h2 className="text-lg font-medium mb-2">Restaurant Review Link</h2>
                      <div className="bg-white p-4 rounded-md border">
                        <p className="break-all">{restaurant.googleReviewUrl}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="metrics" className="pt-4">
                  <RestaurantMetrics restaurant={restaurant} onUpdate={handleRestaurantUpdate} />
                </TabsContent>
                
                <TabsContent value="leaderboard" className="pt-4">
                  <Leaderboard />
                </TabsContent>
                
                <TabsContent value="reviews" className="pt-4">
                  <ReviewsList 
                    reviews={restaurant.recentReviews || []} 
                    onReviewTranslated={handleReviewTranslated}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
          
          {activePage === 'waiters' && (
            <>
              <WaiterForm onSave={handleAddWaiter} />
              <div className="mt-6">
                <h2 className="text-lg font-medium mb-4">Your Waiters</h2>
                <WaiterList waiters={waiters} onDelete={handleDeleteWaiter} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
