import { v4 as uuidv4 } from 'uuid';
import { Waiter, Restaurant, LeaderboardEntry, MonthlyChampion, Review } from '@/types';

// Mock storage (to be replaced with Supabase)
let waiters: Waiter[] = [];
let restaurant: Restaurant = {
  name: '',
  googleReviewUrl: '',
  totalReviews: 0,
  initialRating: 4.0,
  currentRating: 4.0,
  positiveFeedback: '',
  negativeFeedback: '',
  recentReviews: []
};

let monthlyChampions: MonthlyChampion[] = [];

// Get base URL for tracking links
const getBaseUrl = () => {
  return window.location.origin + '/r/';
};

// Generate a QR code URL (using QRCode.js library when integrated)
const generateQRCodeURL = (trackingLink: string) => {
  // This is a placeholder. We'll use an actual QR code library
  // For now, return a dummy URL that would represent the QR code
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackingLink)}`;
};

// Create a new waiter with a unique tracking link
export const createWaiter = (name: string, email: string, whatsapp: string): Waiter => {
  const id = uuidv4();
  const trackingLink = `${getBaseUrl()}${id}`;
  const qrCodeUrl = generateQRCodeURL(trackingLink);
  
  const newWaiter: Waiter = {
    id,
    name,
    email,
    whatsapp,
    trackingLink,
    qrCodeUrl,
    clicks: 0,
    conversions: 0
  };
  
  waiters.push(newWaiter);
  updateTopPerformers();
  return newWaiter;
};

// Get all waiters
export const getAllWaiters = (): Waiter[] => {
  return waiters;
};

// Update a waiter
export const updateWaiter = (id: string, updates: Partial<Waiter>): Waiter | null => {
  const index = waiters.findIndex(w => w.id === id);
  if (index === -1) return null;
  
  waiters[index] = { ...waiters[index], ...updates };
  updateTopPerformers();
  return waiters[index];
};

// Delete a waiter
export const deleteWaiter = (id: string): boolean => {
  const initialLength = waiters.length;
  waiters = waiters.filter(w => w.id !== id);
  updateTopPerformers();
  return waiters.length < initialLength;
};

// Increment click count for a waiter
export const incrementClicks = (id: string): Waiter | null => {
  const waiter = waiters.find(w => w.id === id);
  if (!waiter) return null;
  
  waiter.clicks += 1;
  
  // Simulate random conversion (about 20% of clicks convert to reviews)
  if (Math.random() < 0.2) {
    waiter.conversions = (waiter.conversions || 0) + 1;
    
    // Update restaurant total reviews
    restaurant.totalReviews = (restaurant.totalReviews || 0) + 1;
    
    // Maybe add a new review
    if (Math.random() < 0.5) {
      addRandomReview();
    }
    
    // Simulate small rating changes
    const ratingChange = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1
    if (restaurant.currentRating) {
      restaurant.currentRating = Math.max(1, Math.min(5, restaurant.currentRating + ratingChange));
    }
  }
  
  updateTopPerformers();
  return waiter;
};

// Helper function to add a random review
const addRandomReview = () => {
  const reviewTexts = [
    "Great service and delicious food!",
    "The waiter was very attentive and helpful.",
    "Food was decent but service was excellent.",
    "Average experience overall, but the staff was nice.",
    "Will definitely come back here again!"
  ];
  
  const review: Review = {
    id: uuidv4(),
    content: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
    rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
    date: new Date().toISOString(),
    author: "Customer " + Math.floor(Math.random() * 100),
    translated: false
  };
  
  if (!restaurant.recentReviews) {
    restaurant.recentReviews = [];
  }
  
  restaurant.recentReviews.unshift(review);
  // Keep only last 10 reviews
  if (restaurant.recentReviews.length > 10) {
    restaurant.recentReviews = restaurant.recentReviews.slice(0, 10);
  }
};

// Update the top performers
const updateTopPerformers = () => {
  if (waiters.length === 0) return;
  
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
};

// Set restaurant information
export const setRestaurantInfo = (
  name: string, 
  googleReviewUrl: string, 
  totalReviews?: number,
  initialRating?: number,
  currentRating?: number
): Restaurant => {
  restaurant = { 
    ...restaurant,
    name, 
    googleReviewUrl,
    totalReviews: totalReviews !== undefined ? totalReviews : restaurant.totalReviews,
    initialRating: initialRating !== undefined ? initialRating : restaurant.initialRating,
    currentRating: currentRating !== undefined ? currentRating : restaurant.currentRating
  };
  return restaurant;
};

// Update restaurant feedback
export const updateRestaurantFeedback = (
  positiveFeedback: string,
  negativeFeedback: string
): Restaurant => {
  restaurant = {
    ...restaurant,
    positiveFeedback,
    negativeFeedback
  };
  return restaurant;
};

// Get restaurant information
export const getRestaurantInfo = (): Restaurant => {
  return restaurant;
};

// Get total clicks across all waiters
export const getTotalClicks = (): number => {
  return waiters.reduce((sum, waiter) => sum + waiter.clicks, 0);
};

// Get total conversions across all waiters
export const getTotalConversions = (): number => {
  return waiters.reduce((sum, waiter) => sum + (waiter.conversions || 0), 0);
};

// Get the current month's leaderboard
export const getCurrentLeaderboard = (): LeaderboardEntry[] => {
  return waiters
    .map((waiter, index) => ({
      waiterId: waiter.id,
      waiterName: waiter.name,
      clicks: waiter.clicks,
      position: index + 1
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .map((entry, index) => ({ ...entry, position: index + 1 }));
};

// Record a monthly champion
export const recordMonthlyChampion = () => {
  if (waiters.length === 0) return null;
  
  const sortedWaiters = [...waiters].sort((a, b) => b.clicks - a.clicks);
  const champion = sortedWaiters[0];
  
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const newChampion: MonthlyChampion = {
    waiterId: champion.id,
    waiterName: champion.name,
    month: monthNames[now.getMonth()],
    year: now.getFullYear(),
    clicks: champion.clicks
  };
  
  monthlyChampions.push(newChampion);
  return newChampion;
};

// Get all monthly champions
export const getMonthlyChampions = (): MonthlyChampion[] => {
  return monthlyChampions;
};

// Translate a review (mock function)
export const translateReview = (reviewId: string): Review | null => {
  if (!restaurant.recentReviews) return null;
  
  const reviewIndex = restaurant.recentReviews.findIndex(r => r.id === reviewId);
  if (reviewIndex === -1) return null;
  
  const review = restaurant.recentReviews[reviewIndex];
  
  // Mock translation - in a real app this would call a translation API
  const translatedPrefixes = ["Tradução: ", "Translated: ", "En Español: "];
  const prefix = translatedPrefixes[Math.floor(Math.random() * translatedPrefixes.length)];
  
  restaurant.recentReviews[reviewIndex] = {
    ...review,
    translated: true,
    translatedContent: prefix + review.content
  };
  
  return restaurant.recentReviews[reviewIndex];
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
export const initializeSampleData = () => {
  // Create some waiters
  if (waiters.length === 0) {
    createWaiter("João Silva", "joao@example.com", "+5511999991111");
    createWaiter("Maria Oliveira", "maria@example.com", "+5511999992222");
    createWaiter("Pedro Santos", "pedro@example.com", "+5511999993333");
    
    // Add some random clicks
    waiters.forEach(waiter => {
      const randomClicks = Math.floor(Math.random() * 30);
      for (let i = 0; i < randomClicks; i++) {
        incrementClicks(waiter.id);
      }
    });
    
    // Set sample restaurant data
    setRestaurantInfo(
      "Restaurante Exemplo", 
      "https://g.page/r/example-restaurant-review", 
      120,  // Total reviews
      4.2,  // Initial rating
      4.4   // Current rating
    );
    
    updateRestaurantFeedback(
      "Muitos clientes elogiam o atendimento e a rapidez do serviço.",
      "Algumas reclamações sobre o tempo de espera nos fins de semana."
    );
    
    // Add some sample reviews
    for (let i = 0; i < 5; i++) {
      addRandomReview();
    }
    
    // Add a sample monthly champion
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    monthlyChampions.push({
      waiterId: waiters[0].id,
      waiterName: waiters[0].name,
      month: monthNames[lastMonth.getMonth()],
      year: lastMonth.getFullYear(),
      clicks: 45
    });
  }
};
