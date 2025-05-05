
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import GoogleConnectionMenu from '@/components/GoogleConnectionMenu';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import WaiterManagement from '@/components/dashboard/WaiterManagement';
import WelcomeVideoHandler from '@/components/dashboard/WelcomeVideoHandler';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWelcomeVideo } from '@/hooks/useWelcomeVideo';
import { UnifiedDashboard } from '@/components/UnifiedDashboard';

const Dashboard = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'waiters' | 'google' | 'reviews'>('dashboard');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'leaderboard' | 'reviews'>('overview');
  
  const {
    waiters,
    restaurant,
    isLoading,
    subscriptionStatus,
    handleAddWaiter,
    handleDeleteWaiter,
    handleSaveRestaurant,
    handleRestaurantUpdate,
    handleReviewTranslated,
  } = useDashboardData();
  
  const { showWelcomeVideo, handleCloseVideoModal } = useWelcomeVideo();

  const handleNavigate = (page: 'dashboard' | 'waiters' | 'google' | 'reviews') => {
    setActivePage(page);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage={activePage} 
        onNavigate={handleNavigate} 
      />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          <DashboardHeader activePage={activePage} />
          
          {isLoading ? (
            <DashboardLoader />
          ) : (
            <>
              {activePage === 'dashboard' && (
                <>
                  {/* Add unified dashboard at the top */}
                  <div className="mb-6">
                    <UnifiedDashboard waiters={waiters} restaurant={restaurant} />
                  </div>
                  
                  <DashboardTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    waiters={waiters}
                    restaurant={restaurant}
                    onSaveRestaurant={handleSaveRestaurant}
                    onRestaurantUpdate={handleRestaurantUpdate}
                    onReviewTranslated={handleReviewTranslated}
                    subscriptionStatus={subscriptionStatus}
                  />
                </>
              )}
              
              {activePage === 'waiters' && (
                <WaiterManagement 
                  waiters={waiters}
                  onAddWaiter={handleAddWaiter}
                  onDeleteWaiter={handleDeleteWaiter}
                />
              )}
              
              {activePage === 'google' && (
                <div className="mt-6">
                  <GoogleConnectionMenu />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <WelcomeVideoHandler 
        showWelcomeVideo={showWelcomeVideo}
        onClose={handleCloseVideoModal}
      />
    </div>
  );
};

export default Dashboard;
