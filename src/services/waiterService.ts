
import { supabase } from '@/integrations/supabase/client';
import { Waiter, Restaurant, Review } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Get base URL for tracking links
const getBaseUrl = () => {
  return window.location.origin + '/r/';
};

// Generate a QR code URL (using QRCode.js library when integrated)
const generateQRCodeURL = (trackingLink: string) => {
  // This is a placeholder. We'll use an actual QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingLink)}`;
};

// Create a new waiter with a unique tracking link
export const createWaiter = async (name: string, email: string, whatsapp: string): Promise<Waiter> => {
  // Generate a unique token for the waiter
  const trackingToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
  
  let restaurant: Restaurant;
  
  // Get the restaurant ID - use the first one we find for now
  // In a real app, we'd have the current restaurant ID from context
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1)
    .single();
  
  restaurant = restaurants;
  
  // If no restaurant exists yet, create a default one
  if (!restaurant) {
    const { data } = await supabase
      .from('restaurants')
      .insert({
        name: 'My Restaurant',
        google_review_url: 'https://g.page/r/example-restaurant-review',
        plan_status: 'trial'
      })
      .select()
      .single();
    
    restaurant = data;
  }
  
  // Create the waiter in the database
  const { data, error } = await supabase
    .from('waiters')
    .insert({
      restaurant_id: restaurant.id,
      name,
      email,
      whatsapp,
      tracking_token: trackingToken,
      clicks: 0,
      conversions: 0,
      is_active: true
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating waiter:', error);
    throw error;
  }
  
  // Add computed fields
  const waiter: Waiter = {
    ...data,
    trackingLink: `${getBaseUrl()}${data.tracking_token}`,
    qrCodeUrl: generateQRCodeURL(`${getBaseUrl()}${data.tracking_token}`),
    isTopPerformer: false
  };
  
  updateTopPerformers();
  return waiter;
};

// Get all waiters
export const getAllWaiters = async (): Promise<Waiter[]> => {
  let restaurant: Restaurant;
  
  // Get the restaurant ID - use the first one we find for now
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1)
    .single();
  
  restaurant = restaurants;
  
  // If no restaurant exists, return empty array
  if (!restaurant) {
    return [];
  }
  
  // Get all waiters for this restaurant
  const { data, error } = await supabase
    .from('waiters')
    .select('*')
    .eq('restaurant_id', restaurant.id);
  
  if (error) {
    console.error('Error getting waiters:', error);
    return [];
  }
  
  // Add computed fields
  const waiters: Waiter[] = data.map(waiter => ({
    ...waiter,
    trackingLink: `${getBaseUrl()}${waiter.tracking_token}`,
    qrCodeUrl: generateQRCodeURL(`${getBaseUrl()}${waiter.tracking_token}`),
    isTopPerformer: false
  }));
  
  // Update top performers
  const updatedWaiters = await updateTopPerformers(waiters);
  return updatedWaiters;
};

// Update a waiter
export const updateWaiter = async (id: string, updates: Partial<Waiter>): Promise<Waiter | null> => {
  const { data, error } = await supabase
    .from('waiters')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating waiter:', error);
    return null;
  }
  
  // Add computed fields
  const waiter: Waiter = {
    ...data,
    trackingLink: `${getBaseUrl()}${data.tracking_token}`,
    qrCodeUrl: generateQRCodeURL(`${getBaseUrl()}${data.tracking_token}`),
    isTopPerformer: false
  };
  
  await updateTopPerformers();
  return waiter;
};

// Delete a waiter
export const deleteWaiter = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('waiters')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting waiter:', error);
    return false;
  }
  
  await updateTopPerformers();
  return true;
};

