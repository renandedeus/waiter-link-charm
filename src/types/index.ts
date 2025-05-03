
export interface Waiter {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  trackingLink: string;
  qrCodeUrl: string;
  clicks: number;
}

export interface Restaurant {
  id?: string;
  name: string;
  googleReviewUrl: string;
}
