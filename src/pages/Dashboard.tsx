
import { useState, useEffect, useContext } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RestaurantForm } from '@/components/RestaurantForm';
import { WaiterForm } from '@/components/WaiterForm';
import { WaiterList } from '@/components/WaiterList';
import { Stats } from '@/components/Stats';
import { AuthContext } from '@/App';
import { Waiter, Restaurant } from '@/types';
import { 
  createWaiter, 
  deleteWaiter, 
  getAllWaiters, 
  getRestaurantInfo,
  setRestaurantInfo
} from '@/services/waiterService';

const Dashboard = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'waiters'>('dashboard');
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>({ name: '', googleReviewUrl: '' });
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    // Load initial data
    setWaiters(getAllWaiters());
    setRestaurant(getRestaurantInfo());
  }, []);

  const handleAddWaiter = (name: string, email: string, whatsapp: string) => {
    const newWaiter = createWaiter(name, email, whatsapp);
    setWaiters([...waiters, newWaiter]);
  };

  const handleDeleteWaiter = (id: string) => {
    deleteWaiter(id);
    setWaiters(waiters.filter(w => w.id !== id));
  };

  const handleSaveRestaurant = (name: string, googleReviewUrl: string) => {
    const updatedRestaurant = setRestaurantInfo(name, googleReviewUrl);
    setRestaurant(updatedRestaurant);
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
              <Stats waiters={waiters} restaurant={restaurant} />
              <RestaurantForm restaurant={restaurant} onSave={handleSaveRestaurant} />
              
              {restaurant.name && restaurant.googleReviewUrl && (
                <div className="mt-6">
                  <h2 className="text-lg font-medium mb-2">Restaurant Review Link</h2>
                  <div className="bg-white p-4 rounded-md border">
                    <p className="break-all">{restaurant.googleReviewUrl}</p>
                  </div>
                </div>
              )}
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