// Increment click count for a waiter
export const incrementClicks = async (id: string): Promise<Waiter | null> => {
  // First get the current waiter data
  const { data: waiter, error: getError } = await supabase
    .from('waiters')
    .select('*, restaurants(*)')
    .eq('id', id)
    .single();
  
  if (getError) {
    console.error('Error getting waiter:', getError);
    return null;
  }
  
  // Record the click
  const { error: clickError } = await supabase
    .from('clicks')
    .insert({
      waiter_id: id,
      restaurant_id: waiter.restaurant_id,
      converted: false,
      ip_address: 'client-side', // In a real app, this would come from the server
      user_agent: navigator.userAgent
    });
  
  if (clickError) {
    console.error('Error recording click:', clickError);
  }
  
  // Increment the waiter's click count
  const { data, error: updateError } = await supabase
    .from('waiters')
    .update({
      clicks: (waiter.clicks || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (updateError) {
    console.error('Error updating click count:', updateError);
    return null;
  }
  
  // Simulate random conversion (about 20% of clicks convert to reviews)
  if (Math.random() < 0.2) {
    // Update the waiter's conversion count
    const { data: updatedWaiter, error: convError } = await supabase
      .from('waiters')
      .update({
        conversions: (waiter.conversions || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (convError) {
      console.error('Error updating conversion count:', convError);
    }
    
    // Update the click to mark it as converted
    const { error: clickUpdateError } = await supabase
      .from('clicks')
      .update({
        converted: true
      })
      .eq('waiter_id', id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (clickUpdateError) {
      console.error('Error updating click conversion status:', clickUpdateError);
    }
    
    // Maybe add a new review
    if (Math.random() < 0.5) {
      await addRandomReview(id, waiter.restaurant_id);
    }
    
    // Simulate small rating changes for the restaurant
    const restaurant = waiter.restaurants;
    if (restaurant) {
      const ratingChange = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
      const newRating = restaurant.current_rating ? 
        Math.max(1, Math.min(5, restaurant.current_rating + ratingChange)) : 
        4.0;
      
      await supabase
        .from('restaurants')
        .update({
          current_rating: newRating,
          total_reviews: (restaurant.total_reviews || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurant.id);
    }
  }
  
  // Add computed fields
  const updatedWaiter: Waiter = {
    ...data,
    trackingLink: `${getBaseUrl()}${data.tracking_token}`,
    qrCodeUrl: generateQRCodeURL(`${getBaseUrl()}${data.tracking_token}`),
    isTopPerformer: false
  };
  
  await updateTopPerformers();
  return updatedWaiter;
};

// Helper function to add a random review
const addRandomReview = async (waiterId: string, restaurantId: string): Promise<void> => {
  const reviewTexts = [
    "Great service and delicious food!",
    "The waiter was very attentive and helpful.",
    "Food was decent but service was excellent.",
    "Average experience overall, but the staff was nice.",
    "Will definitely come back here again!"
  ];
  
  const review: Partial<Review> = {
    restaurant_id: restaurantId,
    waiter_id: waiterId,
    content: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
    rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
    author: "Customer " + Math.floor(Math.random() * 100),
    translated: false
  };
  
  await supabase.from('reviews').insert(review);
};

// Update the top performers
const updateTopPerformers = async (waiters?: Waiter[]): Promise<Waiter[]> => {
  // If waiters weren't provided, fetch them
  if (!waiters) {
    waiters = await getAllWaiters();
  }
  
  if (waiters.length === 0) return waiters;
  
  // Sort by clicks
  const sortedWaiters = [...waiters].sort((a, b) => b.clicks - a.clicks);
  
  // Reset all
  waiters.forEach(w => w.isTopPerformer = false);
  
  // Mark top performer
  if (sortedWaiters.length > 0) {
    const topWaiterId = sortedWaiters[0].id;
    const topWaiter = waiters.find(w => w.id === topWaiterId);
    if (topWaiter) {
      topWaiter.isTopPerformer = true;
    }
  }
  
  return waiters;
};

// Set restaurant information
export const setRestaurantInfo = async (
  name: string, 
  googleReviewUrl: string, 
  totalReviews?: number,
  initialRating?: number,
  currentRating?: number
): Promise<Restaurant> => {
  // First check if we have a restaurant already
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1)
    .single();
  
  if (existingRestaurant) {
    // Update the existing restaurant
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        name, 
        google_review_url: googleReviewUrl,
        total_reviews: totalReviews !== undefined ? totalReviews : existingRestaurant.total_reviews,
        initial_rating: initialRating !== undefined ? initialRating : existingRestaurant.initial_rating,
        current_rating: currentRating !== undefined ? currentRating : existingRestaurant.current_rating,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRestaurant.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
    
    return data;
  } else {
    // Create a new restaurant
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name, 
        google_review_url: googleReviewUrl,
        total_reviews: totalReviews || 0,
        initial_rating: initialRating || 4.0,
        current_rating: currentRating || 4.0,
        plan_status: 'trial'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
    
    return data;
  }
};

// Update restaurant feedback
export const updateRestaurantFeedback = async (
  positiveFeedback: string,
  negativeFeedback: string
): Promise<Restaurant> => {
  // Get the current restaurant
  const { data: existingRestaurant } = await supabase
    .from('restaurants')
    .select('*')
    .limit(1)
    .single();
  
  if (!existingRestaurant) {
    throw new Error('No restaurant found to update');
  }
  
  // Update the restaurant feedback
  const { data, error } = await supabase
    .from('restaurants')
    .update({
      positive_feedback: positiveFeedback,
      negative_feedback: negativeFeedback,
      updated_at: new Date().toISOString()
    })
    .eq('id', existingRestaurant.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating restaurant feedback:', error);
    throw error;
  }
  
  return data;
};

// Get restaurant information
export const getRestaurantInfo = async (): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*, reviews(*)')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error getting restaurant info:', error);
    // Return a default restaurant if none exists
    return {
      id: '',
      name: '',
      googleReviewUrl: '',
      totalReviews: 0,
      initialRating: 4.0,
      currentRating: 4.0,
      positiveFeedback: '',
      negativeFeedback: '',
      recentReviews: []
    };
  }
  
  // Format the response
  return {
    ...data,
    googleReviewUrl: data.google_review_url,
    totalReviews: data.total_reviews,
    initialRating: data.initial_rating,
    currentRating: data.current_rating,
    positiveFeedback: data.positive_feedback,
    negativeFeedback: data.negative_feedback,
    recentReviews: data.reviews || []
  };
};

// Get total clicks across all waiters
export const getTotalClicks = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error getting total clicks:', error);
    return 0;
  }
  
  return count || 0;
};

// Get total conversions across all waiters
export const getTotalConversions = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })
    .eq('converted', true);
  
  if (error) {
    console.error('Error getting total conversions:', error);
    return 0;
  }
  
  return count || 0;
};

