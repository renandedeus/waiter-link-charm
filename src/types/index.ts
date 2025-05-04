export interface Waiter {
  id: string;
  trackingId: string;
  restaurantId: string;
  name: string;
  email: string;
  whatsapp: string;
  trackingLink: string;
  qrCodeUrl: string;
  clicks: number;
  createdAt: string;
  conversions: number;
  isActive: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  googleReviewUrl: string;
  responsible_name?: string;
  responsible_email?: string;
  responsible_phone?: string;
  totalReviews?: number;
  initialRating?: number;
  currentRating?: number;
  positiveFeedback?: string;
  negativeFeedback?: string;
  plan_status?: string;
  plan_expiry_date?: string;
  created_at?: string;
  updated_at?: string;
  recentReviews?: Review[];
  waiter_count?: number; // computed field
  
  // Duplicamos os campos com snake_case para compatibilidade com o banco de dados
  google_review_url?: string; 
  total_reviews?: number;
  initial_rating?: number;
  current_rating?: number;
  positive_feedback?: string;
  negative_feedback?: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  author?: string;
  rating: number;
  content?: string;
  date: string;  // Added this field
  created_at: string;
  waiter_id?: string;
  translated?: boolean;
  translated_content?: string;  // Using snake_case to match database
  translatedContent?: string;   // Adding camelCase for component usage
}

export interface LeaderboardEntry {
  waiterId: string;
  waiterName: string;
  clicks: number;
  position: number;
}

export interface MonthlyChampion {
  id: string;
  restaurant_id: string;
  waiter_id?: string;
  waiter_name: string;
  month: number;
  year: number;
  clicks: number;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Click {
  id: string;
  waiter_id: string;
  restaurant_id: string;
  converted: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AccessLog {
  id: string;
  user_type: 'admin' | 'restaurant' | 'waiter' | 'visitor';
  user_id?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  details?: any;
  created_at: string;
}

export interface Backup {
  id: string;
  file_path: string;
  file_size?: number;
  backup_type: string;
  status: string;
  created_at: string;
}

export interface RestaurantFilter {
  search?: string;
  plan_status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface WaiterFilter {
  restaurant_id?: string;
  search?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export interface ReportData {
  type: 'waiter_clicks' | 'monthly_ranking' | 'reviews_evolution';
  period: {
    month: number;
    year: number;
  };
  data: any[];
  exported_at: string;
  restaurant_id: string;
  restaurant_name: string;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
  } | null;
  isAdmin: boolean;
  isLoading: boolean;
}
