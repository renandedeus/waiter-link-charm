
import { v4 as uuidv4 } from 'uuid';
import { Waiter, Restaurant } from '@/types';

// Mock storage (to be replaced with Supabase)
let waiters: Waiter[] = [];
let restaurant: Restaurant = {
  name: '',
  googleReviewUrl: ''
};

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
    clicks: 0
  };
  
  waiters.push(newWaiter);
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
  return waiters[index];
};

// Delete a waiter
export const deleteWaiter = (id: string): boolean => {
  const initialLength = waiters.length;
  waiters = waiters.filter(w => w.id !== id);
  return waiters.length < initialLength;
};

// Increment click count for a waiter
export const incrementClicks = (id: string): Waiter | null => {
  const waiter = waiters.find(w => w.id === id);
  if (!waiter) return null;
  
  waiter.clicks += 1;
  return waiter;
};

// Set restaurant information
export const setRestaurantInfo = (name: string, googleReviewUrl: string): Restaurant => {
  restaurant = { name, googleReviewUrl };
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