// Get the current month's leaderboard
export const getCurrentLeaderboard = async () => {
  const { data, error } = await supabase
    .from('waiters')
    .select('id, name, clicks')
    .order('clicks', { ascending: false });
  
  if (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
  
  return data.map((waiter, index) => ({
    waiterId: waiter.id,
    waiterName: waiter.name,
    clicks: waiter.clicks,
    position: index + 1
  }));
};

// Record a monthly champion
export const recordMonthlyChampion = async () => {
  const waiters = await getAllWaiters();
  
  if (waiters.length === 0) return null;
  
  const sortedWaiters = [...waiters].sort((a, b) => b.clicks - a.clicks);
  const champion = sortedWaiters[0];
  
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  // Get the restaurant ID
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .limit(1)
    .single();
  
  if (!restaurant) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('monthly_champions')
    .insert({
      restaurant_id: restaurant.id,
      waiter_id: champion.id,
      waiter_name: champion.name,
      month,
      year,
      clicks: champion.clicks
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error recording monthly champion:', error);
    return null;
  }
  
  return data;
};

// Get all monthly champions
export const getMonthlyChampions = async () => {
  const { data, error } = await supabase
    .from('monthly_champions')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });
  
  if (error) {
    console.error('Error getting monthly champions:', error);
    return [];
  }
  
  return data;
};

