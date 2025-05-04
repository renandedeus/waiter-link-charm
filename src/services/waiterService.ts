
import { supabase } from '@/integrations/supabase/client';
import { Waiter, LeaderboardEntry, MonthlyChampion } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Waiter management functions
export const getWaiters = async (restaurantId: string): Promise<Waiter[]> => {
  try {
    const { data, error } = await supabase
      .from('waiters')
      .select('*')
      .eq('restaurant_id', restaurantId);
      
    if (error) throw error;
    
    // Transform database model to app model
    const transformedData: Waiter[] = data.map(waiter => ({
      id: waiter.id,
      trackingId: waiter.tracking_token,
      restaurantId: waiter.restaurant_id,
      name: waiter.name,
      email: waiter.email || '',
      whatsapp: waiter.whatsapp || '',
      trackingLink: `${window.location.origin}/r/${waiter.tracking_token}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/r/${waiter.tracking_token}`)}`,
      clicks: waiter.clicks || 0,
      createdAt: waiter.created_at,
      conversions: waiter.conversions || 0,
      isActive: waiter.is_active
    }));
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching waiters:', error);
    throw error;
  }
};

export const createWaiter = async (waiterData: {
  name: string;
  email: string;
  whatsapp: string;
  restaurantId: string;
}): Promise<Waiter> => {
  try {
    const id = uuidv4();
    const trackingToken = uuidv4();
    
    const baseUrl = window.location.origin;
    const trackingLink = `${baseUrl}/r/${trackingToken}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingLink)}`;
    
    // Insert into database with database model structure
    const { error } = await supabase.from('waiters').insert({
      id,
      name: waiterData.name,
      email: waiterData.email,
      whatsapp: waiterData.whatsapp,
      restaurant_id: waiterData.restaurantId,
      tracking_token: trackingToken,
      clicks: 0,
      conversions: 0,
      is_active: true
    });
    
    if (error) throw error;
    
    // Return app model structure
    const waiter: Waiter = {
      id,
      trackingId: trackingToken,
      restaurantId: waiterData.restaurantId,
      name: waiterData.name,
      email: waiterData.email,
      whatsapp: waiterData.whatsapp,
      trackingLink,
      qrCodeUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
      conversions: 0,
      isActive: true
    };
    
    return waiter;
  } catch (error) {
    console.error('Error creating waiter:', error);
    throw error;
  }
};

export const deleteWaiter = async (waiterId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('waiters').delete().eq('id', waiterId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting waiter:', error);
    throw error;
  }
};

// Restaurant metrics functions
export const setRestaurantInfo = async (
  name: string,
  googleReviewUrl: string,
  totalReviews: number = 0,
  initialRating: number = 0,
  currentRating: number = 0
): Promise<any> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    
    if (!userId) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        name,
        google_review_url: googleReviewUrl,
        total_reviews: totalReviews,
        initial_rating: initialRating,
        current_rating: currentRating,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating restaurant info:', error);
    throw error;
  }
};

export const updateRestaurantFeedback = async (
  positiveFeedback: string,
  negativeFeedback: string
): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;
    
    if (!userId) throw new Error("User not authenticated");
    
    const { error } = await supabase
      .from('restaurants')
      .update({
        positive_feedback: positiveFeedback,
        negative_feedback: negativeFeedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating restaurant feedback:', error);
    throw error;
  }
};

export const getRestaurantInfo = async (restaurantId?: string): Promise<any> => {
  try {
    let id = restaurantId;
    
    if (!id) {
      const { data: user } = await supabase.auth.getUser();
      id = user.user?.id;
      
      if (!id) throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform to match app's Restaurant model
    const restaurant = {
      id: data.id,
      name: data.name,
      googleReviewUrl: data.google_review_url,
      responsible_name: data.responsible_name,
      responsible_email: data.responsible_email,
      responsible_phone: data.responsible_phone,
      totalReviews: data.total_reviews,
      initialRating: data.initial_rating,
      currentRating: data.current_rating,
      positiveFeedback: data.positive_feedback,
      negativeFeedback: data.negative_feedback,
      plan_status: data.plan_status,
      plan_expiry_date: data.plan_expiry_date,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
    
    return restaurant;
  } catch (error) {
    console.error('Error fetching restaurant info:', error);
    throw error;
  }
};

// Click tracking functions
export const getTotalClicks = async (restaurantId?: string): Promise<number> => {
  try {
    let id = restaurantId;
    
    if (!id) {
      const { data: user } = await supabase.auth.getUser();
      id = user.user?.id;
      
      if (!id) throw new Error("User not authenticated");
    }
    
    const { count, error } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', id);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting total clicks:', error);
    return 0;
  }
};

export const getTotalConversions = async (restaurantId?: string): Promise<number> => {
  try {
    let id = restaurantId;
    
    if (!id) {
      const { data: user } = await supabase.auth.getUser();
      id = user.user?.id;
      
      if (!id) throw new Error("User not authenticated");
    }
    
    const { count, error } = await supabase
      .from('clicks')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', id)
      .eq('converted', true);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting total conversions:', error);
    return 0;
  }
};

// Leaderboard functions
export const getCurrentLeaderboard = async (restaurantId?: string): Promise<LeaderboardEntry[]> => {
  try {
    let id = restaurantId;
    
    if (!id) {
      const { data: user } = await supabase.auth.getUser();
      id = user.user?.id;
      
      if (!id) throw new Error("User not authenticated");
    }
    
    const waiters = await getWaiters(id);
    
    // Sort by clicks and add position
    const sortedWaiters = [...waiters].sort((a, b) => b.clicks - a.clicks);
    
    return sortedWaiters.map((waiter, index) => ({
      waiterId: waiter.id,
      waiterName: waiter.name,
      clicks: waiter.clicks,
      position: index + 1
    }));
  } catch (error) {
    console.error('Error getting current leaderboard:', error);
    return [];
  }
};

export const getMonthlyChampions = async (restaurantId?: string): Promise<MonthlyChampion[]> => {
  try {
    let id = restaurantId;
    
    if (!id) {
      const { data: user } = await supabase.auth.getUser();
      id = user.user?.id;
      
      if (!id) throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from('monthly_champions')
      .select('*')
      .eq('restaurant_id', id)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(12);
    
    if (error) throw error;
    return data as MonthlyChampion[];
  } catch (error) {
    console.error('Error getting monthly champions:', error);
    return [];
  }
};

export const getDaysUntilEndOfMonth = (): number => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.getDate() - today.getDate() + 1;
};

// For dashboard initialization
export const getAllWaiters = async (restaurantId?: string): Promise<Waiter[]> => {
  return getWaiters(restaurantId || '');
};

export const initializeSampleData = async (restaurantId?: string): Promise<void> => {
  // This function would create sample data for new restaurants
  // Implementation depends on your requirements
  console.log('Initializing sample data for restaurant:', restaurantId);
};

// Review management
export const translateReview = async (reviewId: string, content: string): Promise<string> => {
  try {
    // This would connect to a translation API
    // For now we'll just simulate a translation
    const { error } = await supabase
      .from('reviews')
      .update({ translated: true, translated_content: `Translated: ${content}` })
      .eq('id', reviewId);
    
    if (error) throw error;
    return `Translated: ${content}`;
  } catch (error) {
    console.error('Error translating review:', error);
    throw error;
  }
};
