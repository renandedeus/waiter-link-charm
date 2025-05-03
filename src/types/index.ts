export interface Waiter {
  id: string;
  restaurant_id: string;
  name: string;
  email: string;
  whatsapp: string;
  tracking_token: string;
  token_expiry_date?: string;
  clicks: number;
  conversions?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  trackingLink?: string; // computed field
  qrCodeUrl?: string; // computed field
  isTopPerformer?: boolean; // computed field
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
}

export interface Review {
  id: string;
  restaurant_id: string;
  waiter_id?: string;
  content: string;
  rating: number;
  date: string;
  author?: string;
  translated?: boolean;
  translatedContent?: string;
  created_at: string;
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