// Translate a review (mock function)
export const translateReview = async (reviewId: string): Promise<Review | null> => {
  // Get the review
  const { data: review, error: getError } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();
  
  if (getError) {
    console.error('Error getting review:', getError);
    return null;
  }
  
  // Mock translation
  const translatedPrefixes = ["Tradução: ", "Translated: ", "En Español: "];
  const prefix = translatedPrefixes[Math.floor(Math.random() * translatedPrefixes.length)];
  const translatedContent = prefix + review.content;
  
  // Update the review
  const { data, error } = await supabase
    .from('reviews')
    .update({
      translated: true,
      translated_content: translatedContent
    })
    .eq('id', reviewId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating review translation:', error);
    return null;
  }
  
  return data;
};

// Get days remaining until end of month
export const getDaysUntilEndOfMonth = (): number => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diffTime = lastDay.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Initialize with some sample data for development
export const initializeSampleData = async () => {
  try {
    // Check if we already have data
    const { count: restaurantCount, error: countError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking for existing data:', countError);
      return;
    }
    
    if (restaurantCount && restaurantCount > 0) {
      console.log('Data already initialized, skipping sample data creation');
      return;
    }
    
    // Create a sample restaurant
    const { data: restaurant, error: restError } = await supabase
      .from('restaurants')
      .insert({
        name: 'Restaurante Exemplo',
        google_review_url: 'https://g.page/r/example-restaurant-review',
        total_reviews: 120,
        initial_rating: 4.2,
        current_rating: 4.4,
        positive_feedback: 'Muitos clientes elogiam o atendimento e a rapidez do serviço.',
        negative_feedback: 'Algumas reclamações sobre o tempo de espera nos fins de semana.',
        plan_status: 'trial'
      })
      .select()
      .single();
    
    if (restError) {
      console.error('Error creating sample restaurant:', restError);
      return;
    }
    
    // Create sample waiters
    const waiters = [
      { name: 'João Silva', email: 'joao@example.com', whatsapp: '+5511999991111' },
      { name: 'Maria Oliveira', email: 'maria@example.com', whatsapp: '+5511999992222' },
      { name: 'Pedro Santos', email: 'pedro@example.com', whatsapp: '+5511999993333' }
    ];
    
    for (const waiter of waiters) {
      const { data: newWaiter, error: waiterError } = await supabase
        .from('waiters')
        .insert({
          restaurant_id: restaurant.id,
          name: waiter.name,
          email: waiter.email,
          whatsapp: waiter.whatsapp,
          tracking_token: Math.random().toString(36).substring(2, 15),
          clicks: Math.floor(Math.random() * 30),
          conversions: Math.floor(Math.random() * 10),
          is_active: true
        })
        .select()
        .single();
      
      if (waiterError) {
        console.error('Error creating sample waiter:', waiterError);
        continue;
      }
      
      // Add some sample reviews
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        await addRandomReview(newWaiter.id, restaurant.id);
      }
    }
    
    // Add a sample monthly champion
    const now = new Date();
    const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
    const month = lastMonth.getMonth() + 1;
    const year = lastMonth.getFullYear();
    
    // Get a random waiter to be the champion
    const { data: randomWaiter } = await supabase
      .from('waiters')
      .select('id, name')
      .limit(1)
      .single();
    
    if (randomWaiter) {
      await supabase
        .from('monthly_champions')
        .insert({
          restaurant_id: restaurant.id,
          waiter_id: randomWaiter.id,
          waiter_name: randomWaiter.name,
          month,
          year,
          clicks: 45
        });
    }
    
    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};
