import { supabase } from '@/integrations/supabase/client';
import { Waiter, Restaurant, Review, LeaderboardEntry, MonthlyChampion } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Armazenamento local para desenvolvimento quando o Supabase RLS impede acesso
const localStorageKey = 'target_avaliacoes_data';

// Função para inicializar ou obter dados do localStorage
const getLocalStorage = () => {
  const savedData = localStorage.getItem(localStorageKey);
  if (savedData) {
    return JSON.parse(savedData);
  }
  return {
    restaurant: null,
    waiters: [],
    reviews: [],
    clicks: []
  };
};

// Função para salvar dados no localStorage
const saveLocalStorage = (data: any) => {
  localStorage.setItem(localStorageKey, JSON.stringify(data));
};

// Get base URL for tracking links
const getBaseUrl = () => {
  return window.location.origin + '/r/';
};

// Generate a QR code URL (using QRCode.js library when integrated)
const generateQRCodeURL = (trackingLink: string) => {
  // This is a placeholder. We'll use an actual QR code library
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingLink)}`;
};

// Map database restaurant to client model
const mapRestaurantFromDb = (dbRestaurant: any): Restaurant => {
  return {
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    googleReviewUrl: dbRestaurant.google_review_url || dbRestaurant.googleReviewUrl,
    responsible_name: dbRestaurant.responsible_name,
    responsible_email: dbRestaurant.responsible_email,
    responsible_phone: dbRestaurant.responsible_phone,
    totalReviews: dbRestaurant.total_reviews,
    initialRating: dbRestaurant.initial_rating,
    currentRating: dbRestaurant.current_rating,
    positiveFeedback: dbRestaurant.positive_feedback,
    negativeFeedback: dbRestaurant.negative_feedback,
    plan_status: dbRestaurant.plan_status,
    plan_expiry_date: dbRestaurant.plan_expiry_date,
    created_at: dbRestaurant.created_at,
    updated_at: dbRestaurant.updated_at,
    recentReviews: dbRestaurant.reviews ? dbRestaurant.reviews.map(mapReviewFromDb) : [],
    waiter_count: dbRestaurant.waiter_count || 0
  };
};

// Map database waiter to client model
const mapWaiterFromDb = (dbWaiter: any): Waiter => {
  return {
    id: dbWaiter.id,
    restaurant_id: dbWaiter.restaurant_id,
    name: dbWaiter.name,
    email: dbWaiter.email,
    whatsapp: dbWaiter.whatsapp,
    tracking_token: dbWaiter.tracking_token,
    token_expiry_date: dbWaiter.token_expiry_date,
    clicks: dbWaiter.clicks || 0,
    conversions: dbWaiter.conversions || 0,
    is_active: dbWaiter.is_active,
    created_at: dbWaiter.created_at || new Date().toISOString(),
    updated_at: dbWaiter.updated_at || new Date().toISOString(),
    trackingLink: `${getBaseUrl()}${dbWaiter.tracking_token}`,
    qrCodeUrl: generateQRCodeURL(`${getBaseUrl()}${dbWaiter.tracking_token}`),
    isTopPerformer: false
  };
};

// Map database review to client model
const mapReviewFromDb = (dbReview: any): Review => {
  return {
    id: dbReview.id,
    restaurant_id: dbReview.restaurant_id,
    waiter_id: dbReview.waiter_id,
    content: dbReview.content,
    rating: dbReview.rating,
    date: dbReview.created_at,
    author: dbReview.author,
    translated: dbReview.translated,
    translatedContent: dbReview.translated_content,
    created_at: dbReview.created_at
  };
};

// Create a new waiter with a unique tracking link
export const createWaiter = async (name: string, email: string, whatsapp: string): Promise<Waiter> => {
  // Generate a unique token for the waiter
  const trackingToken = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
  
  try {
    let restaurant: Restaurant | null = null;
    
    // Get the restaurant ID - use the first one we find for now
    // In a real app, we'd have the current restaurant ID from context
    const { data: restaurantData, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .single();
    
    if (restError) {
      console.error('Erro ao buscar restaurante:', restError);
      
      // Usar armazenamento local se houver problemas de RLS
      const localData = getLocalStorage();
      
      if (!localData.restaurant) {
        // Criar restaurante local
        localData.restaurant = {
          id: uuidv4(),
          name: 'Meu Restaurante',
          googleReviewUrl: '',
          plan_status: 'trial',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        saveLocalStorage(localData);
      }
      
      restaurant = mapRestaurantFromDb(localData.restaurant);
    } else if (restaurantData) {
      restaurant = mapRestaurantFromDb(restaurantData);
    }
    
    // Se não encontrar nenhum restaurante nem local nem no Supabase, cria local
    if (!restaurant) {
      const localData = getLocalStorage();
      
      localData.restaurant = {
        id: uuidv4(),
        name: 'Meu Restaurante',
        googleReviewUrl: '',
        plan_status: 'trial',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      saveLocalStorage(localData);
      restaurant = mapRestaurantFromDb(localData.restaurant);
    }
    
    // Tentar criar o garçom no Supabase
    const { data: waiterData, error: waiterError } = await supabase
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
    
    // Se houver erro, usar armazenamento local
    if (waiterError) {
      console.error('Erro ao criar garçom no Supabase, usando armazenamento local:', waiterError);
      
      const localData = getLocalStorage();
      
      const newWaiter = {
        id: uuidv4(),
        restaurant_id: restaurant.id,
        name,
        email,
        whatsapp,
        tracking_token: trackingToken,
        clicks: 0,
        conversions: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localData.waiters.push(newWaiter);
      saveLocalStorage(localData);
      
      return mapWaiterFromDb(newWaiter);
    }
    
    // Add computed fields
    const waiter = mapWaiterFromDb(waiterData);
    
    await updateTopPerformers();
    return waiter;
  } catch (error) {
    console.error('Erro crítico ao criar garçom:', error);
    
    // Garantir que algo seja retornado mesmo em caso de erro
    const fallbackWaiter: Waiter = {
      id: uuidv4(),
      restaurant_id: '',
      name,
      email,
      whatsapp,
      tracking_token: trackingToken,
      clicks: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      trackingLink: `${getBaseUrl()}${trackingToken}`,
      qrCodeUrl: generateQRCodeURL(`${getBaseUrl()}${trackingToken}`),
      isTopPerformer: false
    };
    
    return fallbackWaiter;
  }
};

// Get all waiters
export const getAllWaiters = async (): Promise<Waiter[]> => {
  try {
    let restaurant: Restaurant | null = null;
    
    // Get the restaurant ID - use the first one we find for now
    const { data: restaurantData, error: restError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .single();
    
    if (restError) {
      console.error('Erro ao buscar restaurante:', restError);
      
      // Tentar buscar do armazenamento local
      const localData = getLocalStorage();
      if (localData.restaurant) {
        restaurant = mapRestaurantFromDb(localData.restaurant);
      } else {
        return [];
      }
    } else if (restaurantData) {
      restaurant = mapRestaurantFromDb(restaurantData);
    }
    
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
      console.error('Erro ao buscar garçons:', error);
      
      // Tentar buscar do armazenamento local
      const localData = getLocalStorage();
      const localWaiters = localData.waiters || [];
      
      // Filtrar garçons pelo restaurante atual
      const filteredWaiters = localWaiters.filter(
        (w: any) => w.restaurant_id === restaurant?.id
      );
      
      return filteredWaiters.map(mapWaiterFromDb);
    }
    
    // Add computed fields
    const waiters: Waiter[] = data.map(mapWaiterFromDb);
    
    // Update top performers
    const updatedWaiters = await updateTopPerformers(waiters);
    return updatedWaiters;
  } catch (error) {
    console.error('Erro crítico ao buscar garçons:', error);
    
    // Em caso de erro, retornar array vazio
    return [];
  }
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
  const waiter = mapWaiterFromDb(data);
  
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
  const updatedWaiter = mapWaiterFromDb(data);
  
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
  
  const review = {
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
  try {
    // First check if we have a restaurant already
    const { data: existingRestaurant, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .limit(1)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar restaurante existente:', fetchError);
      
      // Tentar usar armazenamento local
      const localData = getLocalStorage();
      
      if (localData.restaurant) {
        // Atualizar restaurante local
        localData.restaurant = {
          ...localData.restaurant,
          name, 
          googleReviewUrl,
          total_reviews: totalReviews !== undefined ? totalReviews : localData.restaurant.total_reviews || 0,
          initial_rating: initialRating !== undefined ? initialRating : localData.restaurant.initial_rating || 4.0,
          current_rating: currentRating !== undefined ? currentRating : localData.restaurant.current_rating || 4.0,
          updated_at: new Date().toISOString()
        };
        
        saveLocalStorage(localData);
        return mapRestaurantFromDb(localData.restaurant);
      } else {
        // Criar novo restaurante local
        const newRestaurant = {
          id: uuidv4(),
          name, 
          googleReviewUrl,
          total_reviews: totalReviews || 0,
          initial_rating: initialRating || 4.0,
          current_rating: currentRating || 4.0,
          plan_status: 'trial',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localData.restaurant = newRestaurant;
        saveLocalStorage(localData);
        return mapRestaurantFromDb(newRestaurant);
      }
    }
    
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
        console.error('Erro ao atualizar restaurante:', error);
        
        // Usar armazenamento local para persistir a atualização
        const localData = getLocalStorage();
        
        if (!localData.restaurant) {
          localData.restaurant = {
            ...existingRestaurant,
            name,
            googleReviewUrl,
            updated_at: new Date().toISOString()
          };
        } else {
          localData.restaurant = {
            ...localData.restaurant,
            name,
            googleReviewUrl,
            updated_at: new Date().toISOString()
          };
        }
        
        saveLocalStorage(localData);
        return mapRestaurantFromDb(localData.restaurant);
      }
      
      return mapRestaurantFromDb(data);
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
        console.error('Erro ao criar restaurante:', error);
        
        // Criar localmente se houver erro
        const localData = getLocalStorage();
        
        const newRestaurant = {
          id: uuidv4(),
          name,
          googleReviewUrl,
          total_reviews: totalReviews || 0,
          initial_rating: initialRating || 4.0,
          current_rating: currentRating || 4.0,
          plan_status: 'trial',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localData.restaurant = newRestaurant;
        saveLocalStorage(localData);
        return mapRestaurantFromDb(newRestaurant);
      }
      
      return mapRestaurantFromDb(data);
    }
  } catch (error) {
    console.error('Erro crítico ao salvar informações do restaurante:', error);
    
    // Garantir que algo seja retornado mesmo em caso de erro
    const fallbackRestaurant: Restaurant = {
      id: uuidv4(),
      name,
      googleReviewUrl,
      totalReviews: 0,
      initialRating: 4.0,
      currentRating: 4.0,
      plan_status: 'trial'
    };
    
    // Salvar no armazenamento local
    const localData = getLocalStorage();
    localData.restaurant = {
      ...fallbackRestaurant,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveLocalStorage(localData);
    
    return fallbackRestaurant;
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
  
  return mapRestaurantFromDb(data);
};

// Get restaurant information
export const getRestaurantInfo = async (): Promise<Restaurant> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, reviews(*)')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Erro ao buscar informações do restaurante:', error);
      
      // Tentar buscar do armazenamento local
      const localData = getLocalStorage();
      
      if (localData.restaurant) {
        // Adicionar reviews ao restaurante local
        const restaurant = {
          ...localData.restaurant,
          reviews: localData.reviews || []
        };
        
        return mapRestaurantFromDb(restaurant);
      }
      
      // Return a default restaurant if none exists
      return {
        id: uuidv4(),
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
    return mapRestaurantFromDb(data);
  } catch (error) {
    console.error('Erro crítico ao buscar informações do restaurante:', error);
    
    // Retornar um restaurante vazio em caso de erro
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
};

// Get total clicks
export const getTotalClicks = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('clicks')
    .select('id', { count: 'exact' });
  
  if (error) {
    console.error('Error getting total clicks:', error);
    return 0;
  }
  
  return data.length;
};

// Get total conversions
export const getTotalConversions = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('clicks')
    .select('id')
    .eq('converted', true);
  
  if (error) {
    console.error('Error getting total conversions:', error);
    return 0;
  }
  
  return data.length;
};

// Calculate days until end of month
export const getDaysUntilEndOfMonth = (): number => {
  const date = new Date();
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.getDate() - date.getDate();
};

// Initialize sample data for development
export const initializeSampleData = async (): Promise<void> => {
  // First check if we already have data
  const { data: existingRestaurants, error } = await supabase
    .from('restaurants')
    .select('id')
    .limit(1);
  
  if (error) {
    console.error('Error checking for existing data:', error);
    return;
  }
  
  // If we already have data, don't add more
  if (existingRestaurants && existingRestaurants.length > 0) {
    return;
  }
  
  // Create a restaurant
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .insert({
      name: 'Bistro Italiano',
      google_review_url: 'https://g.page/r/example-restaurant-review',
      total_reviews: 42,
      initial_rating: 4.1,
      current_rating: 4.3,
      positive_feedback: 'Customers love our pasta dishes and friendly service.',
      negative_feedback: 'Some customers mentioned long wait times during peak hours.',
      plan_status: 'active'
    })
    .select()
    .single();
  
  if (restError) {
    console.error('Error creating sample restaurant:', restError);
    return;
  }
  
  // Create some waiters
  const waiters = [
    { name: 'João Silva', email: 'joao@example.com', whatsapp: '+5511999887766' },
    { name: 'Maria Oliveira', email: 'maria@example.com', whatsapp: '+5511988776655' },
    { name: 'Carlos Santos', email: 'carlos@example.com', whatsapp: '+5511977665544' },
  ];
  
  for (const waiter of waiters) {
    // Generate tracking token
    const trackingToken = Math.random().toString(36).substring(2, 15) + 
                          Math.random().toString(36).substring(2, 15);
                          
    // Add random clicks (0-30)
    const clicks = Math.floor(Math.random() * 30);
    
    // Add random conversions (0-clicks)
    const conversions = Math.floor(Math.random() * clicks);
    
    await supabase.from('waiters').insert({
      restaurant_id: restaurant.id,
      name: waiter.name,
      email: waiter.email,
      whatsapp: waiter.whatsapp,
      tracking_token: trackingToken,
      clicks,
      conversions,
      is_active: true
    });
  }
  
  // Create some reviews
  const reviews = [
    {
      content: "The service was excellent! Our waiter was very attentive.",
      rating: 5,
      author: "Ana P."
    },
    {
      content: "The food was good but it took a long time to be served.",
      rating: 3,
      author: "Roberto M."
    },
    {
      content: "Great atmosphere and the pizza was delicious!",
      rating: 4,
      author: "Juliana C."
    }
  ];
  
  for (const review of reviews) {
    await supabase.from('reviews').insert({
      restaurant_id: restaurant.id,
      content: review.content,
      rating: review.rating,
      author: review.author
    });
  }
  
  console.log('Sample data initialized successfully');
};

// Get current leaderboard
export const getCurrentLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data: waiters, error } = await supabase
    .from('waiters')
    .select('id, name, clicks')
    .order('clicks', { ascending: false });
  
  if (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
  
  return waiters.map((waiter, index) => ({
    waiterId: waiter.id,
    waiterName: waiter.name,
    clicks: waiter.clicks,
    position: index + 1
  }));
};

// Get monthly champions
export const getMonthlyChampions = async (): Promise<MonthlyChampion[]> => {
  const { data, error } = await supabase
    .from('monthly_champions')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false });
  
  if (error) {
    console.error('Error getting monthly champions:', error);
    return [];
  }
  
  return data.map(champion => ({
    ...champion,
    waiterName: champion.waiter_name
  }));
};

// Translate a review
export const translateReview = async (reviewId: string): Promise<Review> => {
  // First get the current review
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();
  
  if (error) {
    console.error('Error getting review:', error);
    throw error;
  }
  
  // Simulate translation (in a real app, this would call a translation API)
  const translatedContent = `[TRANSLATED] ${review.content}`;
  
  // Update the review with the translation
  const { data: updatedReview, error: updateError } = await supabase
    .from('reviews')
    .update({
      translated: true,
      translated_content: translatedContent
    })
    .eq('id', reviewId)
    .select()
    .single();
  
  if (updateError) {
    console.error('Error updating review translation:', updateError);
    throw updateError;
  }
  
  return mapReviewFromDb(updatedReview);
};
