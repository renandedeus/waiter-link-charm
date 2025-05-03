
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Waiter, Review, Click, AccessLog, Backup } from '@/types';

// Restaurant services
export const fetchRestaurants = async (
  search?: string,
  plan_status?: string,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  try {
    let query = supabase
      .from('restaurants')
      .select('*, waiters(count)', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (plan_status) {
      query = query.eq('plan_status', plan_status);
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Transform the data format
    const formattedData = data.map(restaurant => ({
      ...restaurant,
      waiter_count: restaurant.waiters?.[0]?.count || 0,
      waiters: undefined // Remove the original waiters property
    }));

    return { 
      data: formattedData, 
      count: count || 0,
      error: null
    };
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return { data: [], count: 0, error };
  }
};

export const fetchRestaurantDetails = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return { data: null, error };
  }
};

export const updateRestaurant = async (id: string, updates: Partial<Restaurant>) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return { data: null, error };
  }
};

export const createRestaurant = async (restaurant: Partial<Restaurant>) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name: restaurant.name,
        google_review_url: restaurant.googleReviewUrl,
        responsible_name: restaurant.responsible_name,
        responsible_email: restaurant.responsible_email,
        responsible_phone: restaurant.responsible_phone,
        plan_status: restaurant.plan_status || 'trial',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return { data: null, error };
  }
};

export const deleteRestaurant = async (id: string) => {
  try {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return { error };
  }
};

// Waiter services
export const fetchWaitersByRestaurant = async (restaurantId: string) => {
  try {
    const { data, error } = await supabase
      .from('waiters')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('name', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching waiters:', error);
    return { data: [], error };
  }
};

export const updateWaiter = async (id: string, updates: Partial<Waiter>) => {
  try {
    const { data, error } = await supabase
      .from('waiters')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating waiter:', error);
    return { data: null, error };
  }
};

export const createWaiter = async (waiter: Partial<Waiter>) => {
  try {
    // Generate a unique tracking token
    const trackingToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);

    const { data, error } = await supabase
      .from('waiters')
      .insert({
        restaurant_id: waiter.restaurant_id,
        name: waiter.name,
        email: waiter.email,
        whatsapp: waiter.whatsapp,
        tracking_token: trackingToken,
        is_active: true,
        clicks: 0,
        conversions: 0
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating waiter:', error);
    return { data: null, error };
  }
};

export const deleteWaiter = async (id: string) => {
  try {
    const { error } = await supabase
      .from('waiters')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting waiter:', error);
    return { error };
  }
};

// Stats and analytics services
export const fetchRestaurantStats = async (restaurantId: string) => {
  try {
    // Get total clicks
    const { data: clicksData, error: clicksError } = await supabase
      .from('clicks')
      .select('id', { count: 'exact' })
      .eq('restaurant_id', restaurantId);

    if (clicksError) throw clicksError;
    
    // Get total conversions
    const { data: conversionsData, error: conversionsError } = await supabase
      .from('clicks')
      .select('id', { count: 'exact' })
      .eq('restaurant_id', restaurantId)
      .eq('converted', true);

    if (conversionsError) throw conversionsError;
    
    // Get total reviews
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id', { count: 'exact' })
      .eq('restaurant_id', restaurantId);

    if (reviewsError) throw reviewsError;
    
    return {
      data: {
        totalClicks: clicksData?.length || 0,
        totalConversions: conversionsData?.length || 0,
        totalReviews: reviewsData?.length || 0,
        conversionRate: clicksData?.length ? 
          (conversionsData?.length / clicksData?.length) * 100 : 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching restaurant stats:', error);
    return { 
      data: {
        totalClicks: 0,
        totalConversions: 0,
        totalReviews: 0,
        conversionRate: 0
      }, 
      error 
    };
  }
};

// Export services
export const generateCSVReport = async (
  restaurantId: string,
  reportType: 'waiter_clicks' | 'monthly_ranking' | 'reviews_evolution',
  month: number,
  year: number
) => {
  try {
    // In a real implementation, this would generate a CSV report
    // For now, we're just returning mock data
    
    const { data: restaurant } = await fetchRestaurantDetails(restaurantId);
    
    return {
      data: {
        reportUrl: `reports/${reportType}_${restaurantId}_${month}_${year}.csv`,
        generatedAt: new Date().toISOString(),
        restaurantName: restaurant?.name || 'Unknown'
      },
      error: null
    };
  } catch (error) {
    console.error('Error generating CSV report:', error);
    return { data: null, error };
  }
};

// Access logs and security
export const logSystemAccess = async (
  userType: 'admin' | 'restaurant' | 'waiter' | 'visitor',
  userId: string | undefined,
  action: string,
  details: any = {}
) => {
  try {
    const { error } = await supabase
      .from('access_logs')
      .insert({
        user_type: userType,
        user_id: userId,
        action,
        ip_address: 'client-side', // In a real implementation, this would be captured server-side
        user_agent: navigator.userAgent,
        details
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error logging access:', error);
    return { error };
  }
};

// Backup services
export const fetchBackups = async () => {
  try {
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching backups:', error);
    return { data: [], error };
  }
};

export const createBackup = async (backupType: 'manual' | 'automatic' = 'manual') => {
  try {
    const newBackup = {
      file_path: `backups/${backupType}_backup_${new Date().toISOString().replace(/[:.]/g, '_')}.sql`,
      file_size: Math.floor(Math.random() * 5000000) + 1000000, // Random size between 1-6 MB
      backup_type: backupType,
      status: 'completed',
    };
    
    const { data, error } = await supabase
      .from('backups')
      .insert(newBackup)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating backup:', error);
    return { data: null, error };
  }
};

// Admin user services
export const checkAdminStatus = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows found" error
      throw error;
    }

    return { isAdmin: !!data, data, error: null };
  } catch (error) {
    console.error('Error checking admin status:', error);
    return { isAdmin: false, data: null, error };
  }
};

export const createAdminUser = async (email: string, name: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email,
        name,
        role: 'admin'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { data: null, error };
  }
};
