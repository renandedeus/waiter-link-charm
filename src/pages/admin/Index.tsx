import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, LineChart, PieChart, Activity, Users, Building, FileText, FileSpreadsheet, Package, FolderArchive, Settings as SettingsIcon } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      try {
        // Get restaurant count
        const { count: restaurantCount, error: restError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true });

        if (restError) throw restError;
        
        // Get waiter count
        const { count: waiterCount, error: waiterError } = await supabase
          .from('waiters')
          .select('*', { count: 'exact', head: true });

        if (waiterError) throw waiterError;
        
        // Get click count
        const { count: clickCount, error: clickError } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true });

        if (clickError) throw clickError;
        
        // Get review count
        const { count: reviewCount, error: reviewError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        if (reviewError) throw reviewError;
        
        // Get conversion rate
        const { data: conversions, error: convError } = await supabase
          .from('clicks')
          .select('*', { count: 'exact' })
          .eq('converted', true);

        if (convError) throw convError;
        
        const conversionRate = clickCount > 0 ? (conversions?.length || 0) * 100 / clickCount : 0;
        
        // Get active restaurants
        const { count: activeRestaurants, error: activeError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('plan_status', 'active');

        if (activeError) throw activeError;
        
        // Get trial restaurants
        const { count: trialRestaurants, error: trialError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('plan_status', 'trial');

        if (trialError) throw trialError;
        
        // Get expired restaurants
        const { count: expiredRestaurants, error: expiredError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('plan_status', 'expired');

        if (expiredError) throw expiredError;
        
        // Get canceled restaurants
        const { count: canceledRestaurants, error: canceledError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('plan_status', 'canceled');
        
        if (canceledError) throw canceledError;
        
        return {
          restaurantCount: restaurantCount || 0,
          waiterCount: waiterCount || 0,
          clickCount: clickCount || 0,
          reviewCount: reviewCount || 0,
          conversionRate,
          activeRestaurants: activeRestaurants || 0,
          trialRestaurants: trialRestaurants || 0,
          expiredRestaurants: expiredRestaurants || 0,
          canceledRestaurants: canceledRestaurants || 0
        };
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        return {
          restaurantCount: 0,
          waiterCount: 0,
          clickCount: 0,
          reviewCount: 0,
          conversionRate: 0,
          activeRestaurants: 0,
          trialRestaurants: 0,
          expiredRestaurants: 0,
          canceledRestaurants: 0
        };
      }
    }
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email}</h2>
        <p className="text-muted-foreground">
          Here's an overview of your waiter link platform
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Restaurants
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.restaurantCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Active: {isLoading ? "..." : stats?.activeRestaurants}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Waiters
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.waiterCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : (stats?.waiterCount && stats.restaurantCount ? (stats.waiterCount / stats.restaurantCount).toFixed(1) : 0)} per restaurant avg.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clicks
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.clickCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : stats?.conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reviews
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats?.reviewCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "..." : (stats?.reviewCount && stats.clickCount ? (stats.reviewCount * 100 / stats.clickCount).toFixed(1) : 0)}% of clicks
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Click Analysis</CardTitle>
            <CardDescription>
              Click metrics and conversion rates over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <LineChart className="h-16 w-16 text-muted-foreground" />
            <p className="ml-4 text-muted-foreground">Analysis chart will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>
              Restaurant distribution by plan
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="h-full flex flex-col items-center justify-center">
              <PieChart className="h-16 w-16 text-muted-foreground mb-4" />
              {!isLoading && (
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                      Active
                    </span>
                    <span>{stats?.activeRestaurants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                      Trial
                    </span>
                    <span>{stats?.trialRestaurants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                      Expired
                    </span>
                    <span>{stats?.expiredRestaurants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-gray-500 mr-2"></span>
                      Canceled
                    </span>
                    <span>{stats?.canceledRestaurants}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-gray-50 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">
              Exports
            </CardTitle>
            <FileSpreadsheet className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate reports and export data in CSV format
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-gray-50 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">
              Backups
            </CardTitle>
            <FolderArchive className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage database backups and restoration
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-gray-50 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">
              Settings
            </CardTitle>
            <SettingsIcon className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure platform settings and defaults
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:bg-gray-50 cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg font-medium">
              API Access
            </CardTitle>
            <Package className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View API keys and documentation
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Admin;
