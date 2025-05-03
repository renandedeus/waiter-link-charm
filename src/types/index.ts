
export interface Waiter {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  trackingLink: string;
  qrCodeUrl: string;
  clicks: number;
  conversions?: number;
  isTopPerformer?: boolean;
}

export interface Restaurant {
  id?: string;
  name: string;
  googleReviewUrl: string;
  totalReviews?: number;
  initialRating?: number;
  currentRating?: number;
  positiveFeedback?: string;
  negativeFeedback?: string;
  recentReviews?: Review[];
}

export interface Review {
  id: string;
  content: string;
  rating: number;
  date: string;
  author?: string;
  translated?: boolean;
  translatedContent?: string;
}

export interface LeaderboardEntry {
  waiterId: string;
  waiterName: string;
  clicks: number;
  position: number;
}

export interface MonthlyChampion {
  waiterId: string;
  waiterName: string;
  month: string;
  year: number;
  clicks: number;
}
